import { SupplierAdapter, RawTour, RawTourDetail, RawDeparture, TourPrices, BookingPayload, BookingResult } from '../core/SupplierAdapter';

/**
 * Go365 Adapter — uses KaiKong API (api.kaikongservice.com)
 * 
 * API Endpoints:
 *   GET /tours/search?start_page=0&limit_page=50  → tour list
 *   GET /tours/detail/:tour_id                     → tour detail
 *   GET /tours/period/:tour_id                     → departure periods
 *   GET /tours/country                             → country list
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

  private async fetchApi(endpoint: string, retries = 3): Promise<any> {
    let attempt = 0;
    while (attempt <= retries) {
      console.log(`[Go365Adapter] GET ${this.baseUrl}${endpoint} (Attempt ${attempt + 1})`);
      try {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
          method: 'GET',
          headers: {
            'x-api-key': this.apiKey,
            'Content-Type': 'application/json',
          },
          cache: 'no-store',
        });

        if (response.status === 429 && attempt < retries) {
          attempt++;
          const delay = Math.pow(2, attempt) * 1000;
          console.warn(`[Go365Adapter] Rate limited (429). Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }

        if (!response.ok) {
          throw new Error(`KaiKong API returned status: ${response.status}`);
        }

        const data = await response.json();
        if (data.status === false) {
          throw new Error(`KaiKong API error: ${data.error || 'Unknown error'}`);
        }
        return data;
      } catch (error: any) {
        if (attempt < retries && error.message?.includes('fetch failed')) {
          attempt++;
          const delay = Math.pow(2, attempt) * 1000;
          console.warn(`[Go365Adapter] Network error. Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        throw error;
      }
    }
  }

  /**
   * Fetch all tours via paginated /tours/search endpoint
   * Returns RawTour[] with KaiKong tour data as payload
   */
  async getTours(): Promise<RawTour[]> {
    const PAGE_SIZE = 50;
    let startPage = 0;
    let allTours: RawTour[] = [];
    let totalCount = 0;

    // First request to get total count
    const firstPage = await this.fetchApi(`/tours/search?start_page=0&limit_page=${PAGE_SIZE}`);
    totalCount = firstPage.count || 0;
    const firstData = firstPage.data || [];

    console.log(`[Go365Adapter] Total tours available: ${totalCount}`);

    allTours = firstData.map((t: any) => ({
      externalId: String(t.tour_id),
      name: t.tour_name || '',
      payload: t,
    }));

    // Paginate through remaining pages
    startPage = PAGE_SIZE;
    while (startPage < totalCount) {
      try {
        const pageData = await this.fetchApi(`/tours/search?start_page=${startPage}&limit_page=${PAGE_SIZE}`);
        const tours = (pageData.data || []).map((t: any) => ({
          externalId: String(t.tour_id),
          name: t.tour_name || '',
          payload: t,
        }));
        allTours.push(...tours);
        startPage += PAGE_SIZE;
        // Rate limit protection
        await new Promise(r => setTimeout(r, 300));
      } catch (error) {
        console.error(`[Go365Adapter] Error fetching page ${startPage}:`, error);
        break;
      }
    }

    console.log(`[Go365Adapter] Fetched ${allTours.length} tours total`);
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
