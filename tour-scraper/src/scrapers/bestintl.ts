// ─── Best International Scraper ─────────────────────
// Site: https://www.bestinternational.com
// Structure: Angular SPA, /tour page lists cards, /tour/CODE detail pages
// Uses Playwright for SPA rendering

import * as cheerio from 'cheerio';
import { chromium, Browser } from 'playwright';
import { BaseScraper } from './base.js';
import type { TourData, TourPeriod, SiteConfig } from '../types.js';

const COUNTRY_MAP: Record<string, string> = {
  'ญี่ปุ่น': 'ญี่ปุ่น', 'japan': 'ญี่ปุ่น', 'osaka': 'ญี่ปุ่น', 'tokyo': 'ญี่ปุ่น', 'hokkaido': 'ญี่ปุ่น',
  'fukuoka': 'ญี่ปุ่น', 'nagoya': 'ญี่ปุ่น', 'narita': 'ญี่ปุ่น', 'nrt': 'ญี่ปุ่น', 'kix': 'ญี่ปุ่น',
  'cts': 'ญี่ปุ่น', 'fuk': 'ญี่ปุ่น', 'ngo': 'ญี่ปุ่น',
  'จีน': 'จีน', 'china': 'จีน', 'chongqing': 'จีน', 'xian': 'จีน', 'kunming': 'จีน', 'xinjiang': 'จีน',
  'เฉิงตู': 'จีน', 'เฉิงตู้': 'จีน', 'เฉินตู': 'จีน', 'ฉงชิ่ง': 'จีน', 'เซี่ยงไฮ้': 'จีน',
  'ปักกิ่ง': 'จีน', 'คุนหมิง': 'จีน', 'กุ้ยหลิน': 'จีน', 'จางเจียเจี้ย': 'จีน', 'ต๋ากู': 'จีน',
  'อู่หลง': 'จีน', 'tfu': 'จีน', 'pvg': 'จีน', 'ckg': 'จีน', 'can': 'จีน', 'xnn': 'จีน',
  'dyg': 'จีน', 'xiy': 'จีน',
  'เกาหลี': 'เกาหลี', 'korea': 'เกาหลี', 'icn': 'เกาหลี',
  'ไต้หวัน': 'ไต้หวัน', 'taiwan': 'ไต้หวัน', 'tpe': 'ไต้หวัน',
  'ฮ่องกง': 'ฮ่องกง', 'hong kong': 'ฮ่องกง', 'hongkong': 'ฮ่องกง', 'hkg': 'ฮ่องกง',
  'เวียดนาม': 'เวียดนาม', 'vietnam': 'เวียดนาม', 'han': 'เวียดนาม', 'dad': 'เวียดนาม', 'sgn': 'เวียดนาม',
  'พม่า': 'พม่า', 'myanmar': 'พม่า', 'rgn': 'พม่า',
  'ลาว': 'ลาว', 'laos': 'ลาว',
  'สิงคโปร์': 'สิงคโปร์', 'singapore': 'สิงคโปร์',
  'มาเก๊า': 'ฮ่องกง', 'macau': 'ฮ่องกง',
  'ยุโรป': 'ยุโรป', 'europe': 'ยุโรป', 'fra': 'ยุโรป', 'eur': 'ยุโรป',
  'อิตาลี': 'ยุโรป', 'ฝรั่งเศส': 'ยุโรป', 'สวิส': 'ยุโรป', 'สแกนดิเนเวีย': 'ยุโรป',
  'อเมริกา': 'อเมริกา', 'america': 'อเมริกา', 'usa': 'อเมริกา',
  'อียิปต์': 'อียิปต์', 'egypt': 'อียิปต์',
  'ตุรกี': 'ตุรกี', 'turkey': 'ตุรกี', 'ist': 'ตุรกี',
  'จอร์แดน': 'จอร์แดน', 'jordan': 'จอร์แดน', 'amm': 'จอร์แดน',
  'จอร์เจีย': 'จอร์เจีย', 'georgia': 'จอร์เจีย', 'geo': 'จอร์เจีย',
  'อิหร่าน': 'อิหร่าน', 'iran': 'อิหร่าน',
  'คาซัคสถาน': 'คาซัคสถาน', 'kazakhstan': 'คาซัคสถาน', 'ala': 'คาซัคสถาน',
  'อินเดีย': 'อินเดีย', 'india': 'อินเดีย', 'แคชเมียร์': 'อินเดีย', 'kashmir': 'อินเดีย',
  'บาหลี': 'อินโดนีเซีย', 'bali': 'อินโดนีเซีย', 'bal': 'อินโดนีเซีย',
  'นิวซีแลนด์': 'นิวซีแลนด์', 'new zealand': 'นิวซีแลนด์', 'nzl': 'นิวซีแลนด์',
};

