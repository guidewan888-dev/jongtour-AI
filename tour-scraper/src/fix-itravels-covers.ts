/**
 * fix-itravels-covers.ts
 * 
 * Fixes iTravels cover images that were incorrectly set to shared template images.
 * The correct cover is always image index 0 (sort_order=0) in scraper_tour_images.
 * 
 * Usage: npx tsx src/fix-itravels-covers.ts
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function fixITravelsCovers() {
  console.log('🔧 Fixing iTravels cover images...\n');

  // 1. Get all iTravels tours
  const { data: tours, error } = await supabase
    .from('scraper_tours')
    .select('id, tour_code, cover_image_url')
    .eq('site', 'itravels')
    .eq('is_active', true);

  if (error || !tours) {
    console.error('Failed to fetch iTravels tours:', error?.message);
    return;
  }

  console.log(`Found ${tours.length} iTravels tours`);

  let fixed = 0;
  let skipped = 0;
  let noImage = 0;

  for (const tour of tours) {
    // 2. Get the first image (sort_order=0) for this tour
    const { data: images } = await supabase
      .from('scraper_tour_images')
      .select('public_url, original_url, file_size, sort_order')
      .eq('tour_id', tour.id)
      .order('sort_order', { ascending: true })
      .limit(1);

    if (!images || images.length === 0) {
      noImage++;
      continue;
    }

    const correctCover = images[0].public_url;
    
    // 3. Only update if the current cover is different
    if (tour.cover_image_url !== correctCover) {
      const { error: updateErr } = await supabase
        .from('scraper_tours')
        .update({ cover_image_url: correctCover })
        .eq('id', tour.id);

      if (updateErr) {
        console.error(`  ❌ ${tour.tour_code}: ${updateErr.message}`);
      } else {
        fixed++;
        console.log(`  ✅ ${tour.tour_code}: updated cover → ${correctCover.substring(0, 60)}...`);
      }
    } else {
      skipped++;
    }
  }

  console.log(`\n📊 Results:`);
  console.log(`  Fixed: ${fixed}`);
  console.log(`  Already correct: ${skipped}`);
  console.log(`  No images: ${noImage}`);
}

fixITravelsCovers().catch(console.error);
