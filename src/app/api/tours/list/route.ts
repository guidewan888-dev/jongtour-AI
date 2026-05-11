import { NextResponse } from 'next/server';
import { getTourList } from '@/services/tour.service';
import { createClient } from '@/utils/supabase/server';
import { mapWholesaleTour, mapScraperTour, toCardProps, type ScraperRawTour } from '@/lib/mappers/tour';

// Normalize legacy site names in the DB to canonical names
const SITE_ALIAS_MAP: Record<string, string> = {
  oneworldtour: 'worldconnection',
  'one-world-tour': 'worldconnection',
  onetour: 'worldconnection',
};

const CURRENT_YEAR = new Date().getUTCFullYear();
const MIN_REASONABLE_YEAR = CURRENT_YEAR - 2;
const MAX_REASONABLE_YEAR = CURRENT_YEAR + 5;

const toIsoDate = (value: any): string | null => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const rawYear = date.getUTCFullYear();
  const yearCandidates = Array.from(new Set([
    rawYear,
    rawYear - 543,
    rawYear + 543,
    rawYear + 500,
    rawYear - 500,
    rawYear - 3800,
    rawYear - 4343,
  ]));
  const validYears = yearCandidates.filter((year) => year >= MIN_REASONABLE_YEAR && year <= MAX_REASONABLE_YEAR);
  if (validYears.length === 0) return null;
  const chosenYear = validYears.sort((a, b) => Math.abs(a - CURRENT_YEAR) - Math.abs(b - CURRENT_YEAR))[0];
  const normalized = new Date(date);
  normalized.setUTCFullYear(chosenYear);
  return normalized.toISOString().slice(0, 10);
};

const normalizeStatus = (status: any): 'AVAILABLE' | 'FULL' | 'CANCELLED' => {
  const lower = String(status || '').toLowerCase();
  if (!lower) return 'AVAILABLE';
  if (lower.includes('cancel')) return 'CANCELLED';
  if (lower.includes('close') || lower.includes('full') || lower.includes('เต็ม')) return 'FULL';
  return 'AVAILABLE';
};

const isFuturePeriod = (period: any, today: string) => {
  const startDate = toIsoDate(period.start_date);
  return !startDate || startDate >= today;
};

const isPeriodBookable = (period: any) => {
  const seatsLeft = period.seats_left === null || period.seats_left === undefined ? null : Number(period.seats_left);
  const status = normalizeStatus(period.status);
  return status === 'AVAILABLE' && (seatsLeft === null || seatsLeft > 0);
};

const getMinPositivePrice = (periods: any[]) =>
  periods
    .map((period: any) => Number(period.price || 0))
    .filter((price: number) => price > 0)
    .sort((a: number, b: number) => a - b)[0];

const chunkArray = <T>(items: T[], chunkSize: number): T[][] => {
  if (chunkSize <= 0) return [items];
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += chunkSize) {
    chunks.push(items.slice(index, index + chunkSize));
  }
  return chunks;
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Simple in-memory cache to avoid repeated DB queries (60s TTL)
const apiCache = new Map<string, { data: any; ts: number }>();
const CACHE_TTL = 60_000; // 60 seconds

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get('q') || undefined;
    const country = searchParams.get('country') || undefined;
    const limit = parseInt(searchParams.get('limit') || '1000', 10);
    const safeLimit = Number.isFinite(limit) ? Math.max(1, Math.min(limit, 3000)) : 1000;

    // Check cache
    const cacheKey = `${keyword || ''}|${country || ''}|${safeLimit}`;
    const cached = apiCache.get(cacheKey);
    if (cached && Date.now() - cached.ts < CACHE_TTL) {
      return NextResponse.json(cached.data, {
        headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
      });
    }

    // 1. Existing wholesale tours → map through central mapper
    const rawWholesale = await getTourList({ keyword, country, limit: safeLimit });
    const wholesaleTours = rawWholesale.map(t => toCardProps(mapWholesaleTour(t)));

    // 2. Scraper tours → map through central mapper
    const rawScraper = await getScraperTours({ keyword, country, limit: safeLimit });
    const scraperTours = rawScraper.map(t => toCardProps(mapScraperTour(t)));

    // 3. Merge: wholesale first, then scraper
    const tours = [...wholesaleTours, ...scraperTours];
    const result = { tours };

    // Store in cache
    apiCache.set(cacheKey, { data: result, ts: Date.now() });
    // Evict old entries
    if (apiCache.size > 100) {
      const oldest = [...apiCache.entries()].sort((a, b) => a[1].ts - b[1].ts)[0];
      apiCache.delete(oldest[0]);
    }

    return NextResponse.json(result, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
    });
  } catch (e: any) {
    console.error('[API /tours/list]', e.message);
    return NextResponse.json({ tours: [], error: e.message }, { status: 500 });
  }
}

