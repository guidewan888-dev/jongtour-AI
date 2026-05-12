/**
 * Tour Mapper — Centralized Schema & Mapping
 *
 * Defines a single standardized tour shape used across ALL display surfaces:
 *   - /wholesaler/[slug] listing pages
 *   - /tour/[slug] and /tour/s/[code] detail pages
 *   - Search results, AI chat cards
 *   - Admin dashboards
 *
 * Every data source (wholesale DB, scraper DB, raw API) MUST be mapped
 * through `mapWholesaleTour()` or `mapScraperTour()` before rendering.
 */

// ─── Standard Tour Schema ───────────────────────────────────────────

import { resolveCountryMeta } from '@/lib/geo';

export interface StandardTour {
  id: string;
  code: string;
  slug: string;
  title: string;
  country: string;
  city: string;
  days: number;
  nights: number;
  duration: string;             // "5 วัน 3 คืน" display string
  priceFrom: number;
  currency: string;             // "THB"
  departureDates: DepartureDate[];
  airline: string;
  pdfUrl: string;
  thumbnailUrl: string;
  highlights: string[];
  wholesaler: string;           // canonical name e.g. "letsgo", "worldconnection"
  // Navigation
  href: string;                 // internal link for the card
  sourceUrl: string;            // external original URL (scraper only)
  // Extra display fields
  availableSeats: number;
  deposit: number;
  hotelRating: number;
  flagCode: string;
  nextDeparture: string;        // formatted nearest date
}

export interface DepartureDate {
  startDate?: string;           // ISO date
  endDate?: string;
  price?: number;
  seatsLeft?: number;
  status?: string;
  rawText?: string;
}

// ─── Country → Flag Code ────────────────────────────────────────────

const COUNTRY_FLAGS: Record<string, string> = {
  'ญี่ปุ่น': 'jp', 'จีน': 'cn', 'เกาหลีใต้': 'kr', 'เกาหลี': 'kr',
  'ไต้หวัน': 'tw', 'เวียดนาม': 'vn', 'ฮ่องกง': 'hk', 'สิงคโปร์': 'sg',
  'มาเลเซีย': 'my', 'อินเดีย': 'in', 'กัมพูชา': 'kh', 'พม่า': 'mm',
  'ลาว': 'la', 'ฟิลิปปินส์': 'ph', 'ศรีลังกา': 'lk', 'ภูฏาน': 'bt',
  'ยุโรป': 'eu', 'อังกฤษ': 'gb', 'ฝรั่งเศส': 'fr', 'อิตาลี': 'it',
  'สวิตเซอร์แลนด์': 'ch', 'สเปน': 'es', 'รัสเซีย': 'ru', 'จอร์เจีย': 'ge',
  'ตุรกี': 'tr', 'อียิปต์': 'eg', 'ดูไบ': 'ae', 'จอร์แดน': 'jo',
  'อเมริกา': 'us', 'แคนาดา': 'ca', 'ออสเตรเลีย': 'au', 'นิวซีแลนด์': 'nz',
  'คาซัคสถาน': 'kz', 'เยอรมนี': 'de', 'ออสเตรีย': 'at', 'เช็ก': 'cz',
  'ฮังการี': 'hu', 'โปรตุเกส': 'pt', 'สแกนดิเนเวีย': 'eu',
};

const SITE_ALIAS_MAP: Record<string, string> = {
  oneworldtour: 'worldconnection',
  'one-world-tour': 'worldconnection',
  onetour: 'worldconnection',
};

// Friendly display names for wholesalers — used in toCardProps
const SUPPLIER_DISPLAY_NAMES: Record<string, string> = {
  worldconnection: 'World Connection',
  oneworldtour: 'World Connection',
  letsgo: "Let's Go",
  "let'sgo": "Let's Go",
  bestintl: 'Best International',
  bestinternational: 'Best International',
  gs25: 'GS25 Travel',
  itravels: 'iTravels',
  checkingroup: 'Check-in Group',
  tourfactory: 'Tour Factory',
};

// ─── PDF URL Validator ──────────────────────────────────────────────

