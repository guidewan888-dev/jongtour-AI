import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

dotenv.config({ path: '.env.local' });
dotenv.config();

const DEFAULT_TARGETS = ['SUP_GO365', 'worldconnection', 'itravels', 'bestintl', 'gs25'];

function parseTargets(): string[] {
  const raw = String(process.env.CENTRAL_REQUEUE_TARGETS || '').trim();
  if (!raw) return DEFAULT_TARGETS;
  return Array.from(new Set(raw.split(',').map((value) => value.trim()).filter(Boolean)));
}

function isStaleFkError(lastError: string): boolean {
  const text = String(lastError || '');
  return /tour_prices_departure_id_fkey/i.test(text) || /foreign key constraint/i.test(text);
}

function isRecoverableError(lastError: string): boolean {
  const text = String(lastError || '').toLowerCase();
  if (!text) return false;

  const hardNo = [
    /tour_prices_departure_id_fkey/i,
    /violates foreign key constraint/i,
    /invalid input syntax/i,
    /permission denied/i,
    /column .* does not exist/i,
    /relation .* does not exist/i,
  ];
  if (hardNo.some((rx) => rx.test(text))) return false;

  const softYes = [
    /pdf buffer unavailable/i,
    /http\s*(403|408|409|423|425|429|500|502|503|504)/i,
    /timeout/i,
    /timed out/i,
    /fetch failed/i,
    /network/i,
    /econn/i,
    /enotfound/i,
    /socket/i,
    /tls/i,
    /openai/i,
    /ocr/i,
  ];
  return softYes.some((rx) => rx.test(text));
}

async function run() {
  const sb = getSupabaseAdmin();
  const targets = parseTargets();
  const dryRun = String(process.env.CENTRAL_REQUEUE_DRY_RUN || 'false').toLowerCase() === 'true';

  const report: any = {
    generatedAt: new Date().toISOString(),
    dryRun,
    targets: [] as any[],
    requeuedJobs: [] as any[],
  };

  for (const wholesalerId of targets) {
    const { data: failedJobs, error } = await sb
      .from('pdf_extraction_jobs')
      .select('id, wholesale_id, canonical_tour_id, departure_id, pdf_url, attempts, status, last_error, updated_at')
      .eq('wholesale_id', wholesalerId)
      .eq('status', 'failed')
      .order('updated_at', { ascending: false })
      .limit(5000);
    if (error) throw new Error(`[requeue] load failed jobs ${wholesalerId}: ${error.message}`);

    const jobs = failedJobs || [];
    const departureIds = Array.from(
      new Set(
        jobs
          .map((job: any) => String(job.departure_id || '').trim())
          .filter(Boolean),
      ),
    );

    const validDepartureIds = new Set<string>();
    for (let i = 0; i < departureIds.length; i += 500) {
      const chunk = departureIds.slice(i, i + 500);
      const { data: deps, error: depError } = await sb.from('tour_departures').select('id').in('id', chunk);
      if (depError) throw new Error(`[requeue] validate departure chunk ${wholesalerId}: ${depError.message}`);
      for (const dep of deps || []) validDepartureIds.add(String((dep as any).id));
    }

    const staleJobs: any[] = [];
    const nonRecoverableJobs: any[] = [];
    const recoverableJobs: any[] = [];

    for (const job of jobs) {
      const departureId = String((job as any).departure_id || '').trim();
      const lastError = String((job as any).last_error || '');
      const missingDeparture = departureId ? !validDepartureIds.has(departureId) : false;

      if (isStaleFkError(lastError) || missingDeparture) {
        staleJobs.push(job);
        continue;
      }
      if (!isRecoverableError(lastError)) {
        nonRecoverableJobs.push(job);
        continue;
      }
      recoverableJobs.push(job);
    }

    if (!dryRun && recoverableJobs.length > 0) {
      for (let i = 0; i < recoverableJobs.length; i += 500) {
        const chunk = recoverableJobs.slice(i, i + 500).map((job: any) => String(job.id));
        const { error: updateError } = await sb
          .from('pdf_extraction_jobs')
          .update({
            status: 'retry',
            attempts: 0,
            last_error: null,
            locked_at: null,
            updated_at: new Date().toISOString(),
          })
          .in('id', chunk);
        if (updateError) throw new Error(`[requeue] update retry ${wholesalerId}: ${updateError.message}`);
      }
    }

    report.targets.push({
      wholesalerId,
      totalFailed: jobs.length,
      staleFkOrMissingDeparture: staleJobs.length,
      nonRecoverable: nonRecoverableJobs.length,
      recoverableRequeued: recoverableJobs.length,
    });

    for (const job of recoverableJobs) {
      report.requeuedJobs.push({
        job_id: String((job as any).id || ''),
        wholesaler_id: wholesalerId,
        departure_id: String((job as any).departure_id || ''),
        pdf_url: String((job as any).pdf_url || ''),
        last_error: String((job as any).last_error || ''),
        updated_at: String((job as any).updated_at || ''),
      });
    }
  }

  const outDir = path.join(process.cwd(), 'reports');
  fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, `requeue-recoverable-failed-jobs-${Date.now()}.json`);
  fs.writeFileSync(outFile, JSON.stringify(report, null, 2), 'utf8');
  console.log(`[requeue] report=${outFile}`);
}

run().catch((error) => {
  console.error('[requeue] fatal:', error);
  process.exit(1);
});

