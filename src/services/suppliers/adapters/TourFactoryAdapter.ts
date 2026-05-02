import { SupplierAdapter, RawTour, RawTourDetail, RawDeparture, TourPrices, BookingPayload, BookingResult } from '../core/SupplierAdapter';

export class TourFactoryAdapter implements SupplierAdapter {
  readonly supplierId = 'SUP_TOURFACTORY'; // Match this in database
  private baseUrl = 'https://api.tourfactory.example.com/v1';

  // Mocking internal fetch with credential handling
  private async fetchApi(endpoint: string, options: any = {}) {
    console.log(`[TourFactoryAdapter] Calling API: ${this.baseUrl}${endpoint}`);
    // Simulating delay
    await new Promise(res => setTimeout(res, 500));
    return { success: true, data: [] };
  }

  async getTours(): Promise<RawTour[]> {
    await this.fetchApi('/tours');
    
    // Mock Raw Data from TourFactory Wholesale
    const tours: RawTour[] = [];
    const regions = ["Europe", "Taiwan", "Hong Kong", "China", "Scandinavia"];
    
    for (let i = 1; i <= 18; i++) {
      const region = regions[i % regions.length];
      const days = (i % 5) + 4; // 4 to 8 days
      tours.push({
        externalId: `TF_${region.substring(0,3).toUpperCase()}_0${i}`,
        name: `Classic ${region} ${days} Days`,
        payload: {
          tour_code: `TF_${region.substring(0,3).toUpperCase()}_0${i}`,
          title: `Classic ${region} ${days} Days`,
          country: region,
          duration: `${days}D${days-1}N`,
          base_price: 25000 + (i * 2000),
          active: true
        }
      });
    }

    return tours;
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
