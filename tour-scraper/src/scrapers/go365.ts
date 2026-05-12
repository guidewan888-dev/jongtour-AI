// ─── Go365 API-based Scraper (KaiKong API) ───────
// Unlike other scrapers, Go365 uses a REST API instead of HTML scraping.
// Base URL: https://api.kaikongservice.com/api/v1
// Auth: x-api-key header
// Endpoints:
//   POST /tours/search → paginated tour list (POST required for pagination!)
//   GET /tours/detail/:id → tour detail
//   GET /tours/period/:id → departure periods with prices
//
// IMPORTANT: GET /tours/search ignores pagination and always returns first 20.
//            Must use POST with {start_page, limit_page} body.
//            start_page is 1-based (page 0 duplicates page 1).

import { chromium, type Browser } from 'playwright';
import { BaseScraper } from './base.js';
import type { TourData, TourPeriod } from '../types.js';

// ── Country mapping from Go365 English names to Thai ──
const COUNTRY_TH: Record<string, string> = {
  'Japan': 'ญี่ปุ่น', 'China': 'จีน', 'Taiwan': 'ไต้หวัน', 'Hong Kong': 'ฮ่องกง',
  'Vietnam': 'เวียดนาม', 'India': 'อินเดีย', 'South Korea': 'เกาหลี',
  'Singapore': 'สิงคโปร์', 'Malaysia': 'มาเลเซีย', 'Philippines': 'ฟิลิปปินส์',
  'Cambodia': 'กัมพูชา', 'Myanmar': 'พม่า', 'Laos': 'ลาว',
  'Italy': 'อิตาลี', 'France': 'ฝรั่งเศส', 'Germany': 'เยอรมนี',
  'Switzerland': 'สวิตเซอร์แลนด์', 'Austria': 'ออสเตรีย', 'Spain': 'สเปน',
  'England': 'อังกฤษ', 'Netherlands': 'เนเธอร์แลนด์', 'Belgium': 'เบลเยียม',
  'Czech Republic': 'เช็ก', 'Hungary': 'ฮังการี', 'Portugal': 'โปรตุเกส',
  'Norway': 'นอร์เวย์', 'Sweden': 'สวีเดน', 'Finland': 'ฟินแลนด์',
  'Denmark': 'เดนมาร์ก', 'Scotland': 'สกอตแลนด์', 'Luxembourg': 'ลักเซมเบิร์ก',
  'Liechtenstein': 'ลิกเตนสไตน์', 'Slovakia': 'สโลวาเกีย', 'Estonia': 'เอสโตเนีย',
  'Latvia': 'ลัตเวีย', 'Lithuania': 'ลิทัวเนีย', 'Scandinavia': 'สแกนดิเนเวีย',
  'Baltic': 'บอลติก', 'Europe': 'ยุโรป', 'Asia': 'เอเชีย',
  'Turkiye': 'ตุรกี', 'Turkey': 'ตุรกี', 'Georgia': 'จอร์เจีย',
  'Australia': 'ออสเตรเลีย', 'New Zealand': 'นิวซีแลนด์', 'Africa': 'แอฟริกา',
  'Thailand': 'ไทย',
};

function extractDepositFromText(text: string, priceFrom = 0): number | undefined {
  const clean = String(text || '');
  if (!clean) return undefined;

  const amountPatterns = [
    /(?:?????|????????|?????????|deposit(?:\s*amount)?|down\s*payment)\s*(?:???????|??????|????|??|????????)?\s*[:\-??]?\s*(?:?|???)?\s*([\d,]{3,7})/i,
    /([\d,]{3,7})\s*(?:???|?)\s*(?:???????|??????|????|??)?\s*(?:?????|deposit|down\s*payment)/i,
  ];

  for (const pattern of amountPatterns) {
    const match = clean.match(pattern);
    if (!match?.[1]) continue;
    const parsed = Number(match[1].replace(/[^\d]/g, ''));
    if (Number.isFinite(parsed) && parsed >= 500 && parsed <= 300000) {
      return Math.round(parsed);
    }
  }

  const percentMatch = clean.match(/(?:?????|deposit|down\s*payment)[^%\n]{0,40}?(\d{1,2})\s*%/i);
  if (percentMatch && priceFrom > 0) {
    const percent = Number(percentMatch[1]);
    if (Number.isFinite(percent) && percent > 0 && percent <= 100) {
      const fromPercent = Math.round((priceFrom * percent) / 100);
      if (fromPercent >= 500 && fromPercent <= 300000) return fromPercent;
    }
  }

  return undefined;
}

export class Go365Scraper extends BaseScraper {
  private apiKey: string;
  private apiBase: string;
  private browser?: Browser;

