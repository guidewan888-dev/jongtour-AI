// ─── iTravels Scraper (Next.js SPA) ─────────
// No sitemap available — discover URLs by crawling listing pages
// Client-rendered → use Playwright to wait for JS, then extract data

import { chromium, type Browser } from 'playwright';
import * as cheerio from 'cheerio';
import { BaseScraper } from './base.js';
import type { TourData, TourPeriod } from '../types.js';

export class ITravelsScraper extends BaseScraper {
  private browser?: Browser;

  async discoverUrls(): Promise<string[]> {
    // No sitemap → crawl listing pages to discover tour URLs
    if (!this.browser) {
      this.browser = await chromium.launch({ headless: true });
    }

    const tourUrls = new Set<string>();
    const listingPages = [
      'https://itravels.center/new-programs',
      'https://itravels.center/menus/eu',
      'https://itravels.center/menus/japan',
      'https://itravels.center/menus/china',
      'https://itravels.center/menus/asia',
      'https://itravels.center/menus/america',
      'https://itravels.center/menus/egypt',
    ];

    for (const [i, pageUrl] of listingPages.entries()) {
      try {
        const ctx = await this.browser.newContext({ userAgent: this.cfg.userAgent });
        const page = await ctx.newPage();

        await page.goto(pageUrl, { waitUntil: 'networkidle', timeout: 30_000 });
        await page.waitForTimeout(3000); // Wait for SPA to render

        // Scroll to load more items
        for (let s = 0; s < 5; s++) {
          await page.evaluate(() => window.scrollBy(0, 1000));
          await page.waitForTimeout(1000);
        }

        const html = await page.content();
        const $ = cheerio.load(html);

        // Find all tour links: /programs/CODE
        $('a[href*="/programs/"]').each((_, el) => {
          const href = $(el).attr('href');
          if (href && /\/programs\/[A-Z0-9]{3,}$/i.test(href)) {
            try {
              const full = new URL(href, pageUrl).href;
              if (full.includes('itravels.center')) {
                tourUrls.add(full);
              }
            } catch {}
          }
        });

        await ctx.close();
        console.log(`[itravels] Crawled ${i + 1}/${listingPages.length} "${pageUrl.split('/').pop()}" — ${tourUrls.size} tour URLs`);
        await this.sleep(2000);
      } catch (e) {
        console.error(`[itravels] Skip ${pageUrl}: ${(e as Error).message}`);
      }
    }

    console.log(`[itravels] Total unique tour URLs: ${tourUrls.size}`);
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
      await page.waitForTimeout(5000); // Wait for SPA to fully render

      const html = await page.content();
      return this.parseFromHtml(url, html);
    } finally {
      await ctx.close();
    }
  }

  private parseFromHtml(url: string, html: string): TourData {
    const $ = cheerio.load(html);

    // ── Tour Code from URL or page text ──
    const tourCode = url.match(/\/programs\/([A-Z0-9]+)/i)?.[1] ?? '';

    // ── Title ──
    const title = $('h1, h2').first().text().trim()
      || $('title').text().replace(/\s*[-|].*$/, '').trim();

    // ── Price ──
    let priceFrom: number | undefined;
    const priceText = $('body').text().match(/(?:เริ่มต้น|ราคา)[^\d]*?([\d,]+)/)?.[1];
    if (priceText) {
      priceFrom = parseInt(priceText.replace(/,/g, ''), 10) || undefined;
    }

    // ── Country ──
    const countryLink = $('a[href*="/programs?countries="]').first().text().trim();
    const country = countryLink || '';

    // ── Airline ──
    const airlineLink = $('a[href*="/programs?airlines="]').first().text().trim();
    const airline = airlineLink || '';

    // ── Duration ──
    const durationMatch = $('body').text().match(/(\d+)\s*วัน\s*(\d+)\s*คืน/);
    const duration = durationMatch ? `${durationMatch[1]} วัน ${durationMatch[2]} คืน` : '';

    // ── Description ──
    const description = $('meta[name="description"]').attr('content') || '';

    // ── PDF URL ──
    const pdfUrl = $('a[href*="/pdf"]').first().attr('href') || '';

    // ── Images ──
    const imageUrls = new Set<string>();
    $('img[src]').each((_, el) => {
      const src = $(el).attr('src');
      if (src
        && !/logo|icon|avatar|spacer|svg|data:/i.test(src)
        && /\.(jpe?g|png|webp)/i.test(src)
      ) {
        try {
          imageUrls.add(new URL(src, url).href);
        } catch {}
      }
    });

    // ── Periods ──
    const periods: TourPeriod[] = [];
    // Look for date patterns in page text
    const dateMatches = $('body').text().matchAll(/(\d{1,2})\s*[-–]\s*(\d{1,2})\s*(ม\.?ค|ก\.?พ|มี\.?ค|เม\.?ย|พ\.?ค|มิ\.?ย|ก\.?ค|ส\.?ค|ก\.?ย|ต\.?ค|พ\.?ย|ธ\.?ค)\.?\s*(\d{2,4})/g);
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
      description,
      itineraryHtml: '',
      pdfUrl,
      imageUrls: [...imageUrls].slice(0, 15),
      periods,
    };
  }

  async cleanup(): Promise<void> {
    await this.browser?.close();
    this.browser = undefined;
  }
}
