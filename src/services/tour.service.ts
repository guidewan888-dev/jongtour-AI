/**
 * Tour Data Service
 * 
 * Centralized data access layer for all tour-related queries.
 * Uses Supabase REST API via HTTPS — works even when direct DB (port 5432) is blocked.
 * 
 * All pages and API routes should use this service instead of direct Prisma queries.
 */

import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { resolveCountryMeta } from '@/lib/geo';

// ─── Country Normalizer ─────────────────────────────────────────────
// Maps all raw DB country values → standardized Thai names for frontend display
// This handles mixed English/Thai + composite values from different wholesalers

const COUNTRY_NORMALIZE: Record<string, string> = {
  // === Asia ===
  'JAPAN': 'ญี่ปุ่น',
  'CHINA': 'จีน',
  'VIETNAM': 'เวียดนาม',
  'TAIWAN': 'ไต้หวัน',
  'HONG KONG': 'ฮ่องกง',
  'INDIA': 'อินเดีย',
  'SOUTH KOREA': 'เกาหลี',
  'KOREA': 'เกาหลี',
  'SINGAPORE': 'สิงคโปร์',
  'MALAYSIA': 'มาเลเซีย',
  'CAMBODIA': 'กัมพูชา',
  'MYANMAR': 'พม่า',
  'LAOS': 'ลาว',
  'PHILIPPINES': 'ฟิลิปปินส์',
  // === Europe — each to its own name ===
  'ITALY': 'อิตาลี',
  'FRANCE': 'ฝรั่งเศส',
  'ENGLAND': 'อังกฤษ',
  'UNITED KINGDOM': 'อังกฤษ',
  'UK': 'อังกฤษ',
  'GERMANY': 'เยอรมนี',
  'SWITZERLAND': 'สวิตเซอร์แลนด์',
  'SPAIN': 'สเปน',
  'NETHERLANDS': 'เนเธอร์แลนด์',
  'AUSTRIA': 'ออสเตรีย',
  'BELGIUM': 'เบลเยียม',
  'CZECH REPUBLIC': 'เช็ก',
  'HUNGARY': 'ฮังการี',
  'PORTUGAL': 'โปรตุเกส',
  'NORWAY': 'นอร์เวย์',
  'SWEDEN': 'สวีเดน',
  'FINLAND': 'ฟินแลนด์',
  'DENMARK': 'เดนมาร์ก',
  'SCOTLAND': 'สกอตแลนด์',
  'LUXEMBOURG': 'ลักเซมเบิร์ก',
  'LIECHTENSTEIN': 'ลิกเตนสไตน์',
  'SLOVAKIA': 'สโลวาเกีย',
  'ESTONIA': 'เอสโตเนีย',
  'LATVIA': 'ลัตเวีย',
  'LITHUANIA': 'ลิทัวเนีย',
  'SCANDINAVIA': 'สแกนดิเนเวีย',
  'BALTIC': 'บอลติก',
  'EUROPE': 'ยุโรป',
  // === Middle East ===
  'TURKIYE': 'ตุรกี',
  'TURKEY': 'ตุรกี',
  'EGYPT': 'อียิปต์',
  'JORDAN': 'จอร์แดน',
  'DUBAI': 'ดูไบ',
  'UAE': 'ดูไบ',
  // === Others ===
  'GEORGIA': 'จอร์เจีย',
  'AUSTRALIA': 'ออสเตรเลีย',
  'NEW ZEALAND': 'นิวซีแลนด์',
  'AFRICA': 'แอฟริกา',
  'USA': 'อเมริกา',
  'UNITED STATES': 'อเมริกา',
  'CANADA': 'แคนาดา',
  'BHUTAN': 'ภูฏาน',
  'SRI LANKA': 'ศรีลังกา',
  // Thai duplicates
  'มาเก๊า': 'ฮ่องกง',
  'ภูฎาน': 'ภูฏาน',
  'สหรัฐอาหรับเอมิเรตส์': 'ดูไบ',
  'ตุรเคีย': 'ตุรกี',
};

function normalizeCountry(raw: string): string {
  if (!raw) return '';
  const upper = raw.trim().toUpperCase();
  // 1. Exact match (case-insensitive for English)
  if (COUNTRY_NORMALIZE[upper]) return COUNTRY_NORMALIZE[upper];
  // 2. Exact match (Thai)
  if (COUNTRY_NORMALIZE[raw.trim()]) return COUNTRY_NORMALIZE[raw.trim()];
  // 3. Composite values like "จีน-เฉิงตู", "จีน อี๋ชาง"
  if (raw.startsWith('จีน')) return 'จีน';
  // 4. Already Thai standard
  return raw.trim();
}

// Reverse map: Thai name → all possible DB values that match
function getCountrySearchTerms(thaiName: string): string[] {
  const terms = [thaiName];
  // Add all keys that normalize to this Thai name
  for (const [raw, normalized] of Object.entries(COUNTRY_NORMALIZE)) {
    if (normalized === thaiName) terms.push(raw);
  }
  // Add prefix patterns for composite countries (e.g., จีน matches จีน-เฉิงตู)
  return [...new Set(terms)];
}

