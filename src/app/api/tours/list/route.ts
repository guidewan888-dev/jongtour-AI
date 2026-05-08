import { NextResponse } from 'next/server';
import { getTourList } from '@/services/tour.service';
import { createClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * GET /api/tours/list?q=keyword&country=จีน&limit=50
 * Returns published tours from BOTH wholesale DB + scraper_tours.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get('q') || undefined;
    const country = searchParams.get('country') || undefined;
    const limit = parseInt(searchParams.get('limit') || '1000', 10);

    // 1. Existing wholesale tours
    const wholesaleTours = await getTourList({ keyword, country, limit });

    // 2. Scraper tours (OWT + iTravels)
    const scraperTours = await getScraperTours({ keyword, country, limit: 500 });

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
 * Fetch scraper tours from scraper_tours table, formatted like TourListItem
 */
async function getScraperTours(options: {
  keyword?: string;
  country?: string;
  limit?: number;
}) {
  try {
    const supabase = createClient();
    let query = supabase
      .from('scraper_tours')
      .select('id, site, tour_code, title, country, duration, price_from, airline, cover_image_url, source_url, pdf_url, deposit, hotel_rating, highlights')
      .eq('is_active', true)
      .not('source_url', 'like', '%twitter.com%')
      .order('last_scraped_at', { ascending: false })
      .limit(options.limit || 500);

    // Filter by country (Thai name match)
    if (options.country) {
      query = query.ilike('country', `%${options.country}%`);
    }

    // Filter by keyword in title
    if (options.keyword) {
      query = query.ilike('title', `%${options.keyword}%`);
    }

    const { data, error } = await query;
    if (error || !data) return [];

    return data.map(t => {
      const durMatch = t.duration?.match(/(\d+)\s*วัน\s*(\d+)?/);
      const durationDays = durMatch ? parseInt(durMatch[1]) : 0;
      const durationNights = durMatch && durMatch[2] ? parseInt(durMatch[2]) : Math.max(0, durationDays - 1);

      // Map site name to display name
      const supplierName = t.site === 'oneworldtour' ? 'oneworldtour'
        : t.site === 'itravels' ? 'itravels'
        : t.site === 'bestintl' ? 'bestintl'
        : t.site === 'gs25' ? 'gs25' : t.site || '';

      return {
        id: `scraper-${t.id}`,
        slug: t.tour_code?.toLowerCase() || '',
        code: t.tour_code || '',
        title: t.title || '',
        supplier: supplierName,
        country: t.country || '',
        city: '',
        durationDays,
        durationNights,
        duration: t.duration || '',
        nextDeparture: 'N/A',
        price: t.price_from || 0,
        availableSeats: 0,
        imageUrl: t.cover_image_url || '',
        airline: t.airline || '',
        sourceUrl: t.source_url || '',
        pdfUrl: t.pdf_url || '',
        deposit: t.deposit || 0,
        hotelRating: t.hotel_rating || 0,
        highlights: t.highlights || [],
      };
    });
  } catch (e) {
    console.error('[Scraper tours fetch]', e);
    return [];
  }
}
