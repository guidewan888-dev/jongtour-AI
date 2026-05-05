export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/bookings/[id]/copy-helper
 * Generate copy-friendly booking summary for manual wholesale booking
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: bookingId } = await params;
  try {
    const booking = await prisma.booking.findUniqueOrThrow({
      where: { id: bookingId },
      include: {
        customer: true,
        tour: { select: { tourName: true, tourCode: true, externalTourId: true } },
        departure: { select: { startDate: true, endDate: true } },
        travelers: { orderBy: { createdAt: 'asc' } },
      },
    });

    const { generateCopyHelper } = await import('@/services/rpaEngine');
    const summary = generateCopyHelper(booking);

    return NextResponse.json({ success: true, data: summary });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