type RegionKey = 'asia' | 'europe' | 'middle-east' | 'americas' | 'oceania' | 'others';

const REGION_FILTER_ALIASES: Record<RegionKey, string[]> = {
  asia: ['asia', 'เอเชีย', 'เอเชียตะวันออก', 'asian'],
  europe: ['europe', 'ยุโรป', 'eu'],
  'middle-east': ['middle east', 'middle-east', 'ตะวันออกกลาง', 'middleeast'],
  americas: ['america', 'americas', 'อเมริกา'],
  oceania: ['oceania', 'โอเชียเนีย', 'australia-newzealand', 'australia'],
  others: ['others', 'อื่น', 'อื่นๆ', 'other'],
};

function resolveRegionFilter(raw?: string): RegionKey | null {
  const needle = String(raw || '').trim().toLowerCase();
  if (!needle) return null;
  for (const [regionKey, aliases] of Object.entries(REGION_FILTER_ALIASES) as Array<[RegionKey, string[]]>) {
    if (aliases.some(alias => alias === needle)) {
      return regionKey;
    }
  }
  return null;
}

function chunkArray<T>(items: T[], chunkSize: number): T[][] {
  if (chunkSize <= 0) return [items];
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += chunkSize) {
    chunks.push(items.slice(i, i + chunkSize));
  }
  return chunks;
}

// ─── Types ──────────────────────────────────────────────────────────

export interface TourListItem {
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
}

export interface TourDetailData {
  id: string;
  slug: string;
  code: string;
  title: string;
  supplier: { id: string; name: string };
  country: string;
  city: string;
  duration: { days: number; nights: number };
  images: string[];
  price: { starting: number };
  status: string;
  summary: string;
  highlights: string[];
  flight: { airline: string; details: string };
  hotel: { name: string; rating: number; details: string };
  meals: string;
  included: string[];
  excluded: string[];
  policies: { payment: string; cancellation: string };
  pdfUrl?: string;
  itinerary: {
    day: number;
    title: string;
    description: string;
    meals: { breakfast: boolean; lunch: boolean; dinner: boolean };
  }[];
  departures: {
    id: string;
    startDate: string;
    endDate: string;
    priceAdult: number;
    priceChild: number;
    priceSingle: number;
    priceInfant?: number;
    priceJoinLand?: number;
    deposit?: number;
    totalSeats?: number;
    booked?: number;
    status: string;
    remainingSeats: number;
    bus?: string;
    periodCode?: string;
    flightInfo?: string;
  }[];
  deal?: {
    type: 'fire' | 'discount' | null;
    daysLeft: number | null;
    currentPrice: number;
    minPrice: number;
    maxPrice: number;
    discountPercent: number;
  };
}

// ─── Tour List ──────────────────────────────────────────────────────

