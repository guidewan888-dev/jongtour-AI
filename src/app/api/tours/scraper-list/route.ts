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

const SITE_FILTER_ALIASES: Record<string, string[]> = {
  worldconnection: ['worldconnection', 'oneworldtour', 'one-world-tour', 'onetour'],
  itravels: ['itravels', 'itravel', 'i-travel'],
  bestintl: ['bestintl', 'bestinternational', 'bestin'],
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
    const aliases = SITE_FILTER_ALIASES[site] || [site];
    if (aliases.length === 1) {
      query = query.eq('site', aliases[0]);
    } else {
      query = query.in('site', aliases);
    }
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
      const allPeriods = periodsByTour[tour.id] || [];
      const futurePeriods = allPeriods.filter((period: any) => isFuturePeriod(period, today));
      if (futurePeriods.length === 0) return null;

      const availablePeriods = futurePeriods.filter(isPeriodBookable);
      const minFuturePrice = getMinPositivePrice(availablePeriods) || getMinPositivePrice(futurePeriods);

      const draft: any = { ...tour };
      draft.site = normalizeSite(draft.site);

      if ((!draft.price_from || draft.price_from <= 0) && minFuturePrice) {
        draft.price_from = minFuturePrice;
      }

      if (!draft.deposit || draft.deposit <= 0) {
        draft.deposit = 0;
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
