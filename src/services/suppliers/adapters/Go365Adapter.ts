import { SupplierAdapter, RawTour, RawTourDetail, RawDeparture, TourPrices, BookingPayload, BookingResult } from '../core/SupplierAdapter';

/**
 * Go365 Adapter — uses KaiKong API (api.kaikongservice.com)
 * 
 * API Endpoints:
 *   POST /tours/search (body: {start_page, limit_page})  → tour list (POST required!)
 *   GET  /tours/detail/:tour_id                           → tour detail
 *   GET  /tours/period/:tour_id                           → departure periods
 *   GET  /tours/country                                   → country list
 * 
 * IMPORTANT: GET /tours/search ignores pagination, always returns first 20 results.
 *            Must use POST with JSON body for pagination to work.
 *            start_page is 1-based (page 0 duplicates page 1).
 * 
 * Auth: x-api-key header
 */
export class Go365Adapter implements SupplierAdapter {
  readonly supplierId = 'SUP_GO365';
  
  private get baseUrl(): string {
    return process.env.GO365_API_BASE || 'https://api.kaikongservice.com/api/v1';
  }
  
  private get apiKey(): string {
    const key = process.env.GO365_API_KEY;
    if (!key) throw new Error('[Go365Adapter] Missing GO365_API_KEY environment variable');
    return key;
  }

  /** GET request for detail/period endpoints */
  private async fetchApi(endpoint: string, retries = 3): Promise<any> {
    let attempt = 0;
    while (attempt <= retries) {
      try {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
          method: 'GET',
          headers: { 'x-api-key': this.apiKey },
          cache: 'no-store',
        });

        if (response.status === 429 && attempt < retries) {
          attempt++;
          const delay = Math.pow(2, attempt) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }

        if (!response.ok) throw new Error(`KaiKong API status: ${response.status}`);
        const data = await response.json();
        if (data.status === false) throw new Error(`KaiKong API: ${data.error || 'Unknown'}`);
        return data;
      } catch (error: any) {
        if (attempt < retries && error.message?.includes('fetch failed')) {
          attempt++;
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
          continue;
        }
        throw error;
      }
    }
  }

  /** POST search — required for pagination to work */
  private async searchApi(page: number, limit: number): Promise<any> {
    const response = await fetch(`${this.baseUrl}/tours/search`, {
      method: 'POST',
      headers: {
        'x-api-key': this.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ start_page: page, limit_page: limit }),
      cache: 'no-store',
    });
    if (!response.ok) throw new Error(`KaiKong search status: ${response.status}`);
    const data = await response.json();
    if (data.status === false) throw new Error(`KaiKong search: ${data.error || 'Unknown'}`);
    return data;
  }

  /**
   * Fetch all tours via paginated POST /tours/search
   * Uses 1-based pagination with dedup to handle API wrapping
   */
  async getTours(): Promise<RawTour[]> {
    const PAGE_SIZE = 50;
    const seenIds = new Set<string>();
    const allTours: RawTour[] = [];

    // First POST request to get total count + first page
    const firstPage = await this.searchApi(1, PAGE_SIZE);
    const totalCount = firstPage.count || 0;
    const totalPages = Math.ceil(totalCount / PAGE_SIZE);
    console.log(`[Go365Adapter] Total tours: ${totalCount}, Pages: ${totalPages}`);

    // Add first page
    for (const t of (firstPage.data || [])) {
      const id = String(t.tour_id);
      if (!seenIds.has(id)) {
        seenIds.add(id);
        allTours.push({ externalId: id, name: t.tour_name || '', payload: t });
      }
    }

    // Fetch remaining pages (1-based, start from 2)
    for (let page = 2; page <= totalPages + 1; page++) {
      try {
        const pageData = await this.searchApi(page, PAGE_SIZE);
        let newCount = 0;
        for (const t of (pageData.data || [])) {
          const id = String(t.tour_id);
          if (!seenIds.has(id)) {
            seenIds.add(id);
            allTours.push({ externalId: id, name: t.tour_name || '', payload: t });
            newCount++;
          }
        }
        console.log(`[Go365Adapter] Page ${page}: ${newCount} new, total: ${allTours.length}`);
        if (newCount === 0) break; // API wraps around
        await new Promise(r => setTimeout(r, 200));
      } catch (error) {
        console.error(`[Go365Adapter] Error page ${page}:`, error);
        break;
      }
    }

    console.log(`[Go365Adapter] Fetched ${allTours.length} unique tours`);
    return allTours;
  }

  /**
   * Fetch tour detail with full information (description, images, flights, etc.)
   */
  async getTourDetail(externalTourId: string): Promise<RawTourDetail> {
    const result = await this.fetchApi(`/tours/detail/${externalTourId}`);
    const detail = result.data?.[0] || result.data || {};
    
    // Extract images from cover + file banner
    const images: string[] = [];
    if (detail.tour_cover_image) images.push(detail.tour_cover_image);
    if (detail.tour_file?.file_banner) images.push(detail.tour_file.file_banner);

    return {
      externalId: String(detail.tour_id || externalTourId),
      name: detail.tour_name || '',
      payload: detail,
      itinerary: [],  // KaiKong doesn't provide structured itinerary
      images,
    };
  }

  /**
   * Fetch departure periods for a tour with prices, seats, flights
   */
  async getDepartures(externalTourId: string): Promise<RawDeparture[]> {
    const result = await this.fetchApi(`/tours/period/${externalTourId}`);
    const periods = result.data || [];

    return periods.map((p: any) => ({
      externalId: String(p.period_id),
      tourExternalId: externalTourId,
      startDate: p.period_date || '',
      endDate: p.period_back || '',
      price: p.period_price_start || p.period_price_min || 0,
      availableSeats: p.period_available || 0,
      totalSeats: p.period_total || p.period_quota || 0,
      status: p.period_visible === 2 ? 'available' : 'closed',
      payload: p,
    }));
  }

  async getAvailability(externalTourId: string, departureExternalId: string): Promise<number> {
    const deps = await this.getDepartures(externalTourId);
    const dep = deps.find(d => d.externalId === departureExternalId);
    return dep?.availableSeats || 0;
  }

  async getPrices(externalTourId: string, departureExternalId: string): Promise<TourPrices> {
    const deps = await this.getDepartures(externalTourId);
    const dep = deps.find(d => d.externalId === departureExternalId);
    return { adult: dep?.price || 0, netPrice: dep?.price || 0 };
  }

  async createBooking(payload: BookingPayload): Promise<BookingResult> {
    // Go365 booking is handled externally via their website
    return {
      externalBookingId: `BK_GO365_${Date.now()}`,
      status: 'pending'
    };
  }

  async getBookingStatus(externalBookingId: string): Promise<string> {
    return 'pending';
  }

  async cancelBooking(externalBookingId: string): Promise<boolean> {
    return true;
  }
}