export async function getTourList(options?: {
  keyword?: string;
  country?: string;
  limit?: number;
}): Promise<TourListItem[]> {
  const { keyword, country, limit = 1000 } = options || {};
  const sb = getSupabaseAdmin();

  // 1. Get published tours
  let query = sb
    .from('tours')
    .select('id, slug, "tourCode", "tourName", "durationDays", "durationNights", "supplierId", "externalTourId"')
    .eq('status', 'PUBLISHED')
    .order('createdAt', { ascending: false })
    .limit(limit);

  if (keyword) {
    query = query.ilike('tourName', `%${keyword}%`);
  }

  const { data: tours, error } = await query;
  if (error || !tours?.length) return [];

  const tourIds = tours.map(t => t.id);
  const supplierIds = [...new Set(tours.map(t => t.supplierId))];

  // 2. Get suppliers
  const { data: suppliers } = await sb
    .from('suppliers')
    .select('id, "canonicalName"')
    .in('id', supplierIds);

  const supplierMap: Record<string, string> = {};
  (suppliers || []).forEach(s => { supplierMap[s.id] = s.canonicalName; });

  // 3. Get ALL destinations + images + raw sources (for airline) in parallel
  const [{ data: destinations }, { data: images }, { data: rawSources }] = await Promise.all([
    sb.from('tour_destinations').select('"tourId", country, city').in('tourId', tourIds),
    sb.from('tour_images').select('"tourId", "imageUrl"').in('tourId', tourIds),
    sb.from('tour_raw_sources').select('"supplierId", "externalTourId", "rawPayload"').in('supplierId', supplierIds),
  ]);

  // Build airline map from raw sources
  const airlineMap: Record<string, string> = {};
  (rawSources || []).forEach((rs: any) => {
    const payload = rs.rawPayload;
    if (!payload) return;
    // Check all possible field names (lowercase and PascalCase)
    let airline = payload.airline || payload.airlineName || payload.air || payload.AirlineName || '';
    const airlineCode = payload.AirlineCode || payload.airline_code || '';
    // If we have a code but no name, resolve it
    if (!airline && airlineCode && AIRLINE_CODES[airlineCode.toUpperCase()]) {
      airline = AIRLINE_CODES[airlineCode.toUpperCase()];
    }
    // If airline is a raw code like "FD", resolve to full name
    if (airline && airline.length === 2 && AIRLINE_CODES[airline.toUpperCase()]) {
      airline = AIRLINE_CODES[airline.toUpperCase()];
    }
    if (airline) {
      const key = `${rs.supplierId}_${rs.externalTourId}`;
      airlineMap[key] = typeof airline === 'string' ? airline : '';
    }
  });

  // Build image map (first image per tour)
  const imageMap: Record<string, string> = {};
  (images || []).forEach(img => {
    if (!imageMap[img.tourId]) imageMap[img.tourId] = img.imageUrl;
  });

  // Build destination map with NORMALIZED country names
  const destMap: Record<string, { country: string; city: string }> = {};
  (destinations || []).forEach(d => {
    if (!destMap[d.tourId]) {
      destMap[d.tourId] = {
        country: normalizeCountry(d.country || ''),
        city: d.city || '',
      };
    }
  });

  // Filter by country using normalized matching
  let filteredTours = tours;
  if (country) {
    const regionFilter = resolveRegionFilter(country);
    const normalizedSearch = normalizeCountry(country);
    const searchTerms = getCountrySearchTerms(normalizedSearch);

    const matchingTourIds = new Set((destinations || [])
      .filter(d => {
        const rawCountry = (d.country || '').trim();
        if (!rawCountry) return false;

        if (regionFilter) {
          return resolveCountryMeta(rawCountry).regionKey === regionFilter;
        }

        const normalizedRaw = normalizeCountry(rawCountry);
        return normalizedRaw === normalizedSearch
          || searchTerms.some(term => rawCountry.toUpperCase() === term.toUpperCase())
          || rawCountry.startsWith(normalizedSearch);
      })
      .map(d => d.tourId));
    filteredTours = tours.filter(t => matchingTourIds.has(t.id));
  }

  // 4. Get nearest departures (paginate to avoid Supabase default 1000-row truncation)
  const now = new Date().toISOString();
  const departures: any[] = [];
  const departureTourIdChunks = chunkArray(tourIds, 60);

  for (const tourIdChunk of departureTourIdChunks) {
    let from = 0;
    while (true) {
      const { data: page, error: depError } = await sb
        .from('departures')
        .select('id, "tourId", "startDate", "remainingSeats"')
        .in('tourId', tourIdChunk)
        .gte('startDate', now)
        .order('startDate', { ascending: true })
        .range(from, from + 999);

      if (depError) throw depError;
      if (!page || page.length === 0) break;

      departures.push(...page);
      if (page.length < 1000) break;
      from += 1000;
    }
  }

  const depMap: Record<string, any> = {};
  (departures || []).forEach(d => {
    if (!depMap[d.tourId]) depMap[d.tourId] = d;
  });

  // 5. Get prices for nearest departures
  const depIds = Object.values(depMap).map((d: any) => d.id);
  const prices: any[] = [];
  const depIdChunks = chunkArray(depIds, 250);
  for (const depIdChunk of depIdChunks) {
    if (depIdChunk.length === 0) continue;
    const { data: chunkPrices, error: priceError } = await sb
      .from('prices')
      .select('"departureId", "sellingPrice"')
      .in('departureId', depIdChunk);
    if (priceError) throw priceError;
    prices.push(...(chunkPrices || []));
  }

  const priceMap: Record<string, number> = {};
  (prices || []).forEach(p => {
    if (!priceMap[p.departureId] || p.sellingPrice < priceMap[p.departureId]) {
      priceMap[p.departureId] = p.sellingPrice;
    }
  });

  // Build externalTourId map for airline lookup
  // Match via externalTourId which both tours and raw_sources share
  const externalIdMap: Record<string, string> = {};
  (rawSources || []).forEach((rs: any) => {
    tours.forEach(t => {
      const key = `${t.supplierId}_${rs.externalTourId}`;
      if (t.supplierId === rs.supplierId && airlineMap[key]) {
        // Primary match: externalTourId (both tables have this field)
        if (String(t.externalTourId) === String(rs.externalTourId)) {
          externalIdMap[t.id] = airlineMap[key];
          return;
        }
        // Fallback: match by tourCode variants
        const payload = rs.rawPayload;
        if (payload?.tourCode === t.tourCode || payload?.tour_code === t.tourCode || payload?.ProductCode === t.tourCode) {
          externalIdMap[t.id] = airlineMap[key];
        }
      }
    });
  });

  // 6a. Build availability map from rawPayload periods
  // Tours with NO available FUTURE departures (all sold out / closed) are hidden
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const availabilityMap: Record<string, boolean> = {};
  (rawSources || []).forEach((rs: any) => {
    const payload = rs.rawPayload;
    if (!payload) return;
    const periods = payload.Periods || payload.periods || [];
    if (!Array.isArray(periods) || periods.length === 0) return;
    const matchingTour = tours.find(t => t.supplierId === rs.supplierId && String(t.externalTourId) === String(rs.externalTourId));
    if (!matchingTour) return;
    // Check if any FUTURE period has available seats
    const hasAvailable = periods.some((p: any) => {
      // Skip past periods — they should not affect availability
      const startDate = p.start || p.StartDate || p.departureDate || '';
      if (startDate && startDate < today) return false;
      
      const status = p.status || p.PeriodStatus || '';
      if (status === 'Close' || status === 'Closed') return false;
      const seats = p.Seat || p.seat || p.GroupSize || p.group || 0;
      const booked = p.Book || p.join || 0;
      // Seat=0 means unlimited/unknown → treat as available
      if (seats === 0) return true;
      return (seats - booked) > 0;
    });
    // If no future periods exist at all, don't mark as unavailable
    const hasFuturePeriods = periods.some((p: any) => {
      const startDate = p.start || p.StartDate || p.departureDate || '';
      return !startDate || startDate >= today;
    });
    if (hasFuturePeriods) {
      availabilityMap[matchingTour.id] = hasAvailable;
    }
    // If all periods are in the past, don't set availability (keep tour visible)
  });

  // Filter: only show tours with available departures (or those without rawPayload data — keep visible)
  const availableTours = filteredTours.filter(t => {
    // Hide tours that have no upcoming departure at all
    if (!depMap[t.id]) return false;
    // If we have raw period availability info, enforce it
    if (availabilityMap[t.id] === undefined) return true;
    return availabilityMap[t.id];
  });

  // 6b. Format results with normalized countries
  return availableTours.map(t => {
    const dep = depMap[t.id];
    const dest = destMap[t.id];
    const price = dep ? (priceMap[dep.id] || 0) : 0;
    // Try rawPayload starting price if DB price is 0
    let startingPrice = Number(price);
    if (!startingPrice) {
      const rs = (rawSources || []).find((r: any) => r.supplierId === t.supplierId && String(r.externalTourId) === String(t.externalTourId));
      if (rs?.rawPayload) {
        const periods = rs.rawPayload.Periods || rs.rawPayload.periods || [];
        const rawPrices = periods.map((p: any) => p.Price || p.price || 0).filter((p: number) => p > 0);
        if (rawPrices.length > 0) startingPrice = Math.min(...rawPrices);
      }
    }
    const titleAirline = extractAirlineFromTitle(t.tourName || '');
    return {
      id: t.id,
      slug: t.slug || '',
      code: t.tourCode || '',
      title: t.tourName || '',
      supplier: supplierMap[t.supplierId] || '',
      country: dest?.country || '',
      city: dest?.city || '',
      durationDays: t.durationDays || 0,
      durationNights: t.durationNights || 0,
      nextDeparture: dep ? new Date(dep.startDate).toLocaleDateString('th-TH') : 'N/A',
      price: startingPrice,
      availableSeats: dep?.remainingSeats || 0,
      imageUrl: imageMap[t.id] || '',
      airline: externalIdMap[t.id] || titleAirline || '',
    };
  });
}

