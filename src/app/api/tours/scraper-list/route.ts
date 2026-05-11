import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { mapScraperTour, toCardProps, type ScraperRawTour } from '@/lib/mappers/tour';

// Normalize legacy site names in the DB to canonical names
const SITE_ALIAS_MAP: Record<string, string> = {
  oneworldtour: 'worldconnection',
  'one-world-tour': 'worldconnection',
  onetour: 'worldconnection',
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const site = searchParams.get('site') || '';
  const limit = Math.min(parseInt(searchParams.get('limit') || '500', 10), 1000);

  const supabase = createClient();

  let query = supabase
    .from('scraper_tours')
    .select('id, site, tour_code, title, country, duration, price_from, airline, cover_image_url, source_url, is_active, pdf_url, deposit, hotel_rating, highlights')
    .eq('is_active', true)
    .order('last_scraped_at', { ascending: false })
    .limit(limit);

  if (site) {
    query = query.eq('site', site);
  }

  // Exclude garbage rows
  query = query.not('source_url', 'like', '%twitter.com%');

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const normalizeSite = (rawSite: string | null | undefined) =>
    SITE_ALIAS_MAP[rawSite || ''] || rawSite || '';

  // GS25 image fallback (bulk): cover_image_url -> first public_url -> first original_url
  const gs25MissingCoverIds = (data || [])
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

  // For tours with no price, try to get cheapest price from periods
  const toursWithNoPrice = (data || []).filter(t => !t.price_from || t.price_from <= 0);
  const tourIds = toursWithNoPrice.map(t => t.id);

  let periodPriceMap: Record<number, number> = {};
  if (tourIds.length > 0) {
    const { data: periods } = await supabase
      .from('scraper_tour_periods')
      .select('tour_id, price')
      .in('tour_id', tourIds)
      .gt('price', 0)
      .order('price', { ascending: true });

    if (periods) {
      periods.forEach(p => {
        if (!periodPriceMap[p.tour_id] || p.price < periodPriceMap[p.tour_id]) {
          periodPriceMap[p.tour_id] = p.price;
        }
      });
    }
  }

  // Map through central mapper → consistent schema
  const tours = (data || []).map((t: any) => {
    // Populate price from periods if main price is 0
    if ((!t.price_from || t.price_from <= 0) && periodPriceMap[t.id]) {
      t.price_from = periodPriceMap[t.id];
    }

    // Smart deposit calculation (same logic as detail API)
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

    // Normalize legacy site names (e.g. oneworldtour → worldconnection)
    t.site = normalizeSite(t.site);

    // GS25 image fallback from scraper_tour_images
    if (!t.cover_image_url && t.site.toLowerCase() === 'gs25' && fallbackImageMap[t.id]) {
      t.cover_image_url = fallbackImageMap[t.id];
    }

    const standardTour = mapScraperTour(t as ScraperRawTour);
    return toCardProps(standardTour);
  });

  return NextResponse.json({ tours, total: tours.length });
}
