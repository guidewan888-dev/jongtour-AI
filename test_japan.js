const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://qterfftaebnoawnzkfgu.supabase.co', 'sb_publishable_SRwNSJ89mInda5FcuB1W2w_9IEJlSOI');
(async () => {
  const keywords = ['JAPAN', 'ญี่ปุ่น', 'ฮอกไกโด', 'โตเกียว', 'โอซาก้า', 'ฟุกุโอกะ', 'นาโกย่า', 'เกียวโต', 'โอกินาว่า'];
  const orFilter = keywords.map(kw => `destination.ilike.*${kw}*,title.ilike.*${kw}*`).join(',');
  const { data, error } = await supabase.from('Tour').select('*').or(orFilter);
  if(error) console.error('Supabase error:', error);
  else console.log('Japan matches:', data.length);
})();
