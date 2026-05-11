// ─── Go365 API-based Scraper (KaiKong API) ───────
// Unlike other scrapers, Go365 uses a REST API instead of HTML scraping.
// Base URL: https://api.kaikongservice.com/api/v1
// Auth: x-api-key header
// Endpoints:
//   GET /tours/search → paginated tour list
//   GET /tours/detail/:id → tour detail
//   GET /tours/period/:id → departure periods with prices

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

export class Go365Scraper extends BaseScraper {
  private apiKey: string;
  private apiBase: string;

  constructor(cfg: any) {
    super(cfg);
    this.apiKey = process.env.GO365_API_KEY || cfg.apiKey || '';
    this.apiBase = process.env.GO365_API_BASE || 'https://api.kaikongservice.com/api/v1';
  }

  private async fetchApi(endpoint: string): Promise<any> {
    const url = `${this.apiBase}${endpoint}`;
    console.log(`[go365] API: ${url}`);
    const res = await fetch(url, {
      headers: { 'x-api-key': this.apiKey, 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(30_000),
    });
    if (!res.ok) throw new Error(`Go365 API ${res.status}`);
    const data = await res.json();
    if (data.status === false) throw new Error(`Go365 API: ${data.error}`);
    return data;
  }

  /**
   * Discover all available tour IDs via paginated search
   */
  async discoverUrls(): Promise<string[]> {
    const PAGE_SIZE = 50;
    const tourIds: string[] = [];
    
    // Get total count
    const first = await this.fetchApi(`/tours/search?start_page=0&limit_page=1`);
    const total = first.count || 0;
    console.log(`[go365] Total tours: ${total}`);

    // Paginate
    for (let page = 0; page < total; page += PAGE_SIZE) {
      try {
        await this.sleep(500);
        const data = await this.fetchApi(`/tours/search?start_page=${page}&limit_page=${PAGE_SIZE}`);
        (data.data || []).forEach((t: any) => {
          tourIds.push(String(t.tour_id));
        });
        console.log(`[go365] Page ${page}/${total}: ${tourIds.length} tours`);
      } catch (e) {
        console.error(`[go365] Error page ${page}:`, (e as Error).message);
      }
    }

    return tourIds;
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

    // Duration from tour_name: "7D 4N", "5D4N"
    const durMatch = title.match(/(\d+)\s*D\s*(\d+)\s*N/i);
    const durationDays = durMatch ? parseInt(durMatch[1]) : 0;
    const durationNights = durMatch ? parseInt(durMatch[2]) : 0;
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

    // PDF
    const pdfUrl = detail.tour_file?.file_pdf || '';

    // Source URL (Go365 website)
    const sourceUrl = `https://www.go365travel.com/tour-detail/${tourId}/${encodeURIComponent(tourCode)}`;

    // Deposit — calculate from first period price
    const prices = periodData.map((p: any) => p.period_price_start || p.period_price_min || 0).filter((p: number) => p > 0);
    const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
    let deposit: number | undefined;
    if (minPrice > 0) {
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
