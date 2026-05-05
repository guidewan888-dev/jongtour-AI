export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { auditLog } from '@/lib/logger';

/**
 * POST /api/admin/rpa/start
 * Gateway to start RPA session — calls internal engine or external bot service
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sessionId, bookingId, supplierId } = body;

    if (!sessionId) {
      return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 });
    }

    // Try internal engine first
    try {
      const { executeRpaWorkflow } = await import('@/services/rpaEngine');
      const result = await executeRpaWorkflow(sessionId);

      await auditLog({
        action: 'RPA_SESSION_START',
        userId: 'BOT',
        targetType: 'wholesale_rpa_session',
        targetId: sessionId,
        details: { bookingId, supplierId, result: result.status },
      });

      return NextResponse.json(result);
    } catch (engineError: any) {
      console.warn('[RPA Gateway] Internal engine failed, trying external bot service:', engineError.message);
    }

    // Fallback to external bot service
    const botUrl = process.env.BOT_SERVICE_URL;
    if (!botUrl) {
      return NextResponse.json({
        error: 'No RPA engine available — internal engine failed and BOT_SERVICE_URL not configured',
      }, { status: 500 });
    }

    const res = await fetch(`${botUrl}/run/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, bookingId, supplierId }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Bot Service returned ${res.status}: ${errorText}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error in RPA Gateway:', error);
    return NextResponse.json(
      { error: 'Failed to execute RPA workflow', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/rpa/submit
 * Gateway to execute the submit step after admin approval
 */
// Also handle submit via query params
