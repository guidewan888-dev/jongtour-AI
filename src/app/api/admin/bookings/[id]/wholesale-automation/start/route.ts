export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auditLog } from '@/lib/logger';

/**
 * POST /api/admin/bookings/[id]/wholesale-automation/start
 * Start RPA session — validates booking data, creates session, triggers bot
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: bookingId } = await params;
  try {
    const { startedBy } = await req.json();

    // 1. Load booking with all required data
    const booking = await prisma.booking.findUniqueOrThrow({
      where: { id: bookingId },
      include: {
        supplier: true,
        tour: true,
        departure: true,
        customer: true,
        travelers: true,
      },
    });

    // 2. Validate booking data completeness
    const errors: string[] = [];
    if (!booking.supplierId) errors.push('Missing supplier');
    if (!booking.tourId) errors.push('Missing tour');
    if (!booking.departureId) errors.push('Missing departure');
    if (!booking.customerId) errors.push('Missing customer');
    if (!booking.travelers?.length) errors.push('No travelers');
    if (!booking.tour?.externalTourId && !booking.tour?.bookingUrl) errors.push('No wholesale tour URL or external ID');

    if (errors.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'Booking validation failed',
        validationErrors: errors,
      }, { status: 400 });
    }

    // 3. Check automation config
    const config = await (prisma as any).supplierAutomationConfig.findUnique({
      where: { supplierId: booking.supplierId },
    });

    if (!config?.automationEnabled) {
      return NextResponse.json({
        success: false,
        error: 'Automation not enabled for this supplier. Use manual follow-up.',
        suggestion: 'MANUAL_FOLLOW_UP',
      }, { status: 400 });
    }

    // 4. Check credentials exist
    const credential = await (prisma as any).supplierCredential.findFirst({
      where: { supplierId: booking.supplierId, status: 'ACTIVE' },
    });

    if (!credential) {
      return NextResponse.json({
        success: false,
        error: 'No active credentials for this supplier',
        suggestion: 'ADD_CREDENTIALS',
      }, { status: 400 });
    }

    // 5. Check for existing active session
    const existingSession = await (prisma as any).wholesaleRpaSession.findFirst({
      where: {
        bookingId,
        status: { in: ['CHECKING_DATA', 'LOGGING_IN', 'FILLING_FORM', 'WAITING_ADMIN_APPROVAL'] },
      },
    });

    if (existingSession) {
      return NextResponse.json({
        success: false,
        error: 'An active RPA session already exists',
        sessionId: existingSession.id,
        status: existingSession.status,
      }, { status: 409 });
    }

    // 6. Create RPA session
    const session = await (prisma as any).wholesaleRpaSession.create({
      data: {
        bookingId,
        supplierId: booking.supplierId,
        status: 'CHECKING_DATA',
        startedBy: startedBy || 'ADMIN',
        adminApprovalRequired: config.requiresAdminApproval,
      },
    });

    // 7. Update booking status
    await prisma.booking.update({
      where: { id: bookingId },
      data: { wholesaleStatus: 'SENT_TO_WHOLESALE' },
    });

    // 8. Log first action
    await (prisma as any).wholesaleRpaAction.create({
      data: {
        sessionId: session.id,
        bookingId,
        actionType: 'SESSION_START',
        actionStatus: 'SUCCESS',
        inputSummary: JSON.stringify({
          supplier: booking.supplier?.displayName,
          tour: booking.tour?.tourName,
          departure: booking.departure?.startDate,
          travelers: booking.travelers?.length,
        }),
      },
    });

    // 9. Trigger bot service (async — don't wait)
    const botUrl = process.env.BOT_SERVICE_URL;
    if (botUrl) {
      fetch(`${botUrl}/run/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: session.id,
          bookingId,
          supplierId: booking.supplierId,
          credentialId: credential.id,
          loginUrl: config.loginUrl,
          bookingUrlPattern: config.bookingUrlPattern,
          selectors: config.selectorsJson,
        }),
      }).catch(e => console.error('[RPA Start] Bot service call failed:', e.message));
    }

    // 10. Audit log
    await auditLog({
      action: 'RPA_SESSION_START',
      userId: startedBy || 'ADMIN',
      targetType: 'wholesale_rpa_session',
      targetId: session.id,
      details: { bookingId, supplierId: booking.supplierId },
    });

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      status: session.status,
      message: 'RPA session started — bot is preparing',
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
