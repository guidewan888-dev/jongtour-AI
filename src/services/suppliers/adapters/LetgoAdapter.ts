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
    return [
      {
        externalId: "LG_JPN_01",
        name: "Japan Classic Hokkaido",
        payload: {
          pkg_id: "LG_JPN_01",
          name_th: "Japan Classic Hokkaido",
          destination: "Japan",
          days: 5,
          min_price: 35000,
          status: 1
        }
      },
      {
        externalId: "LG_KOR_02",
        name: "Korea Winter Ski",
        payload: {
          pkg_id: "LG_KOR_02",
          name_th: "Korea Winter Ski",
          destination: "South Korea",
          days: 4,
          min_price: 22000,
          status: 1
        }
      }
    ];
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
