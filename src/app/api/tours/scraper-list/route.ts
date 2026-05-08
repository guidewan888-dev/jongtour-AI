import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

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

  // Filter by site
  if (site) {
    query = query.eq('site', site);
  }

  // Exclude twitter garbage rows
  query = query.not('source_url', 'like', '%twitter.com%');

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Map to Tour-compatible format
  const tours = (data || []).map((t) => {
    // Parse duration "X วัน Y คืน" or "X Days" 
    const durMatch = t.duration?.match(/(\d+)\s*วัน\s*(\d+)?/);
    const durationDays = durMatch ? parseInt(durMatch[1]) : 0;
    const durationNights = durMatch && durMatch[2] ? parseInt(durMatch[2]) : Math.max(0, durationDays - 1);

    return {
      id: `scraper-${t.id}`,
      slug: t.tour_code?.toLowerCase() || '',
      code: t.tour_code || '',
      title: t.title || '',
      supplier: t.site || '',
      country: t.country || '',
      city: '',
      durationDays,
      durationNights,
      duration: t.duration || '',
      nextDeparture: '',
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

  return NextResponse.json({ tours, total: tours.length });
}
