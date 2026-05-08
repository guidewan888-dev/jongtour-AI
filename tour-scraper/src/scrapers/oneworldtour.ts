// ─── OneWorldTour Scraper (WordPress) ───────
// Server-rendered HTML → parse with Cheerio

import * as cheerio from 'cheerio';
import { BaseScraper } from './base.js';
import { discoverUrls } from '../core/sitemap.js';
import type { TourData, TourPeriod } from '../types.js';

export class OneWorldTourScraper extends BaseScraper {

  async discoverUrls(): Promise<string[]> {
    return discoverUrls(
      this.cfg.sitemapUrls,
      this.cfg.tourUrlPattern,
      this.cfg.userAgent,
    );
  }

  async scrapeTour(url: string): Promise<TourData> {
    await this.sleep(this.cfg.requestDelayMs);

    const res = await fetch(url, {
      headers: { 'User-Agent': this.cfg.userAgent },
      signal: AbortSignal.timeout(30_000),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    const html = await res.text();
    const $ = cheerio.load(html);

    // ── Extract tour code from URL: /tour/owtt210079/ ──
    const tourCode = (url.match(/\/tour\/([a-z0-9]+)/i)?.[1] ?? '').toUpperCase();

    // ── Title ──
    const title = $('h1.entry-title, h1.tour-title, h1').first().text().trim();

    // ── Price ──
    const priceText = $('.tour-price, .price, [class*=price]').first().text();
    const priceFrom = this.parsePrice(priceText);

    // ── Airline ──
    const airline = $('[class*=airline]').first().text().trim();

    // ── Duration ──
    const duration = $('[class*=duration], [class*=day]').first().text().trim();

    // ── Country (try meta or breadcrumb) ──
    const country = $('[class*=country], .breadcrumb a').eq(1).text().trim() || '';

    // ── Description ──
    const description = $('meta[name="description"]').attr('content') || '';

    // ── Itinerary HTML ──
    const itineraryEl = $('.tour-itinerary, .entry-content, .tour-program').first();
    const itineraryHtml = itineraryEl.html() ?? '';

    // ── PDF link ──
    const pdfLink = $('a[href$=".pdf"]').first().attr('href');
    const pdfUrl = pdfLink ? new URL(pdfLink, url).href : '';

    // ── Images (filter out logos/icons) ──
    const imageUrls = new Set<string>();
    $('article img, .tour-content img, .gallery img, .entry-content img, .wp-block-image img').each((_, el) => {
      const src = $(el).attr('src') || $(el).attr('data-src') || $(el).attr('data-lazy-src');
      if (src && !/logo|icon|avatar|spacer|pixel/i.test(src)) {
        try {
          imageUrls.add(new URL(src, url).href);
        } catch {}
      }
    });

    // ── Periods (departure dates table) ──
    const periods = this.parsePeriods($);

    return {
      tourCode,
      sourceUrl: url,
      title,
      country,
      duration,
      priceFrom,
      airline,
      description,
      itineraryHtml,
      pdfUrl,
      imageUrls: [...imageUrls],
      periods,
    };
  }

  private parsePeriods($: cheerio.CheerioAPI): TourPeriod[] {
    const periods: TourPeriod[] = [];

    // Look for tables with departure info
    $('table tr, .period-table tr, .departure-table tr').each((_, row) => {
      const cells = $(row).find('td').map((_, c) => $(c).text().trim()).get();
      if (cells.length >= 2) {
        periods.push({
          rawText: cells.join(' | '),
          price: this.parsePrice(cells[1] || ''),
          status: cells[2] || 'open',
        });
      }
    });

    return periods;
  }
}
