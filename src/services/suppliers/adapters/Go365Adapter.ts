import { SupplierAdapter, RawTour, RawTourDetail, RawDeparture, TourPrices, BookingPayload, BookingResult } from '../core/SupplierAdapter';

export class Go365Adapter implements SupplierAdapter {
  readonly supplierId = 'SUP_GO365';
  private baseUrl = 'https://api.go365.com/v1'; // Pseudo URL
  private apiKey = process.env.GO365_API_KEY || 'MOCK_KEY';

  private async fetchApi(endpoint: string, options: any = {}, retries = 3) {
    let attempt = 0;
    while (attempt <= retries) {
      console.log(`[Go365Adapter] Calling API: ${this.baseUrl}${endpoint} (Attempt ${attempt + 1})`);
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          ...options.headers
        },
        cache: 'no-store',
        ...options
      });
      
      if (response.status === 429 && attempt < retries) {
        attempt++;
        const delay = Math.pow(2, attempt) * 1000;
        console.warn(`[Go365Adapter] Rate limited (429). Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      if (!response.ok) {
        throw new Error(`Go365 API returned status: ${response.status}`);
      }
      
      return await response.json();
    }
  }

  async getTours(): Promise<RawTour[]> {
    // In a real app, this would be await this.fetchApi('/tours')
    // Simulating Go365 Response
    const rawData = {
      tours: [
        {
          TripCode: "GO-JP01",
          TripName: "Japan Classic Tokyo 5 Days",
          Destinations: ["Japan"],
          DurationDay: 5,
          MinPrice: 29900,
          ImageThumb: "https://example.com/jp01.jpg"
        }
      ]
    };
    
    return rawData.tours.map((t: any) => ({
      externalId: t.TripCode,
      name: t.TripName,
      payload: t
    }));
  }

  async getTourDetail(externalTourId: string): Promise<RawTourDetail> {
    return {
      externalId: externalTourId,
      name: "Detail Mock",
      payload: { Description: "Explore Tokyo" },
      itinerary: [],
      images: []
    };
  }

  async getDepartures(externalTourId: string): Promise<RawDeparture[]> {
    return [
      {
        externalId: `DEP_GO_${externalTourId}_1`,
        tourExternalId: externalTourId,
        startDate: "2026-11-10T00:00:00Z",
        endDate: "2026-11-15T00:00:00Z",
        price: 29900,
        availableSeats: 15,
        totalSeats: 30,
        status: 'available',
        payload: { CostPrice: 27000 }
      }
    ];
  }

  async getAvailability(externalTourId: string, departureExternalId: string): Promise<number> {
    return 15;
  }

  async getPrices(externalTourId: string, departureExternalId: string): Promise<TourPrices> {
    return { adult: 29900, netPrice: 27000 };
  }

  async createBooking(payload: BookingPayload): Promise<BookingResult> {
    return {
      externalBookingId: `BK_GO365_${Date.now()}`,
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
