import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

const SITE_ALIAS_MAP: Record<string, string> = {
  oneworldtour: 'worldconnection',
  'one-world-tour': 'worldconnection',
  onetour: 'worldconnection',
  itravel: 'itravels',
  'i-travel': 'itravels',
  bestin: 'bestintl',
  bestinternational: 'bestintl',
};

const FIRE_SALE_DAYS = 21;
const DISCOUNT_RATIO = 0.88;

const CURRENT_YEAR = new Date().getUTCFullYear();
const MIN_REASONABLE_YEAR = CURRENT_YEAR - 2;
const MAX_REASONABLE_YEAR = CURRENT_YEAR + 5;

const JUNK_PERIOD_PATTERN = /(adult|child|single|double|triple|deposit|infant)/i;
const HAS_DATE_PATTERN = /(\d{1,2})[\/\-\.](\d{1,2})|(\d{4})/;
const IS_PURE_NUMBER = /^\d[\d,]*$/;

const toIsoDate = (value: any): string | null => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  const rawYear = date.getUTCFullYear();
  const yearCandidates = Array.from(
    new Set([
      rawYear,
      rawYear - 543,
      rawYear + 543,
      rawYear + 500,
      rawYear - 500,
      rawYear - 3800,
      rawYear - 4343,
    ]),
  );

  const validYears = yearCandidates.filter((year) => year >= MIN_REASONABLE_YEAR && year <= MAX_REASONABLE_YEAR);
  if (validYears.length === 0) return null;

  const chosenYear = validYears.sort((a, b) => Math.abs(a - CURRENT_YEAR) - Math.abs(b - CURRENT_YEAR))[0];
  const normalized = new Date(date);
  normalized.setUTCFullYear(chosenYear);
  return normalized.toISOString().slice(0, 10);
};

const asNumber = (value: any): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const normalizeStatus = (status: any): 'AVAILABLE' | 'FULL' | 'CANCELLED' => {
  const lower = String(status || '').toLowerCase();
  if (!lower) return 'AVAILABLE';
  if (lower.includes('cancel')) return 'CANCELLED';
  if (lower.includes('close') || lower.includes('full') || lower.includes('เต็ม')) return 'FULL';
  return 'AVAILABLE';
};

const isRealPeriodRow = (period: any) => {
  if (period.start_date && period.end_date) return true;
  const raw = String(period.raw_text || '').trim();
  if (!raw) return false;
  if (IS_PURE_NUMBER.test(raw.replace(/,/g, ''))) return false;
  if (JUNK_PERIOD_PATTERN.test(raw) && !HAS_DATE_PATTERN.test(raw)) return false;
  return HAS_DATE_PATTERN.test(raw);
};

const resolveScraperDepositSafe = async (params: {
  supabase: any;
  tourId: number;
  site: string;
  pdfUrl: string;
  currentDeposit?: number | null;
  priceFrom?: number | null;
  contextText?: string;
}): Promise<number> => {
  try {
    const moduleRef: any = await import('@/lib/depositResolver');
    const resolveFn =
      moduleRef?.resolveAndPersistScraperDeposit ||
      moduleRef?.default?.resolveAndPersistScraperDeposit;

    if (typeof resolveFn !== 'function') {
      return 0;
    }

    const resolved = await resolveFn(params);
    return asNumber(resolved);
  } catch (error) {
    console.error('[scraper detail] deposit resolver unavailable:', error);
    return 0;
  }
};

