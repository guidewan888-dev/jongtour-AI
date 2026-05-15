import { NextResponse } from 'next/server';
import { processPdfExtractionQueue } from '@/services/central-wholesale.service';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const wholesalerId = String(searchParams.get('wholesalerId') || '').trim() || undefined;
    const batchSize = Number(searchParams.get('batchSize') || 25);
    const maxRuntimeMs = Number(searchParams.get('maxRuntimeMs') || 240000);
    const runUntilDrained = String(searchParams.get('runUntilDrained') || 'true').toLowerCase() !== 'false';
    const maxRounds = Number(searchParams.get('maxRounds') || 40);
    const startedAt = Date.now();

    const safeBatch = Number.isFinite(batchSize) ? Math.max(1, batchSize) : 25;
    const safeRuntime = Number.isFinite(maxRuntimeMs) ? Math.max(1000, maxRuntimeMs) : 240000;
    const rounds: any[] = [];
    const roundLimit = Number.isFinite(maxRounds) ? Math.max(1, Math.min(maxRounds, 200)) : 40;
    let aggregate = { processed: 0, completed: 0, failed: 0, retried: 0, durationMs: 0 };

    for (let round = 1; round <= roundLimit; round += 1) {
      const elapsed = Date.now() - startedAt;
      if (elapsed >= safeRuntime) break;
      const result = await processPdfExtractionQueue({
        wholesalerId,
        batchSize: safeBatch,
        maxRuntimeMs: Math.min(120000, Math.max(5000, safeRuntime - elapsed)),
      });
      rounds.push({ round, ...result });
      aggregate = {
        processed: aggregate.processed + Number(result.processed || 0),
        completed: aggregate.completed + Number(result.completed || 0),
        failed: aggregate.failed + Number(result.failed || 0),
        retried: aggregate.retried + Number(result.retried || 0),
        durationMs: Date.now() - startedAt,
      };
      if (!runUntilDrained) break;
      if (Number(result.processed || 0) < safeBatch) break;
    }

    return NextResponse.json({
      success: true,
      runUntilDrained,
      rounds,
      aggregate,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'central pdf extraction cron failed' },
      { status: 500 },
    );
  }
}
