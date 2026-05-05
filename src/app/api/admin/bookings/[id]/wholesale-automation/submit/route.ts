export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auditLog } from '@/lib/logger';

/**
 * POST /api/admin/bookings/[id]/wholesale-automation/submit
 * Submit booking to wholesale — REQUIRES approval token
 * ห้าม AI เรียก submit โดยตรงถ้าไม่มี approval
 * ห้าม Bot จองเองถ้าไม่มี Admin approve
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: bookingId } = await params;
  try {
    const { sessionId, approvalToken } = await req.json();

    if (!sessionId || !approvalToken) {
      return NextResponse.json({ success: false, error: 'Missing sessionId or approvalToken' }, { status: 400 });
    }

    // 1. Verify session
    const session = await (prisma as any).wholesaleRpaSession.findUniqueOrThrow({
      where: { id: sessionId },
    });

    // 2. Verify approval token
    if (!session.errorMessage) {
      return NextResponse.json({ success: false, error: 'No approval token found — admin must approve first' }, { status: 403 });
    }

    let tokenData: any;
    try {
      tokenData = JSON.parse(session.errorMessage);
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid approval data' }, { status: 403 });
    }

    if (tokenData.approvalToken !== approvalToken) {
      return NextResponse.json({ success: false, error: 'Invalid approval token' }, { status: 403 });
    }

    if (new Date(tokenData.tokenExpiry) < new Date()) {
      return NextResponse.json({ success: false, error: 'Approval token expired — request new approval' }, { status: 403 });
    }

    // 3. Update session to SUBMITTED
    await (prisma as any).wholesaleRpaSession.update({
      where: { id: sessionId },
      data: {
        status: 'SUBMITTED',
        errorMessage: null, // Clear token
      },
    });

    // 4. Trigger bot to submit
    const botUrl = process.env.BOT_SERVICE_URL;
    let botResult: any = { status: 'NO_BOT_SERVICE', message: 'Bot service not configured — manual submission required' };

    if (botUrl) {
      try {
        const res = await fetch(`${botUrl}/run/submit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId, bookingId, approvalToken }),
        });
        botResult = await res.json();
      } catch (e: any) {
        botResult = { status: 'BOT_ERROR', message: e.message };
      }
    }

    // 5. Log submit action
    await (prisma as any).wholesaleRpaAction.create({
      data: {
        sessionId,
        bookingId,
        actionType: 'SUBMIT_BOOKING',
        actionStatus: botResult.status === 'SUCCESS' ? 'SUCCESS' : 'PENDING',
        inputSummary: 'Submit booking with admin approval',
        outputSummary: botResult.message,
      },
    });

    // 6. Update booking status
    await prisma.booking.update({
      where: { id: bookingId },
      data: { wholesaleStatus: 'WAITING_CONFIRM' },
    });

    await auditLog({
      action: 'RPA_SUBMIT_BOOKING',
      userId: session.adminApprovedBy || 'BOT',
      targetType: 'wholesale_rpa_session',
      targetId: sessionId,
      details: { bookingId, botResult: botResult.status },
    });

    return NextResponse.json({
      success: true,
      status: 'SUBMITTED',
      botResult,
      message: 'Booking submitted to wholesale — waiting for confirmation',
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
