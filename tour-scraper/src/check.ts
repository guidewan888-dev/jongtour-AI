import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const sb = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

const { count: tc } = await sb.from('scraper_tours').select('*', { count: 'exact', head: true });
const { count: ic } = await sb.from('scraper_tour_images').select('*', { count: 'exact', head: true });

// Per-site counts
for (const site of ['worldconnection', 'itravels', 'bestintl', 'gs25']) {
  const { count } = await sb.from('scraper_tours').select('*', { count: 'exact', head: true }).eq('site', site);
  console.log(`${site}: ${count} tours`);
}

console.log(`\nTotal tours: ${tc}`);
console.log(`Total images: ${ic}`);
