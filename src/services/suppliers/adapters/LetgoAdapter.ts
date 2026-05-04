import { SupplierAdapter, RawTour, RawTourDetail, RawDeparture, TourPrices, BookingPayload, BookingResult } from '../core/SupplierAdapter';

export class LetgoAdapter implements SupplierAdapter {
  readonly supplierId = 'SUP_LETGO'; // Match this in database
  private baseUrl = 'https://www.zegoapi.com/v1.5';
  private token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2OWYwM2JlODQzMWFmMmU0ODY5NWY0YjAiLCJpYXQiOjE3Nzc1MTg1NDN9.qbZPxA3jldUTTLsGmbdMrvv3qXnTPDiNc_9_T48zPnw';

  // Mocking internal fetch with credential handling
  private async fetchApi(endpoint: string, options: any = {}, retries = 3) {
    let attempt = 0;
    while (attempt <= retries) {
      console.log(`[LetgoAdapter] Calling API: ${this.baseUrl}${endpoint} (Attempt ${attempt + 1})`);
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
      
      if (response.status === 429 && attempt < retries) {
        attempt++;
        const delay = Math.pow(2, attempt) * 1000; // Exponential backoff: 2s, 4s, 8s
        console.warn(`[LetgoAdapter] Rate limited (429). Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      if (!response.ok) {
        throw new Error(`Zego API returned status: ${response.status}`);
      }
      
      return await response.json();
    }
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
    return true;
  }
}
