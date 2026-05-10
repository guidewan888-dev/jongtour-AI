// ─── Fix Best International missing price/hotel/dates by scraping rendered pages ──
// Uses Playwright to visit each tour page and extract rendered Angular data
// Run: npx tsx tour-scraper/src/fix-bestintl-rendered.ts

import { chromium, type Page } from 'playwright';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface ExtractedData {
  price?: number;
  hotelRating?: number;
  deposit?: number;
  travelRange?: string;
  airline?: string;
  duration?: string;
}

async function extractRenderedData(page: Page, url: string): Promise<ExtractedData> {
  try {
    // Intercept API calls for period data (Best Intl Angular SPA calls APIs)
    const apiResponses: any[] = [];
    page.on('response', async (response) => {
      const reqUrl = response.url();
      if (reqUrl.includes('periodpro') || reqUrl.includes('period') || reqUrl.includes('tour-detail')) {
        try {
          const json = await response.json();
          apiResponses.push({ url: reqUrl, data: json });
        } catch { /* not JSON */ }
      }
    });

    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30_000 });
    // Wait for Angular SPA to render
    await page.waitForTimeout(12000);
    // Scroll to trigger lazy content
    await page.evaluate(() => window.scrollBy(0, 2000));
    await page.waitForTimeout(3000);

    // Log any API responses we captured
    if (apiResponses.length > 0) {
      console.log(`  🌐 Captured ${apiResponses.length} API responses`);
    }

    const result = await page.evaluate(() => {
      const text = document.body.innerText || '';
      const html = document.body.innerHTML || '';
      const data: Record<string, any> = {};

      // 1. Price — multiple patterns
      const pricePatterns = [
        /฿\s*([\d,]+)/,
        /ราคา(?:เริ่มต้น)?\s*[:：]?\s*฿?\s*([\d,]+)/i,
        /เริ่มต้น\s*[:：]?\s*฿?\s*([\d,]+)/i,
        /([\d,]{5,})\s*(?:บาท|.-)/,
        /THB\s*([\d,]+)/i,
      ];
      for (const p of pricePatterns) {
        const m = text.match(p);
        if (m) {
          const v = parseInt(m[1].replace(/,/g, ''), 10);
          if (v > 1000 && v < 500000) { data.price = v; break; }
        }
      }

      // 2. Hotel rating — multiple patterns
      const hotelPatterns = [
        /(\d)\s*(?:ดาว|star)/i,
        /โรงแรม\s*(?:ระดับ)?\s*(\d)/i,
        /hotel\s*(\d)\s*star/i,
        /(\d)\s*★/,
        /★{3,5}/, // count stars
      ];
      for (const p of hotelPatterns) {
        const m = text.match(p);
        if (m) {
          if (m[0].includes('★')) {
            data.hotelRating = (m[0].match(/★/g) || []).length;
          } else {
            const r = parseInt(m[1]);
            if (r >= 2 && r <= 5) { data.hotelRating = r; break; }
          }
        }
      }

      // Also check for star icons in HTML
      if (!data.hotelRating) {
        const starEls = document.querySelectorAll('.fa-star, .star-icon, [class*="star"]');
        if (starEls.length >= 2 && starEls.length <= 5) {
          data.hotelRating = starEls.length;
        }
      }

      // 3. Deposit
      const depMatch = text.match(/มัดจำ\s*[^0-9]*([\d,]+)/);
      if (depMatch) data.deposit = parseInt(depMatch[1].replace(/,/g, ''), 10);

      // 4. Travel date range
      const travelPatterns = [
        /เดินทาง\s*[:：]?\s*([^\n]{5,60})/i,
        /วันเดินทาง\s*[:：]?\s*([^\n]{5,60})/i,
        /ช่วงเดินทาง\s*[:：]?\s*([^\n]{5,60})/i,
        /กำหนดการเดินทาง\s*[:：]?\s*([^\n]{5,60})/i,
      ];
      for (const p of travelPatterns) {
        const m = text.match(p);
        if (m) { data.travelRange = m[1].trim(); break; }
      }

      // 5. Airline
      const airlinePatterns = [
        /สายการบิน\s*[:：]?\s*([^\n]{3,40})/i,
        /airline\s*[:：]?\s*([^\n]{3,40})/i,
        /บิน(โดย|ด้วย)\s*([^\n]{3,30})/i,
      ];
      for (const p of airlinePatterns) {
        const m = text.match(p);
        if (m) { data.airline = (m[2] || m[1]).trim(); break; }
      }

      // 6. Duration
      const durMatch = text.match(/(\d+)\s*วัน\s*(\d+)\s*คืน/);
      if (durMatch) data.duration = `${durMatch[1]}D${durMatch[2]}N`;

      // 7. Fallback price: scan for price-like elements
      if (!data.price) {
        const prices: number[] = [];
        document.querySelectorAll('*').forEach(el => {
          const t = (el as HTMLElement).textContent?.trim() || '';
          if (/^[\d,]{4,7}$/.test(t) && (el as HTMLElement).children.length === 0) {
            const v = parseInt(t.replace(/,/g, ''), 10);
            if (v > 1000 && v < 500000) prices.push(v);
          }
        });
        if (prices.length > 0) data.price = Math.min(...prices);
      }

      return data;
    });

    return result;
  } catch (e) {
    console.error(`  ⚠️ Error loading ${url}:`, (e as Error).message?.slice(0, 80));
    return {};
  }
}