// Extract airline code/name from tour title (e.g. "ทัวร์ญี่ปุ่น (TG)" → "Thai Airways")
const AIRLINE_CODES: Record<string, string> = {
  'TG': 'Thai Airways', 'VZ': 'Thai VietJet', 'FD': 'Thai AirAsia',
  'SL': 'Thai Lion Air', 'XJ': 'Thai AirAsia X', 'WE': 'Thai Smile',
  'CX': 'Cathay Pacific', 'SQ': 'Singapore Airlines', 'NH': 'ANA',
  'JL': 'Japan Airlines', 'MM': 'Peach Aviation', 'TR': 'Scoot',
  'VJ': 'VietJet Air', 'VN': 'Vietnam Airlines', 'QR': 'Qatar Airways',
  'EK': 'Emirates', 'TK': 'Turkish Airlines', 'CI': 'China Airlines',
  'BR': 'EVA Air', 'CA': 'Air China', 'MU': 'China Eastern',
  'CZ': 'China Southern', 'KE': 'Korean Air', 'OZ': 'Asiana Airlines',
  'MH': 'Malaysia Airlines', 'AK': 'AirAsia', 'AI': 'Air India',
  'MS': 'EgyptAir', 'EY': 'Etihad Airways', 'QF': 'Qantas',
};

