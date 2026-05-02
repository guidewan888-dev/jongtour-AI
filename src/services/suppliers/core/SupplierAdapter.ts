export interface RawTour {
  externalId: string;
  name: string;
  payload: any; // Raw JSON from supplier
}

export interface RawTourDetail extends RawTour {
  itinerary: any[];
  images: string[];
}

export interface RawDeparture {
  externalId: string;
  tourExternalId: string;
  startDate: string;
  endDate: string;
  price: number;
  availableSeats: number;
  totalSeats: number;
  status: 'available' | 'full' | 'cancelled' | 'on_request';
  payload: any;
}

export interface TourPrices {
  adult: number;
  child?: number;
  infant?: number;
  singleRoom?: number;
  netPrice?: number;
}

export interface BookingPayload {
  tourExternalId: string;
  departureExternalId: string;
  pax: number;
  travelers: any[];
  contactInfo: any;
}

export interface BookingResult {
  externalBookingId: string;
  status: 'confirmed' | 'pending' | 'failed' | 'on_request';
  message?: string;
}

export interface SupplierAdapter {
  readonly supplierId: string;
  
  /**
   * Fetch all tours (summary list) from the supplier
   */
  getTours(): Promise<RawTour[]>;
  
  /**
   * Fetch detailed information of a specific tour
   */
  getTourDetail(externalTourId: string): Promise<RawTourDetail>;
  
  /**
   * Fetch all departure dates and availability for a specific tour
   */
  getDepartures(externalTourId: string): Promise<RawDeparture[]>;
  
  /**
   * Real-time availability check for a specific departure
   */
  getAvailability(externalTourId: string, departureExternalId: string): Promise<number>;
  
  /**
   * Real-time price check for a specific departure
   */
  getPrices(externalTourId: string, departureExternalId: string): Promise<TourPrices>;
  
  /**
   * Submit a booking to the supplier's system
   */
  createBooking(payload: BookingPayload): Promise<BookingResult>;
  
  /**
   * Check status of an existing booking
   */
  getBookingStatus(externalBookingId: string): Promise<string>;
  
  /**
   * Cancel an existing booking
   */
  cancelBooking(externalBookingId: string): Promise<boolean>;
}
