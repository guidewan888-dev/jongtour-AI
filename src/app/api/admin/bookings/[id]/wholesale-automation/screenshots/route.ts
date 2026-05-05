export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/bookings/[id]/wholesale-automation/screenshots
 * Get all screenshots from RPA sessions for this booking
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: bookingId } = await params;
  try {
    // Get all sessions with screenshots
    const sessions = await (prisma as any).wholesaleRpaSession.findMany({
      where: { bookingId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        status: true,
        screenshotBeforeUrl: true,
        screenshotAfterUrl: true,
        startedAt: true,
        startedBy: true,
      },
    });

    // Get action-level screenshots
    const actionScreenshots = await (prisma as any).wholesaleRpaAction.findMany({
      where: { bookingId, screenshotUrl: { not: null } },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        sessionId: true,
        actionType: true,
        screenshotUrl: true,
        createdAt: true,
      },
    });

    // Combine all screenshots
    const allScreenshots: any[] = [];

    for (const s of sessions) {
      if (s.screenshotBeforeUrl) {
        allScreenshots.push({
          type: 'SESSION_BEFORE',
          sessionId: s.id,
          url: s.screenshotBeforeUrl,
          label: `Before — Session ${s.id.slice(-6)}`,
          timestamp: s.startedAt,
        });
      }
      if (s.screenshotAfterUrl) {
        allScreenshots.push({
          type: 'SESSION_AFTER',
          sessionId: s.id,
          url: s.screenshotAfterUrl,
          label: `After — Session ${s.id.slice(-6)}`,
          timestamp: s.startedAt,
        });
      }
    }

    for (const a of actionScreenshots) {
      allScreenshots.push({
        type: 'ACTION',
        sessionId: a.sessionId,
        actionId: a.id,
        url: a.screenshotUrl,
        label: `${a.actionType} — ${a.id.slice(-6)}`,
        timestamp: a.createdAt,
      });
    }

    return NextResponse.json({
      success: true,
      data: allScreenshots.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
