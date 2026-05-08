// ─── iTravels Scraper (Next.js SPA) ─────────
// Client-rendered → use Playwright to wait for JS, then parse with Cheerio
// TIP: intercepts XHR API responses for cleaner data extraction

import { chromium, type Browser } from 'playwright';
import * as cheerio from 'cheerio';
import { BaseScraper } from './base.js';
import { discoverUrls } from '../core/sitemap.js';
import type { TourData, TourPeriod } from '../types.js';

export class ITravelsScraper extends BaseScraper {
  private browser?: Browser;

  async discoverUrls(): Promise<string[]> {
    return discoverUrls(
      this.cfg.sitemapUrls,
      this.cfg.tourUrlPattern,
      this.cfg.userAgent,
    );
  }

  async scrapeTour(url: string): Promise<TourData> {
    await this.sleep(this.cfg.requestDelayMs);

    if (!this.browser) {
      this.browser = await chromium.launch({ headless: true });
    }

    const ctx = await this.browser.newContext({ userAgent: this.cfg.userAgent });
    const page = await ctx.newPage();

    // ⭐ Intercept API calls — SPA often fetches tour data via XHR
    const apiResponses: any[] = [];
    page.on('response', async (r) => {
      const u = r.url();
      if (/\/api\/.*tour/i.test(u) && r.headers()['content-type']?.includes('json')) {
        try {
          apiResponses.push(await r.json());
        } catch {}
      }
    });

    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 60_000 });

      // Wait for main content to render
      if (this.cfg.waitSelector) {
        await page.waitForSelector(this.cfg.waitSelector, { timeout: 15_000 }).catch(() => {});
      }

      const html = await page.content();

      // Prefer API JSON if intercepted
      if (apiResponses.length > 0) {
        console.log(`[itravels] Got API response for ${url}`);
        return this.parseFromApi(url, apiResponses[0]);
      }

      return this.parseFromHtml(url, html);
    } finally {
      await ctx.close();
    }
  }

  private parseFromApi(url: string, json: any): TourData {
    // Adapt field names based on actual API response structure
    const data = json.data ?? json;
    return {
      tourCode: data.code ?? data.tourCode ?? this.extractCode(url),
      sourceUrl: url,
      title: data.title ?? data.name ?? '',
      country: data.country ?? data.destination ?? '',
      duration: data.duration ?? '',
      priceFrom: data.price ?? data.startingPrice ?? 0,
      airline: data.airline ?? '',
      description: data.description ?? '',
      itineraryHtml: data.itinerary ?? data.program ?? '',
      pdfUrl: data.pdfUrl ?? '',
      imageUrls: Array.isArray(data.images)
        ? data.images.map((i: any) => (typeof i === 'string' ? i : i.url))
        : [],
      periods: Array.isArray(data.periods)
        ? data.periods.map((p: any) => ({
            startDate: p.startDate ?? p.start,
            endDate: p.endDate ?? p.end,
            price: p.price,
            seatsLeft: p.seatsLeft ?? p.seats,
            status: p.status ?? 'open',
            rawText: JSON.stringify(p),
          }))
        : [],
    };
  }

  private parseFromHtml(url: string, html: string): TourData {
    const $ = cheerio.load(html);

    const title = $('h1').first().text().trim();
    const description = $('meta[name="description"]').attr('content') || '';

    // Collect images
    const imageUrls = new Set<string>();
    $('img[src]').each((_, el) => {
      const src = $(el).attr('src');
      if (src && !/logo|icon|avatar|spacer/i.test(src) && !src.startsWith('data:')) {
        try {
          imageUrls.add(new URL(src, url).href);
        } catch {}
      }
    });

    return {
      tourCode: this.extractCode(url),
      sourceUrl: url,
      title,
      description,
      imageUrls: [...imageUrls],
      periods: [],
    };
  }

  private extractCode(url: string): string {
    return url.match(/\/(?:tour|package)\/([\w-]+)/)?.[1] ?? '';
  }

  async cleanup(): Promise<void> {
    await this.browser?.close();
    this.browser = undefined;
  }
}
