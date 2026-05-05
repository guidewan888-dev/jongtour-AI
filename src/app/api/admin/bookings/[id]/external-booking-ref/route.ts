export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auditLog } from '@/lib/logger';

/**
 * POST /api/admin/bookings/[id]/external-booking-ref
 * Save or update external booking reference from wholesale
 * Admin ใส่ external_booking_ref เองได้ (manual fallback)
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: bookingId } = await params;
  try {
    const {
      externalBookingRef,
      wholesaleTourUrl,
      wholesaleBookingUrl,
      wholesaleStatus,
      supplierConfirmedPrice,
      supplierNote,
      confirmationFileUrl,
      createdBy,
    } = await req.json();

    if (!externalBookingRef) {
      return NextResponse.json({ success: false, error: 'Missing externalBookingRef' }, { status: 400 });
    }

    const booking = await prisma.booking.findUniqueOrThrow({
      where: { id: bookingId },
    });

    // Upsert wholesale ref
    const ref = await (prisma as any).bookingWholesaleRef.upsert({
      where: { bookingId },
      create: {
        bookingId,
        supplierId: booking.supplierId,
        externalBookingRef,
        wholesaleTourUrl: wholesaleTourUrl || null,
        wholesaleBookingUrl: wholesaleBookingUrl || null,
        supplierConfirmedStatus: wholesaleStatus || 'CONFIRMED',
        supplierConfirmedPrice: supplierConfirmedPrice || null,
        supplierNote: supplierNote || null,
        supplierConfirmedAt: new Date(),
        confirmationFileUrl: confirmationFileUrl || null,
        createdBy: createdBy || 'ADMIN',
      },
      update: {
        externalBookingRef,
        supplierConfirmedStatus: wholesaleStatus || 'CONFIRMED',
        supplierConfirmedPrice: supplierConfirmedPrice || undefined,
        supplierNote: supplierNote || undefined,
        supplierConfirmedAt: new Date(),
        confirmationFileUrl: confirmationFileUrl || undefined,
      },
    });

    // Update booking status
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        wholesaleStatus: wholesaleStatus || 'CONFIRMED',
        supplierConfirmedStatus: 'CONFIRMED',
        supplierConfirmedAt: new Date(),
        supplierConfirmedPrice: supplierConfirmedPrice || undefined,
      },
    });

    // If there was an active RPA session, mark it as confirmed
    const activeSession = await (prisma as any).wholesaleRpaSession.findFirst({
      where: { bookingId, status: { in: ['SUBMITTED', 'WAITING_ADMIN_APPROVAL'] } },
    });
    if (activeSession) {
      await (prisma as any).wholesaleRpaSession.update({
        where: { id: activeSession.id },
        data: { status: 'CONFIRMED', finishedAt: new Date() },
      });
    }

    await auditLog({
      action: 'EXTERNAL_BOOKING_REF_SAVE',
      userId: createdBy || 'ADMIN',
      targetType: 'booking',
      targetId: bookingId,
      details: { externalBookingRef, wholesaleStatus: wholesaleStatus || 'CONFIRMED' },
    });

    return NextResponse.json({
      success: true,
      data: { id: ref.id, externalBookingRef, status: 'CONFIRMED' },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
