require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function searchTours(args) {
  let query = supabase.from('Tour').select('*, departures:TourDeparture(*)');
  
  if (args.destination) {
    query = query.or(`title.ilike.%${args.destination}%,description.ilike.%${args.destination}%,destination.ilike.%${args.destination}%`);
  }
  
  query = query.order('createdAt', { ascending: false }).limit(10);
  
  const { data, error } = await query;
  if (error) console.error("Supabase Error:", error);
  
  console.log("Raw tours count:", data?.length || 0);
  return data;
}

searchTours({ destination: "เฉิงตู" }).then(() => process.exit());