  constructor(cfg: any) {
    super(cfg);
    this.apiKey = process.env.GO365_API_KEY || cfg.apiKey || '';
    this.apiBase = process.env.GO365_API_BASE || 'https://api.kaikongservice.com/api/v1';
  }

  /** GET request for detail/period endpoints */
  private async fetchApi(endpoint: string): Promise<any> {
    const url = `${this.apiBase}${endpoint}`;
    console.log(`[go365] GET: ${url}`);
    const res = await fetch(url, {
      headers: { 'x-api-key': this.apiKey },
      signal: AbortSignal.timeout(30_000),
    });
    if (!res.ok) throw new Error(`Go365 API ${res.status}`);
    const data = await res.json();
    if (data.status === false) throw new Error(`Go365 API: ${data.error}`);
    return data;
  }

  /** POST search — required for pagination to work */
  private async searchTours(page: number, limit: number): Promise<any> {
    const url = `${this.apiBase}/tours/search`;
    console.log(`[go365] POST search page=${page} limit=${limit}`);
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'x-api-key': this.apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ start_page: page, limit_page: limit }),
      signal: AbortSignal.timeout(30_000),
    });
    if (!res.ok) throw new Error(`Go365 search ${res.status}`);
    const data = await res.json();
    if (data.status === false) throw new Error(`Go365 search: ${data.error}`);
    return data;
  }

  /**
   * Discover all available tour IDs via paginated POST search
   * Uses 1-based pagination with dedup to handle API wrapping
   */
  async discoverUrls(): Promise<string[]> {
    const PAGE_SIZE = 50;
    const seenIds = new Set<string>();
    const tourIds: string[] = [];
    
    // Get total count via first POST request
    const first = await this.searchTours(1, PAGE_SIZE);
    const total = first.count || 0;
    const totalPages = Math.ceil(total / PAGE_SIZE);
    console.log(`[go365] Total tours: ${total}, Pages: ${totalPages}`);

    // Add first page results
    for (const t of (first.data || [])) {
      const id = String(t.tour_id);
      if (!seenIds.has(id)) {
        seenIds.add(id);
        tourIds.push(id);
      }
    }

    // Fetch remaining pages (1-based, start from 2)
    for (let page = 2; page <= totalPages + 1; page++) {
      try {
        await this.sleep(300);
        const data = await this.searchTours(page, PAGE_SIZE);
        let newCount = 0;
        for (const t of (data.data || [])) {
          const id = String(t.tour_id);
          if (!seenIds.has(id)) {
            seenIds.add(id);
            tourIds.push(id);
            newCount++;
          }
        }
        console.log(`[go365] Page ${page}: ${newCount} new, total: ${tourIds.length}`);
        // Stop if no new tours (API wraps around)
        if (newCount === 0) break;
      } catch (e) {
        console.error(`[go365] Error page ${page}:`, (e as Error).message);
      }
    }

    console.log(`[go365] Discovered ${tourIds.length} unique tours`);
    return tourIds;
  }

  /**
   * Extract PDF URL from Go365 website using Playwright (SPA requires JS execution)
   * Go365 hosts PDFs on files.file4load.com and loadfileall.com
   */
  private async scrapePdfFromWebsite(tourId: string, tourCode: string): Promise<string> {
    try {
      if (!this.browser) {
        this.browser = await chromium.launch({ headless: true });
      }
      const ctx = await this.browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      });
      const page = await ctx.newPage();
      
      const webUrl = `https://www.go365travel.com/tour-detail/${tourId}/${encodeURIComponent(tourCode)}`;
      await page.goto(webUrl, { waitUntil: 'networkidle', timeout: 20_000 });
      await page.waitForTimeout(3000); // Wait for SPA to render

      // Extract PDF link from rendered DOM
      const pdfUrl = await page.evaluate(() => {
        const links = [...document.querySelectorAll('a')];
        // Priority 1: file4load.com direct download
        const file4load = links.find(a => a.href.includes('file4load.com'));
        if (file4load) return file4load.href;
        // Priority 2: loadfileall.com share link
        const loadfile = links.find(a => a.href.includes('loadfileall.com'));
        if (loadfile) return loadfile.href;
        // Priority 3: any .pdf link
        const pdfLink = links.find(a => /\.pdf$/i.test(a.href));
        if (pdfLink) return pdfLink.href;
        return '';
      });

      await ctx.close();
      
      if (pdfUrl) {
        console.log(`[go365] ✅ Found PDF from website: ${pdfUrl.substring(0, 80)}`);
      }
      return pdfUrl;
    } catch (e) {
      console.warn(`[go365] Could not scrape website for PDF: ${(e as Error).message}`);
      return '';
    }
  }

  async cleanup(): Promise<void> {
    await this.browser?.close();
    this.browser = undefined;
  }

  /**
   * Fetch full tour data from API (detail + period)
   * The "url" parameter is actually the tour_id
   */
  async scrapeTour(tourId: string): Promise<TourData> {
    await this.sleep(300);

    // 1. Get detail
    const detailRes = await this.fetchApi(`/tours/detail/${tourId}`);
    const detail = detailRes.data?.[0] || detailRes.data || {};

    // 2. Get periods
    let periodData: any[] = [];
    try {
      const periodRes = await this.fetchApi(`/tours/period/${tourId}`);
      periodData = periodRes.data || [];
    } catch (e) {
      console.warn(`[go365] No periods for tour ${tourId}`);
    }

    // ── Map to TourData ──
    const tourCode = detail.tour_code || `GO365-${tourId}`;
    const title = detail.tour_name || '';
    
    // Country from tour_country array
    const countries = detail.tour_country || [];
    const primaryCountry = countries[0];
    const countryNameEn = primaryCountry?.country_name_en || '';
    const countryNameTh = primaryCountry?.country_name_th || COUNTRY_TH[countryNameEn] || countryNameEn;

    // City
    const cities = detail.tour_city || [];
    const cityName = cities.map((c: any) => c.city_name_th || c.city_name_en || '').join(', ');

    // Duration from tour_name: "7D 4N", "5D4N", "8 วัน 5 คืน"
    const durEn = title.match(/(\d+)\s*D\s*(\d+)\s*N/i);
    const durTh = title.match(/(\d+)\s*วัน\s*(\d+)\s*คืน/);
    const durationDays = durEn ? parseInt(durEn[1]) : (durTh ? parseInt(durTh[1]) : 0);
    const durationNights = durEn ? parseInt(durEn[2]) : (durTh ? parseInt(durTh[2]) : 0);
    const duration = durationDays > 0 ? `${durationDays} วัน ${durationNights} คืน` : '';

    // Airline from detail
    const airlineName = detail.tour_flight?.[0]?.flight_airline_name || '';
    const airlineIata = detail.tour_flight?.[0]?.flight_airline_iata || '';
    const airline = airlineName || airlineIata || '';

    // Description
    const description = detail.tour_description || '';

    // Highlights from description
    const highlights: string[] = [];
    if (description) {
      const lines = description.split('\n').map((l: string) => l.trim()).filter((l: string) => l.length > 5);
      highlights.push(...lines.slice(0, 10));
    }

    // Images
    const imageUrls: string[] = [];
    if (detail.tour_cover_image) imageUrls.push(detail.tour_cover_image);
    if (detail.tour_file?.file_banner) imageUrls.push(detail.tour_file.file_banner);

    // PDF — try API first, then scrape website with Playwright for PDF link
    let pdfUrl = detail.tour_file?.file_pdf || detail.tour_file?.file_word || '';
    
    // Fallback: use Playwright to scrape the Go365 SPA for PDF download link
    // Go365 is an Angular SPA — PDF links (file4load.com / loadfileall.com) only appear after JS execution
    if (!pdfUrl) {
      pdfUrl = await this.scrapePdfFromWebsite(tourId, tourCode);
    }

    // Source URL (Go365 website)
    const sourceUrl = `https://www.go365travel.com/tour-detail/${tourId}/${encodeURIComponent(tourCode)}`;
    // Deposit ? prefer explicit value from text, fallback to heuristic by price bucket
    const prices = periodData.map((p: any) => p.period_price_start || p.period_price_min || 0).filter((p: number) => p > 0);
    const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
    let deposit: number | undefined = extractDepositFromText(description, minPrice);
    if (!deposit && minPrice > 0) {
      if (minPrice < 20000) deposit = 5000;
      else if (minPrice < 50000) deposit = 10000;
      else if (minPrice < 100000) deposit = 15000;
      else deposit = 20000;
    }

    // Periods
    const periods: TourPeriod[] = periodData.map((p: any) => {
      const seats = p.period_total || p.period_quota || 0;
      const available = p.period_available || 0;
      const isBookable = p.period_visible === 2;
      
      return {
        startDate: p.period_date || undefined,
        endDate: p.period_back || undefined,
        price: p.period_price_start || p.period_price_min || undefined,
        seatsLeft: available > 0 ? available : (isBookable ? undefined : 0),
        status: isBookable ? 'open' : 'closed',
        rawText: `${p.period_date || ''} - ${p.period_back || ''} | ${p.period_price_start || 0}฿`,
      };
    });

    return {
      tourCode,
      sourceUrl,
      title,
      country: countryNameTh,
      city: cityName,
      duration,
      priceFrom: minPrice || undefined,
      airline,
      description: description.substring(0, 2000),
      pdfUrl,
      imageUrls,
      periods,
      deposit,
      hotelRating: undefined,
      highlights: highlights.slice(0, 10),
    };
  }
}
