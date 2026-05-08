// ─── OneWorldTour Scraper (WordPress) ───────
// Phase 1: Discover tour URLs by crawling landing pages
// Phase 2: Scrape individual /tour/owttXXXXXX/ pages

import * as cheerio from 'cheerio';
import { BaseScraper } from './base.js';
import { discoverUrls } from '../core/sitemap.js';
import type { TourData, TourPeriod } from '../types.js';

// ── Airline code mapping ──
const AIRLINE_MAP: Record<string, string> = {
  'TG': 'Thai Airways', 'QR': 'Qatar Airways', 'EK': 'Emirates',
  'SQ': 'Singapore Airlines', 'CX': 'Cathay Pacific', 'TK': 'Turkish Airlines',
  'SV': 'Saudia', 'OZ': 'Asiana Airlines', 'BR': 'EVA Air',
  'CI': 'China Airlines', 'MH': 'Malaysia Airlines', 'WY': 'Oman Air',
  'AZ': 'ITA Airways', 'LH': 'Lufthansa', 'AF': 'Air France',
  'BA': 'British Airways', 'KL': 'KLM', 'NH': 'ANA', 'JL': 'Japan Airlines',
  'KE': 'Korean Air', 'CZ': 'China Southern', 'MU': 'China Eastern',
  'ET': 'Ethiopian Airlines', 'MS': 'EgyptAir', 'AI': 'Air India',
  'GA': 'Garuda Indonesia', 'VN': 'Vietnam Airlines', 'UL': 'SriLankan Airlines',
  'FD': 'Thai AirAsia', 'VZ': 'Thai Vietjet', 'WE': 'Thai Smile',
  'PG': 'Bangkok Airways', 'RJ': 'Royal Jordanian', 'GF': 'Gulf Air',
};

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
    const maxLandingPages = 200; // Crawl ALL landing pages

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
    const bodyText = $('body').text();

    // ── Extract tour code from URL: /tour/owtt210079/ ──
    const tourCode = (url.match(/\/tour\/([a-z0-9]+)/i)?.[1] ?? '').toUpperCase();

    // ── Title (from page title or h1) ──
    const rawTitle = $('title').text().trim();
    const title = rawTitle.replace(/\s*[-–|].*One\s*World.*$/i, '').trim()
      || $('h1').first().text().trim();

    // ── Duration — parse "X วัน" from title (most reliable) ──
    // Titles like "5 วัน (Free Day) (TG)" or "10 วัน (TG)" or "11 วัน 8 คืน (QR)"
    const durMatchFull = title.match(/(\d+)\s*วัน\s*(\d+)\s*คืน/);
    const durMatchDaysOnly = title.match(/(\d+)\s*วัน/);
    const durationDays = durMatchFull ? parseInt(durMatchFull[1]) 
      : durMatchDaysOnly ? parseInt(durMatchDaysOnly[1]) : 0;
    const durationNights = durMatchFull ? parseInt(durMatchFull[2])
      : (durationDays > 0 ? Math.max(0, durationDays - 2) : 0);
    const duration = durationDays > 0 ? `${durationDays} วัน ${durationNights} คืน` : '';

    // ── Airline — parse "(TG)", "(QR)", "(LH/OS)" etc from title ──
    const airlineCodeMatch = title.match(/\(([A-Z]{2}(?:\/[A-Z]{2})*)\)/);
    const airlineCode = airlineCodeMatch?.[1]?.split('/')[0] || '';
    const airline = AIRLINE_MAP[airlineCode] || airlineCode;

    // ── Country — from breadcrumb links ──
    // Breadcrumb order: หน้าแรก > ทัวร์ต่างประเทศ > ทัวร์สวิตเซอร์แลนด์ > [tour title]
    // We want the one BEFORE the last (which is the country page)
    const breadcrumbLinks = $('a[href*="/intertours/"]')
      .map((_, el) => ({
        text: $(el).text().trim(),
        href: $(el).attr('href') || '',
      }))
      .get()
      .filter(b => b.text.length > 1 && !/ต่างประเทศ|หน้าแรก|Home/i.test(b.text));
    // Get the LAST link (closest to the tour = country page)
    const lastBreadcrumb = breadcrumbLinks[breadcrumbLinks.length - 1];
    const country = lastBreadcrumb 
      ? lastBreadcrumb.text.replace(/^ทัวร์/, '').trim() 
      : '';

    // ── Price — look for "เริ่มเพียง XX,XXX" or large number patterns ──
    let priceFrom: number | undefined;
    const pricePatterns = [
      /(?:เริ่ม(?:ต้น|เพียง)?)\s*[^\d]*([\d,]+)\s*(?:บ\.?|฿)?/,
      /ราคา\s*[^\d]*([\d,]+)\s*(?:บ\.?|฿)?/,
    ];
    for (const pat of pricePatterns) {
      const m = bodyText.match(pat);
      if (m) {
        const parsed = parseInt(m[1].replace(/,/g, ''), 10);
        if (parsed > 1000) { priceFrom = parsed; break; }
      }
    }

    // ── Hotel Rating — "X ดาว" ──
    const starMatch = bodyText.match(/(\d)\s*ดาว/);
    const hotelRating = starMatch ? parseInt(starMatch[1]) : undefined;

    // ── Highlights — bullet points with "–" or "—" separators ──
    const highlights: string[] = [];
    $('li, .wpb_text_column p, .entry-content p').each((_, el) => {
      const text = $(el).text().trim();
      if (text.length > 30 && text.length < 500 && /[–—\-]/.test(text)) {
        highlights.push(text);
      }
    });

    // ── Description from highlights or meta ──
    const description = highlights.slice(0, 3).join(' | ')
      || $('meta[name="description"]').attr('content') || '';

    // ── Full itinerary HTML ──
    const itineraryEl = $('article, .entry-content, .tour-content, .wpb_wrapper').first();
    const itineraryHtml = itineraryEl.html()?.slice(0, 50_000) ?? '';

    // ── PDF link (weon.website pattern) ──
    const pdfUrl = $('a[href*="pdf.weon.website"], a[href$=".pdf"]').first().attr('href') || '';

    // ── Deposit — look for "มัดจำ XX,XXX" ──
    const depositMatch = bodyText.match(/มัดจำ\s*[^\d]*([\d,]+)/);
    const deposit = depositMatch ? parseInt(depositMatch[1].replace(/,/g, ''), 10) : undefined;

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

    // ── Periods (departure dates table) ──
    const periods = this.parsePeriods($, bodyText);
    // Fallback price from periods
    if (!priceFrom && periods.length > 0) {
      const validPrices = periods.map(p => p.price).filter((p): p is number => !!p && p > 1000);
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
      imageUrls: [...imageUrls].slice(0, 20),
      periods,
      deposit,
      hotelRating,
      highlights: highlights.slice(0, 10),
    };
  }

  private parsePeriods($: cheerio.CheerioAPI, bodyText: string): TourPeriod[] {
    const periods: TourPeriod[] = [];

    // Look for date + price patterns in table rows
    $('table tr, .period-row, [class*=departure]').each((_, row) => {
      const cells = $(row).find('td, span, div').map((_, c) => $(c).text().trim()).get();
      if (cells.length >= 2) {
        // Try to extract price from cells (look for numbers > 1000)
        const priceCell = cells.find(c => {
          const num = parseInt(c.replace(/[,\s]/g, ''), 10);
          return num > 1000;
        });
        const price = priceCell ? parseInt(priceCell.replace(/[,\s]/g, ''), 10) : undefined;

        // Try to extract seats from "Group Size" column
        const seatsCell = cells.find(c => /^\d{1,3}$/.test(c.trim()));
        const seatsLeft = seatsCell ? parseInt(seatsCell) : undefined;

        periods.push({
          rawText: cells.join(' | '),
          price,
          seatsLeft,
          status: cells.find(c => /เปิด|ว่าง|open|available/i.test(c)) ? 'open' : 'open',
        });
      }
    });

    // Fallback: look for date patterns in body text
    if (periods.length === 0) {
      const dateMatches = bodyText.matchAll(
        /(\d{1,2})\s*[-–]\s*(\d{1,2})\s*(ม\.?ค|ก\.?พ|มี\.?ค|เม\.?ย|พ\.?ค|มิ\.?ย|ก\.?ค|ส\.?ค|ก\.?ย|ต\.?ค|พ\.?ย|ธ\.?ค)\.?\s*(\d{2,4})/g
      );
      for (const m of dateMatches) {
        periods.push({ rawText: m[0] });
      }
    }

    return periods;
  }
}