function detectCountry(title: string, url: string): string {
  const combined = (title + ' ' + url).toLowerCase();
  for (const [key, val] of Object.entries(COUNTRY_MAP)) {
    if (combined.includes(key.toLowerCase())) return val;
  }
  // Also check IATA codes in tour code (e.g. BT-TFU49 → TFU → จีน)
  const codeMatch = url.match(/\/tour\/[A-Z]*-?([A-Z]{3})/i);
  if (codeMatch) {
    const iata = codeMatch[1].toLowerCase();
    if (COUNTRY_MAP[iata]) return COUNTRY_MAP[iata];
  }
  return '';
}

export class BestInternationalScraper extends BaseScraper {
  private browser: Browser | null = null;

  async discoverUrls(): Promise<string[]> {
    if (!this.browser) {
      this.browser = await chromium.launch({ headless: true });
    }

    const tourUrls = new Set<string>();
    const ctx = await this.browser.newContext({ userAgent: this.cfg.userAgent });
    const page = await ctx.newPage();

    try {
      // Load main tour listing page
      await page.goto('https://www.bestinternational.com/tour', { waitUntil: 'networkidle', timeout: 60_000 });
      await page.waitForTimeout(6000);

      // Scroll to load all cards (lazy loading)
      for (let i = 0; i < 10; i++) {
        await page.evaluate(() => window.scrollBy(0, 1000));
        await page.waitForTimeout(1000);
      }

      // Collect all tour card links
      const links = await page.$$eval('a[href*="/tour/"]', els =>
        els.map(el => el.getAttribute('href') || '').filter(Boolean)
      );

      for (const href of links) {
        // Tour detail pages: /tour/BT-CNXKIX01_VZ format
        if (/\/tour\/[A-Z0-9_-]+$/i.test(href) && !/\/tour\/?$/.test(href)) {
          const fullUrl = href.startsWith('http') ? href : `https://www.bestinternational.com${href}`;
          tourUrls.add(fullUrl);
        }
      }

      console.log(`[bestintl] Found ${tourUrls.size} tour URLs from listing page`);
    } catch (e) {
      console.error(`[bestintl] Error discovering URLs:`, (e as Error).message);
    } finally {
      await ctx.close();
    }

    // Also try country pages for additional tours
    const countryPages = [
      'ญี่ปุ่น', 'จีน', 'เกาหลี', 'ไต้หวัน', 'ฮ่องกง', 'เวียดนาม',
      'ยุโรป', 'พม่า', 'ลาว', 'อียิปต์', 'จอร์แดน', 'จอร์เจีย'
    ];

    for (const country of countryPages) {
      try {
        const ctx2 = await this.browser.newContext({ userAgent: this.cfg.userAgent });
        const page2 = await ctx2.newPage();
        const countryUrl = `https://www.bestinternational.com/country/${encodeURIComponent(country)}`;
        await page2.goto(countryUrl, { waitUntil: 'networkidle', timeout: 30_000 });
        await page2.waitForTimeout(4000);

        const links = await page2.$$eval('a[href*="/tour/"]', els =>
          els.map(el => el.getAttribute('href') || '').filter(Boolean)
        );

        for (const href of links) {
          if (/\/tour\/[A-Z0-9_-]+$/i.test(href) && !/\/tour\/?$/.test(href)) {
            const fullUrl = href.startsWith('http') ? href : `https://www.bestinternational.com${href}`;
            tourUrls.add(fullUrl);
          }
        }

        await ctx2.close();
        console.log(`[bestintl] Country "${country}" — total: ${tourUrls.size}`);
        await this.sleep(2000);
      } catch (e) {
        console.error(`[bestintl] Skip country "${country}":`, (e as Error).message);
      }
    }

    return [...tourUrls];
  }

