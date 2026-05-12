import 'dotenv/config';
import { getSupabaseAdmin } from '../src/lib/supabaseAdmin';
import { resolveAndPersistScraperDeposit } from '../src/lib/depositResolver';

async function run() {
  const supabase = getSupabaseAdmin();
  const limit = Number(process.env.BACKFILL_LIMIT || 300);
  const force = String(process.env.BACKFILL_FORCE || '').toLowerCase() === 'true';
  const siteFilter = String(process.env.BACKFILL_SITE || '').trim().toLowerCase();

  let query = supabase
    .from('scraper_tours')
    .select('id, site, tour_code, title, description, highlights, price_from, pdf_url, deposit')
    .eq('is_active', true)
    .not('pdf_url', 'is', null)
    .neq('pdf_url', '')
    .order('last_scraped_at', { ascending: false });

  if (siteFilter) {
    query = query.eq('site', siteFilter);
  }

  if (!force) {
    query = query.or('deposit.is.null,deposit.eq.0');
  }

  const { data: tours, error } = await query.limit(limit);

  if (error) {
    throw new Error(`[backfill-deposit] query failed: ${error.message}`);
  }

  const rows = tours || [];
  console.log(`[backfill-deposit] found ${rows.length} tours | force=${force} | site=${siteFilter || 'all'}`);
  if (rows.length === 0) return;

  let updated = 0;
  let skipped = 0;
  let failed = 0;

  for (const tour of rows) {
    try {
      const contextText = [
        tour.title || '',
        tour.description || '',
        ...(Array.isArray(tour.highlights) ? tour.highlights : []),
      ].join('\n');

      const before = Number(tour.deposit || 0);
      const deposit = await resolveAndPersistScraperDeposit({
        supabase,
        tourId: tour.id,
        site: tour.site || '',
        pdfUrl: tour.pdf_url || '',
        currentDeposit: tour.deposit,
        priceFrom: Number(tour.price_from || 0),
        contextText,
        forceRefresh: force,
      });

      if (deposit > 0 && deposit !== before) {
        updated += 1;
        console.log(`UPDATED ${tour.site}/${tour.tour_code} -> ${deposit.toLocaleString()}`);
      } else if (deposit > 0) {
        skipped += 1;
        console.log(`UNCHANGED ${tour.site}/${tour.tour_code} -> ${deposit.toLocaleString()}`);
      } else {
        skipped += 1;
        console.log(`NOT_FOUND ${tour.site}/${tour.tour_code}`);
      }
    } catch (e: any) {
      failed += 1;
      console.error(`FAILED ${tour.site}/${tour.tour_code}: ${e.message}`);
    }
  }

  console.log('\n=== Backfill Summary ===');
  console.log(`Updated: ${updated}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Failed : ${failed}`);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
