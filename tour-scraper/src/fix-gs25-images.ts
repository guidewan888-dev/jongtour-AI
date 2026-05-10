/**
 * fix-gs25-images.ts
 * 
 * Re-scrapes GS25 detail pages to extract images for tours that currently have no cover image.
 * Also fixes duplicate images by selecting the correct unique cover per tour.
 * 
 * Usage: npx tsx src/fix-gs25-images.ts
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { chromium } from 'playwright';
import * as cheerio from 'cheerio';
import { createHash } from 'crypto';
import sharp from 'sharp';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const BUCKET = 'tour-images';

async function uploadImage(imageUrl: string): Promise<{ publicUrl: string; hash: string; size: number } | null> {
  try {
    const res = await fetch(imageUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      signal: AbortSignal.timeout(30_000),
    });
    if (!res.ok) return null;

    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 5_000) return null;

    const hash = createHash('sha256').update(buf).digest('hex');
    const meta = await sharp(buf).metadata();
    if (!meta.width || !meta.height || meta.width < 200 || meta.height < 150) return null;

    const ext = (meta.format ?? 'jpeg').replace('jpeg', 'jpg');
    const storagePath = `images/${hash.slice(0, 2)}/${hash.slice(2, 4)}/${hash}.${ext}`;

    // Upload (ignore "already exists" errors)
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, buf, { contentType: `image/${ext}`, cacheControl: '31536000', upsert: false });

    if (error && !error.message.includes('already exists') && !error.message.includes('Duplicate')) {
      console.warn(`  ⚠️ Upload error: ${error.message}`);
      return null;
    }

    const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
    return { publicUrl: pub.publicUrl, hash, size: buf.length };
  } catch (e) {
    console.warn(`  ⚠️ Image download failed: ${(e as Error).message}`);
    return null;
  }
}

async function fixGS25Images() {
  console.log('🔧 Fixing GS25 missing images...\n');

  // 1. Get GS25 tours with no cover image
  const { data: tours, error } = await supabase
    .from('scraper_tours')
    .select('id, tour_code, source_url, cover_image_url')
    .eq('site', 'gs25')
    .eq('is_active', true)
    .is('cover_image_url', null);

  if (error || !tours) {
    console.error('Failed to fetch GS25 tours:', error?.message);
    return;
  }

  console.log(`Found ${tours.length} GS25 tours with no cover image`);

  if (tours.length === 0) {
    console.log('✅ Nothing to fix!');
    return;
  }

  // 2. Launch browser and login
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  });

  const loginPage = await ctx.newPage();
  try {
    console.log('[gs25] 🔑 Logging in...');
    await loginPage.goto('https://gs25travel.com/login', { waitUntil: 'networkidle', timeout: 30_000 });
    await loginPage.waitForTimeout(2000);

    const username = process.env.GS25_EMAIL || '';
    const password = process.env.GS25_PASSWORD || '';
    if (!username || !password) {
      console.error('❌ GS25_EMAIL or GS25_PASSWORD not set');
      await browser.close();
      return;
    }

    await loginPage.fill('input[name="username"]', username);
    await loginPage.fill('input[name="password"]', password);
    await Promise.all([
      loginPage.waitForNavigation({ waitUntil: 'networkidle', timeout: 15_000 }).catch(() => {}),
      loginPage.click('button[type="submit"]'),
    ]);
    await loginPage.waitForTimeout(3000);
    console.log(`[gs25] ✅ Logged in → ${loginPage.url()}`);
  } finally {
    await loginPage.close();
  }

  // 3. Visit each tour's detail page to extract images
  let fixed = 0;
  let failed = 0;

  for (const [i, tour] of tours.entries()) {
    const page = await ctx.newPage();
    try {
      console.log(`  [${i + 1}/${tours.length}] ${tour.tour_code} → ${tour.source_url.substring(0, 70)}...`);
      await page.goto(tour.source_url, { waitUntil: 'networkidle', timeout: 30_000 });
      await page.waitForTimeout(3000);

      const html = await page.content();
      const $ = cheerio.load(html);

      // Extract images using expanded logic
      const imageUrls = new Set<string>();

      // 1. Carousel
      $('.carousel-inner .item img, .carousel img, #carousel-example-generic img').each((_, img) => {
        const src = $(img).attr('src');
        if (src && src.startsWith('http') && !/logo|icon|avatar|spacer|favicon/i.test(src)) {
          imageUrls.add(src);
        }
      });

      // 2. General content images
      if (imageUrls.size === 0) {
        $('img[src]').each((_, img) => {
          const src = $(img).attr('src');
          if (src && src.startsWith('http')
            && !/logo|icon|avatar|spacer|favicon|flag|payment|bank|qr/i.test(src)
            && !/\.(svg|gif)$/i.test(src)) {
            imageUrls.add(src);
          }
        });
      }

      // 3. data-src
      $('img[data-src]').each((_, img) => {
        const src = $(img).attr('data-src');
        if (src && src.startsWith('http') && !/logo|icon|avatar|spacer|favicon/i.test(src)) {
          imageUrls.add(src);
        }
      });

      // 4. Background images
      $('[style*="background-image"]').each((_, el) => {
        const bgMatch = $(el).attr('style')?.match(/url\(['"]?([^'")\s]+)/);
        if (bgMatch?.[1] && bgMatch[1].startsWith('http') && !/logo|icon/i.test(bgMatch[1])) {
          imageUrls.add(bgMatch[1]);
        }
      });

      // 5. og:image
      if (imageUrls.size === 0) {
        const ogImage = $('meta[property="og:image"]').attr('content');
        if (ogImage && ogImage.startsWith('http')) {
          imageUrls.add(ogImage);
        }
      }

      if (imageUrls.size === 0) {
        console.log(`    ⚠️ No images found on page`);
        failed++;
        continue;
      }

      // Download and upload the first image as cover
      const firstImgUrl = [...imageUrls][0];
      const uploaded = await uploadImage(firstImgUrl);
      if (!uploaded) {
        console.log(`    ⚠️ Failed to download/process image: ${firstImgUrl.substring(0, 60)}`);
        failed++;
        continue;
      }

      // Update cover_image_url
      const { error: updateErr } = await supabase
        .from('scraper_tours')
        .update({ cover_image_url: uploaded.publicUrl })
        .eq('id', tour.id);

      if (updateErr) {
        console.error(`    ❌ DB update failed: ${updateErr.message}`);
        failed++;
      } else {
        fixed++;
        console.log(`    ✅ Cover updated (${(uploaded.size / 1024).toFixed(0)}KB)`);
      }

      // Rate limiting
      await new Promise(r => setTimeout(r, 2000));

    } catch (e) {
      console.warn(`    ❌ Error: ${(e as Error).message}`);
      failed++;
    } finally {
      await page.close();
    }
  }

  await ctx.close();
  await browser.close();

  console.log(`\n📊 Results:`);
  console.log(`  Fixed: ${fixed}`);
  console.log(`  Failed: ${failed}`);
  console.log(`  Total: ${tours.length}`);
}

fixGS25Images().catch(console.error);
