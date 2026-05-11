import 'dotenv/config';
import { getSupabaseAdmin } from '../src/lib/supabaseAdmin';
import { resolveAndPersistScraperDeposit } from '../src/lib/depositResolver';

async function run() {
  const supabase = getSupabaseAdmin();
  const limit = Number(process.env.BACKFILL_LIMIT || 300);

  const { data: tours, error } = await supabase
    .from('scraper_tours')
    .select('id, site, tour_code, title, description, highlights, price_from, pdf_url, deposit')
    .eq('is_active', true)
    .or('deposit.is.null,deposit.eq.0')
    .not('pdf_url', 'is', null)
    .neq('pdf_url', '')
    .order('last_scraped_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`[backfill-deposit] query failed: ${error.message}`);
  }

  const rows = tours || [];
  console.log(`[backfill-deposit] found ${rows.length} tours`);
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

      const deposit = await resolveAndPersistScraperDeposit({
        supabase,
        tourId: tour.id,
        site: tour.site || '',
        pdfUrl: tour.pdf_url || '',
        currentDeposit: tour.deposit,
        priceFrom: Number(tour.price_from || 0),
        contextText,
      });

      if (deposit > 0) {
        updated += 1;
        console.log(`✅ ${tour.site}/${tour.tour_code} -> ${deposit.toLocaleString()}`);
      } else {
        skipped += 1;
        console.log(`⚠️ ${tour.site}/${tour.tour_code} -> not found`);
      }
    } catch (e: any) {
      failed += 1;
      console.error(`❌ ${tour.site}/${tour.tour_code}: ${e.message}`);
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
