import { SupplierAdapter, RawTour, RawTourDetail, RawDeparture, TourPrices, BookingPayload, BookingResult } from '../core/SupplierAdapter';

export class TourFactoryAdapter implements SupplierAdapter {
  readonly supplierId = 'SUP_TOURFACTORY'; // Match this in database
  private baseUrl = 'https://api.tourfactory.co.th/v1';

  // Mocking internal fetch with credential handling
  private async fetchApi(endpoint: string, options: any = {}) {
    console.log(`[TourFactoryAdapter] Calling API: ${this.baseUrl}${endpoint}`);
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
      throw new Error(`TourFactory API returned status: ${response.status}`);
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
    await this.fetchApi(`/tours/${externalTourId}`);
    return {
      externalId: externalTourId,
      name: "Detail Mock TourFactory",
      payload: {},
      itinerary: [],
      images: []
    };
  }

  async getDepartures(externalTourId: string): Promise<RawDeparture[]> {
    await this.fetchApi(`/tours/${externalTourId}/dates`);
    return [
      {
        externalId: `DEP_${externalTourId}_A`,
        tourExternalId: externalTourId,
        startDate: "2026-11-15T00:00:00Z",
        endDate: "2026-11-23T00:00:00Z",
        price: 65000,
        availableSeats: 5,
        totalSeats: 25,
        status: 'available',
        payload: { agent_price: 61000 }
      }
    ];
  }

  async getAvailability(externalTourId: string, departureExternalId: string): Promise<number> {
    return 5;
  }

  async getPrices(externalTourId: string, departureExternalId: string): Promise<TourPrices> {
    return { adult: 65000, netPrice: 61000 };
  }

  async createBooking(payload: BookingPayload): Promise<BookingResult> {
    return { externalBookingId: `BK_TF_${Date.now()}`, status: 'confirmed' };
  }

  async getBookingStatus(externalBookingId: string): Promise<string> {
    return 'confirmed';
  }

  async cancelBooking(externalBookingId: string): Promise<boolean> {
    return true;
  }
}
