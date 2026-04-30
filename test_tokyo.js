const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://qterfftaebnoawnzkfgu.supabase.co', 'sb_publishable_SRwNSJ89mInda5FcuB1W2w_9IEJlSOI');
(async () => {
  const keywords = ['โตเกียว', 'Tokyo', 'ฟูจิ', 'ชินจูกุ'];
  const orFilter = keywords.map(kw => `destination.ilike.*${kw}*,title.ilike.*${kw}*`).join(',');
  const { data, error } = await supabase.from('Tour').select('*').or(orFilter);
  if(error) console.error('error', error);
  else console.log('Tokyo matches:', data.length);
})();
