import { NextResponse } from 'next/server';
import { getTourList } from '@/services/tour.service';
import { createClient } from '@/utils/supabase/server';
import { mapWholesaleTour, mapScraperTour, toCardProps, type ScraperRawTour } from '@/lib/mappers/tour';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * GET /api/tours/list?q=keyword&country=จีน&limit=50
 * Returns published tours from BOTH wholesale DB + scraper_tours.
 * All data goes through the centralized Tour Mapper for consistent schema.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get('q') || undefined;
    const country = searchParams.get('country') || undefined;
    const limit = parseInt(searchParams.get('limit') || '1000', 10);

    // 1. Existing wholesale tours → map through central mapper
    const rawWholesale = await getTourList({ keyword, country, limit });
    const wholesaleTours = rawWholesale.map(t => toCardProps(mapWholesaleTour(t)));

    // 2. Scraper tours → map through central mapper
    const rawScraper = await getScraperTours({ keyword, country, limit: 500 });
    const scraperTours = rawScraper.map(t => toCardProps(mapScraperTour(t)));

    // 3. Merge: wholesale first, then scraper
    const tours = [...wholesaleTours, ...scraperTours];

    return NextResponse.json({ tours }, {
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

    return data as ScraperRawTour[];
  } catch (e) {
    console.error('[Scraper tours fetch]', e);
    return [];
  }
}
