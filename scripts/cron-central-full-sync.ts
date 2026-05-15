import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import {
  enqueuePdfExtractionJobs,
  processPdfExtractionQueue,
  syncCentralWholesale,
} from '@/services/central-wholesale.service';

dotenv.config({ path: '.env.local' });
dotenv.config();

const DEFAULT_TARGETS = ['worldconnection', 'itravels', 'bestintl', 'gs25'];

type QueueCounts = {
  pending: number;
  retry: number;
  processing: number;
  failed: number;
  completed: number;
};

function parseTargets(): string[] {
  const raw = String(process.env.CENTRAL_SYNC_TARGETS || '').trim();
  if (!raw) return DEFAULT_TARGETS;
  return Array.from(
    new Set(
      raw
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean),
    ),
  );
}

async function getQueueCounts(wholesalerId: string): Promise<QueueCounts> {
  const sb = getSupabaseAdmin();
  const [pending, retry, processing, failed, completed] = await Promise.all([
    sb.from('pdf_extraction_jobs').select('id', { count: 'exact', head: true }).eq('wholesale_id', wholesalerId).eq('status', 'pending'),
    sb.from('pdf_extraction_jobs').select('id', { count: 'exact', head: true }).eq('wholesale_id', wholesalerId).eq('status', 'retry'),
    sb.from('pdf_extraction_jobs').select('id', { count: 'exact', head: true }).eq('wholesale_id', wholesalerId).eq('status', 'processing'),
    sb.from('pdf_extraction_jobs').select('id', { count: 'exact', head: true }).eq('wholesale_id', wholesalerId).eq('status', 'failed'),
    sb.from('pdf_extraction_jobs').select('id', { count: 'exact', head: true }).eq('wholesale_id', wholesalerId).eq('status', 'completed'),
  ]);
  return {
    pending: pending.count || 0,
    retry: retry.count || 0,
    processing: processing.count || 0,
    failed: failed.count || 0,
    completed: completed.count || 0,
  };
}

async function run() {
  const startedAt = Date.now();
  const targets = parseTargets();
  const batchSize = Math.max(1, Number(process.env.CENTRAL_SYNC_QUEUE_BATCH_SIZE || 80));
  const maxWorkerRounds = Math.max(1, Number(process.env.CENTRAL_SYNC_MAX_WORKER_ROUNDS || 500));
  const maxWorkerRuntimeMs = Math.max(15_000, Number(process.env.CENTRAL_SYNC_WORKER_RUNTIME_MS || 180_000));
  const limitPerSource = Math.max(1, Number(process.env.CENTRAL_SYNC_LIMIT_PER_SOURCE || 12_000));
  const enqueueLimit = Math.max(1, Number(process.env.CENTRAL_SYNC_ENQUEUE_LIMIT || 150_000));
  const includeApiForSup = String(process.env.CENTRAL_SYNC_INCLUDE_API_FOR_SUP || 'true').toLowerCase() !== 'false';
  const perTargetMaxMs = Math.max(60_000, Number(process.env.CENTRAL_SYNC_PER_TARGET_MAX_MS || 7_200_000));

  const report: any = {
    startedAt: new Date().toISOString(),
    config: {
      targets,
      batchSize,
      maxWorkerRounds,
      maxWorkerRuntimeMs,
      limitPerSource,
      enqueueLimit,
      includeApiForSup,
      perTargetMaxMs,
    },
    targets: [] as any[],
  };

  for (const wholesalerId of targets) {
    const targetStarted = Date.now();
    const isSup = wholesalerId.startsWith('SUP_');
    const targetReport: any = {
      wholesalerId,
      startedAt: new Date().toISOString(),
      sync: null,
      enqueue: null,
      workerRounds: [] as any[],
      queueBefore: null,
      queueAfter: null,
      timedOut: false,
      error: null as string | null,
    };

    try {
      console.log(`[central-full-sync] ${wholesalerId} start`);
      targetReport.queueBefore = await getQueueCounts(wholesalerId);
      console.log(`[central-full-sync] ${wholesalerId} queueBefore=${JSON.stringify(targetReport.queueBefore)}`);
      targetReport.sync = await syncCentralWholesale({
        wholesalerId,
        includeApi: isSup ? includeApiForSup : false,
        includeScraper: !isSup,
        limitPerSource,
      });
      console.log(`[central-full-sync] ${wholesalerId} normalize done`);

      targetReport.enqueue = await enqueuePdfExtractionJobs({
        wholesalerId,
        force: false,
        onlyMissingPricing: true,
        limit: enqueueLimit,
      });
      console.log(`[central-full-sync] ${wholesalerId} enqueue=${JSON.stringify(targetReport.enqueue)}`);

      let aggregate = { processed: 0, completed: 0, failed: 0, retried: 0, durationMs: 0 };
      for (let round = 1; round <= maxWorkerRounds; round += 1) {
        const elapsedTarget = Date.now() - targetStarted;
        if (elapsedTarget >= perTargetMaxMs) {
          targetReport.timedOut = true;
          break;
        }

        const roundResult = await processPdfExtractionQueue({
          wholesalerId,
          batchSize,
          maxRuntimeMs: Math.min(maxWorkerRuntimeMs, Math.max(5_000, perTargetMaxMs - elapsedTarget)),
        });
        targetReport.workerRounds.push({ round, ...roundResult });

        aggregate = {
          processed: aggregate.processed + Number(roundResult.processed || 0),
          completed: aggregate.completed + Number(roundResult.completed || 0),
          failed: aggregate.failed + Number(roundResult.failed || 0),
          retried: aggregate.retried + Number(roundResult.retried || 0),
          durationMs: Date.now() - targetStarted,
        };

        const queue = await getQueueCounts(wholesalerId);
        targetReport.queueAfter = queue;
        if (round % 10 === 0 || queue.pending === 0 && queue.retry === 0 && queue.processing === 0) {
          console.log(`[central-full-sync] ${wholesalerId} round=${round} queue=${JSON.stringify(queue)} aggregate=${JSON.stringify(aggregate)}`);
        }
        if (queue.pending === 0 && queue.retry === 0 && queue.processing === 0) {
          break;
        }
      }

      targetReport.aggregate = aggregate;
      targetReport.queueAfter = targetReport.queueAfter || (await getQueueCounts(wholesalerId));
    } catch (error: any) {
      targetReport.error = String(error?.message || error || 'unknown error');
      targetReport.queueAfter = await getQueueCounts(wholesalerId);
    }

    targetReport.finishedAt = new Date().toISOString();
    targetReport.durationSec = Math.round((Date.now() - targetStarted) / 1000);
    report.targets.push(targetReport);
    console.log(
      `[central-full-sync] ${wholesalerId} done in ${targetReport.durationSec}s | error=${targetReport.error ? 'yes' : 'no'} | queueAfter=${JSON.stringify(targetReport.queueAfter)}`,
    );
  }

  report.finishedAt = new Date().toISOString();
  report.durationSec = Math.round((Date.now() - startedAt) / 1000);
  const outDir = path.join(process.cwd(), 'reports');
  fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, `central-full-sync-${Date.now()}.json`);
  fs.writeFileSync(outFile, JSON.stringify(report, null, 2), 'utf8');
  console.log(`[central-full-sync] report=${outFile}`);
}

run().catch((error) => {
  console.error('[central-full-sync] fatal:', error);
  process.exit(1);
});
