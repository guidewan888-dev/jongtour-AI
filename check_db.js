const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'https://qterfftaebnoawnzkfgu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF0ZXJmZnRhZWJub2F3bnprZmd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzQ3MzAxNCwiZXhwIjoyMDkzMDQ5MDE0fQ.IDd7B8okNE1B0vf1OVQizDGeVQNdVwLK0gzogOyWIFE'
);

async function run() {
  const { data: mockTours, error } = await supabase.from('tours').select('id, tourCode, tourName').or('tourCode.ilike.%mock%,tourName.ilike.%mock%,tourName.ilike.%test%,tourName.ilike.%demo%');
  if (error) console.error(error);
  
  console.log(`Mocks found in tours: ${mockTours?.length || 0}`);
  if (mockTours?.length > 0) {
     console.log('Sample mock tours:', mockTours.slice(0, 5));
  }

  const { data: mockBookings, error: bErr } = await supabase.from('bookings').select('id, bookingRef').ilike('id', '%mock%');
  console.log(`Mocks found in bookings by ID: ${mockBookings?.length || 0}`);
  
  const { data: allBookings } = await supabase.from('bookings').select('id, bookingRef').limit(10);
  console.log('Sample Bookings:', allBookings);

}
run();
