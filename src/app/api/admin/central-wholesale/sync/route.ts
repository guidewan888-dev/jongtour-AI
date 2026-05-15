import { NextResponse } from 'next/server';
import { processPdfExtractionQueue, syncCentralWholesale } from '@/services/central-wholesale.service';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

export async function POST(req: Request) {
  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const wholesalerId = String(body.wholesalerId || '').trim() || undefined;
    const includeApi = body.includeApi !== false;
    const includeScraper = body.includeScraper !== false;
    const limitPerSource = Number(body.limitPerSource || 2000);
    const runPdfWorker = body.runPdfWorker !== false;
    const pdfWorkerBatchSize = Number(body.pdfWorkerBatchSize || 40);
    const runPdfWorkerUntilDrained = body.runPdfWorkerUntilDrained === true;
    const maxPdfWorkerRounds = Number(body.maxPdfWorkerRounds || 20);
    const maxPdfWorkerTotalRuntimeMs = Number(body.maxPdfWorkerTotalRuntimeMs || 270000);

    const results = await syncCentralWholesale({
      wholesalerId,
      includeApi,
      includeScraper,
      limitPerSource: Number.isFinite(limitPerSource) && limitPerSource > 0 ? limitPerSource : 2000,
    });
    let pdfWorker: any = null;
    if (runPdfWorker) {
      const safeBatchSize = Number.isFinite(pdfWorkerBatchSize) ? Math.max(1, pdfWorkerBatchSize) : 40;
      const roundsLimit = Number.isFinite(maxPdfWorkerRounds) ? Math.max(1, Math.min(maxPdfWorkerRounds, 200)) : 20;
      const runtimeBudget = Number.isFinite(maxPdfWorkerTotalRuntimeMs)
        ? Math.max(30_000, Math.min(maxPdfWorkerTotalRuntimeMs, 1_800_000))
        : 270_000;
      const startedAt = Date.now();

      const rounds: any[] = [];
      let aggregate = {
        processed: 0,
        completed: 0,
        failed: 0,
        retried: 0,
        durationMs: 0,
      };

      for (let round = 1; round <= roundsLimit; round += 1) {
        const elapsed = Date.now() - startedAt;
        if (elapsed >= runtimeBudget) break;

        const workerResult = await processPdfExtractionQueue({
          wholesalerId,
          batchSize: safeBatchSize,
          maxRuntimeMs: Math.min(240_000, Math.max(5_000, runtimeBudget - elapsed)),
        });

        rounds.push({ round, ...workerResult });
        aggregate = {
          processed: aggregate.processed + Number(workerResult.processed || 0),
          completed: aggregate.completed + Number(workerResult.completed || 0),
          failed: aggregate.failed + Number(workerResult.failed || 0),
          retried: aggregate.retried + Number(workerResult.retried || 0),
          durationMs: Date.now() - startedAt,
        };

        if (!runPdfWorkerUntilDrained) break;
        if (Number(workerResult.processed || 0) < safeBatchSize) break;
      }

      pdfWorker = {
        runUntilDrained: runPdfWorkerUntilDrained,
        rounds,
        aggregate,
      };
    }

    const summary = results.reduce(
      (acc, row) => {
        acc.recordsAdded += row.recordsAdded;
        acc.recordsUpdated += row.recordsUpdated;
        acc.recordsFailed += row.recordsFailed;
        return acc;
      },
      { recordsAdded: 0, recordsUpdated: 0, recordsFailed: 0 },
    );

    const wholesalerIds = Array.from(new Set(results.map((row) => row.wholesalerId).filter(Boolean)));
    let quality: any[] = [];
    if (wholesalerIds.length > 0) {
      const sb = getSupabaseAdmin();
      const { data: rows } = await sb
        .from('sync_quality_reports')
        .select('*')
        .in('wholesale_id', wholesalerIds)
        .order('generated_at', { ascending: false })
        .limit(500);

      const latestByWholesale: Record<string, any> = {};
      for (const row of rows || []) {
        const wid = String(row.wholesale_id || '');
        if (!wid || latestByWholesale[wid]) continue;
        latestByWholesale[wid] = row;
      }
      quality = wholesalerIds.map((wid) => latestByWholesale[wid]).filter(Boolean);
    }

    return NextResponse.json({
      success: true,
      summary,
      results,
      quality,
      pdfWorker,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Central sync failed' },
      { status: 500 },
    );
  }
}
