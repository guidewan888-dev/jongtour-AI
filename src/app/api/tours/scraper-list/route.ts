import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { mapScraperTour, toCardProps, type ScraperRawTour } from '@/lib/mappers/tour';

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

  // Map through central mapper → consistent schema
  const tours = (data || []).map((t: any) => {
    const standardTour = mapScraperTour(t as ScraperRawTour);
    return toCardProps(standardTour);
  });

  return NextResponse.json({ tours, total: tours.length });
}
