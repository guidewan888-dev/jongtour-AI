import { SupplierAdapter, RawTour, RawTourDetail, RawDeparture, TourPrices, BookingPayload, BookingResult } from '../core/SupplierAdapter';

export class CheckinAdapter implements SupplierAdapter {
  readonly supplierId = 'SUP_CHECKIN'; // Match this in database
  private baseUrl = 'https://api.checkingroup.co.th/v1';

  // Mocking internal fetch with credential handling
  private async fetchApi(endpoint: string, options: any = {}) {
    console.log(`[CheckinAdapter] Calling API: ${this.baseUrl}${endpoint}`);
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers
      },
      cache: 'no-store',
      ...options
    });
    
    if (!response.ok) {
      throw new Error(`CheckIn API returned status: ${response.status}`);
    }
    
    return await response.json();
  }

  async getTours(): Promise<RawTour[]> {
    const rawData = await this.fetchApi('/programtours');
    const toursData = Array.isArray(rawData) ? rawData : (rawData.data || []);
    
    return toursData.map((t: any) => ({
      externalId: t.id.toString(),
      name: t.name,
      payload: t
    }));
  }

  async getTourDetail(externalTourId: string): Promise<RawTourDetail> {
    await this.fetchApi(`/products/${externalTourId}`);
    return {
      externalId: externalTourId,
      name: "Detail Mock Checkin",
      payload: {},
      itinerary: [],
      images: []
    };
  }

  async getDepartures(externalTourId: string): Promise<RawDeparture[]> {
    await this.fetchApi(`/products/${externalTourId}/schedule`);
    return [
      {
        externalId: `SCH_${externalTourId}_X`,
        tourExternalId: externalTourId,
        startDate: "2026-10-10T00:00:00Z",
        endDate: "2026-10-13T00:00:00Z",
        price: 12900,
        availableSeats: 20,
        totalSeats: 35,
        status: 'available',
        payload: { wholesale_net: 11500 }
      }
    ];
  }

  async getAvailability(externalTourId: string, departureExternalId: string): Promise<number> {
    return 20;
  }

  async getPrices(externalTourId: string, departureExternalId: string): Promise<TourPrices> {
    return { adult: 12900, netPrice: 11500 };
  }

  async createBooking(payload: BookingPayload): Promise<BookingResult> {
    return { externalBookingId: `BK_CHK_${Date.now()}`, status: 'confirmed' };
  }

  async getBookingStatus(externalBookingId: string): Promise<string> {
    return 'confirmed';
  }

  async cancelBooking(externalBookingId: string): Promise<boolean> {
    return true;
  }
}
