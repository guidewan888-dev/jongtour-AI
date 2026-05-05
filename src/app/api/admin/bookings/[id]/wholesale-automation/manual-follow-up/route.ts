export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auditLog } from '@/lib/logger';

/**
 * POST /api/admin/bookings/[id]/wholesale-automation/manual-follow-up
 * Mark booking for manual follow-up — Bot ทำไม่ได้ ให้ Admin ทำเอง
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: bookingId } = await params;
  try {
    const { sessionId, reason, markedBy } = await req.json();

    // If there's an active session, mark it as failed
    if (sessionId) {
      await (prisma as any).wholesaleRpaSession.update({
        where: { id: sessionId },
        data: {
          status: 'FAILED',
          finishedAt: new Date(),
          errorMessage: reason || 'Marked for manual follow-up',
        },
      });

      await (prisma as any).wholesaleRpaAction.create({
        data: {
          sessionId,
          bookingId,
          actionType: 'MANUAL_FOLLOW_UP',
          actionStatus: 'SUCCESS',
          inputSummary: reason || 'Bot cannot complete — manual required',
        },
      });
    }

    // Update booking wholesale status
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        wholesaleStatus: 'MANUAL_FOLLOW_UP_REQUIRED',
        internalNote: reason
          ? `[Manual Follow-up] ${reason}`
          : '[Manual Follow-up] Bot cannot complete this booking',
      },
    });

    await auditLog({
      action: 'RPA_MANUAL_FOLLOW_UP',
      userId: markedBy || 'ADMIN',
      targetType: 'booking',
      targetId: bookingId,
      details: { sessionId, reason },
    });

    return NextResponse.json({
      success: true,
      status: 'MANUAL_FOLLOW_UP_REQUIRED',
      message: 'Booking marked for manual follow-up',
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