export async function GET(
  _req: NextRequest,
  { params }: { params: { code: string } },
) {
  try {
    const supabase = createClient();
    const code = decodeURIComponent(String(params.code || '')).trim();

    const { data: rows, error } = await supabase
      .from('scraper_tours')
      .select('*')
      .ilike('tour_code', code)
      .order('last_scraped_at', { ascending: false })
      .limit(1);

    const data = rows?.[0];
    if (error || !data) {
      return NextResponse.json({ error: 'ไม่พบทัวร์' }, { status: 404 });
    }

    const normalizedSite = SITE_ALIAS_MAP[data.site] || data.site || '';

    const { data: periods } = await supabase
      .from('scraper_tour_periods')
      .select('*')
      .eq('tour_id', data.id)
      .order('start_date', { ascending: true });

    let imageUrl = data.cover_image_url || '';
    if (!imageUrl) {
      const { data: fallbackImages } = await supabase
        .from('scraper_tour_images')
        .select('public_url, original_url, sort_order, id')
        .eq('tour_id', data.id)
        .order('sort_order', { ascending: true })
        .order('id', { ascending: true });

      if (fallbackImages && fallbackImages.length > 0) {
        const withPublicUrl = fallbackImages.find((img: any) => typeof img.public_url === 'string' && img.public_url.trim().length > 0);
        const withOriginalUrl = fallbackImages.find((img: any) => typeof img.original_url === 'string' && img.original_url.trim().length > 0);
        imageUrl = withPublicUrl?.public_url?.trim() || withOriginalUrl?.original_url?.trim() || '';
      }
    }

    const today = new Date().toISOString().slice(0, 10);
    const cleanPeriods = (periods || [])
      .filter(isRealPeriodRow)
      .map((period: any) => {
        const startDate = toIsoDate(period.start_date);
        const endDate = toIsoDate(period.end_date);
        const adultPrice = asNumber(period.price || period.price_adult || period.priceAdult);
        const childPrice = asNumber(period.price_child || period.priceChild || period.Price_Child) || adultPrice;
        const singlePrice = asNumber(period.price_single || period.priceSingle || period.price_single_room_add || period.priceSingleRoomAdd || period.Price_Single_Bed);
        const deposit = asNumber(period.deposit || period.Deposit || data.deposit);
        const totalSeats = asNumber(period.total_seats || period.totalSeats || period.seat || period.Seat || period.group || period.GroupSize);
        const booked = asNumber(period.booked || period.Book || period.join);
        const seatsLeftRaw = period.seats_left === null || period.seats_left === undefined ? null : asNumber(period.seats_left);
        const remainingSeats = seatsLeftRaw !== null ? seatsLeftRaw : (totalSeats > 0 ? Math.max(totalSeats - booked, 0) : null);
        const status = normalizeStatus(period.status || period.PeriodStatus);
        const isFuture = !startDate || startDate >= today;
        const isBookable = status === 'AVAILABLE' && (remainingSeats === null || remainingSeats > 0);

        return {
          id: period.id,
          startDate,
          endDate,
          price: adultPrice || null,
          priceAdult: adultPrice || null,
          priceChild: childPrice || null,
          priceSingle: singlePrice || null,
          deposit: deposit || 0,
          seatsLeft: remainingSeats,
          totalSeats: totalSeats || null,
          booked: booked || 0,
          remainingSeats,
          status,
          isFuture,
          isBookable,
          rawText: period.raw_text || '',
        };
      })
      .filter((period: any) => period.isFuture)
      .sort((a: any, b: any) => String(a.startDate || '9999-12-31').localeCompare(String(b.startDate || '9999-12-31')));

    const availablePeriods = cleanPeriods.filter((period: any) => period.isBookable);
    const pricedAvailable = availablePeriods.filter((period: any) => asNumber(period.priceAdult) > 0);
    const nearest = pricedAvailable[0] || availablePeriods[0] || cleanPeriods[0] || null;
    const periodPrices = pricedAvailable.map((period: any) => asNumber(period.priceAdult)).filter((price: number) => price > 0);
    const minPrice = periodPrices.length > 0 ? Math.min(...periodPrices) : asNumber(data.price_from);
    const maxPrice = periodPrices.length > 0 ? Math.max(...periodPrices) : asNumber(data.price_from);
    const displayPrice = asNumber(nearest?.priceAdult || minPrice || data.price_from);
    const daysLeft = nearest?.startDate ? Math.max(0, Math.ceil((new Date(nearest.startDate).getTime() - Date.now()) / 86400000)) : null;
    const isFireSale = daysLeft !== null && daysLeft <= FIRE_SALE_DAYS;
    const isDiscount = periodPrices.length >= 2 && minPrice > 0 && maxPrice > 0 && minPrice <= maxPrice * DISCOUNT_RATIO;
    const dealType: 'fire' | 'discount' | null = isFireSale ? 'fire' : isDiscount ? 'discount' : null;
    const discountPercent = maxPrice > 0 && minPrice > 0 ? Math.max(0, Math.round(((maxPrice - minPrice) / maxPrice) * 100)) : 0;

    const durationText = typeof data.duration === 'string' ? data.duration : '';
    const durMatch = durationText.match(/(\d+)\s*วัน\s*(\d+)?/);
    const durationDays = durMatch ? parseInt(durMatch[1], 10) : 0;
    const durationNights = durMatch && durMatch[2] ? parseInt(durMatch[2], 10) : Math.max(0, durationDays - 1);

    const cleanHighlights = Array.isArray(data.highlights)
      ? data.highlights
          .filter((highlight: any) => typeof highlight === 'string')
          .map((highlight: string) => highlight.trim())
          .filter((highlight: string) => highlight.length > 2 && highlight.length < 500)
          .slice(0, 12)
      : [];

    let priceFrom = asNumber(data.price_from);
    if (!priceFrom && minPrice > 0) {
      priceFrom = minPrice;
    }

    let deposit = asNumber(data.deposit);
    if (!deposit) {
      const textContext = [
        data.title || '',
        ...(Array.isArray(data.highlights) ? data.highlights : []),
        ...cleanPeriods.map((period: any) => period.rawText || ''),
      ].join('\n');

      deposit = await resolveScraperDepositSafe({
        supabase,
        tourId: data.id,
        site: normalizedSite,
        pdfUrl: data.pdf_url || '',
        currentDeposit: data.deposit,
        priceFrom,
        contextText: textContext,
      });
    }

    const tour = {
      id: data.id,
      code: data.tour_code || '',
      title: data.title || '',
      site: normalizedSite,
      country: data.country || '',
      duration: durationText,
      durationDays,
      durationNights,
      airline: data.airline || '',
      price: priceFrom,
      imageUrl,
      sourceUrl: data.source_url || '',
      pdfUrl: data.pdf_url || '',
      deposit,
      hotelRating: data.hotel_rating || 0,
      highlights: cleanHighlights,
      lastScraped: data.last_scraped_at || '',
      periods: cleanPeriods,
      deal: {
        type: dealType,
        daysLeft,
        currentPrice: displayPrice,
        minPrice,
        maxPrice,
        discountPercent,
      },
    };

    return NextResponse.json({ tour });
  } catch (error: any) {
    console.error('[scraper detail] failed:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการโหลดข้อมูลทัวร์' }, { status: 500 });
  }
}
