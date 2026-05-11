import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { mapScraperTour, toCardProps, type ScraperRawTour } from '@/lib/mappers/tour';

const SITE_ALIAS_MAP: Record<string, string> = {
  oneworldtour: 'worldconnection',
  'one-world-tour': 'worldconnection',
  onetour: 'worldconnection',
};

const normalizeSite = (rawSite: string | null | undefined) =>
  SITE_ALIAS_MAP[rawSite || ''] || rawSite || '';

const isPeriodBookable = (period: any) => {
  const seatsLeft = period.seats_left === null || period.seats_left === undefined ? null : Number(period.seats_left);
  const status = String(period.status || '').toLowerCase();
  const notFull = status !== 'full' && status !== 'close' && status !== 'closed' && status !== 'cancelled';
  return notFull && (seatsLeft === null || seatsLeft > 0);
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const site = searchParams.get('site') || '';
  const limit = Math.min(parseInt(searchParams.get('limit') || '500', 10), 1000);
  const today = new Date().toISOString().slice(0, 10);

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

  query = query.not('source_url', 'like', '%twitter.com%');
  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const tours = data || [];
  const tourIds = tours.map((tour: any) => tour.id);
  if (tourIds.length === 0) {
    return NextResponse.json({ tours: [], total: 0 });
  }

  const [periodsRes, imagesRes] = await Promise.all([
    supabase
      .from('scraper_tour_periods')
      .select('tour_id, start_date, price, seats_left, status')
      .in('tour_id', tourIds)
      .gte('start_date', today)
      .order('start_date', { ascending: true }),
    supabase
      .from('scraper_tour_images')
      .select('tour_id, public_url, original_url, sort_order, id')
      .in('tour_id', tourIds)
      .order('sort_order', { ascending: true })
      .order('id', { ascending: true }),
  ]);

  const periodsByTour: Record<number, any[]> = {};
  (periodsRes.data || []).forEach((period: any) => {
    if (!periodsByTour[period.tour_id]) periodsByTour[period.tour_id] = [];
    periodsByTour[period.tour_id].push(period);
  });

  const fallbackImageMap: Record<number, string> = {};
  (imagesRes.data || []).forEach((img: any) => {
    if (fallbackImageMap[img.tour_id]) return;
    const fallbackUrl = (typeof img.public_url === 'string' && img.public_url.trim().length > 0)
      ? img.public_url.trim()
      : (typeof img.original_url === 'string' && img.original_url.trim().length > 0)
        ? img.original_url.trim()
        : '';
    if (fallbackUrl) fallbackImageMap[img.tour_id] = fallbackUrl;
  });

  const normalized = tours
    .map((tour: any) => {
      const futurePeriods = periodsByTour[tour.id] || [];
      const availablePeriods = futurePeriods.filter(isPeriodBookable);
      if (availablePeriods.length === 0) return null;

      const minFuturePrice = availablePeriods
        .map((period: any) => Number(period.price || 0))
        .filter((price: number) => price > 0)
        .sort((a: number, b: number) => a - b)[0];

      const draft: any = { ...tour };
      draft.site = normalizeSite(draft.site);

      if ((!draft.price_from || draft.price_from <= 0) && minFuturePrice) {
        draft.price_from = minFuturePrice;
      }

      if (!draft.deposit || draft.deposit <= 0) {
        const price = Number(draft.price_from || 0);
        if (price > 0) {
          if (price < 20000) draft.deposit = 5000;
          else if (price < 50000) draft.deposit = 10000;
          else if (price < 100000) draft.deposit = 15000;
          else draft.deposit = 20000;
        } else {
          draft.deposit = 10000;
        }
      }

      if (!draft.cover_image_url && fallbackImageMap[draft.id]) {
        draft.cover_image_url = fallbackImageMap[draft.id];
      }

      return draft as ScraperRawTour;
    })
    .filter(Boolean) as ScraperRawTour[];

  const mappedTours = normalized.map((tour) => toCardProps(mapScraperTour(tour)));
  return NextResponse.json({ tours: mappedTours, total: mappedTours.length });
}
