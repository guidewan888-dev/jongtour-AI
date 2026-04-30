const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://qterfftaebnoawnzkfgu.supabase.co', 'sb_publishable_SRwNSJ89mInda5FcuB1W2w_9IEJlSOI');
(async () => {
  const keywords = ['JAPAN', 'ญี่ปุ่น', 'ฮอกไกโด', 'โตเกียว', 'โอซาก้า', 'ฟุกุโอกะ', 'นาโกย่า', 'เกียวโต', 'โอกินาว่า'];
  const orFilter = keywords.map(kw => `destination.ilike.*${kw}*,title.ilike.*${kw}*`).join(',');
  const { data, error } = await supabase.from('Tour').select('*, departures:TourDeparture(*)').or(orFilter);
  if(error) {
     console.error('Error', error);
     return;
  }
  
  for(const tour of data) {
      if (tour.departures && tour.departures.length > 0) {
          try {
            const sorted = [...tour.departures].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
            const firstDate = new Date(sorted[0].startDate);
            const lastDate = new Date(sorted[sorted.length - 1].startDate);
            
            const formatMonth = (d) => d.toLocaleDateString("th-TH", { month: "short", year: "2-digit" });
            const m1 = formatMonth(firstDate);
            const m2 = formatMonth(lastDate);
          } catch(e) {
              console.log('Crash on tour:', tour.id, e.message);
          }
      }
  }
  console.log('Done checking');
})();
