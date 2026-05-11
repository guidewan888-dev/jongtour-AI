import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { resolveAndPersistScraperDeposit } from '@/lib/depositResolver';

const SITE_ALIAS_MAP: Record<string, string> = {
  oneworldtour: 'worldconnection',
  'one-world-tour': 'worldconnection',
  onetour: 'worldconnection',
};

const FIRE_SALE_DAYS = 21;
const DISCOUNT_RATIO = 0.88;

const JUNK_PERIOD_PATTERNS = /^(วันที่เดินทาง|วันเดินทาง|ผู้ใหญ่|พักเดี่ยว|พักสาม|เด็ก|ทารก|\(พัก|มีเตียง|ไม่มีเตียง|Infant|Child|Twin|Single|Double|Triple)/i;
const HAS_DATE = /(\d{1,2}\s*)?(ม\.?ค|ก\.?พ|มี\.?ค|เม\.?ย|พ\.?ค|มิ\.?ย|ก\.?ค|ส\.?ค|ก\.?ย|ต\.?ค|พ\.?ย|ธ\.?ค)/i;
const IS_PURE_NUMBER = /^\d[\d,]*$/;
const JUNK_HIGHLIGHT_PATTERNS = /(โปรแกรมทัวร์|ออสเตรเลีย-นิวซีแลนด์|เรือสำราญ|ทัวร์โปรโมชั่น|โปรแกรม.*ทัวร์|^ทัวร์\w+$|One World|www\.|http|@|\.com|\.co\.th|โทร|สายด่วน|เมนู|หน้าหลัก|ติดต่อเรา|เกี่ยวกับเรา)/i;

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

export async function GET(
  _req: NextRequest,
  { params }: { params: { code: string } }
) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('scraper_tours')
    .select('*')
    .ilike('tour_code', params.code)
    .limit(1)
    .single();

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
    .filter((p: any) => {
      if (p.start_date && p.end_date) return true;
      if (!p.raw_text) return false;
      const raw = p.raw_text.trim();
      if (JUNK_PERIOD_PATTERNS.test(raw)) return false;
      if (IS_PURE_NUMBER.test(raw.replace(/,/g, ''))) return false;
      return HAS_DATE.test(raw);
    })
    .map((p: any) => {
      const startDate = toIsoDate(p.start_date);
      const endDate = toIsoDate(p.end_date);
      const adultPrice = asNumber(p.price || p.price_adult || p.priceAdult);
      const childPrice = asNumber(p.price_child || p.priceChild || p.Price_Child) || adultPrice;
      const singlePrice = asNumber(p.price_single || p.priceSingle || p.price_single_room_add || p.priceSingleRoomAdd || p.Price_Single_Bed);
      const deposit = asNumber(p.deposit || p.Deposit || data.deposit);
      const totalSeats = asNumber(p.total_seats || p.totalSeats || p.seat || p.Seat || p.group || p.GroupSize);
      const booked = asNumber(p.booked || p.Book || p.join);
      const seatsLeftRaw = p.seats_left === null || p.seats_left === undefined ? null : asNumber(p.seats_left);
      const remainingSeats = seatsLeftRaw !== null ? seatsLeftRaw : (totalSeats > 0 ? Math.max(totalSeats - booked, 0) : null);
      const status = normalizeStatus(p.status || p.PeriodStatus);
      const isFuture = !startDate || startDate >= today;
      const isBookable = status === 'AVAILABLE' && (remainingSeats === null || remainingSeats > 0);

      return {
        id: p.id,
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
        rawText: p.raw_text || '',
      };
    })
    .filter((p: any) => p.isFuture)
    .sort((a: any, b: any) => String(a.startDate || '9999-12-31').localeCompare(String(b.startDate || '9999-12-31')));

  const availablePeriods = cleanPeriods.filter((p: any) => p.isBookable);
  const pricedAvailable = availablePeriods.filter((p: any) => asNumber(p.priceAdult) > 0);
  const nearest = pricedAvailable[0] || availablePeriods[0] || cleanPeriods[0] || null;
  const periodPrices = pricedAvailable.map((p: any) => asNumber(p.priceAdult)).filter((n: number) => n > 0);
  const minPrice = periodPrices.length > 0 ? Math.min(...periodPrices) : asNumber(data.price_from);
  const maxPrice = periodPrices.length > 0 ? Math.max(...periodPrices) : asNumber(data.price_from);
  const displayPrice = asNumber(nearest?.priceAdult || minPrice || data.price_from);
  const daysLeft = nearest?.startDate ? Math.max(0, Math.ceil((new Date(nearest.startDate).getTime() - Date.now()) / 86400000)) : null;
  const isFireSale = daysLeft !== null && daysLeft <= FIRE_SALE_DAYS;
  const isDiscount = periodPrices.length >= 2 && minPrice > 0 && maxPrice > 0 && minPrice <= maxPrice * DISCOUNT_RATIO;
  const dealType: 'fire' | 'discount' | null = isFireSale ? 'fire' : isDiscount ? 'discount' : null;
  const discountPercent = maxPrice > 0 && minPrice > 0 ? Math.max(0, Math.round(((maxPrice - minPrice) / maxPrice) * 100)) : 0;

  const durMatch = data.duration?.match(/(\d+)\s*วัน\s*(\d+)?/);
  const durationDays = durMatch ? parseInt(durMatch[1]) : 0;
  const durationNights = durMatch && durMatch[2] ? parseInt(durMatch[2]) : Math.max(0, durationDays - 1);

  const cleanHighlights = Array.isArray(data.highlights)
    ? data.highlights.filter((h: string) =>
        h && h.length > 2 && h.length < 500 && !JUNK_HIGHLIGHT_PATTERNS.test(h)
      ).slice(0, 12)
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

    deposit = await resolveAndPersistScraperDeposit({
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
    duration: data.duration || '',
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
}
