export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auditLog } from '@/lib/logger';

/**
 * POST /api/admin/bookings/[id]/wholesale-automation/request-approval
 * Bot requests admin to review before submitting
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: bookingId } = await params;
  try {
    const { sessionId, screenshotUrl, filledSummary } = await req.json();

    if (!sessionId) {
      return NextResponse.json({ success: false, error: 'Missing sessionId' }, { status: 400 });
    }

    const session = await (prisma as any).wholesaleRpaSession.findUniqueOrThrow({
      where: { id: sessionId },
    });

    if (session.status !== 'FILLING_FORM') {
      return NextResponse.json({ success: false, error: `Session is ${session.status} — expected FILLING_FORM` }, { status: 400 });
    }

    // Update to waiting
    await (prisma as any).wholesaleRpaSession.update({
      where: { id: sessionId },
      data: {
        status: 'WAITING_ADMIN_APPROVAL',
        screenshotBeforeUrl: screenshotUrl || session.screenshotBeforeUrl,
      },
    });

    // Log the preview action
    await (prisma as any).wholesaleRpaAction.create({
      data: {
        sessionId,
        bookingId,
        actionType: 'REQUEST_APPROVAL',
        actionStatus: 'SUCCESS',
        inputSummary: filledSummary || 'Form filled — waiting admin review',
        screenshotUrl,
      },
    });

    await auditLog({
      action: 'RPA_REQUEST_APPROVAL',
      userId: 'BOT',
      targetType: 'wholesale_rpa_session',
      targetId: sessionId,
      details: { bookingId },
    });

    return NextResponse.json({
      success: true,
      status: 'WAITING_ADMIN_APPROVAL',
      message: 'Bot is waiting for admin approval before submitting',
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
