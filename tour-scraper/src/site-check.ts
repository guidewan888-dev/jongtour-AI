import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

async function main() {
  const sb = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  
  // Check site names
  const { data } = await sb.from('scraper_tours').select('site, tour_code, title, price_from, cover_image_url').eq('is_active', true).limit(1000);
  const sites: Record<string, { count: number; noImage: number; noPrice: number; sample: string }> = {};
  data?.forEach(t => {
    if (!sites[t.site]) sites[t.site] = { count: 0, noImage: 0, noPrice: 0, sample: '' };
    sites[t.site].count++;
    if (!t.cover_image_url) sites[t.site].noImage++;
    if (!t.price_from || t.price_from <= 0) sites[t.site].noPrice++;
    if (!sites[t.site].sample) sites[t.site].sample = t.tour_code;
  });
  
  console.log('\n=== SITE NAMES IN DB ===');
  Object.entries(sites).forEach(([site, info]) => {
    console.log(`${site}: ${info.count} tours | noImage: ${info.noImage} | noPrice: ${info.noPrice} | sample: ${info.sample}`);
  });
}

main().catch(console.error);