function sanitizePdfUrl(url: string | null | undefined): string {
  if (!url) return '';
  const trimmed = url.trim();

  // Reject obviously invalid URLs
  if (trimmed.length < 10) return '';
  if (!/^https?:\/\//i.test(trimmed)) return '';
  if (/\.(jpg|jpeg|png|gif|webp|svg|ico|html?)$/i.test(trimmed)) return '';

  // Must look like a PDF or document link
  const isPdfLike = /\.pdf/i.test(trimmed)
    || /cloudfront/i.test(trimmed)
    || /program/i.test(trimmed)
    || /download/i.test(trimmed)
    || /document/i.test(trimmed)
    || /s3\.amazonaws/i.test(trimmed);

  return isPdfLike ? trimmed : '';
}

// ─── Duration Parser ────────────────────────────────────────────────

function parseDuration(raw: string | null | undefined): { days: number; nights: number; display: string } {
  if (!raw) return { days: 0, nights: 0, display: '' };
  const m = raw.match(/(\d+)\s*วัน\s*(\d+)?/);
  const days = m ? parseInt(m[1]) : 0;
  const nights = m && m[2] ? parseInt(m[2]) : Math.max(0, days - 1);
  return {
    days,
    nights,
    display: days > 0 ? `${days} วัน ${nights} คืน` : raw,
  };
}

// ─── Title Cleanup ──────────────────────────────────────────────────

function cleanTitle(raw: string | null | undefined, code: string): string {
  if (!raw || raw.trim().length === 0) return code || 'ทัวร์ไม่มีชื่อ';
  let title = raw.trim();

  // If title is just a code (e.g. "TOUR-LETSGO-1234"), try to humanize
  if (/^[A-Z0-9_-]+$/.test(title) && title.length < 30) {
    // Keep code as-is but mark it
    return title;
  }

  // Remove excessive whitespace
  title = title.replace(/\s+/g, ' ');

  return title;
}

// ─── Wholesale Tour Mapper ──────────────────────────────────────────

export interface WholesaleRawTour {
  id: string;
  slug: string;
  code: string;
  title: string;
  supplier: string;
  country: string;
  city: string;
  durationDays: number;
  durationNights: number;
  nextDeparture: string;
  price: number;
  availableSeats: number;
  imageUrl: string;
  airline: string;
  pdfUrl?: string;
}

export function mapWholesaleTour(raw: WholesaleRawTour): StandardTour {
  const geo = resolveCountryMeta(raw.country, raw.title);
  const dur = raw.durationDays > 0
    ? { days: raw.durationDays, nights: raw.durationNights, display: `${raw.durationDays} วัน ${raw.durationNights} คืน` }
    : { days: 0, nights: 0, display: '' };

  return {
    id: raw.id,
    code: raw.code || '',
    slug: raw.slug || '',
    title: cleanTitle(raw.title, raw.code),
    country: geo.name || raw.country || '',
    city: raw.city || '',
    days: dur.days,
    nights: dur.nights,
    duration: dur.display,
    priceFrom: typeof raw.price === 'number' ? raw.price : 0,
    currency: 'THB',
    departureDates: [],
    airline: raw.airline || '',
    pdfUrl: sanitizePdfUrl(raw.pdfUrl),
    thumbnailUrl: raw.imageUrl || '',
    highlights: [],
    wholesaler: raw.supplier || '',
    href: `/tour/${raw.slug}`,
    sourceUrl: '',
    availableSeats: raw.availableSeats || 0,
    deposit: 0,
    hotelRating: 0,
    flagCode: geo.flagCode || COUNTRY_FLAGS[raw.country] || '',
    nextDeparture: raw.nextDeparture || 'N/A',
  };
}

// ─── Scraper Tour Mapper ────────────────────────────────────────────

export interface ScraperRawTour {
  id: number | string;
  site: string;
  tour_code: string;
  title: string;
  country: string;
  duration: string;
  price_from: number;
  airline: string;
  cover_image_url: string;
  source_url: string;
  pdf_url: string;
  deposit: number;
  hotel_rating: number;
  highlights: string[];
  is_active?: boolean;
}

export function mapScraperTour(raw: ScraperRawTour): StandardTour {
  const geo = resolveCountryMeta(raw.country, raw.title);
  const dur = parseDuration(raw.duration);
  const code = raw.tour_code || '';

  return {
    id: `scraper-${raw.id}`,
    code,
    slug: code.toLowerCase(),
    title: cleanTitle(raw.title, code),
    country: geo.name || raw.country || '',
    city: '',
    days: dur.days,
    nights: dur.nights,
    duration: dur.display,
    priceFrom: typeof raw.price_from === 'number' ? raw.price_from : 0,
    currency: 'THB',
    departureDates: [],
    airline: raw.airline || '',
    pdfUrl: sanitizePdfUrl(raw.pdf_url),
    thumbnailUrl: raw.cover_image_url || '',
    highlights: Array.isArray(raw.highlights) ? raw.highlights : [],
    wholesaler: SITE_ALIAS_MAP[raw.site] || raw.site || '',
    href: `/tour/s/${code.toLowerCase()}`,
    sourceUrl: raw.source_url || '',
    availableSeats: 0,
    deposit: typeof raw.deposit === 'number' ? raw.deposit : 0,
    hotelRating: typeof raw.hotel_rating === 'number' ? raw.hotel_rating : 0,
    flagCode: geo.flagCode || COUNTRY_FLAGS[raw.country] || '',
    nextDeparture: '',
  };
}

// ─── Convert StandardTour → TourCardProps ───────────────────────────

export function toCardProps(tour: StandardTour) {
  return {
    id: tour.id,
    slug: tour.slug,
    code: tour.code,
    title: tour.title,
    supplier: SUPPLIER_DISPLAY_NAMES[tour.wholesaler] || tour.wholesaler,
    supplierSlug: tour.wholesaler,
    country: tour.country,
    city: tour.city,
    durationDays: tour.days,
    durationNights: tour.nights,
    duration: tour.duration,
    nextDeparture: tour.nextDeparture,
    price: tour.priceFrom,
    availableSeats: tour.availableSeats,
    imageUrl: tour.thumbnailUrl,
    airline: tour.airline,
    flagCode: tour.flagCode,
    sourceUrl: tour.sourceUrl,
    pdfUrl: tour.pdfUrl,
    deposit: tour.deposit,
    hotelRating: tour.hotelRating,
    highlights: tour.highlights,
  };
}
