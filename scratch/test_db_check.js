const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = "https://qterfftaebnoawnzkfgu.supabase.co";
const supabaseKey = "sb_publishable_SRwNSJ89mInda5FcuB1W2w_9IEJlSOI"; // Using publishable key for reading

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await supabase.from('Tour').select('id, source, destination, title').limit(20);
  if (error) console.error(error);
  
  const counts = data.reduce((acc, curr) => {
    acc[curr.source] = (acc[curr.source] || 0) + 1;
    return acc;
  }, {});
  
  console.log("Total sample tours:", data.length);
  console.log("Source counts in sample:", counts);
  
  const { count: totalCheckin } = await supabase.from('Tour').select('*', { count: 'exact', head: true }).eq('source', 'CHECKIN');
  const { count: totalTourFac } = await supabase.from('Tour').select('*', { count: 'exact', head: true }).eq('source', 'TOUR_FACTORY');
  console.log("Total CHECKIN:", totalCheckin);
  console.log("Total TOUR_FACTORY:", totalTourFac);
}

check();
