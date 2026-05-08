import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const s = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// Check sample of recently scraped tours
const { data, error } = await s
  .from('scraper_tours')
  .select('tour_code, title, country, duration, airline, price_from, hotel_rating, deposit, highlights, pdf_url, cover_image_url')
  .eq('site', 'oneworldtour')
  .order('last_scraped_at', { ascending: false })
  .limit(5);

if (error) {
  console.error('Error:', error.message);
  process.exit(1);
}

console.log('=== Recently scraped OWT tours ===\n');
for (const t of data) {
  console.log(`📋 ${t.tour_code}`);
  console.log(`   Title:    ${t.title}`);
  console.log(`   Country:  ${t.country || '❌ EMPTY'}`);
  console.log(`   Duration: ${t.duration || '❌ EMPTY'}`);
  console.log(`   Airline:  ${t.airline || '❌ EMPTY'}`);
  console.log(`   Price:    ${t.price_from || '❌ EMPTY'}`);
  console.log(`   Hotel:    ${t.hotel_rating ? '★'.repeat(t.hotel_rating) : '❌ EMPTY'}`);
  console.log(`   Deposit:  ${t.deposit || 'N/A'}`);
  console.log(`   PDF:      ${t.pdf_url ? '✅' : '❌'}`);
  console.log(`   Image:    ${t.cover_image_url ? '✅' : '❌'}`);
  console.log(`   Highlights: ${t.highlights?.length || 0} items`);
  console.log('');
}
