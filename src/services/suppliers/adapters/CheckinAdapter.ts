import { SupplierAdapter, RawTour, RawTourDetail, RawDeparture, TourPrices, BookingPayload, BookingResult } from '../core/SupplierAdapter';

export class CheckinAdapter implements SupplierAdapter {
  readonly supplierId = 'SUP_CHECKIN'; // Match this in database
  private baseUrl = 'https://api.checkingroup.example.com/v1';

  // Mocking internal fetch with credential handling
  private async fetchApi(endpoint: string, options: any = {}) {
    console.log(`[CheckinAdapter] Calling API: ${this.baseUrl}${endpoint}`);
    // Simulating delay
    await new Promise(res => setTimeout(res, 500));
    return { success: true, data: [] };
  }

  async getTours(): Promise<RawTour[]> {
    await this.fetchApi('/products');
    
    // Mock Raw Data from Check In Wholesale
    // Mock Raw Data from Check In Wholesale
    const tours: RawTour[] = [];
    const themes = ["Premium", "Standard", "Budget", "Luxury"];
    const destinations = ["Singapore", "Malaysia", "Bali", "Maldives", "Dubai"];
    
    for (let i = 1; i <= 35; i++) {
      const theme = themes[i % themes.length];
      const dest = destinations[i % destinations.length];
      const days = (i % 4) + 3; // 3 to 6 days
      tours.push({
        externalId: `CHK_${dest.substring(0,3).toUpperCase()}_0${i}`,
        name: `${theme} ${dest} ${days} Days`,
        payload: {
          product_id: `CHK_${dest.substring(0,3).toUpperCase()}_0${i}`,
          name: `${theme} ${dest} ${days} Days`,
          region: "Asia",
          duration_days: days,
          price_starting: 12000 + (i * 800),
          is_active: true
        }
      });
    }

    return tours;
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
