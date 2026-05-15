import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { SyncManager } from '@/services/suppliers/core/SyncManager';
import {
  syncCentralWholesale,
  enqueuePdfExtractionJobs,
  processPdfExtractionQueue,
  getDepartureCompletenessReport,
} from '@/services/central-wholesale.service';

const API_SUPPLIERS = ['SUP_LETGO', 'SUP_CHECKIN', 'SUP_TOURFACTORY', 'SUP_GO365'] as const;
const SCRAPER_WHOLESALERS = ['worldconnection', 'itravels', 'bestintl', 'gs25'] as const;

dotenv.config({ path: '.env.local' });
dotenv.config();

function nowIso() {
  return new Date().toISOString();
}

function summarizeCompleteness(rows: any[]) {
  const total = rows.length;
  const complete = rows.filter((r) => r.is_complete).length;
  const incomplete = total - complete;
  const missingFieldsCount: Record<string, number> = {};

  for (const row of rows) {
    const fields: string[] = Array.isArray(row.missing_fields) ? row.missing_fields : [];
    for (const f of fields) {
      missingFieldsCount[f] = (missingFieldsCount[f] || 0) + 1;
    }
  }

  const topMissing = Object.entries(missingFieldsCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([field, count]) => ({ field, count }));

  return {
    total_departures: total,
    complete_departures: complete,
    incomplete_departures: incomplete,
    completeness_percent: total > 0 ? Number(((complete / total) * 100).toFixed(2)) : 0,
    top_missing_fields: topMissing,
  };
}

async function run() {
  const startedAt = Date.now();
  const output: any = {
    started_at: nowIso(),
    step1_api_sync: [],
    step2_pdf_queue: [],
    step3_completeness: [],
  };

  const syncManager = new SyncManager();

  console.log('[1/3] API wholesaler sync + normalize start');
  for (const supplierId of API_SUPPLIERS) {
    const row: any = { supplierId, started_at: nowIso() };
    try {
      const t0 = Date.now();
      await syncManager.syncSupplierTours(supplierId);
      row.source_sync = { success: true, duration_ms: Date.now() - t0 };
    } catch (error: any) {
      row.source_sync = { success: false, error: String(error?.message || error) };
    }

    try {
      const t1 = Date.now();
      const normalized = await syncCentralWholesale({
        wholesalerId: supplierId,
        includeApi: true,
        includeScraper: false,
        limitPerSource: 8000,
      });
      row.central_normalize = {
        success: true,
        duration_ms: Date.now() - t1,
        result: normalized,
      };
    } catch (error: any) {
      row.central_normalize = {
        success: false,
        error: String(error?.message || error),
      };
    }

    row.finished_at = nowIso();
    output.step1_api_sync.push(row);
    console.log(`  - ${supplierId}: source=${row.source_sync.success ? 'ok' : 'fail'} normalize=${row.central_normalize.success ? 'ok' : 'fail'}`);
  }

  console.log('[2/3] PDF queue start (scraper wholesalers)');
  for (const wholesalerId of SCRAPER_WHOLESALERS) {
    const row: any = { wholesalerId, started_at: nowIso() };
    try {
      const enqueue = await enqueuePdfExtractionJobs({
        wholesalerId,
        force: false,
        onlyMissingPricing: true,
        limit: 30000,
      });
      row.enqueue = enqueue;

      const rounds: any[] = [];
      let aggregate = { processed: 0, completed: 0, failed: 0, retried: 0, durationMs: 0 };
      const workerStart = Date.now();
      for (let round = 1; round <= 60; round += 1) {
        const result = await processPdfExtractionQueue({
          wholesalerId,
          batchSize: 80,
          maxRuntimeMs: 240000,
        });
        rounds.push({ round, ...result });
        aggregate = {
          processed: aggregate.processed + Number(result.processed || 0),
          completed: aggregate.completed + Number(result.completed || 0),
          failed: aggregate.failed + Number(result.failed || 0),
          retried: aggregate.retried + Number(result.retried || 0),
          durationMs: Date.now() - workerStart,
        };

        if (Number(result.processed || 0) < 80) break;
      }

      row.worker = { rounds, aggregate };
      row.success = true;
    } catch (error: any) {
      row.success = false;
      row.error = String(error?.message || error);
    }

    row.finished_at = nowIso();
    output.step2_pdf_queue.push(row);
    console.log(`  - ${wholesalerId}: ${row.success ? 'ok' : 'fail'}`);
  }

  console.log('[3/3] Completeness report start');
  for (const wholesalerId of [...API_SUPPLIERS, ...SCRAPER_WHOLESALERS]) {
    const row: any = { wholesalerId, started_at: nowIso() };
    try {
      const rows = await getDepartureCompletenessReport({
        wholesalerId,
        onlyIncomplete: false,
        limit: 50000,
        offset: 0,
      });
      row.summary = summarizeCompleteness(rows as any[]);
      row.sample_incomplete = (rows as any[])
        .filter((r) => !r.is_complete)
        .slice(0, 15)
        .map((r: any) => ({
          departure_id: r.departure_id,
          canonical_tour_id: r.canonical_tour_id,
          source_departure_key: r.source_departure_key,
          missing_fields: r.missing_fields,
          price_source: r.price_source,
          extraction_status: r.price_extraction_status,
          need_review: r.need_review,
        }));
      row.success = true;
    } catch (error: any) {
      row.success = false;
      row.error = String(error?.message || error);
    }
    row.finished_at = nowIso();
    output.step3_completeness.push(row);
    console.log(`  - ${wholesalerId}: ${row.success ? 'ok' : 'fail'}`);
  }

  output.finished_at = nowIso();
  output.duration_seconds = Math.round((Date.now() - startedAt) / 1000);

  const reportsDir = path.join(process.cwd(), 'reports');
  fs.mkdirSync(reportsDir, { recursive: true });
  const filePath = path.join(reportsDir, `central-sync-1-3-${Date.now()}.json`);
  fs.writeFileSync(filePath, JSON.stringify(output, null, 2), 'utf8');

  console.log(`DONE report=${filePath}`);
}

run().catch((error) => {
  console.error('FATAL', error);
  process.exit(1);
});
