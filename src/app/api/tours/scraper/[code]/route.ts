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

  // Parse duration
  const durMatch = data.duration?.match(/(\d+)\s*วัน\s*(\d+)?/);
  const durationDays = durMatch ? parseInt(durMatch[1]) : 0;
  const durationNights = durMatch && durMatch[2] ? parseInt(durMatch[2]) : Math.max(0, durationDays - 1);

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
    price: data.price_from || 0,
    imageUrl: data.cover_image_url || '',
    sourceUrl: data.source_url || '',
    pdfUrl: data.pdf_url || '',
    deposit: data.deposit || 0,
    hotelRating: data.hotel_rating || 0,
    highlights: data.highlights || [],
    lastScraped: data.last_scraped_at || '',
  };

  return NextResponse.json({ tour });
}
