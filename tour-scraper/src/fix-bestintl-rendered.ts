// ─── Fix Best International missing price/hotel/dates by scraping rendered pages ──
// Uses Playwright to visit each tour page and extract rendered Angular data
// Run: npx tsx tour-scraper/src/fix-bestintl-rendered.ts

import { chromium } from 'playwright';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function extractRenderedData(page: any, url: string) {
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30_000 });
    await page.waitForTimeout(10000);
    // Scroll to trigger lazy content
    await page.evaluate(() => window.scrollBy(0, 1500));
    await page.waitForTimeout(2000);

    return await page.evaluate(() => {
      const text = document.body.innerText || '';
      const result: Record<string, any> = {};

      // Price
      const pricePatterns = [
        /฿\s*([\d,]+)/,
        /ราคา(?:เริ่มต้น)?\s*[:：]?\s*฿?\s*([\d,]+)/i,
        /เริ่มต้น\s*[:：]?\s*฿?\s*([\d,]+)/i,
        /([\d,]{5,})\s*(?:บาท|.-)/,
      ];
      for (const p of pricePatterns) {
        const m = text.match(p);
        if (m) {
          const v = parseInt(m[1].replace(/,/g, ''), 10);
          if (v > 1000 && v < 500000) { result.price = v; break; }
        }
      }

      // Hotel rating
      const hotelMatch = text.match(/(\d)\s*ดาว/i);
      if (hotelMatch) result.hotelRating = parseInt(hotelMatch[1]);

      // Deposit
      const depMatch = text.match(/มัดจำ\s*[^0-9]*([\d,]+)/);
      if (depMatch) result.deposit = parseInt(depMatch[1].replace(/,/g, ''), 10);

      // Travel date range
      const travelMatch = text.match(/เดินทาง\s*[:：]?\s*([^\n]{5,60})/i);
      if (travelMatch) result.travelRange = travelMatch[1].trim();

      // Fallback: scan for price-like elements
      if (!result.price) {
        const prices: number[] = [];
        document.querySelectorAll('*').forEach(el => {
          const t = (el as HTMLElement).textContent?.trim() || '';
          if (/^[\d,]{4,7}$/.test(t) && (el as HTMLElement).children.length === 0) {
            const v = parseInt(t.replace(/,/g, ''), 10);
            if (v > 1000 && v < 500000) prices.push(v);
          }
        });
        if (prices.length > 0) result.price = Math.min(...prices);
      }

      return result;
    });
  } catch (e) {
    console.error(`  ⚠️ Error loading ${url}:`, (e as Error).message?.slice(0, 80));
    return {};
  }
}

async function main() {
  // Get Best International tours that need data
  const { data: tours, error } = await supabase
    .from('scraper_tours')
    .select('id, tour_code, source_url, price_from, hotel_rating')
    .eq('site', 'bestintl')
    .order('id');

  if (error) { console.error('Error:', error); return; }

  // Filter tours that need price or hotel data
  const needsFix = tours.filter(t => !t.price_from || t.price_from === 0 || !t.hotel_rating);
  console.log(`Found ${tours.length} Best Intl tours, ${needsFix.length} need data fix\n`);

  if (needsFix.length === 0) { console.log('All tours already have data!'); return; }

  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  });

  let fixed = 0;
  let failed = 0;

  for (let i = 0; i < needsFix.length; i++) {
    const tour = needsFix[i];
    const url = tour.source_url || `https://www.bestinternational.com/tour/${tour.tour_code}`;
    console.log(`[${i + 1}/${needsFix.length}] ${tour.tour_code} ...`);

    const page = await ctx.newPage();
    const data = await extractRenderedData(page, url);
    await page.close();

    if (!data.price && !data.hotelRating) {
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
    await new Promise(r => setTimeout(r, 3000));
  }

  await browser.close();
  console.log(`\nDone! Fixed: ${fixed}, Failed: ${failed}`);
}

main();
