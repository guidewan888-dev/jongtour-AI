// ─── Fix Best International cover images ─────────────────
// Selects the correct tour flyer image from existing scraper_tour_images
// instead of the generic mobile.png banner
// Run: npx tsx tour-scraper/src/fix-bestintl-images.ts

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function fixBestIntlImages() {
  // Get all Best International tours
  const { data: tours, error } = await supabase
    .from('scraper_tours')
    .select('id, tour_code, cover_image_url')
    .eq('site', 'bestintl');

  if (error) { console.error('Error fetching tours:', error); return; }
  console.log(`Found ${tours.length} Best International tours`);

  let fixed = 0;
  let alreadyOk = 0;
  let noImages = 0;

  for (const tour of tours) {
    // Get all images for this tour
    const { data: images } = await supabase
      .from('scraper_tour_images')
      .select('id, original_url, public_url, file_size')
      .eq('tour_id', tour.id)
      .order('sort_order');

    if (!images || images.length === 0) {
      noImages++;
      continue;
    }

    // Check if current cover is the banner (mobile.png)
    const isBannerCover = tour.cover_image_url && images.some(
      img => img.public_url === tour.cover_image_url &&
             /mobile\.png/i.test(img.original_url)
    );

    if (!isBannerCover) {
      alreadyOk++;
      continue;
    }

    // Find the best replacement: CloudFront image with tour code in name
    const codeMatch = images.find(img =>
      /cloudfront/i.test(img.original_url) &&
      img.original_url.toLowerCase().includes(tour.tour_code.toLowerCase()) &&
      !/mobile\.png/i.test(img.original_url)
    );

    // Fallback: largest non-banner image
    const nonBanner = images.filter(img => !/mobile\.png/i.test(img.original_url));
    const best = codeMatch || (nonBanner.length > 0
      ? nonBanner.sort((a, b) => (b.file_size || 0) - (a.file_size || 0))[0]
      : null);

    if (best && best.public_url !== tour.cover_image_url) {
      const { error: updateErr } = await supabase
        .from('scraper_tours')
        .update({ cover_image_url: best.public_url })
        .eq('id', tour.id);

      if (updateErr) {
        console.error(`  ❌ ${tour.tour_code}: ${updateErr.message}`);
      } else {
        console.log(`  ✅ ${tour.tour_code}: updated cover → ${best.original_url.slice(0, 80)}`);
        fixed++;
      }
    } else {
      alreadyOk++;
    }
  }

  console.log(`\nDone! Fixed: ${fixed}, Already OK: ${alreadyOk}, No images: ${noImages}`);
}

fixBestIntlImages();
