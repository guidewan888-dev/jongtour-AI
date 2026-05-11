import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

/**
 * GET /api/tours/flash-sale
 * Returns tours that are departing soon (within 30 days) or have discounted prices
 * from ALL wholesalers — both API and scraper sources.
 */
export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const today = new Date().toISOString().split('T')[0];
    const thirtyDaysLater = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];

    // ─── 1. API-based tours with near departures ───
    // Get tours with departures in the next 30 days
    const { data: departures } = await supabase
      .from('departures')
      .select('tourId, departureDate, status, totalSeats, bookedSeats, adultPrice')
      .gte('departureDate', today)
      .lte('departureDate', thirtyDaysLater)
      .neq('status', 'CANCELLED')
      .order('departureDate', { ascending: true })
      .limit(200);

    const tourIds = [...new Set((departures || []).map(d => d.tourId))];

    let apiTours: any[] = [];
    if (tourIds.length > 0) {
      const { data: tours } = await supabase
        .from('tours')
        .select('id, tourCode, title, country, coverImage, supplierId, status')
        .in('id', tourIds)
        .eq('status', 'PUBLISHED')
        .limit(100);

      // Get supplier names
      const { data: suppliers } = await supabase
        .from('suppliers')
        .select('id, displayName');
      const supplierMap: Record<string, string> = {};
      (suppliers || []).forEach(s => { supplierMap[s.id] = s.displayName; });

      apiTours = (tours || []).map(t => {
        const deps = (departures || []).filter(d => d.tourId === t.id);
        const nextDep = deps[0];
        const availableSeats = nextDep ? (nextDep.totalSeats - nextDep.bookedSeats) : 0;
        return {
          id: t.id,
          code: t.tourCode,
          title: t.title,
          country: t.country,
          image: t.coverImage,
          supplier: supplierMap[t.supplierId] || t.supplierId,
          type: 'api',
          price: nextDep?.adultPrice || 0,
          departureDate: nextDep?.departureDate || null,
          availableSeats,
          totalDepartures: deps.length,
          link: `/tour/${t.tourCode?.toLowerCase()}`,
        };
      }).filter(t => t.availableSeats > 0 && t.price > 0);
    }

    // ─── 2. Scraper-based tours departing soon ───
    // Look for scraper tours that have departure dates within 30 days
    const { data: scraperTours } = await supabase
      .from('scraper_tours')
      .select('id, site, tour_code, title, country, price_from, cover_image_url, departure_dates, pdf_url, is_active')
      .eq('is_active', true)
      .gt('price_from', 0)
      .order('price_from', { ascending: true })
      .limit(500);

    const SITE_LABELS: Record<string, string> = {
      worldconnection: 'World Connection',
      itravels: 'iTravels Center',
      bestintl: 'Best International',
      gs25: 'GS25 Travel',
      go365: 'Go365 Travel',
    };

    const scraperFlash: any[] = [];
    (scraperTours || []).forEach(t => {
      // Parse departure_dates to find near departures
      let nearestDate: string | null = null;
      let departureDates: string[] = [];
      
      if (t.departure_dates) {
        if (Array.isArray(t.departure_dates)) {
          departureDates = t.departure_dates;
        } else if (typeof t.departure_dates === 'string') {
          departureDates = t.departure_dates.split(',').map((d: string) => d.trim());
        }
      }

      // Find departures within 30 days
      const nearDates = departureDates.filter(d => d >= today && d <= thirtyDaysLater);
      if (nearDates.length > 0) {
        nearestDate = nearDates[0];
      }

      // Include if: has near departure OR price is low (likely discounted)
      if (nearestDate || departureDates.length === 0) {
        scraperFlash.push({
          id: t.id,
          code: t.tour_code,
          title: t.title,
          country: t.country,
          image: t.cover_image_url,
          supplier: SITE_LABELS[t.site] || t.site,
          type: 'scraper',
          price: t.price_from,
          departureDate: nearestDate,
          availableSeats: null, // scrapers don't track seats
          totalDepartures: departureDates.length,
          pdfUrl: t.pdf_url,
          link: `/tour/s/${(t.tour_code || '').toLowerCase()}`,
        });
      }
    });

    // ─── 3. Combine and group by supplier ───
    const allTours = [...apiTours, ...scraperFlash]
      .sort((a, b) => (a.departureDate || '9999').localeCompare(b.departureDate || '9999'));

    // Group by supplier
    const grouped: Record<string, any[]> = {};
    allTours.forEach(t => {
      if (!grouped[t.supplier]) grouped[t.supplier] = [];
      // Limit per supplier to keep response manageable
      if (grouped[t.supplier].length < 8) {
        grouped[t.supplier].push(t);
      }
    });

    return NextResponse.json({
      flashSale: allTours.slice(0, 60),
      grouped,
      suppliers: Object.keys(grouped),
      total: allTours.length,
    });
  } catch (e: any) {
    console.error('[flash-sale API]', e.message);
    return NextResponse.json({ error: e.message, flashSale: [], grouped: {}, suppliers: [], total: 0 }, { status: 500 });
  }
}
