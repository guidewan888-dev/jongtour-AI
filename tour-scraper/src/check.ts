import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const sb = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

const { count: tc } = await sb.from('scraper_tours').select('*', { count: 'exact', head: true });
const { count: ic } = await sb.from('scraper_tour_images').select('*', { count: 'exact', head: true });
const { data: runs } = await sb.from('scraper_runs').select('*');
const { data: sample } = await sb.from('scraper_tours').select('id,tour_code,title,source_url').eq('site', 'worldconnection').not('source_url', 'like', '%twitter%').limit(5);

console.log('=== DB STATS ===');
console.log('Tours:', tc);
console.log('Images:', ic);
console.log('Runs:', JSON.stringify(runs, null, 2));
console.log('Sample tours:');
sample?.forEach(t => console.log(`  ${t.tour_code}: ${t.title}`));