  async scrapeTour(url: string): Promise<TourData> {
    await this.sleep(this.cfg.requestDelayMs);

    if (!this.browser) {
      this.browser = await chromium.launch({ headless: true });
    }

    const ctx = await this.browser.newContext({ userAgent: this.cfg.userAgent });
    const page = await ctx.newPage();

    // Intercept image network requests to capture dynamically-loaded tour flyer images
    const networkImages = new Set<string>();
    page.on('response', (response) => {
      const reqUrl = response.url();
      const ct = response.headers()['content-type'] || '';
      if (ct.startsWith('image/') && reqUrl.startsWith('http') && !/(logo|icon|favicon|flag|social|badge|line\.|facebook|google|apple|mobile\.png)/i.test(reqUrl)) {
        networkImages.add(reqUrl);
      }
    });

    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30_000 });
      await page.waitForTimeout(8000);

      // Scroll down to trigger lazy-loaded images
      await page.evaluate(() => window.scrollBy(0, 2000));
      await page.waitForTimeout(2000);

      const html = await page.content();
      const $ = cheerio.load(html);

      // ── Extract structured data from rendered Angular DOM ──
      const renderedData = await page.evaluate(() => {
        const text = document.body.innerText || '';
        const result: Record<string, any> = {};

        // Price: look for ฿XX,XXX or ราคาเริ่มต้น patterns
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

        // Hotel rating: X ดาว or โรงแรม X ดาว
        const hotelMatch = text.match(/(\d)\s*ดาว/i)
          || text.match(/โรงแรม(?:หรู)?\s*(\d)\s*ดาว/i);
        if (hotelMatch) result.hotelRating = parseInt(hotelMatch[1]);

        // Deposit
        const depMatch = text.match(/มัดจำ\s*[^0-9]*([\d,]+)/);
        if (depMatch) result.deposit = parseInt(depMatch[1].replace(/,/g, ''), 10);

        // Travel date range: "เดินทาง : มี.ค. 2569 - พ.ค. 2569" or similar
        const travelMatch = text.match(/เดินทาง\s*[:：]?\s*([^\n]{5,60})/i);
        if (travelMatch) result.travelRange = travelMatch[1].trim();

        // Extract prices from all small text elements (Angular-rendered price tags)
        const priceElements: number[] = [];
        document.querySelectorAll('*').forEach(el => {
          const t = (el as HTMLElement).textContent?.trim() || '';
          if (/^[\d,]{4,7}$/.test(t) && (el as HTMLElement).children.length === 0) {
            const v = parseInt(t.replace(/,/g, ''), 10);
            if (v > 1000 && v < 500000) priceElements.push(v);
          }
        });
        if (priceElements.length > 0 && !result.price) {
          result.price = Math.min(...priceElements);
        }

        return result;
      });

      console.log(`[bestintl] Rendered data for ${url.split('/').pop()}:`, JSON.stringify(renderedData));

      // Extract images from HTML (img src, ng-src, data-src, background-image)
      const htmlImages = new Set<string>();

      // Standard img + Angular attributes
      $('img[src], img[ng-src], img[data-src], [style*="background-image"]').each((_, el) => {
        const src = $(el).attr('src') || $(el).attr('ng-src') || $(el).attr('data-src') || '';
        if (src && src.startsWith('http') && !/logo|icon|avatar|flag|svg|data:|line|facebook|instagram|tiktok|youtube|google|apple|mobile\.png/i.test(src)) {
          htmlImages.add(src);
        }
        // Check background-image style
        const style = $(el).attr('style') || '';
        const bgMatch = style.match(/background-image:\s*url\(['"]?([^'")\s]+)/);
        if (bgMatch && bgMatch[1].startsWith('http')) {
          htmlImages.add(bgMatch[1]);
        }
      });

      // Extract PDF link
      let pdfUrl = '';
      $('a[href*=".pdf"], a[href*="cloudfront"]').each((_, el) => {
        const href = $(el).attr('href');
        if (href && (/\.pdf/i.test(href) || /program/i.test(href))) {
          if (!pdfUrl) pdfUrl = href.startsWith('http') ? href : `https://www.bestinternational.com${href}`;
        }
      });

      const data = this.parseFromHtml(url, html);

      // Prioritize CloudFront CDN images (tour flyers), then network images, then HTML images
      const allImages = [...networkImages, ...htmlImages, ...data.imageUrls];
      // Separate CloudFront tour images, excluding PDFs and the generic mobile.png banner
      const tourImages = allImages.filter(img =>
        /cloudfront|amazonaws/i.test(img) && !/\.pdf/i.test(img) && !/mobile\.png/i.test(img)
      );
      // Sort: images whose URL contains the tour code should come FIRST (they are the flyer)
      const tourCode = url.match(/\/tour\/([A-Z0-9_-]+)/i)?.[1] || '';
      tourImages.sort((a, b) => {
        const aHasCode = tourCode && a.toLowerCase().includes(tourCode.toLowerCase()) ? 1 : 0;
        const bHasCode = tourCode && b.toLowerCase().includes(tourCode.toLowerCase()) ? 1 : 0;
        return bHasCode - aHasCode;
      });
      const otherImages = allImages.filter(img =>
        !tourImages.includes(img) &&
        !/logo|icon|avatar|flag|svg|banner.*site|header|mobile\.png/i.test(img) &&
        /\.(jpe?g|png|webp)/i.test(img)
      );
      data.imageUrls = [...new Set([...tourImages, ...otherImages])].slice(0, 5);

      if (pdfUrl && !data.pdfUrl) {
        data.pdfUrl = pdfUrl;
      }

      // ── Merge rendered Angular data (overrides static HTML parse) ──
      if (renderedData.price && (!data.priceFrom || data.priceFrom === 0)) {
        data.priceFrom = renderedData.price;
      }
      if (renderedData.hotelRating && !data.hotelRating) {
        data.hotelRating = renderedData.hotelRating;
      }
      if (renderedData.deposit && !data.deposit) {
        data.deposit = renderedData.deposit;
      }
      // Create a period from travelRange if no periods were parsed
      if (renderedData.travelRange && data.periods.length === 0) {
        data.periods.push({
          rawText: renderedData.travelRange,
          price: renderedData.price || data.priceFrom || undefined,
        });
      }

      return data;
    } finally {
      await ctx.close();
    }
  }

  private parseFromHtml(url: string, html: string): TourData {
    const $ = cheerio.load(html);
    const bodyText = $('body').text();

    // Tour Code from URL
    const tourCode = url.match(/\/tour\/([A-Z0-9_-]+)/i)?.[1] ?? '';

    // Title
    const title = $('h1').first().text().trim()
      || $('h2').first().text().trim()
      || tourCode;

    // Duration
    const durMatch = bodyText.match(/(\d+)\s*วัน\s*[-–]?\s*(\d+)\s*คืน/);
    const duration = durMatch ? `${durMatch[1]} วัน ${durMatch[2]} คืน` : '';

    // Price
    const priceMatch = bodyText.match(/(?:ราคา|เริ่มต้น|price)\s*[:：]?\s*[฿]?\s*([\d,]+)/i)
      || bodyText.match(/\b([\d,]{5,})\s*(?:บาท|฿)/);
    const priceFrom = priceMatch ? parseInt(priceMatch[1].replace(/,/g, ''), 10) : 0;

    // Airline
    const airlineMatch = bodyText.match(/สายการบิน\s*[:：]?\s*([^\n\r]{3,40}?)(?:\s*\(|\s*$|\n)/);
    const airline = airlineMatch?.[1]?.trim() || '';

    // Country
    const country = detectCountry(title, url);

    // Deposit
    const depositMatch = bodyText.match(/มัดจำ\s*[^0-9]*([\d,]+)/);
    const deposit = depositMatch ? parseInt(depositMatch[1].replace(/,/g, ''), 10) : undefined;

    // Hotel rating — also check "พักโรงแรม X ดาว" pattern
    let hotelRating: number | undefined;
    const starMatch = bodyText.match(/(\d)\s*(?:ดาว|star|★)/i)
      || bodyText.match(/โรงแรม(?:หรู)?\s*(\d)\s*ดาว/i);
    if (starMatch) hotelRating = parseInt(starMatch[1]);

    // Highlights
    const highlights: string[] = [];
    $('h3, h4, strong').each((_, el) => {
      const text = $(el).text().trim();
      if (/วันที่\s*\d|Day\s*\d/i.test(text) && text.length > 10 && text.length < 300) {
        highlights.push(text);
      }
    });

    // Images from HTML
    const htmlImageUrls: string[] = [];
    $('img[src]').each((_, el) => {
      const src = $(el).attr('src');
      if (src && !/logo|icon|avatar|flag|svg|data:/i.test(src) && (/\.(jpe?g|png|webp)/i.test(src) || /cloudfront|bestinternational/i.test(src))) {
        try { htmlImageUrls.push(new URL(src, url).href); } catch {}
      }
    });

    // PDF
    let pdfUrl = '';
    $('a[href*=".pdf"], a[href*="cloudfront"]').each((_, el) => {
      const href = $(el).attr('href');
      if (href && (/\.pdf/i.test(href) || /program/i.test(href))) {
        pdfUrl = href.startsWith('http') ? href : `https://www.bestinternational.com${href}`;
      }
    });

    // Periods — parse from table rows or text patterns
    const periods: TourPeriod[] = [];
    
    // Thai month abbreviation mapping
    const THAI_MONTHS: Record<string, string> = {
      'ม.ค': '01', 'มค': '01', 'ม.ค.': '01',
      'ก.พ': '02', 'กพ': '02', 'ก.พ.': '02',
      'มี.ค': '03', 'มีค': '03', 'มี.ค.': '03',
      'เม.ย': '04', 'เมย': '04', 'เม.ย.': '04',
      'พ.ค': '05', 'พค': '05', 'พ.ค.': '05',
      'มิ.ย': '06', 'มิย': '06', 'มิ.ย.': '06',
      'ก.ค': '07', 'กค': '07', 'ก.ค.': '07',
      'ส.ค': '08', 'สค': '08', 'ส.ค.': '08',
      'ก.ย': '09', 'กย': '09', 'ก.ย.': '09',
      'ต.ค': '10', 'ตค': '10', 'ต.ค.': '10',
      'พ.ย': '11', 'พย': '11', 'พ.ย.': '11',
      'ธ.ค': '12', 'ธค': '12', 'ธ.ค.': '12',
    };

    function parseThaiDate(dateStr: string): string {
      // Pattern: "25 พ.ย. 69" or "6 ธ.ค. 2569" or "25 พ.ย. 2569"
      const m = dateStr.match(/(\d{1,2})\s*(ม\.?ค\.?|ก\.?พ\.?|มี\.?ค\.?|เม\.?ย\.?|พ\.?ค\.?|มิ\.?ย\.?|ก\.?ค\.?|ส\.?ค\.?|ก\.?ย\.?|ต\.?ค\.?|พ\.?ย\.?|ธ\.?ค\.?)\.?\s*(\d{2,4})/);
      if (!m) return '';
      const day = m[1].padStart(2, '0');
      const monthKey = m[2].replace(/\./g, '');
      const month = THAI_MONTHS[monthKey] || THAI_MONTHS[m[2]] || THAI_MONTHS[m[2].replace(/\.$/, '')] || '01';
      let year = parseInt(m[3]);
      // Convert Buddhist Era to CE
      if (year > 2400) year = year - 543;
      else if (year < 100) year = year + 2000 - 543;
      return `${year}-${month}-${day}`;
    }

    // Try parsing date ranges from body text  
    const dateRangeMatches = bodyText.matchAll(
      /(\d{1,2})\s*(ม\.?ค\.?|ก\.?พ\.?|มี\.?ค\.?|เม\.?ย\.?|พ\.?ค\.?|มิ\.?ย\.?|ก\.?ค\.?|ส\.?ค\.?|ก\.?ย\.?|ต\.?ค\.?|พ\.?ย\.?|ธ\.?ค\.?)\.?\s*(\d{2,4})\s*[-–~]\s*(\d{1,2})\s*(ม\.?ค\.?|ก\.?พ\.?|มี\.?ค\.?|เม\.?ย\.?|พ\.?ค\.?|มิ\.?ย\.?|ก\.?ค\.?|ส\.?ค\.?|ก\.?ย\.?|ต\.?ค\.?|พ\.?ย\.?|ธ\.?ค\.?)\.?\s*(\d{2,4})/g
    );
    for (const m of dateRangeMatches) {
      const startStr = `${m[1]} ${m[2]} ${m[3]}`;
      const endStr = `${m[4]} ${m[5]} ${m[6]}`;
      const startDate = parseThaiDate(startStr);
      const endDate = parseThaiDate(endStr);
      
      // Try to extract price near this date range
      const datePos = m.index || 0;
      const nearbyText = bodyText.slice(datePos, datePos + 200);
      const priceMatch = nearbyText.match(/[\d,]{5,}/);
      const price = priceMatch ? parseInt(priceMatch[0].replace(/,/g, ''), 10) : undefined;

      if (startDate || endDate) {
        periods.push({
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          price: price && price > 1000 ? price : undefined,
          rawText: `${m[1]} ${m[2]} ${m[3]} - ${m[4]} ${m[5]} ${m[6]}`,
        });
      }
    }

    // Fallback: simpler date patterns "DD - DD เดือน ปี" (same month)
    if (periods.length === 0) {
      const simpleDateMatches = bodyText.matchAll(
        /(\d{1,2})\s*[-–]\s*(\d{1,2})\s*(ม\.?ค\.?|ก\.?พ\.?|มี\.?ค\.?|เม\.?ย\.?|พ\.?ค\.?|มิ\.?ย\.?|ก\.?ค\.?|ส\.?ค\.?|ก\.?ย\.?|ต\.?ค\.?|พ\.?ย\.?|ธ\.?ค\.?)\.?\s*(\d{2,4})/g
      );
      for (const m of simpleDateMatches) {
        const startDate = parseThaiDate(`${m[1]} ${m[3]} ${m[4]}`);
        const endDate = parseThaiDate(`${m[2]} ${m[3]} ${m[4]}`);
        periods.push({
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          rawText: `${m[1]}-${m[2]} ${m[3]} ${m[4]}`,
        });
      }
    }

    return {
      tourCode,
      sourceUrl: url,
      title,
      country,
      duration,
      priceFrom,
      airline,
      pdfUrl,
      imageUrls: [...new Set(htmlImageUrls)].slice(0, 5),
      periods,
      deposit,
      hotelRating,
      highlights,
    };
  }

  async cleanup(): Promise<void> {
    await this.browser?.close();
    this.browser = null;
  }
}
