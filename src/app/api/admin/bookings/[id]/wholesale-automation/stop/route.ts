export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auditLog } from '@/lib/logger';

/**
 * POST /api/admin/bookings/[id]/wholesale-automation/stop
 * Stop active RPA session — ถ้า Bot ไม่มั่นใจ ต้องหยุด
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: bookingId } = await params;
  try {
    const { sessionId, reason, stoppedBy } = await req.json();

    if (!sessionId) {
      return NextResponse.json({ success: false, error: 'Missing sessionId' }, { status: 400 });
    }

    const session = await (prisma as any).wholesaleRpaSession.findUniqueOrThrow({
      where: { id: sessionId },
    });

    // Already finished
    if (['SUBMITTED', 'CONFIRMED', 'FAILED'].includes(session.status)) {
      return NextResponse.json({ success: false, error: `Session already ${session.status}` }, { status: 400 });
    }

    await (prisma as any).wholesaleRpaSession.update({
      where: { id: sessionId },
      data: {
        status: 'FAILED',
        finishedAt: new Date(),
        errorMessage: reason || 'Stopped by admin',
      },
    });

    await (prisma as any).wholesaleRpaAction.create({
      data: {
        sessionId,
        bookingId,
        actionType: 'SESSION_STOP',
        actionStatus: 'SUCCESS',
        inputSummary: reason || 'Stopped by admin',
      },
    });

    // Notify bot service to stop
    const botUrl = process.env.BOT_SERVICE_URL;
    if (botUrl) {
      fetch(`${botUrl}/run/stop`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      }).catch(() => {});
    }

    await auditLog({
      action: 'RPA_SESSION_STOP',
      userId: stoppedBy || 'ADMIN',
      targetType: 'wholesale_rpa_session',
      targetId: sessionId,
      details: { bookingId, reason },
    });

    return NextResponse.json({ success: true, status: 'STOPPED' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
