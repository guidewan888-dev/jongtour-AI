const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://qterfftaebnoawnzkfgu.supabase.co', 'sb_publishable_SRwNSJ89mInda5FcuB1W2w_9IEJlSOI');
(async () => {
  const keywords = ['HONG KONG', 'ฮ่องกง', 'ดิสนีย์แลนด์', 'ไหว้พระ'];
  const orFilter = keywords.map(kw => `destination.ilike.*${kw}*,title.ilike.*${kw}*`).join(',');
  const { data, error } = await supabase.from('Tour').select('*').or(orFilter);
  if(error) console.error('Supabase error:', error);
  else console.log('HK matches:', data.length);
})();
