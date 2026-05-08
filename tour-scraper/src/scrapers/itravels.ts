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

      // Extract images via Playwright (iTravels uses UUID URLs without file extensions)
      const playwrightImages = await page.$$eval('img[src*="file.itravels.center/attachments/tour_program"]', els =>
        els.map(el => el.getAttribute('src') || '').filter(Boolean)
      );

      const html = await page.content();
      const data = this.parseFromHtml(url, html);

      // Merge Playwright images (these are the real tour images)
      if (playwrightImages.length > 0 && data.imageUrls.length === 0) {
        data.imageUrls = [...new Set(playwrightImages)];
      }

      return data;
    } finally {
      await ctx.close();
    }
  }

  private parseFromHtml(url: string, html: string): TourData {
    const $ = cheerio.load(html);
    const bodyText = $('body').text();

    // ── Tour Code from URL or page text ──
    const tourCode = url.match(/\/programs\/([A-Z0-9]+)/i)?.[1] ?? '';

    // ── Title ──
    const title = $('h1, h2').first().text().trim()
      || $('title').text().replace(/\s*[-|].*$/, '').trim();

    // ── Country — "ประเทศ : XXX" label (stop at next label like "เมือง") ──
    const countryMatch = bodyText.match(/ประเทศ\s*:\s*(.+?)(?=เมือง|ระดับ|จำนวน|ช่วง|สายการบิน|\n|\r|$)/);
    const country = countryMatch?.[1]?.trim() || '';

    // ── City — "เมือง : XXX" label (stop at next label) ──
    const cityMatch = bodyText.match(/เมือง\s*:\s*(.+?)(?=ระดับ|จำนวน|ช่วง|สายการบิน|ประเทศ|\n|\r|$)/);
    const city = cityMatch?.[1]?.trim() || '';

    // ── Duration — "จำนวนวัน : X วัน Y คืน" ──
    const durationMatch = bodyText.match(/จำนวนวัน\s*:\s*(\d+)\s*วัน\s*(\d+)\s*คืน/)
      || bodyText.match(/(\d+)\s*วัน\s*(\d+)\s*คืน/);
    const duration = durationMatch ? `${durationMatch[1]} วัน ${durationMatch[2]} คืน` : '';

    // ── Airline — "สายการบิน : XXX (XX)" ──
    const airlineMatch = bodyText.match(/สายการบิน\s*:\s*([^\n\r(]+(?:\([A-Z]{2}\))?)/);
    const airline = airlineMatch?.[1]?.trim() || '';

    // ── Price — "เริ่มต้นเพียง XX,XXX" or "เริ่มเพียง" ──
    let priceFrom: number | undefined;
    const pricePatterns = [
      /เริ่ม(?:ต้น)?(?:เพียง)?\s*[^\d]*([\d,]+)/,
      /ราคา\s*[^\d]*([\d,]+)/,
      /([\d,]{5,})\s*(?:บ\.?|฿|-)/,
    ];
    for (const pat of pricePatterns) {
      const m = bodyText.match(pat);
      if (m) {
        const parsed = parseInt(m[1].replace(/,/g, ''), 10);
        if (parsed > 1000) { priceFrom = parsed; break; }
      }
    }

    // ── Hotel Rating — "ระดับโรงแรม : ★★★" or SVG star icons ──
    const hotelSection = bodyText.match(/ระดับโรงแรม\s*:\s*([^\n\r]+)/)?.[1] || '';
    // Count filled star characters (★, ⭐, ☆ doesn't count)
    const starCount = (hotelSection.match(/[★⭐🌟]/g) || []).length;
    // Fallback: try to find digit-based "X ดาว" pattern  
    const starDigitMatch = hotelSection.match(/(\d)\s*ดาว/) || bodyText.match(/(\d)\s*ดาว/);
    const hotelRating = starCount > 0 ? starCount 
      : (starDigitMatch ? parseInt(starDigitMatch[1]) : undefined);

    // ── PDF — button with "PDF" text or href containing pdf ──
    const pdfUrl = $('a:contains("PDF")').first().attr('href')
      || $('a[href*=".pdf"]').first().attr('href')
      || $('a[href*="/pdf"]').first().attr('href')
      || '';

    // ── Deposit — "มัดจำ XX,XXX" ──
    const depositMatch = bodyText.match(/มัดจำ\s*[^\d]*([\d,]+)/);
    const deposit = depositMatch ? parseInt(depositMatch[1].replace(/,/g, ''), 10) : undefined;

    // ── Description ──
    const description = $('meta[name="description"]').attr('content') || '';

    // ── Highlights — from itinerary section ──
    const highlights: string[] = [];
    // Look for day-by-day itinerary headers
    $('h3, h4, strong').each((_, el) => {
      const text = $(el).text().trim();
      if (/วันที่\s*\d|Day\s*\d/i.test(text) && text.length > 10 && text.length < 300) {
        highlights.push(text);
      }
    });

    // ── Images — both <img> and background-image ──
    const imageUrls = new Set<string>();
    $('img[src]').each((_, el) => {
      const src = $(el).attr('src');
      if (src
        && !/logo|icon|avatar|spacer|svg|data:|flag/i.test(src)
        && /\.(jpe?g|png|webp)/i.test(src)
      ) {
        try {
          imageUrls.add(new URL(src, url).href);
        } catch {}
      }
    });
    // Also try data-src and lazy-loaded images
    $('img[data-src]').each((_, el) => {
      const src = $(el).attr('data-src');
      if (src && /\.(jpe?g|png|webp)/i.test(src)) {
        try { imageUrls.add(new URL(src, url).href); } catch {}
      }
    });
    // Background images
    $('[style*="background-image"]').each((_, el) => {
      const bgMatch = $(el).attr('style')?.match(/url\(['"]?([^'")\s]+)/);
      if (bgMatch?.[1] && /\.(jpe?g|png|webp)/i.test(bgMatch[1])) {
        try { imageUrls.add(new URL(bgMatch[1], url).href); } catch {}
      }
    });

    // ── Periods ──
    const periods: TourPeriod[] = [];
    // Look for date patterns: "X - Y เดือน ปี" or structured date rows
    const dateMatches = bodyText.matchAll(
      /(\d{1,2})\s*[-–]\s*(\d{1,2})\s*(ม\.?ค|ก\.?พ|มี\.?ค|เม\.?ย|พ\.?ค|มิ\.?ย|ก\.?ค|ส\.?ค|ก\.?ย|ต\.?ค|พ\.?ย|ธ\.?ค)\.?\s*(\d{2,4})/g
    );
    for (const m of dateMatches) {
      periods.push({ rawText: m[0] });
    }
    // Also try "ช่วงเดือน : XXX" pattern
    if (periods.length === 0) {
      const periodText = bodyText.match(/ช่วงเดือน\s*:\s*([^\n\r]+)/)?.[1]?.trim();
      if (periodText) {
        periods.push({ rawText: periodText });
      }
    }

    return {
      tourCode,
      sourceUrl: url,
      title,
      country,
      city,
      duration,
      priceFrom,
      airline,
      description,
      itineraryHtml: '',
      pdfUrl,
      imageUrls: [...imageUrls].slice(0, 15),
      periods,
      deposit,
      hotelRating,
      highlights: highlights.slice(0, 10),
    };
  }

  async cleanup(): Promise<void> {
    await this.browser?.close();
    this.browser = undefined;
  }
}
