import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const sb = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function cleanupGS25() {
  const { data: all } = await sb
    .from('scraper_tours')
    .select('id, tour_code, pdf_url, last_scraped_at')
    .eq('site', 'gs25')
    .eq('is_active', true);

  const total = (all || []).length;
  const withPdf = (all || []).filter((t: any) => t.pdf_url && t.pdf_url.length > 10).length;
  const noPdf = (all || []).filter((t: any) => !t.pdf_url || t.pdf_url.length < 10);

  console.log(`GS25 active: ${total}, with PDF: ${withPdf}, without PDF: ${noPdf.length}`);

  // Tours without PDF = stale/inactive programs no longer on GS25 listing
  const staleIds = noPdf.map((t: any) => t.id);
  console.log(`Deactivating ${staleIds.length} stale tours...`);

  if (staleIds.length > 0) {
    // Process in chunks to avoid query size limits
    const CHUNK = 50;
    for (let i = 0; i < staleIds.length; i += CHUNK) {
      const chunk = staleIds.slice(i, i + CHUNK);
      const { error } = await sb
        .from('scraper_tours')
        .update({ is_active: false })
        .in('id', chunk);
      if (error) console.error(`Chunk ${i} error:`, error.message);
    }
    console.log(`✅ Deactivated ${staleIds.length} stale GS25 tours`);
  }

  // Verify
  const { data: after } = await sb
    .from('scraper_tours')
    .select('id')
    .eq('site', 'gs25')
    .eq('is_active', true);
  console.log(`GS25 active after cleanup: ${(after || []).length}`);
}

cleanupGS25();