function extractAirlineFromTitle(title: string): string {
  // 1. Match (TG), [TG]
  const bm = title.match(/[\(\[](\w{2})[\)\]]/);
  if (bm && AIRLINE_CODES[bm[1].toUpperCase()]) return AIRLINE_CODES[bm[1].toUpperCase()];

  // 2. Match "บิน XX"
  const fm = title.match(/บิน\s*(\w{2})\b/i);
  if (fm && AIRLINE_CODES[fm[1].toUpperCase()]) return AIRLINE_CODES[fm[1].toUpperCase()];

  // 3. Direct airline name mentions
  const tl = title.toLowerCase();
  const names: [string, string][] = [
    ['vietjet', 'VietJet Air'], ['thai airways', 'Thai Airways'], ['thai airasia', 'Thai AirAsia'],
    ['cathay pacific', 'Cathay Pacific'], ['singapore airlines', 'Singapore Airlines'],
    ['china eastern', 'China Eastern'], ['china southern', 'China Southern'],
    ['air china', 'Air China'], ['korean air', 'Korean Air'], ['eva air', 'EVA Air'],
    ['china airlines', 'China Airlines'], ['japan airlines', 'Japan Airlines'],
    ['turkish airlines', 'Turkish Airlines'], ['emirates', 'Emirates'],
    ['qatar airways', 'Qatar Airways'], ['peach', 'Peach Aviation'],
    ['scoot', 'Scoot'], ['airasia', 'AirAsia'], ['thai lion', 'Thai Lion Air'],
    ['thai smile', 'Thai Smile'], ['vietnam airlines', 'Vietnam Airlines'],
    ['etihad', 'Etihad Airways'], ['malaysia airlines', 'Malaysia Airlines'],
    ['asiana', 'Asiana Airlines'],
  ];
  for (const [p, n] of names) { if (tl.includes(p)) return n; }

  // 4. Standalone 2-letter IATA codes
  for (const [code, name] of Object.entries(AIRLINE_CODES)) {
    if (new RegExp('\\b' + code + '\\b').test(title)) return name;
  }
  return '';
}

