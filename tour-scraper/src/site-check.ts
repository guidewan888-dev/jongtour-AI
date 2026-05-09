import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

async function main() {
  const sb = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  
  // Check bestintl period prices
  const { data: tours } = await sb.from('scraper_tours').select('id, tour_code').eq('site', 'bestintl').limit(5);
  
  for (const tour of (tours || []).slice(0, 3)) {
    const { data: periods } = await sb.from('scraper_tour_periods').select('*').eq('tour_id', tour.id).limit(5);
    console.log(`\n${tour.tour_code} (id=${tour.id}):`);
    console.log(`  Periods: ${periods?.length || 0}`);
    if (periods && periods.length > 0) {
      periods.forEach((p: any) => {
        console.log(`  - price=${p.price}, start=${p.start_date}, raw=${(p.raw_text || '').slice(0, 60)}`);
      });
    }
  }
  
  // Count total periods with prices
  const { count: totalPeriods } = await sb.from('scraper_tour_periods')
    .select('*', { count: 'exact', head: true })
    .in('tour_id', (tours || []).map(t => t.id));
  
  const { count: pricesPeriods } = await sb.from('scraper_tour_periods')
    .select('*', { count: 'exact', head: true })
    .in('tour_id', (tours || []).map(t => t.id))
    .gt('price', 0);
    
  console.log(`\nBestIntl total periods: ${totalPeriods}, with price>0: ${pricesPeriods}`);
}

main().catch(console.error);
