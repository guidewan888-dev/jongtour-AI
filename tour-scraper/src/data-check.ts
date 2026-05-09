import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const sb = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

// Check bestintl periods for prices
const { data: bestTours } = await sb.from('scraper_tours')
  .select('id, tour_code, price_from')
  .eq('site', 'bestintl')
  .limit(5);

console.log('=== BESTINTL period prices ===');
for (const t of bestTours || []) {
  const { data: periods } = await sb.from('scraper_tour_periods')
    .select('price, raw_text, start_date')
    .eq('tour_id', t.id)
    .limit(3);
  
  console.log(`\n${t.tour_code} (price_from: ${t.price_from}):`);
  periods?.forEach(p => {
    console.log(`  price=${p.price} | date=${p.start_date} | raw=${p.raw_text?.slice(0, 80)}`);
  });
}

// Check GS25 image patterns
console.log('\n\n=== GS25 image patterns ===');
const { data: gsTours } = await sb.from('scraper_tours')
  .select('tour_code, cover_image_url, price_from')
  .eq('site', 'gs25')
  .limit(10);
  
gsTours?.forEach(t => {
  console.log(`${t.tour_code}: img=${t.cover_image_url?.slice(0, 60) || 'NULL'} price=${t.price_from}`);
});

// Check scraper_tour_images for bestintl
const { data: bestImages } = await sb.from('scraper_tour_images')
  .select('tour_id, url, storage_path')
  .limit(5);
console.log('\n=== Sample images table ===');
bestImages?.forEach(i => console.log(`  tour_id=${i.tour_id} url=${i.url?.slice(0, 60)}`));
