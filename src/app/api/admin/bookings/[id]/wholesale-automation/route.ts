export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/bookings/[id]/wholesale-automation
 * Full automation status panel data for a booking
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
        supplier: { select: { id: true, displayName: true, canonicalName: true, bookingMethod: true } },
        tour: { select: { id: true, tourName: true, tourCode: true, bookingUrl: true, externalTourId: true } },
        departure: { select: { id: true, startDate: true, endDate: true, remainingSeats: true } },
        customer: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
        travelers: true,
        wholesaleRef: true,
      },
    });

    // Get supplier automation config
    const automationConfig = await (prisma as any).supplierAutomationConfig.findUnique({
      where: { supplierId: booking.supplierId },
    });

    // Get credential status (masked)
    const credentials = await (prisma as any).supplierCredential.findMany({
      where: { supplierId: booking.supplierId, status: 'ACTIVE' },
      select: { id: true, credentialName: true, status: true, lastUsedAt: true, failedLoginCount: true },
    });

    // Get latest RPA session
    const latestSession = await (prisma as any).wholesaleRpaSession.findFirst({
      where: { bookingId },
      orderBy: { createdAt: 'desc' },
      include: { actions: { orderBy: { createdAt: 'desc' }, take: 10 } },
    });

    // Get all screenshots
    const screenshots = await (prisma as any).wholesaleRpaAction.findMany({
      where: { bookingId, screenshotUrl: { not: null } },
      select: { id: true, actionType: true, screenshotUrl: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: {
        // Booking info
        bookingId: booking.id,
        bookingRef: booking.bookingRef,
        bookingStatus: booking.status,

        // Supplier
        supplier: booking.supplier,
        supplierId: booking.supplierId,

        // Tour
        tour: booking.tour,
        departure: booking.departure,

        // Wholesale details
        wholesaleBookingMethod: booking.wholesaleBookingMethod,
        wholesaleStatus: booking.wholesaleStatus,
        wholesaleRef: booking.wholesaleRef,
        wholesaleTourUrl: booking.wholesaleRef?.wholesaleTourUrl || booking.tour?.bookingUrl || null,
        wholesaleBookingUrl: booking.wholesaleRef?.wholesaleBookingUrl || null,
        externalBookingRef: booking.wholesaleRef?.externalBookingRef || null,

        // Automation
        automationSupported: automationConfig?.automationEnabled || false,
        automationConfig: automationConfig ? {
          loginUrl: automationConfig.loginUrl,
          bookingMethod: automationConfig.bookingMethod,
          requiresAdminApproval: automationConfig.requiresAdminApproval,
          status: automationConfig.status,
        } : null,

        // Credentials (masked)
        credentialStatus: credentials.length > 0 ? 'CONFIGURED' : 'NOT_CONFIGURED',
        credentialCount: credentials.length,

        // Bot status
        botStatus: latestSession?.status || 'NOT_STARTED',
        lastBotRunAt: latestSession?.startedAt || null,
        lastErrorMessage: latestSession?.errorMessage || null,
        currentSessionId: latestSession?.id || null,
        adminApprovalRequired: latestSession?.adminApprovalRequired || true,
        adminApprovedBy: latestSession?.adminApprovedBy || null,
        adminApprovedAt: latestSession?.adminApprovedAt || null,

        // Screenshots
        screenshotBeforeUrl: latestSession?.screenshotBeforeUrl || null,
        screenshotAfterUrl: latestSession?.screenshotAfterUrl || null,
        screenshots,

        // Travelers (for copy helper)
        travelers: booking.travelers,
        customer: booking.customer,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
