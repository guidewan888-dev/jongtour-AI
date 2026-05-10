// Quick test: scrape one Best Intl page to see if rendered data extraction works
import { chromium } from 'playwright';

async function test() {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  });
  const page = await ctx.newPage();

  console.log('Loading BT-TFU49_VZ...');
  await page.goto('https://www.bestinternational.com/tour/BT-TFU49_VZ', {
    waitUntil: 'domcontentloaded',
    timeout: 30_000,
  });
  console.log('Page loaded, waiting for Angular render...');
  await page.waitForTimeout(10000);
  await page.evaluate(() => window.scrollBy(0, 1500));
  await page.waitForTimeout(2000);

  const data = await page.evaluate(() => {
    const text = document.body.innerText || '';
    const result: Record<string, any> = {};
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
    const hotelMatch = text.match(/(\d)\s*ดาว/i);
    if (hotelMatch) result.hotelRating = parseInt(hotelMatch[1]);
    const depMatch = text.match(/มัดจำ\s*[^0-9]*([\d,]+)/);
    if (depMatch) result.deposit = parseInt(depMatch[1].replace(/,/g, ''), 10);
    const travelMatch = text.match(/เดินทาง\s*[:：]?\s*([^\n]{5,60})/i);
    if (travelMatch) result.travelRange = travelMatch[1].trim();

    // Also dump some interesting text for debug
    const lines = text.split('\n').filter((l: string) => l.trim().length > 0);
    result.debugLines = lines.filter((l: string) =>
      /ดาว|โรงแรม|ราคา|เดินทาง|มัดจำ|฿|[\d,]{5,}/.test(l)
    ).slice(0, 15).map((l: string) => l.substring(0, 120));

    return result;
  });

  console.log('\n=== EXTRACTED DATA ===');
  console.log(JSON.stringify(data, null, 2));

  await browser.close();
}

test().catch(console.error);