/**
 * Fetch raw scraper tours from scraper_tours table
 */
async function getScraperTours(options: {
  keyword?: string;
  country?: string;
  limit?: number;
}): Promise<ScraperRawTour[]> {
  try {
    const supabase = createClient();
    const today = new Date().toISOString().slice(0, 10);
    let query = supabase
      .from('scraper_tours')
      .select('id, site, tour_code, title, country, duration, price_from, airline, cover_image_url, source_url, pdf_url, deposit, hotel_rating, highlights')
      .eq('is_active', true)
      .not('source_url', 'like', '%twitter.com%')
      .order('last_scraped_at', { ascending: false })
      .limit(options.limit || 500);

    if (options.country) {
      query = query.ilike('country', `%${options.country}%`);
    }
    if (options.keyword) {
      query = query.ilike('title', `%${options.keyword}%`);
    }

    const { data, error } = await query;
    if (error || !data) return [];

    const normalizeSite = (rawSite: string | null | undefined) =>
      SITE_ALIAS_MAP[rawSite || ''] || rawSite || '';

    const tourIds = data.map((tour: any) => tour.id);
    if (tourIds.length === 0) return [];

    const idChunks = chunkArray(tourIds, 200);
    const periodRows: any[] = [];
    const imageRows: any[] = [];

    for (const idChunk of idChunks) {
      const [periodsRes, imagesRes] = await Promise.all([
        supabase
          .from('scraper_tour_periods')
          .select('tour_id, start_date, price, seats_left, status')
          .in('tour_id', idChunk)
          .order('start_date', { ascending: true }),
        supabase
          .from('scraper_tour_images')
          .select('tour_id, public_url, original_url, sort_order, id')
          .in('tour_id', idChunk)
          .order('sort_order', { ascending: true })
          .order('id', { ascending: true }),
      ]);

      if (periodsRes.error) throw periodsRes.error;
      if (imagesRes.error) throw imagesRes.error;

      periodRows.push(...(periodsRes.data || []));
      imageRows.push(...(imagesRes.data || []));
    }

    const periodsByTour: Record<number, any[]> = {};
    periodRows.forEach((period: any) => {
      if (!periodsByTour[period.tour_id]) periodsByTour[period.tour_id] = [];
      periodsByTour[period.tour_id].push(period);
    });

    const fallbackImageMap: Record<number, string> = {};
    imageRows.forEach((img: any) => {
      if (fallbackImageMap[img.tour_id]) return;
      const fallbackUrl = (typeof img.public_url === 'string' && img.public_url.trim().length > 0)
        ? img.public_url.trim()
        : (typeof img.original_url === 'string' && img.original_url.trim().length > 0)
          ? img.original_url.trim()
          : '';
      if (fallbackUrl) fallbackImageMap[img.tour_id] = fallbackUrl;
    });

    const isPeriodBookable = (period: any) => {
      const seatsLeft = period.seats_left === null || period.seats_left === undefined ? null : Number(period.seats_left);
      const status = String(period.status || '').toLowerCase();
      const notFull = status !== 'full' && status !== 'close' && status !== 'closed' && status !== 'cancelled';
      return notFull && (seatsLeft === null || seatsLeft > 0);
    };

    // ── Apply price fallback, smart deposit, and site name normalization ──
    return data
      .map((t: any) => {
      const allPeriods = periodsByTour[t.id] || [];
      const futurePeriods = allPeriods.filter((period: any) => isFuturePeriod(period, today));
      if (futurePeriods.length === 0) return null;

      const availablePeriods = futurePeriods.filter(isPeriodBookable);
      const minFuturePrice = getMinPositivePrice(availablePeriods) || getMinPositivePrice(futurePeriods);

      if ((!t.price_from || t.price_from <= 0) && minFuturePrice) {
        t.price_from = minFuturePrice;
      }

      // Keep only verified deposit from source data.
      // If missing, detail API will try PDF fallback + persist update.
      if (!t.deposit || t.deposit <= 0) {
        t.deposit = 0;
      }

      // Normalize legacy site names
      t.site = normalizeSite(t.site);

      // Image fallback from scraper_tour_images
      if (!t.cover_image_url && fallbackImageMap[t.id]) {
        t.cover_image_url = fallbackImageMap[t.id];
      }

      return t as ScraperRawTour;
    })
    .filter(Boolean) as ScraperRawTour[];
  } catch (e) {
    console.error('[Scraper tours fetch]', e);
    return [];
  }
}
