import { SupplierAdapter, RawTour, RawTourDetail, RawDeparture, TourPrices, BookingPayload, BookingResult } from '../core/SupplierAdapter';

export class LetgoAdapter implements SupplierAdapter {
  readonly supplierId = 'SUP_LETGO'; // Match this in database
  private baseUrl = 'https://api.letgogroup.example.com/v1';

  // Mocking internal fetch with credential handling
  private async fetchApi(endpoint: string, options: any = {}) {
    // In reality: Fetch API Key from DB, decrypt, set headers
    console.log(`[LetgoAdapter] Calling API: ${this.baseUrl}${endpoint}`);
    // Simulating delay
    await new Promise(res => setTimeout(res, 500));
    
    // Mock response
    return { success: true, data: [] };
  }

  async getTours(): Promise<RawTour[]> {
    await this.fetchApi('/packages');
    
    // Mock Raw Data from Wholesale
    const tours: RawTour[] = [];
    const countries = ["Japan", "South Korea", "Vietnam", "Taiwan"];
    
    for (let i = 1; i <= 24; i++) {
      const country = countries[i % countries.length];
      const days = (i % 3) + 4; // 4 to 6 days
      tours.push({
        externalId: `LG_${country.substring(0,3).toUpperCase()}_0${i}`,
        name: `Amazing ${country} Explorer ${days} Days`,
        payload: {
          pkg_id: `LG_${country.substring(0,3).toUpperCase()}_0${i}`,
          name_th: `Amazing ${country} Explorer ${days} Days`,
          destination: country,
          days: days,
          min_price: 15000 + (i * 1000),
          status: 1
        }
      });
    }

    return tours;
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
