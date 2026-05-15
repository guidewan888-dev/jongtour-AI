import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

dotenv.config({ path: '.env.local' });
dotenv.config();

const DEFAULT_TARGETS = ['SUP_GO365', 'worldconnection', 'itravels', 'bestintl', 'gs25'];

function parseTargets(): string[] {
  const raw = String(process.env.CENTRAL_CLEANUP_TARGETS || '').trim();
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

function isStaleFkError(lastError: string): boolean {
  const text = String(lastError || '');
  return /tour_prices_departure_id_fkey/i.test(text) || /violates foreign key constraint/i.test(text);
}

function chunk<T>(rows: T[], size: number): T[][] {
  const output: T[][] = [];
  for (let i = 0; i < rows.length; i += size) output.push(rows.slice(i, i + size));
  return output;
}

async function run() {
  const sb = getSupabaseAdmin();
  const targets = parseTargets();
  const dryRun = String(process.env.CENTRAL_CLEANUP_DRY_RUN || 'false').toLowerCase() === 'true';
  const startedAt = Date.now();
  const runId = `cleanup-${Date.now()}`;

  const report: any = {
    runId,
    generatedAt: new Date().toISOString(),
    dryRun,
    targets: [] as any[],
    archivedJobs: [] as any[],
  };

  for (const wholesalerId of targets) {
    const { data: failedJobs, error } = await sb
      .from('pdf_extraction_jobs')
      .select('id, wholesale_id, canonical_tour_id, departure_id, pdf_url, attempts, status, last_error, extraction_result, updated_at')
      .eq('wholesale_id', wholesalerId)
      .eq('status', 'failed')
      .order('updated_at', { ascending: false })
      .limit(5000);
    if (error) throw new Error(`[cleanup] load failed jobs ${wholesalerId}: ${error.message}`);

    const jobs = failedJobs || [];
    const departureIds = Array.from(
      new Set(
        jobs
          .map((job: any) => String(job.departure_id || '').trim())
          .filter(Boolean),
      ),
    );

    const validDepartureIds = new Set<string>();
    for (const part of chunk(departureIds, 500)) {
      const { data: departures, error: depError } = await sb.from('tour_departures').select('id').in('id', part);
      if (depError) throw new Error(`[cleanup] validate departures ${wholesalerId}: ${depError.message}`);
      for (const dep of departures || []) {
        validDepartureIds.add(String((dep as any).id));
      }
    }

    const staleJobs = jobs.filter((job: any) => {
      const departureId = String(job.departure_id || '').trim();
      const missingDeparture = departureId ? !validDepartureIds.has(departureId) : false;
      return missingDeparture || isStaleFkError(String(job.last_error || ''));
    });

    if (!dryRun) {
      for (const part of chunk(staleJobs, 100)) {
        for (const job of part) {
          const prevResult = (job as any).extraction_result && typeof (job as any).extraction_result === 'object'
            ? (job as any).extraction_result
            : {};
          const nextResult = {
            ...prevResult,
            cleanup: {
              run_id: runId,
              cleaned_at: new Date().toISOString(),
              reason: 'stale_failed_job',
              previous_status: String(job.status || 'failed'),
              previous_error: String(job.last_error || ''),
              action: 'archived',
            },
          };

          const { error: updateError } = await sb
            .from('pdf_extraction_jobs')
            .update({
              status: 'archived',
              source_hint: `${String(job.wholesale_id || '')}:cleanup`,
              last_error: `[ARCHIVED_STALE] ${String(job.last_error || '')}`.slice(0, 1800),
              extraction_result: nextResult,
              locked_at: null,
              updated_at: new Date().toISOString(),
            })
            .eq('id', String(job.id));
          if (updateError) throw new Error(`[cleanup] archive job ${job.id}: ${updateError.message}`);
        }
      }
    }

    const targetSummary = {
      wholesalerId,
      totalFailed: jobs.length,
      staleArchived: staleJobs.length,
      remainedActionableFailed: jobs.length - staleJobs.length,
    };
    report.targets.push(targetSummary);

    for (const job of staleJobs) {
      report.archivedJobs.push({
        job_id: String((job as any).id || ''),
        wholesaler_id: wholesalerId,
        canonical_tour_id: String((job as any).canonical_tour_id || ''),
        departure_id: String((job as any).departure_id || ''),
        pdf_url: String((job as any).pdf_url || ''),
        attempts: Number((job as any).attempts || 0),
        last_error: String((job as any).last_error || ''),
        updated_at: String((job as any).updated_at || ''),
      });
    }

    await sb.from('sync_logs').insert({
      wholesale_id: wholesalerId,
      sync_type: 'pdf_queue_cleanup',
      status: 'SUCCESS',
      message: dryRun
        ? `[DRY_RUN] stale failed jobs detected=${staleJobs.length}`
        : `archived stale failed jobs=${staleJobs.length}`,
      records_added: 0,
      records_updated: staleJobs.length,
      records_failed: 0,
      created_at: new Date().toISOString(),
    });
  }

  report.finishedAt = new Date().toISOString();
  report.durationSec = Math.round((Date.now() - startedAt) / 1000);
  report.archivedCount = report.archivedJobs.length;

  const outDir = path.join(process.cwd(), 'reports');
  fs.mkdirSync(outDir, { recursive: true });
  const jsonFile = path.join(outDir, `cleanup-stale-failed-jobs-${Date.now()}.json`);
  fs.writeFileSync(jsonFile, JSON.stringify(report, null, 2), 'utf8');

  console.log(`[cleanup] report=${jsonFile}`);
  console.log(`[cleanup] archived_count=${report.archivedCount}`);
}

run().catch((error) => {
  console.error('[cleanup] fatal:', error);
  process.exit(1);
});

