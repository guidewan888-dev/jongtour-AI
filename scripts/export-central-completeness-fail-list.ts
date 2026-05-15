import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { getDepartureCompletenessReport } from '@/services/central-wholesale.service';

dotenv.config({ path: '.env.local' });
dotenv.config();

const DEFAULT_TARGETS = ['SUP_GO365', 'worldconnection', 'itravels', 'bestintl', 'gs25'];

function parseTargets(): string[] {
  const raw = String(process.env.CENTRAL_EXPORT_TARGETS || '').trim();
  if (!raw) return DEFAULT_TARGETS;
  return Array.from(new Set(raw.split(',').map((value) => value.trim()).filter(Boolean)));
}

function isStaleFkError(lastError: string): boolean {
  const text = String(lastError || '');
  return /tour_prices_departure_id_fkey/i.test(text) || /foreign key constraint/i.test(text);
}

function toCsv(rows: Array<Record<string, any>>): string {
  if (rows.length === 0) return '';
  const headers = Array.from(new Set(rows.flatMap((row) => Object.keys(row))));
  const esc = (value: any) => {
    const s = String(value ?? '');
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  return [headers.join(','), ...rows.map((row) => headers.map((header) => esc(row[header])).join(','))].join('\n');
}

async function run() {
  const sb = getSupabaseAdmin();
  const targets = parseTargets();
  const output: any = {
    generatedAt: new Date().toISOString(),
    targets: [] as any[],
    manualReviewList: [] as any[],
  };

  for (const wholesalerId of targets) {
    const completenessRows = await getDepartureCompletenessReport({
      wholesalerId,
      onlyIncomplete: false,
      limit: 100_000,
      offset: 0,
    });

    const total = completenessRows.length;
    const complete = completenessRows.filter((row: any) => row.is_complete).length;
    const missingCount: Record<string, number> = {};
    for (const row of completenessRows.filter((item: any) => !item.is_complete)) {
      for (const field of row.missing_fields || []) {
        missingCount[String(field)] = (missingCount[String(field)] || 0) + 1;
      }
    }

    const { data: failedJobs } = await sb
      .from('pdf_extraction_jobs')
      .select('id, wholesale_id, canonical_tour_id, departure_id, pdf_url, attempts, last_error, updated_at')
      .eq('wholesale_id', wholesalerId)
      .eq('status', 'failed')
      .order('updated_at', { ascending: false })
      .limit(3000);

    const failed = failedJobs || [];
    const departureIds = Array.from(
      new Set(
        failed
          .map((job: any) => String(job.departure_id || '').trim())
          .filter(Boolean),
      ),
    );
    const validDepartureIds = new Set<string>();
    if (departureIds.length > 0) {
      for (let i = 0; i < departureIds.length; i += 500) {
        const chunk = departureIds.slice(i, i + 500);
        const { data: deps } = await sb.from('tour_departures').select('id').in('id', chunk);
        for (const dep of deps || []) validDepartureIds.add(String((dep as any).id));
      }
    }

    const staleFk = [];
    const needsManualReview = [];
    for (const job of failed) {
      const departureId = String((job as any).departure_id || '').trim();
      const lastError = String((job as any).last_error || '');
      const missingDeparture = departureId ? !validDepartureIds.has(departureId) : false;
      const stale = isStaleFkError(lastError) || missingDeparture;
      const row = {
        job_id: String((job as any).id || ''),
        wholesaler_id: wholesalerId,
        canonical_tour_id: String((job as any).canonical_tour_id || ''),
        departure_id: departureId,
        pdf_url: String((job as any).pdf_url || ''),
        attempts: Number((job as any).attempts || 0),
        last_error: lastError,
        updated_at: String((job as any).updated_at || ''),
        stale_fk_or_missing_departure: stale ? 'yes' : 'no',
      };
      if (stale) staleFk.push(row);
      else needsManualReview.push(row);
    }

    output.targets.push({
      wholesalerId,
      completeness: {
        total,
        complete,
        percent: total > 0 ? Number(((complete / total) * 100).toFixed(2)) : 0,
        topMissing: Object.entries(missingCount).sort((a, b) => b[1] - a[1]).slice(0, 12),
      },
      failedSummary: {
        totalFailedJobs: failed.length,
        staleFkOrMissingDeparture: staleFk.length,
        needsManualReview: needsManualReview.length,
      },
      manualReviewSample: needsManualReview.slice(0, 20),
    });

    output.manualReviewList.push(...needsManualReview);
  }

  output.manualReviewList = output.manualReviewList.sort((a: any, b: any) =>
    String(a.updated_at || '').localeCompare(String(b.updated_at || '')),
  );

  const outDir = path.join(process.cwd(), 'reports');
  fs.mkdirSync(outDir, { recursive: true });
  const stamp = Date.now();
  const jsonPath = path.join(outDir, `central-completeness-fail-export-${stamp}.json`);
  const csvPath = path.join(outDir, `central-manual-review-fail-list-${stamp}.csv`);
  fs.writeFileSync(jsonPath, JSON.stringify(output, null, 2), 'utf8');
  fs.writeFileSync(csvPath, toCsv(output.manualReviewList), 'utf8');

  console.log(`[central-export] json=${jsonPath}`);
  console.log(`[central-export] csv=${csvPath}`);
  console.log(`[central-export] manual_review_count=${output.manualReviewList.length}`);
}

run().catch((error) => {
  console.error('[central-export] fatal:', error);
  process.exit(1);
});

