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
  'fukuoka': 'ญี่ปุ่น', 'nagoya': 'ญี่ปุ่น', 'narita': 'ญี่ปุ่น',
  'จีน': 'จีน', 'china': 'จีน', 'chongqing': 'จีน', 'xian': 'จีน', 'kunming': 'จีน', 'xinjiang': 'จีน',
  'เกาหลี': 'เกาหลี', 'korea': 'เกาหลี',
  'ไต้หวัน': 'ไต้หวัน', 'taiwan': 'ไต้หวัน',
  'ฮ่องกง': 'ฮ่องกง', 'hong kong': 'ฮ่องกง', 'hongkong': 'ฮ่องกง',
  'เวียดนาม': 'เวียดนาม', 'vietnam': 'เวียดนาม',
  'พม่า': 'พม่า', 'myanmar': 'พม่า',
  'ลาว': 'ลาว', 'laos': 'ลาว',
  'สิงคโปร์': 'สิงคโปร์', 'singapore': 'สิงคโปร์',
  'มาเก๊า': 'ฮ่องกง', 'macau': 'ฮ่องกง',
  'ยุโรป': 'ยุโรป', 'europe': 'ยุโรป',
  'อเมริกา': 'อเมริกา', 'america': 'อเมริกา', 'usa': 'อเมริกา',
  'อียิปต์': 'อียิปต์', 'egypt': 'อียิปต์',
  'ตุรกี': 'ตุรกี', 'turkey': 'ตุรกี',
  'จอร์แดน': 'จอร์แดน', 'jordan': 'จอร์แดน',
  'จอร์เจีย': 'จอร์เจีย', 'georgia': 'จอร์เจีย',
  'อิหร่าน': 'อิหร่าน', 'iran': 'อิหร่าน',
  'คาซัคสถาน': 'คาซัคสถาน', 'kazakhstan': 'คาซัคสถาน',
  'อินเดีย': 'อินเดีย', 'india': 'อินเดีย',
};

function detectCountry(title: string, url: string): string {
  const combined = (title + ' ' + url).toLowerCase();
  for (const [key, val] of Object.entries(COUNTRY_MAP)) {
    if (combined.includes(key.toLowerCase())) return val;
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

    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 60_000 });
      await page.waitForTimeout(5000);

      // Extract images via Playwright
      const imageUrls = await page.$$eval('img[src]', els =>
        els.map(el => el.getAttribute('src') || '')
          .filter(src => src && !/(logo|icon|avatar|flag|svg|data:|line|facebook|instagram|tiktok|youtube|google|apple)/i.test(src))
          .filter(src => /\.(jpe?g|png|webp)/i.test(src) || /cloudfront|amazonaws|bestinternational/i.test(src))
      );

      // Extract PDF link
      const pdfUrl = await page.$$eval('a[href*=".pdf"], a[href*="cloudfront"]', els => {
        for (const el of els) {
          const href = el.getAttribute('href') || '';
          if (/\.pdf/i.test(href) || /program/i.test(href)) return href;
        }
        return '';
      });

      const html = await page.content();
      const data = this.parseFromHtml(url, html);

      // Merge Playwright images
      if (imageUrls.length > 0) {
        const uniqueImgs = [...new Set([...data.imageUrls, ...imageUrls])];
        data.imageUrls = uniqueImgs.slice(0, 5);
      }

      if (pdfUrl && !data.pdfUrl) {
        data.pdfUrl = pdfUrl;
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

    // Hotel rating
    let hotelRating: number | undefined;
    const starMatch = bodyText.match(/(\d)\s*(?:ดาว|star|★)/i);
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

    // Periods
    const periods: TourPeriod[] = [];
    const dateMatches = bodyText.matchAll(
      /(\d{1,2})\s*[-–]\s*(\d{1,2})\s*(ม\.?ค|ก\.?พ|มี\.?ค|เม\.?ย|พ\.?ค|มิ\.?ย|ก\.?ค|ส\.?ค|ก\.?ย|ต\.?ค|พ\.?ย|ธ\.?ค)\.?\s*(\d{2,4})/g
    );
    for (const m of dateMatches) {
      periods.push({ rawText: m[0] });
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
