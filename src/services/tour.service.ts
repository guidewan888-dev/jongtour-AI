/**
 * Tour Data Service
 * 
 * Centralized data access layer for all tour-related queries.
 * Uses Supabase REST API via HTTPS — works even when direct DB (port 5432) is blocked.
 * 
 * All pages and API routes should use this service instead of direct Prisma queries.
 */

import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

// ─── Country Normalizer ─────────────────────────────────────────────
// Maps all raw DB country values → standardized Thai names for frontend display
// This handles mixed English/Thai + composite values from different wholesalers

const COUNTRY_NORMALIZE: Record<string, string> = {
  // English → Thai
  'JAPAN': 'ญี่ปุ่น',
  'CHINA': 'จีน',
  'VIETNAM': 'เวียดนาม',
  'TAIWAN': 'ไต้หวัน',
  'HONG KONG': 'ฮ่องกง',
  'INDIA': 'อินเดีย',
  'TURKIYE': 'ตุรกี',
  'TURKEY': 'ตุรกี',
  'EGYPT': 'อียิปต์',
  'GEORGIA': 'จอร์เจีย',
  'EUROPE': 'ยุโรป',
  'ITALY': 'ยุโรป',
  'FRANCE': 'ยุโรป',
  'ENGLAND': 'ยุโรป',
  'SINGAPORE': 'สิงคโปร์',
  // Thai duplicates
  'มาเก๊า': 'ฮ่องกง',
  'ภูฎาน': 'ภูฏาน',
  'สหรัฐอาหรับเอมิเรตส์': 'ดูไบ',
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
    status: string;
    remainingSeats: number;
  }[];
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
    .select('id, slug, "tourCode", "tourName", "durationDays", "durationNights", "supplierId"')
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
    const airline = payload.airline || payload.airlineName || payload.air || '';
    if (airline) {
      // Map by externalTourId since we can't join directly to tourId
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
    const normalizedSearch = normalizeCountry(country);
    const searchTerms = getCountrySearchTerms(normalizedSearch);
    
    const matchingTourIds = new Set(
      (destinations || [])
        .filter(d => {
          const rawCountry = (d.country || '').trim();
          const normalizedRaw = normalizeCountry(rawCountry);
          // Match by normalized name OR by search terms OR prefix match
          return normalizedRaw === normalizedSearch
            || searchTerms.some(term => rawCountry.toUpperCase() === term.toUpperCase())
            || rawCountry.startsWith(normalizedSearch);
        })
        .map(d => d.tourId)
    );
    filteredTours = tours.filter(t => matchingTourIds.has(t.id));
  }

  // 4. Get nearest departures
  const now = new Date().toISOString();
  const { data: departures } = await sb
    .from('departures')
    .select('id, "tourId", "startDate", "remainingSeats"')
    .in('tourId', tourIds)
    .gte('startDate', now)
    .order('startDate', { ascending: true });

  const depMap: Record<string, any> = {};
  (departures || []).forEach(d => {
    if (!depMap[d.tourId]) depMap[d.tourId] = d;
  });

  // 5. Get prices for nearest departures
  const depIds = Object.values(depMap).map((d: any) => d.id);
  const { data: prices } = depIds.length > 0
    ? await sb.from('prices').select('"departureId", "sellingPrice"').in('departureId', depIds)
    : { data: [] };

  const priceMap: Record<string, number> = {};
  (prices || []).forEach(p => {
    if (!priceMap[p.departureId] || p.sellingPrice < priceMap[p.departureId]) {
      priceMap[p.departureId] = p.sellingPrice;
    }
  });

  // Build externalTourId map for airline lookup
  const externalIdMap: Record<string, string> = {};
  (rawSources || []).forEach((rs: any) => {
    // Try to find tours matching this raw source
    tours.forEach(t => {
      const key = `${t.supplierId}_${rs.externalTourId}`;
      if (t.supplierId === rs.supplierId && airlineMap[key]) {
        // Match by tour code or name if possible
        const payload = rs.rawPayload;
        if (payload?.tourCode === t.tourCode || payload?.tour_code === t.tourCode) {
          externalIdMap[t.id] = airlineMap[key];
        }
      }
    });
  });

  // 6. Format results with normalized countries
  return filteredTours.map(t => {
    const dep = depMap[t.id];
    const dest = destMap[t.id];
    const price = dep ? (priceMap[dep.id] || 0) : 0;
    // Extract airline from tour title as fallback
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
      price: Number(price),
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
  // Match patterns like (TG), [TG], by TG, สายการบิน TG
  const match = title.match(/[\(\[](\w{2})[\)\]]/);
  if (match && AIRLINE_CODES[match[1]]) return AIRLINE_CODES[match[1]];
  // Check if any airline name appears in the title
  for (const [code, name] of Object.entries(AIRLINE_CODES)) {
    if (title.includes(code) && title.includes('บิน')) return name;
  }
  return '';
}

// ─── Tour Detail ────────────────────────────────────────────────────

export async function getTourBySlug(slug: string): Promise<TourDetailData | null> {
  const sb = getSupabaseAdmin();

  // 1. Get tour
  const { data: tours } = await sb
    .from('tours')
    .select('id, slug, "tourCode", "tourName", "durationDays", "durationNights", "supplierId", status, "supplierBookingNote"')
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
  ]);

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

  // 5. Calculate starting price
  const allPrices = (prices || []).map(p => p.sellingPrice).filter(p => p > 0);
  const startingPrice = allPrices.length > 0 ? Math.min(...allPrices) : 0;

  const dest = destinations?.[0];
  const defaultImg = 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1200';

  return {
    id: tour.id,
    slug: tour.slug,
    code: tour.tourCode || '',
    title: tour.tourName || '',
    supplier: {
      id: supplier?.canonicalName || '',
      name: supplier?.displayName || '',
    },
    country: normalizeCountry(dest?.country || ''),
    city: dest?.city || '',
    duration: { days: tour.durationDays || 0, nights: tour.durationNights || 0 },
    images: (images || []).length > 0 ? images!.map(i => i.imageUrl) : [defaultImg],
    price: { starting: startingPrice },
    status: tour.status || 'PUBLISHED',
    summary: tour.supplierBookingNote || '',
    highlights: [],
    flight: { airline: 'ตามโปรแกรมทัวร์', details: 'อ้างอิงจากรายละเอียดทัวร์' },
    hotel: { name: 'โรงแรมมาตรฐาน', rating: 3, details: 'ตามโปรแกรมทัวร์' },
    meals: 'ดูรายละเอียดในโปรแกรม',
    included: (included || []).map(i => i.description),
    excluded: (excluded || []).map(e => e.description),
    policies: {
      payment: policies?.find(p => p.policyType === 'PAYMENT')?.description || 'ตามเงื่อนไขบริษัท',
      cancellation: policies?.find(p => p.policyType === 'CANCELLATION')?.description || 'ตามเงื่อนไขบริษัท',
    },
    pdfUrl: pdfs?.[0]?.pdfUrl,
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
    departures: (departures || []).map(d => ({
      id: d.id,
      startDate: d.startDate,
      endDate: d.endDate,
      priceAdult: pricesByDep[d.id]?.ADULT || 0,
      priceChild: pricesByDep[d.id]?.CHILD || 0,
      priceSingle: pricesByDep[d.id]?.SINGLE_SUPP || 0,
      status: d.status || 'AVAILABLE',
      remainingSeats: d.remainingSeats || 0,
    })),
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
