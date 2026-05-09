import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

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

  // Fetch periods (travel dates) for this tour
  const { data: periods } = await supabase
    .from('scraper_tour_periods')
    .select('*')
    .eq('tour_id', data.id)
    .order('start_date', { ascending: true });

  // Parse duration
  const durMatch = data.duration?.match(/(\d+)\s*วัน\s*(\d+)?/);
  const durationDays = durMatch ? parseInt(durMatch[1]) : 0;
  const durationNights = durMatch && durMatch[2] ? parseInt(durMatch[2]) : Math.max(0, durationDays - 1);

  // ── Clean periods: filter out header/room-type garbage rows ──
  const JUNK_PERIOD_PATTERNS = /^(วันที่เดินทาง|วันเดินทาง|ผู้ใหญ่|พักเดี่ยว|พักสาม|เด็ก|ทารก|\(พัก|มีเตียง|ไม่มีเตียง|Infant|Child|Twin|Single|Double|Triple)/i;
  const HAS_DATE = /\d{1,2}\s*(ม\.?ค|ก\.?พ|มี\.?ค|เม\.?ย|พ\.?ค|มิ\.?ย|ก\.?ค|ส\.?ค|ก\.?ย|ต\.?ค|พ\.?ย|ธ\.?ค)/i;
  const IS_PURE_NUMBER = /^\d[\d,]*$/;

  const cleanPeriods = (periods || [])
    .filter(p => {
      // Must have structured dates OR raw text that contains a date
      if (p.start_date && p.end_date) return true;
      if (!p.raw_text) return false;
      const raw = p.raw_text.trim();
      // Skip junk header rows
      if (JUNK_PERIOD_PATTERNS.test(raw)) return false;
      // Skip pure numbers (bare prices showing as periods)
      if (IS_PURE_NUMBER.test(raw.replace(/,/g, ''))) return false;
      // Must contain a date pattern
      return HAS_DATE.test(raw);
    })
    .map(p => ({
      id: p.id,
      startDate: p.start_date,
      endDate: p.end_date,
      price: p.price,
      seatsLeft: p.seats_left,
      status: p.status,
      rawText: p.raw_text,
    }));

  // ── Clean highlights: filter out navigation/menu garbage ──
  const JUNK_HIGHLIGHT_PATTERNS = /(โปรแกรมทัวร์|ออสเตรเลีย-นิวซีแลนด์|เรือสำราญ|ทัวร์โปรโมชั่น|โปรแกรม.*ทัวร์|^ทัวร์\w+$|One World|www\.|http|@|\.com|\.co\.th|โทร|สายด่วน|เมนู|หน้าหลัก|ติดต่อเรา|เกี่ยวกับเรา)/i;
  const cleanHighlights = Array.isArray(data.highlights)
    ? data.highlights.filter((h: string) =>
        h && h.length > 2 && h.length < 100 && !JUNK_HIGHLIGHT_PATTERNS.test(h)
      ).slice(0, 8)
    : [];

  // ── Smart default deposit: if scraper didn't find มัดจำ, calculate from price ──
  let priceFrom = data.price_from || 0;
  // If main price is 0, try cheapest period price
  if (!priceFrom && cleanPeriods.length > 0) {
    const periodPrices = cleanPeriods.map(p => p.price).filter((p): p is number => !!p && p > 0);
    if (periodPrices.length > 0) priceFrom = Math.min(...periodPrices);
  }
  let deposit = data.deposit || 0;
  if (!deposit && priceFrom > 0) {
    if (priceFrom < 20000) deposit = 5000;
    else if (priceFrom < 50000) deposit = 10000;
    else if (priceFrom < 100000) deposit = 15000;
    else deposit = 20000;
  }
  // Last resort: if still no deposit (no price data at all), use industry default
  if (!deposit) deposit = 10000;

  const tour = {
    id: data.id,
    code: data.tour_code || '',
    title: data.title || '',
    site: data.site || '',
    country: data.country || '',
    duration: data.duration || '',
    durationDays,
    durationNights,
    airline: data.airline || '',
    price: priceFrom,
    imageUrl: data.cover_image_url || '',
    sourceUrl: data.source_url || '',
    pdfUrl: data.pdf_url || '',
    deposit,
    hotelRating: data.hotel_rating || 0,
    highlights: cleanHighlights,
    lastScraped: data.last_scraped_at || '',
    periods: cleanPeriods,
  };

  return NextResponse.json({ tour });
}
