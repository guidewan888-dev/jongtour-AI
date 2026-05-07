/**
 * Booking Session — Client-side state management for multi-step booking flow
 * 
 * Uses sessionStorage so data persists across page navigations within the same tab
 * but is automatically cleared when the tab is closed.
 */

const STORAGE_KEY = 'jongtour_booking';

export interface BookingTraveler {
  titleTh: string;
  firstNameTh: string;
  lastNameTh: string;
  firstNameEn: string;
  lastNameEn: string;
  passportNumber?: string;
  dateOfBirth?: string;
  phone?: string;
  email?: string;
}

export interface BookingSession {
  // Tour info (set in Step 1: Book Tour)
  tourId: string;
  tourSlug: string;
  tourCode: string;
  tourName: string;
  supplier: string;
  country: string;
  durationDays: number;
  durationNights: number;
  imageUrl?: string;

  // Departure info (set in Step 1: Book Tour)
  departureId: string;
  departureDate: string;
  departureEndDate: string;
  priceAdult: number;
  priceChild: number;
  priceSingle?: number;
  deposit?: number;
  remainingSeats: number;

  // Quantities (set in Step 1: Book Tour)
  adults?: number;
  children?: number;
  singleRooms?: number;
  addOns?: string[];
  totalPrice?: number;
  totalDeposit?: number;

  // Travelers (set in Step 2: Travelers)
  travelers: BookingTraveler[];

  // Contact info (set in Step 2: Travelers)
  contactEmail: string;
  contactPhone: string;
  specialRequests?: string;
}

export function getBookingSession(): BookingSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setBookingSession(data: Partial<BookingSession>): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getBookingSession() || {};
    const merged = { ...existing, ...data };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  } catch {
    // Storage full or unavailable — silent fail
  }
}

export function clearBookingSession(): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // silent
  }
}

/**
 * Calculate total price from session data
 */
export function calculateTotal(session: BookingSession): number {
  const childTitles = ['เด็กชาย', 'เด็กหญิง', 'Master', 'Miss'];
  const adults = session.travelers.filter(t => !childTitles.includes(t.titleTh));
  const children = session.travelers.filter(t => childTitles.includes(t.titleTh));
  
  return (adults.length * session.priceAdult) + (children.length * (session.priceChild || session.priceAdult));
}
