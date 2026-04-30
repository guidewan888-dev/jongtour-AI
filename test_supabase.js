const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://qterfftaebnoawnzkfgu.supabase.co';
const supabaseKey = 'sb_publishable_SRwNSJ89mInda5FcuB1W2w_9IEJlSOI';
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const keywords = ['Japan', '­Õè»Øè¹'];
  const orFilter = keywords.map(kw => destination.ilike.**,title.ilike.**).join(',');
  console.log('Filter:', orFilter);
  const { data: tours, error } = await supabase
    .from('Tour')
    .select('*, departures:TourDeparture(*)')
    .or(orFilter)
    .order('createdAt', { ascending: false });
  if (error) console.error('Error:', error);
  else console.log('Success, found:', tours.length);
}
test();
