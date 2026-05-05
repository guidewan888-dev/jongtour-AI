export interface TourDetail {
  id: string;
  slug: string;
  code: string;
  title: string;
  supplier: {
    id: string;
    name: string;
    logo?: string;
  };
  country: string;
  city: string;
  duration: {
    days: number;
    nights: number;
  };
  images: string[];
  price: {
    starting: number;
    original?: number;
  };
  status: 'AVAILABLE' | 'FEW_SEATS' | 'WAITLIST' | 'SOLD_OUT';
  summary: string;
  highlights: string[];
  flight: {
    airline: string;
    airlineLogo?: string;
    details: string;
  };
  hotel: {
    name: string;
    rating: number;
    details: string;
  };
  meals: string;
  included: string[];
  excluded: string[];
  policies: {
    payment: string;
    cancellation: string;
  };
  pdfUrl?: string;
  itinerary: TourDay[];
  departures: TourDeparture[];
  faqs: { question: string; answer: string }[];
}

export interface TourDay {
  day: number;
  title: string;
  description: string;
  meals: {
    breakfast: boolean;
    lunch: boolean;
    dinner: boolean;
    details?: string;
  };
  hotel?: string;
}

export interface TourDeparture {
  id: string;
  startDate: string; // ISO String
  endDate: string; // ISO String
  priceAdult: number;
  priceChild: number;
  priceSingle: number;
  status: 'AVAILABLE' | 'FEW_SEATS' | 'WAITLIST' | 'SOLD_OUT';
  remainingSeats: number;
}
