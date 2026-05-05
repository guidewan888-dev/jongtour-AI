export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auditLog } from '@/lib/logger';

/**
 * POST /api/admin/bookings/[id]/wholesale-automation/fill
 * Record bot fill actions — bot reports what it filled
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: bookingId } = await params;
  try {
    const { sessionId, actions, screenshotUrl } = await req.json();

    if (!sessionId) {
      return NextResponse.json({ success: false, error: 'Missing sessionId' }, { status: 400 });
    }

    // Verify session exists and is active
    const session = await (prisma as any).wholesaleRpaSession.findUniqueOrThrow({
      where: { id: sessionId },
    });

    if (!['CHECKING_DATA', 'LOGGING_IN', 'FILLING_FORM'].includes(session.status)) {
      return NextResponse.json({ success: false, error: `Session is ${session.status} — cannot fill` }, { status: 400 });
    }

    // Record each fill action
    const results = [];
    for (const action of (actions || [])) {
      const log = await (prisma as any).wholesaleRpaAction.create({
        data: {
          sessionId,
          bookingId,
          actionType: action.type || 'FILL_FIELD',
          actionStatus: action.status || 'SUCCESS',
          actionUrl: action.url || null,
          inputSummary: action.field ? `${action.field}: ${action.value}` : action.summary || null,
          outputSummary: action.result || null,
          screenshotUrl: action.screenshotUrl || null,
          errorMessage: action.error || null,
        },
      });
      results.push(log.id);
    }

    // Update session status
    await (prisma as any).wholesaleRpaSession.update({
      where: { id: sessionId },
      data: {
        status: 'FILLING_FORM',
        screenshotBeforeUrl: screenshotUrl || session.screenshotBeforeUrl,
      },
    });

    await auditLog({
      action: 'RPA_FILL_FORM',
      userId: 'BOT',
      targetType: 'wholesale_rpa_session',
      targetId: sessionId,
      details: { bookingId, actionCount: results.length },
    });

    return NextResponse.json({ success: true, actionsLogged: results.length });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
