import { SupplierAdapter, RawTour, RawTourDetail, RawDeparture, TourPrices, BookingPayload, BookingResult } from '../core/SupplierAdapter';

export class LetgoAdapter implements SupplierAdapter {
  readonly supplierId = 'SUP_LETGO'; // Match this in database
  private baseUrl = 'https://www.zegoapi.com/v1.5';
  private token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2OWYwM2JlODQzMWFmMmU0ODY5NWY0YjAiLCJpYXQiOjE3Nzc1MTg1NDN9.qbZPxA3jldUTTLsGmbdMrvv3qXnTPDiNc_9_T48zPnw';

  // Mocking internal fetch with credential handling
  private async fetchApi(endpoint: string, options: any = {}) {
    console.log(`[LetgoAdapter] Calling API: ${this.baseUrl}${endpoint}`);
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'auth-token': this.token,
        ...options.headers
      },
      cache: 'no-store',
      ...options
    });
    
    if (!response.ok) {
      throw new Error(`Zego API returned status: ${response.status}`);
    }
    
    return await response.json();
  }

  async getTours(): Promise<RawTour[]> {
    const rawData = await this.fetchApi('/programtours');
    // Zego API returns { Data: [...], Count: ... }
    const toursData = Array.isArray(rawData) ? rawData : (rawData.Data || rawData.data || []);
    
    return toursData.map((t: any) => ({
      externalId: t.ProductID.toString(),
      name: t.ProductName,
      payload: t
    }));
  }

  async getTourDetail(externalTourId: string): Promise<RawTourDetail> {
    await this.fetchApi(`/packages/${externalTourId}`);
    return {
      externalId: externalTourId,
      name: "Detail Mock",
      payload: {},
      itinerary: [],
      images: []
    };
  }

  async getDepartures(externalTourId: string): Promise<RawDeparture[]> {
    await this.fetchApi(`/packages/${externalTourId}/departures`);
    return [
      {
        externalId: `DEP_${externalTourId}_1`,
        tourExternalId: externalTourId,
        startDate: "2026-12-15T00:00:00Z",
        endDate: "2026-12-20T00:00:00Z",
        price: 35000,
        availableSeats: 10,
        totalSeats: 30,
        status: 'available',
        payload: { net_price: 32000 }
      }
    ];
  }

  async getAvailability(externalTourId: string, departureExternalId: string): Promise<number> {
    await this.fetchApi(`/availability/${departureExternalId}`);
    return 10; // Mock 10 seats
  }

  async getPrices(externalTourId: string, departureExternalId: string): Promise<TourPrices> {
    await this.fetchApi(`/prices/${departureExternalId}`);
    return { adult: 35000, netPrice: 32000 };
  }

  async createBooking(payload: BookingPayload): Promise<BookingResult> {
    await this.fetchApi(`/book`, { method: 'POST', body: payload });
    return {
      externalBookingId: `BK_LG_${Date.now()}`,
      status: 'confirmed'
    };
  }

  async getBookingStatus(externalBookingId: string): Promise<string> {
    return 'confirmed';
  }

  async cancelBooking(externalBookingId: string): Promise<boolean> {
    return true;
  }
}
