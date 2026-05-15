/**
 * Booking Session - Client-side state management for multi-step booking flow
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
  wholesaleId?: string;
  wholesaleSourceType?: 'api' | 'scraper' | string;
  country: string;
  durationDays: number;
  durationNights: number;
  imageUrl?: string;
  bookingMode?: 'ONLINE' | 'PAY_LATER_ONLY' | 'CONTACT_STAFF';
  bookingHint?: string;
  lineContactUrl?: string;

  // Departure info (set in Step 1: Book Tour)
  departureId: string;
  departureDate: string;
  departureEndDate: string;
  priceAdult: number;
  priceChildWithBed?: number;
  priceChildWithoutBed?: number;
  priceInfant?: number;
  priceChild: number;
  priceSingle?: number;
  deposit?: number;
  depositType?: 'per_person' | 'per_booking' | 'unknown';
  pdfUrl?: string;
  remainingSeats: number;

  // Quantities (set in Step 1: Book Tour)
  adults?: number;
  children?: number;
  childWithBedCount?: number;
  childWithoutBedCount?: number;
  infantCount?: number;
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
    // Storage full or unavailable - silent fail
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
  const childTitles = ['Master', 'Miss'];
  const normalizedTravelerTitles = (session.travelers || []).map((traveler) => String(traveler.titleTh || '').trim().replace(/\.$/, ''));
  const travelerAdults = normalizedTravelerTitles.filter((title) => !childTitles.includes(title)).length;
  const travelerChildren = normalizedTravelerTitles.filter((title) => childTitles.includes(title)).length;

  const adults = travelerAdults || session.adults || 1;
  const childWithBedCount = session.childWithBedCount ?? session.children ?? travelerChildren ?? 0;
  const childWithoutBedCount = session.childWithoutBedCount ?? 0;
  const infantCount = session.infantCount ?? 0;
  const children = childWithBedCount + childWithoutBedCount;
  const singleRooms = session.singleRooms || 0;

  const childWithBedPrice = session.priceChildWithBed || session.priceChild || session.priceAdult;
  const childWithoutBedPrice = session.priceChildWithoutBed || session.priceChild || session.priceAdult;
  const infantPrice = session.priceInfant || 0;

  let total = adults * session.priceAdult;
  total += childWithBedCount * childWithBedPrice;
  total += childWithoutBedCount * childWithoutBedPrice;
  total += infantCount * infantPrice;
  total += singleRooms * (session.priceSingle || 0);

  const addOns = session.addOns || [];
  if (addOns.includes('insurance')) {
    total += 800 * (adults + children);
  }
  if (addOns.includes('airport_transfer') || addOns.includes('airport')) {
    total += 1500;
  }

  return total;
}

