// ─── OneWorldTour Scraper (WordPress) ───────
// Phase 1: Discover tour URLs by crawling landing pages
// Phase 2: Scrape individual /tour/owttXXXXXX/ pages

import * as cheerio from 'cheerio';
import { BaseScraper } from './base.js';
import { discoverUrls } from '../core/sitemap.js';
import type { TourData, TourPeriod } from '../types.js';

export class OneWorldTourScraper extends BaseScraper {

  async discoverUrls(): Promise<string[]> {
    // 1. Get ALL URLs from sitemap (landing pages)
    const landingPattern = /\/custom-landingpage\//i;
    const landingUrls = await discoverUrls(
      this.cfg.sitemapUrls,
      landingPattern,
      this.cfg.userAgent,
    );
    console.log(`[owt] Found ${landingUrls.length} landing pages to crawl for /tour/ links`);

    // Also try to find direct /tour/ URLs in sitemap
    const directTourUrls = await discoverUrls(
      this.cfg.sitemapUrls,
      /\/tour\/[a-z]{2,}[0-9]+\/?$/i,
      this.cfg.userAgent,
    );
    console.log(`[owt] Found ${directTourUrls.length} direct /tour/ URLs in sitemap`);

    // 2. Crawl a sample of landing pages to find /tour/ links
    const tourUrls = new Set<string>(directTourUrls);
    const maxLandingPages = 30; // Crawl up to 30 landing pages

    for (const [i, lpUrl] of landingUrls.slice(0, maxLandingPages).entries()) {
      try {
        await this.sleep(1000);
        const res = await fetch(lpUrl, {
          headers: { 'User-Agent': this.cfg.userAgent },
          signal: AbortSignal.timeout(15_000),
        });
        if (!res.ok) continue;
        const html = await res.text();
        const $ = cheerio.load(html);

        // Find links matching /tour/owttXXXXXX/
        $('a[href*="/tour/"]').each((_, el) => {
          const href = $(el).attr('href');
          if (href && /\/tour\/[a-z]{2,}[0-9]+\/?$/i.test(href)) {
            try {
              const fullUrl = new URL(href, lpUrl);
              if (fullUrl.hostname.includes('oneworldtour.co.th')) {
                tourUrls.add(fullUrl.href.replace(/\/$/, '') + '/');
              }
            } catch {}
          }
        });

        console.log(`[owt] Crawled ${i + 1}/${Math.min(landingUrls.length, maxLandingPages)} — ${tourUrls.size} unique tour URLs found`);
      } catch (e) {
        console.error(`[owt] Skip ${lpUrl}: ${(e as Error).message}`);
      }
    }

    console.log(`[owt] Total unique tour URLs discovered: ${tourUrls.size}`);
    return [...tourUrls];
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

    // ── Title (from page title or h1) ──
    const rawTitle = $('title').text().trim();
    const title = rawTitle.replace(/\s*[-–|].*One\s*World.*$/i, '').trim()
      || $('h1').first().text().trim();

    // ── Breadcrumb → country ──
    const breadcrumbs = $('a').filter((_, el) => {
      const href = $(el).attr('href') || '';
      return /\/(intertours|custom-landingpage)\//.test(href);
    }).map((_, el) => $(el).text().trim()).get();
    const country = breadcrumbs.find(b => b.length > 1 && !/หน้าแรก|Home/i.test(b)) || '';

    // ── Itinerary description from bullet points ──
    const itineraryBullets: string[] = [];
    $('li, .wpb_text_column p, .entry-content p').each((_, el) => {
      const text = $(el).text().trim();
      if (text.length > 20 && text.length < 500) {
        itineraryBullets.push(text);
      }
    });
    const description = itineraryBullets.slice(0, 3).join(' | ') 
      || $('meta[name="description"]').attr('content') || '';

    // ── Full itinerary HTML ──
    const itineraryEl = $('article, .entry-content, .tour-content, .wpb_wrapper').first();
    const itineraryHtml = itineraryEl.html()?.slice(0, 50_000) ?? '';

    // ── PDF link (weon.website pattern) ──
    const pdfUrl = $('a[href*="pdf.weon.website"], a[href$=".pdf"]').first().attr('href') || '';

    // ── Star rating ──
    const duration = $('[class*=star], [class*=rating]').text().trim().slice(0, 20)
      || `${(html.match(/(\d+)\s*ดาว/)?.[1] || '')} ดาว`;

    // ── Price from periods ──
    let priceFrom: number | undefined;

    // ── Airline ──
    const airline = $('[class*=airline]').first().text().trim();

    // ── Images (filter out logos/icons/nav images) ──
    const imageUrls = new Set<string>();
    $('img').each((_, el) => {
      const src = $(el).attr('src') || $(el).attr('data-src') || $(el).attr('data-lazy-src');
      if (src && !/logo|icon|avatar|spacer|pixel|menu|arrow|social/i.test(src)
        && /\.(jpe?g|png|webp)/i.test(src)
        && !src.includes('wp-content/themes')
      ) {
        try {
          imageUrls.add(new URL(src, url).href);
        } catch {}
      }
    });

    // ── Periods (departure dates: "แสดง/ซ่อน" + "ติดต่อเรา" toggles) ──
    const periods = this.parsePeriods($);
    if (periods.length > 0 && !priceFrom) {
      const validPrices = periods.map(p => p.price).filter((p): p is number => !!p);
      priceFrom = validPrices.length > 0 ? Math.min(...validPrices) : undefined;
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
      itineraryHtml,
      pdfUrl,
      imageUrls: [...imageUrls].slice(0, 20), // Max 20 images per tour
      periods,
    };
  }

  private parsePeriods($: cheerio.CheerioAPI): TourPeriod[] {
    const periods: TourPeriod[] = [];

    // Look for date + price patterns in toggle sections
    $('table tr, .period-row, [class*=departure]').each((_, row) => {
      const cells = $(row).find('td, span, div').map((_, c) => $(c).text().trim()).get();
      if (cells.length >= 2) {
        periods.push({
          rawText: cells.join(' | '),
          price: this.parsePrice(cells.find(c => /[\d,]+/.test(c)) || ''),
          status: cells.find(c => /เปิด|ว่าง|open|available/i.test(c)) ? 'open' : 'open',
        });
      }
    });

    return periods;
  }
}