async function main() {
  console.log('═══════════════════════════════════════════');
  console.log('  Best International Data Fix (Rendered)');
  console.log('═══════════════════════════════════════════\n');

  // Get Best International tours that need data
  const { data: tours, error } = await supabase
    .from('scraper_tours')
    .select('id, tour_code, source_url, price_from, hotel_rating, country, duration')
    .eq('site', 'bestintl')
    .order('id');

  if (error) { console.error('Error:', error); return; }

  // Filter tours that need hotel rating or price
  const needsFix = tours.filter(t =>
    !t.hotel_rating ||
    !t.price_from || t.price_from === 0
  );
  
  console.log(`📊 Total Best Intl tours: ${tours.length}`);
  console.log(`🔧 Need fix: ${needsFix.length}`);
  console.log(`   - Missing hotel_rating: ${tours.filter(t => !t.hotel_rating).length}`);
  console.log(`   - Missing price: ${tours.filter(t => !t.price_from || t.price_from === 0).length}\n`);

  if (needsFix.length === 0) { console.log('✅ All tours already have data!'); return; }

  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  });

  let fixed = 0;
  let failed = 0;
  let skipped = 0;

  for (let i = 0; i < needsFix.length; i++) {
    const tour = needsFix[i];
    const url = tour.source_url || `https://www.bestinternational.com/tour/${tour.tour_code}`;
    console.log(`[${i + 1}/${needsFix.length}] ${tour.tour_code} ...`);

    const page = await ctx.newPage();
    const data = await extractRenderedData(page, url);
    await page.close();

    if (!data.price && !data.hotelRating && !data.deposit) {
      console.log(`  ⏭️ No data extracted`);
      failed++;
      continue;
    }

    const updates: Record<string, any> = {};
    if (data.price && (!tour.price_from || tour.price_from === 0)) {
      updates.price_from = data.price;
    }
    if (data.hotelRating && !tour.hotel_rating) {
      updates.hotel_rating = data.hotelRating;
    }
    if (data.deposit) {
      updates.deposit = data.deposit;
    }

    if (Object.keys(updates).length > 0) {
      const { error: updateErr } = await supabase
        .from('scraper_tours')
        .update(updates)
        .eq('id', tour.id);

      if (updateErr) {
        console.log(`  ❌ DB error: ${updateErr.message}`);
        failed++;
      } else {
        console.log(`  ✅ ${JSON.stringify(updates)}`);
        fixed++;
      }
    } else {
      skipped++;
    }

    // Also upsert period if travelRange found and no periods exist
    if (data.travelRange) {
      const { data: existingPeriods } = await supabase
        .from('scraper_tour_periods')
        .select('id')
        .eq('tour_id', tour.id)
        .limit(1);

      if (!existingPeriods || existingPeriods.length === 0) {
        await supabase.from('scraper_tour_periods').insert({
          tour_id: tour.id,
          raw_text: data.travelRange,
          price: data.price || null,
          status: 'open',
        });
        console.log(`  📅 Period: "${data.travelRange}"`);
      }
    }

    // Throttle to avoid rate limiting
    await new Promise(r => setTimeout(r, 2000));
  }

  await browser.close();
  console.log(`\n═══════════════════════════════════════════`);
  console.log(`  Done! Fixed: ${fixed}, Failed: ${failed}, Skipped: ${skipped}`);
  console.log(`═══════════════════════════════════════════`);
}

main();
