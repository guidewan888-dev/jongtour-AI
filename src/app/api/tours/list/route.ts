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

    // Check cache
    const cacheKey = `${keyword || ''}|${country || ''}|${limit}`;
    const cached = apiCache.get(cacheKey);
    if (cached && Date.now() - cached.ts < CACHE_TTL) {
      return NextResponse.json(cached.data, {
        headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
      });
    }

    // 1. Existing wholesale tours → map through central mapper
    const rawWholesale = await getTourList({ keyword, country, limit });
    const wholesaleTours = rawWholesale.map(t => toCardProps(mapWholesaleTour(t)));

    // 2. Scraper tours → map through central mapper
    const rawScraper = await getScraperTours({ keyword, country, limit: 500 });
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

    // GS25 image fallback (bulk): cover_image_url -> first public_url -> first original_url
    const gs25MissingCoverIds = data
      .filter((t: any) => !t.cover_image_url && normalizeSite(t.site).toLowerCase() === 'gs25')
      .map((t: any) => t.id);

    const fallbackImageMap: Record<number, string> = {};
    if (gs25MissingCoverIds.length > 0) {
      const { data: fallbackImages } = await supabase
        .from('scraper_tour_images')
        .select('tour_id, public_url, original_url, sort_order, id')
        .in('tour_id', gs25MissingCoverIds)
        .order('sort_order', { ascending: true })
        .order('id', { ascending: true });

      for (const img of fallbackImages || []) {
        if (fallbackImageMap[img.tour_id]) continue;
        const fallbackUrl = (typeof img.public_url === 'string' && img.public_url.trim().length > 0)
          ? img.public_url.trim()
          : (typeof img.original_url === 'string' && img.original_url.trim().length > 0)
            ? img.original_url.trim()
            : '';
        if (fallbackUrl) fallbackImageMap[img.tour_id] = fallbackUrl;
      }
    }

    // ── Period price fallback for tours with price_from = 0 ──
    const toursWithNoPrice = data.filter((t: any) => !t.price_from || t.price_from <= 0);
    const tourIds = toursWithNoPrice.map((t: any) => t.id);
    let periodPriceMap: Record<number, number> = {};
    if (tourIds.length > 0) {
      const { data: periods } = await supabase
        .from('scraper_tour_periods')
        .select('tour_id, price')
        .in('tour_id', tourIds)
        .gt('price', 0)
        .order('price', { ascending: true });
      if (periods) {
        periods.forEach((p: any) => {
          if (!periodPriceMap[p.tour_id] || p.price < periodPriceMap[p.tour_id]) {
            periodPriceMap[p.tour_id] = p.price;
          }
        });
      }
    }

    // ── Apply price fallback, smart deposit, and site name normalization ──
    return data.map((t: any) => {
      // Period price fallback
      if ((!t.price_from || t.price_from <= 0) && periodPriceMap[t.id]) {
        t.price_from = periodPriceMap[t.id];
      }

      // Smart deposit calculation (same logic as scraper-list & detail API)
      if (!t.deposit || t.deposit <= 0) {
        const price = t.price_from || 0;
        if (price > 0) {
          if (price < 20000) t.deposit = 5000;
          else if (price < 50000) t.deposit = 10000;
          else if (price < 100000) t.deposit = 15000;
          else t.deposit = 20000;
        } else {
          t.deposit = 10000; // industry default
        }
      }

      // Normalize legacy site names
      t.site = normalizeSite(t.site);

      // GS25 image fallback from scraper_tour_images
      if (!t.cover_image_url && t.site.toLowerCase() === 'gs25' && fallbackImageMap[t.id]) {
        t.cover_image_url = fallbackImageMap[t.id];
      }

      return t as ScraperRawTour;
    });
  } catch (e) {
    console.error('[Scraper tours fetch]', e);
    return [];
  }
}