// Extract highlights/destinations from tour title
function extractHighlightsFromTitle(title: string): string[] {
  if (!title) return [];
  const highlights: string[] = [];
  // Remove airline codes and common prefixes
  let cleaned = title
    .replace(/\(.*?\)/g, '') // Remove parentheses content
    .replace(/\[.*?\]/g, '') // Remove bracket content
    .replace(/#\S+/g, '')    // Remove hashtags
    .replace(/บิน\s*\w{2}/g, '') // Remove "บิน XX"
    .replace(/\d+\s*วัน\s*\d+\s*คืน/g, '') // Remove "X วัน X คืน"
    .replace(/ทัวร์/g, '')
    .trim();
  // Split by common delimiters
  const parts = cleaned.split(/[\s]+/).filter(p => p.length > 1);
  // Find place-like words (Thai words typically 3+ chars, not common words)
  const skipWords = new Set(['และ','กับ','ที่','จาก','ไป','มา','ใน','ของ','เที่ยว','พัก','เดินทาง','ราคา','พิเศษ','โปรโมชั่น','ฟรี','รวม','ไม่','บิน','สาย','การ','แอร์','ไลน์','วัน','คืน']);
  const destinations: string[] = [];
  // Also try splitting by spaces and finding destination clusters
  const rawParts = cleaned.split(/\s+/);
  for (const p of rawParts) {
    if (p.length >= 3 && !skipWords.has(p) && !/^\d+$/.test(p)) {
      destinations.push(p);
    }
  }
  // Return unique, max 6
  return [...new Set(destinations)].slice(0, 6);
}


// ─── Tour Detail ────────────────────────────────────────────────────

export async function getTourBySlug(slug: string): Promise<TourDetailData | null> {
  const sb = getSupabaseAdmin();

  // 1. Get tour
  const { data: tours } = await sb
    .from('tours')
    .select('id, slug, "tourCode", "tourName", "durationDays", "durationNights", "supplierId", "externalTourId", status, "supplierBookingNote"')
    .eq('slug', slug)
    .limit(1);

  const tour = tours?.[0];
  if (!tour) return null;

  // 2. Parallel fetches for related data
  const [
    { data: supplier },
    { data: destinations },
    { data: images },
    { data: itineraries },
    { data: meals },
    { data: included },
    { data: excluded },
    { data: policies },
    { data: pdfs },
    { data: departures },
    { data: rawSources },
  ] = await Promise.all([
    sb.from('suppliers').select('id, "canonicalName", "displayName"').eq('id', tour.supplierId).single(),
    sb.from('tour_destinations').select('country, city').eq('tourId', tour.id),
    sb.from('tour_images').select('"imageUrl"').eq('tourId', tour.id).order('createdAt', { ascending: true }),
    sb.from('itineraries').select('"dayNumber", title, description').eq('tourId', tour.id).order('dayNumber', { ascending: true }),
    sb.from('tour_meals').select('"dayNumber", "mealType"').eq('tourId', tour.id),
    sb.from('tour_included').select('description').eq('tourId', tour.id),
    sb.from('tour_excluded').select('description').eq('tourId', tour.id),
    sb.from('tour_policies').select('"policyType", description').eq('tourId', tour.id),
    sb.from('tour_pdfs').select('"pdfUrl"').eq('tourId', tour.id).limit(1),
    sb.from('departures')
      .select('id, "startDate", "endDate", status, "remainingSeats"')
      .eq('tourId', tour.id)
      .gte('startDate', new Date().toISOString())
      .order('startDate', { ascending: true }),
    sb.from('tour_raw_sources').select('"supplierId", "externalTourId", "rawPayload"').eq('supplierId', tour.supplierId),
  ]);

  // Extract airline, PDF, highlights, periods, flights from raw_sources
  let detailAirline = extractAirlineFromTitle(tour.tourName || '');
  let detailPdfUrl = pdfs?.[0]?.pdfUrl || '';
  let detailHighlights: string[] = [];
  let rawPeriods: any[] = [];
  let rawFlights: any[] = [];
  (rawSources || []).forEach((rs: any) => {
    if (String(rs.externalTourId) !== String(tour.externalTourId)) return;
    const payload = rs.rawPayload;
    if (!payload) return;
    // Airline
    let airline = payload.AirlineName || payload.airlineName || payload.airline || payload.air || '';
    const airlineCode = payload.AirlineCode || payload.airline_code || '';
    if (!airline && airlineCode && AIRLINE_CODES[airlineCode.toUpperCase()]) airline = AIRLINE_CODES[airlineCode.toUpperCase()];
    if (airline && airline.length === 2 && AIRLINE_CODES[airline.toUpperCase()]) airline = AIRLINE_CODES[airline.toUpperCase()];
    if (airline) detailAirline = airline;
    // PDF
    const pdf = payload.FilePDF || payload.pdfUrl || payload.pdf_url || payload.PdfUrl || payload.programPdf || payload.FileWord || payload.pdf || payload.word || '';
    if (pdf && !detailPdfUrl) detailPdfUrl = pdf;
    // Highlights — strip HTML tags, split on <br/> and newlines
    const hl = payload.Highlight || payload.highlight || payload.highlights || '';
    if (hl && typeof hl === 'string') {
      detailHighlights = hl
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<[^>]+>/g, '')
        .split('\n')
        .map((h: string) => h.replace(/^[\s•✦▸►●○◆→]+/, '').trim())
        .filter((h: string) => h.length > 2);
    } else if (Array.isArray(hl)) {
      detailHighlights = hl.map((h: string) => typeof h === 'string' ? h.replace(/<[^>]+>/g, '').trim() : '').filter(Boolean);
    }
    // Periods (departure details with deposit/prices) — Periods (Let's Go) or periods (Check In / Tour Factory)
    const periodArr = payload.Periods || payload.periods || [];
    if (Array.isArray(periodArr) && periodArr.length > 0) rawPeriods = periodArr;
    // Flights
    if (Array.isArray(payload.Flights) && payload.Flights.length > 0) rawFlights = payload.Flights;
  });

  const toIsoDate = (value: any): string => {
    if (!value) return '';
    try {
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return '';
      return date.toISOString().slice(0, 10);
    } catch {
      return '';
    }
  };

  const normalizePeriodStatus = (value: any) => {
    const status = String(value || '').toLowerCase();
    if (!status) return '';
    if (status.includes('close') || status.includes('เต็ม') || status.includes('full')) return 'FULL';
    if (status.includes('cancel')) return 'CANCELLED';
    return 'AVAILABLE';
  };

  const periodCandidates = rawPeriods.map((p: any) => ({
    raw: p,
    startIso: toIsoDate(p.PeriodStartDate || p.periodStartDate || p.start || p.StartDate || p.departureDate || ''),
    endIso: toIsoDate(p.PeriodEndDate || p.periodEndDate || p.end || p.EndDate || ''),
  }));

  const findMatchingRawPeriod = (startDate: string, endDate: string) => {
    const startIso = toIsoDate(startDate);
    const endIso = toIsoDate(endDate);
    return periodCandidates.find((candidate) => {
      if (!candidate.startIso) return false;
      if (candidate.startIso === startIso) return true;
      return !!candidate.endIso && candidate.endIso === endIso;
    })?.raw;
  };

  // 3. Get prices for departures
  const depIds = (departures || []).map(d => d.id);
  const { data: prices } = depIds.length > 0
    ? await sb.from('prices').select('"departureId", "paxType", "sellingPrice"').in('departureId', depIds)
    : { data: [] };

  const pricesByDep: Record<string, Record<string, number>> = {};
  (prices || []).forEach(p => {
    if (!pricesByDep[p.departureId]) pricesByDep[p.departureId] = {};
    pricesByDep[p.departureId][p.paxType] = p.sellingPrice;
  });

  // 4. Build meals map
  const mealsByDay: Record<number, Set<string>> = {};
  (meals || []).forEach(m => {
    if (!mealsByDay[m.dayNumber]) mealsByDay[m.dayNumber] = new Set();
    mealsByDay[m.dayNumber].add(m.mealType);
  });

  // 5. Calculate starting price from real departure prices first
  let startingPrice = 0;
  const allPrices = (prices || []).map(p => p.sellingPrice).filter(p => p > 0);
  if (allPrices.length > 0) {
    startingPrice = Math.min(...allPrices);
  } else if (rawPeriods.length > 0) {
    const rawPrices = rawPeriods.map((p: any) => p.Price || p.price || 0).filter((p: number) => p > 0);
    startingPrice = rawPrices.length > 0 ? Math.min(...rawPrices) : 0;
  }

  const dest = destinations?.[0];
  const defaultImg = 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1200';

  // Build enriched departures from REAL DB departures/prices first (single source of truth for booking/payment),
  // then merge richer period metadata from raw payload when available.
  const enrichedDeps = (departures || []).map((d: any) => {
    const raw = findMatchingRawPeriod(d.startDate, d.endDate) || {};
    const seatRaw = Number(raw.Seat || raw.seat || raw.GroupSize || raw.group || 0);
    const bookedRaw = Number(raw.Book || raw.join || 0);
    const rawRemaining = seatRaw > 0 ? Math.max(seatRaw - bookedRaw, 0) : null;
    const dbRemaining = Number(d.remainingSeats || 0);
    const remainingSeats = Math.max(dbRemaining || rawRemaining || 0, 0);

    const dbAdult = Number(pricesByDep[d.id]?.ADULT || 0);
    const dbChild = Number(pricesByDep[d.id]?.CHILD || 0);
    const dbSingle = Number(pricesByDep[d.id]?.SINGLE_SUPP || 0);

    const rawAdult = Number(raw.Price || raw.price || 0);
    const rawChild = Number(raw.Price_Child || raw.priceChild || 0);
    const rawSingle = Number(raw.Price_Single_Bed || raw.priceSingleRoomAdd || raw.priceForOne || 0);
    const rawInfant = Number(raw.Price_Infant || raw.priceInfant || 0);
    const rawJoinLand = Number(raw.Price_JoinLand || 0);
    const rawDeposit = Number(raw.Deposit || raw.deposit || 0);

    const rawStatus = normalizePeriodStatus(raw.status || raw.PeriodStatus || '');
    const dbStatus = String(d.status || '').toUpperCase();
    const status = dbStatus || rawStatus || (remainingSeats > 0 ? 'AVAILABLE' : 'FULL');

    return {
      id: d.id,
      startDate: d.startDate,
      endDate: d.endDate,
      priceAdult: dbAdult || rawAdult || 0,
      priceChild: dbChild || rawChild || dbAdult || rawAdult || 0,
      priceSingle: dbSingle || rawSingle || 0,
      priceInfant: rawInfant || 0,
      priceJoinLand: rawJoinLand || 0,
      deposit: rawDeposit || 0,
      totalSeats: seatRaw > 0 ? seatRaw : Math.max(remainingSeats, 0),
      booked: seatRaw > 0 ? bookedRaw : 0,
      remainingSeats,
      status,
      bus: raw.Bus || raw.bus || '',
      periodCode: raw.PeriodCode || '',
      flightInfo: raw.flight || '',
    };
  });

  const activeDeps = enrichedDeps
    .filter((d: any) => {
      const departureTime = new Date(d.startDate).getTime();
      if (!Number.isFinite(departureTime) || departureTime < Date.now()) return false;
      return Number(d.remainingSeats || 0) > 0 && d.status !== 'CANCELLED';
    })
    .sort((a: any, b: any) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

  const FIRE_SALE_DAYS = 21;
  const DISCOUNT_RATIO = 0.88;
  const pricedActiveDeps = activeDeps.filter((d: any) => Number(d.priceAdult || 0) > 0);
  const nearestDep = pricedActiveDeps[0];
  const priceSeries = pricedActiveDeps.map((d: any) => Number(d.priceAdult || 0)).filter((n: number) => n > 0);
  const minDealPrice = priceSeries.length > 0 ? Math.min(...priceSeries) : 0;
  const maxDealPrice = priceSeries.length > 0 ? Math.max(...priceSeries) : 0;
  const dealDaysLeft = nearestDep
    ? Math.max(0, Math.ceil((new Date(nearestDep.startDate).getTime() - Date.now()) / 86400000))
    : null;
  const isFire = dealDaysLeft !== null && dealDaysLeft <= FIRE_SALE_DAYS;
  const isDiscount = priceSeries.length >= 2 && minDealPrice > 0 && maxDealPrice > 0 && minDealPrice <= maxDealPrice * DISCOUNT_RATIO;
  const dealType: 'fire' | 'discount' | null = isFire ? 'fire' : isDiscount ? 'discount' : null;
  const discountPercent = maxDealPrice > 0 && minDealPrice > 0
    ? Math.max(0, Math.round(((maxDealPrice - minDealPrice) / maxDealPrice) * 100))
    : 0;

  // Build flights info — Let's Go has Flights array, Check In/Tour Factory have flight string in periods
  const flightInfo = rawFlights.length > 0
    ? rawFlights.map((f: any) => ({
        route: f.Route || '',
        flightNo: f.FlightNo || '',
        departure: (f.DepartureTime || '').slice(0, 5),
        arrival: (f.ArrivalTime || '').slice(0, 5),
        airline: f.AirlineName || detailAirline || '',
      }))
    : (() => {
        // Parse flight string: "(BKK-PEK)TG614 10.00-15.45//(PEK-BKK)TG615 17.05-21.15"
        // Also handles: "(BKK-TFU) VZ3680 17.50-22.00", "(DMK-NRT)  XJ600  23.55 -08.00"
        const flightStr = rawPeriods.find((p: any) => p.flight)?.flight || '';
        if (!flightStr) return [];
        return flightStr.split('//').filter(Boolean).map((seg: string) => {
          const cleaned = seg.trim().replace(/\t/g, ' ').replace(/\s+/g, ' ');
          const m = cleaned.match(/\(([^)]+)\)\s*(\w+)\s+([\d.:]+)\s*-\s*([\d.:+]+)/);
          if (!m) return null;
          return { route: m[1].trim(), flightNo: m[2].trim(), departure: m[3].replace('.', ':'), arrival: m[4].replace('+1','').replace('.', ':'), airline: detailAirline || '' };
        }).filter(Boolean);
      })();

  return {
    id: tour.id,
    slug: tour.slug,
    code: tour.tourCode || '',
    title: tour.tourName || '',
    supplier: { id: supplier?.canonicalName || '', name: supplier?.displayName || '' },
    country: normalizeCountry(dest?.country || ''),
    city: dest?.city || '',
    duration: { days: tour.durationDays || 0, nights: tour.durationNights || 0 },
    images: (images || []).length > 0 ? images!.map(i => i.imageUrl) : [defaultImg],
    price: { starting: startingPrice },
    status: tour.status || 'PUBLISHED',
    summary: tour.supplierBookingNote || '',
    highlights: detailHighlights.length > 0 ? detailHighlights : extractHighlightsFromTitle(tour.tourName || ''),
    flight: { airline: detailAirline || 'ตามโปรแกรมทัวร์', details: 'อ้างอิงจากรายละเอียดทัวร์' },
    flights: flightInfo,
    hotel: { name: 'โรงแรมมาตรฐาน', rating: 3, details: 'ตามโปรแกรมทัวร์' },
    meals: 'ดูรายละเอียดในโปรแกรม',
    included: (included || []).map(i => i.description),
    excluded: (excluded || []).map(e => e.description),
    policies: {
      payment: policies?.find(p => p.policyType === 'PAYMENT')?.description || 'ตามเงื่อนไขบริษัท',
      cancellation: policies?.find(p => p.policyType === 'CANCELLATION')?.description || 'ตามเงื่อนไขบริษัท',
    },
    pdfUrl: detailPdfUrl || undefined,
    itinerary: (itineraries || []).map(it => ({
      day: it.dayNumber,
      title: it.title || `วันที่ ${it.dayNumber}`,
      description: it.description || '',
      meals: {
        breakfast: mealsByDay[it.dayNumber]?.has('BREAKFAST') || false,
        lunch: mealsByDay[it.dayNumber]?.has('LUNCH') || false,
        dinner: mealsByDay[it.dayNumber]?.has('DINNER') || false,
      },
    })),
    departures: activeDeps,
    deal: {
      type: dealType,
      daysLeft: dealDaysLeft,
      currentPrice: nearestDep ? Number(nearestDep.priceAdult || 0) : 0,
      minPrice: minDealPrice,
      maxPrice: maxDealPrice,
      discountPercent,
    },
  };
}

// ─── Available Countries ────────────────────────────────────────────

export async function getAvailableCountries(): Promise<{ country: string; tourCount: number }[]> {
  const sb = getSupabaseAdmin();
  
  // Get all destinations for published tours
  const { data } = await sb
    .from('tour_destinations')
    .select('country, "tourId"');

  if (!data?.length) return [];

  // Get published tour IDs
  const { data: publishedTours } = await sb
    .from('tours')
    .select('id')
    .eq('status', 'PUBLISHED');

  const publishedIds = new Set((publishedTours || []).map(t => t.id));

  // Count by NORMALIZED country
  const countMap: Record<string, number> = {};
  data.forEach(d => {
    if (d.country && publishedIds.has(d.tourId)) {
      const normalized = normalizeCountry(d.country);
      countMap[normalized] = (countMap[normalized] || 0) + 1;
    }
  });

  return Object.entries(countMap)
    .map(([country, tourCount]) => ({ country, tourCount }))
    .sort((a, b) => b.tourCount - a.tourCount);
}
