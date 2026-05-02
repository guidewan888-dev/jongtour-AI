import { SupplierAdapter, RawTour, RawTourDetail, RawDeparture, TourPrices, BookingPayload, BookingResult } from '../core/SupplierAdapter';

export class Go365Adapter implements SupplierAdapter {
  readonly supplierId = 'SUP_GO365'; // Match this in database
  private baseUrl = 'https://api.go365.example.com/v1';

  // Mocking internal fetch with credential handling
  private async fetchApi(endpoint: string, options: any = {}) {
    console.log(`[Go365Adapter] Calling API: ${this.baseUrl}${endpoint}`);
    // Simulating delay
    await new Promise(res => setTimeout(res, 500));
    return { success: true, data: [] };
  }

  async getTours(): Promise<RawTour[]> {
    await this.fetchApi('/tours');
    
    // Mock Raw Data from Go365 Wholesale
    return [
      {
        externalId: "GO365_EUR_01",
        name: "Classic Europe 9 Days",
        payload: {
          tour_code: "GO365_EUR_01",
          title: "Classic Europe 9 Days (Ger, Switz, France)",
          country: "Europe",
          duration: "9D6N",
          base_price: 65000,
          active: true
        }
      },
      {
        externalId: "GO365_TPE_02",
        name: "Taipei Alishan 5 Days",
        payload: {
          tour_code: "GO365_TPE_02",
          title: "Taipei Alishan 5 Days",
          country: "Taiwan",
          duration: "5D4N",
          base_price: 18900,
          active: true
        }
      }
    ];
  }

  async getTourDetail(externalTourId: string): Promise<RawTourDetail> {
    await this.fetchApi(`/tours/${externalTourId}`);
    return {
      externalId: externalTourId,
      name: "Detail Mock Go365",
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
    return { externalBookingId: `BK_GO_${Date.now()}`, status: 'confirmed' };
  }

  async getBookingStatus(externalBookingId: string): Promise<string> {
    return 'confirmed';
  }

  async cancelBooking(externalBookingId: string): Promise<boolean> {
    return true;
  }
}
