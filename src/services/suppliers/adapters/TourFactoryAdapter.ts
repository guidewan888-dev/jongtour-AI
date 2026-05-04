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
    throw new Error("Method not implemented. Bulk sync is used via getTours().");
  }

  async getDepartures(externalTourId: string): Promise<RawDeparture[]> {
    throw new Error("Method not implemented. Bulk sync is used via getTours().");
  }

  async getAvailability(externalTourId: string, departureExternalId: string): Promise<number> {
    throw new Error("Method not implemented.");
  }

  async getPrices(externalTourId: string, departureExternalId: string): Promise<TourPrices> {
    throw new Error("Method not implemented.");
  }

  async createBooking(payload: BookingPayload): Promise<BookingResult> {
    throw new Error("Method not implemented.");
  }

  async getBookingStatus(externalBookingId: string): Promise<string> {
    throw new Error("Method not implemented.");
  }

  async cancelBooking(externalBookingId: string): Promise<boolean> {
    throw new Error("Method not implemented.");
  }
}
