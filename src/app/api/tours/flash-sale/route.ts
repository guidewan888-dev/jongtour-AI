import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

/**
 * GET /api/tours/flash-sale
 * Returns ONLY fire-sale / discounted tours from all wholesalers (API + scraper),
 * grouped by wholesaler.
 */
export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const FIRE_SALE_DAYS = 21;
    const LOOKAHEAD_DAYS = 365;
    const DISCOUNT_RATIO = 0.88; // current/min price <= 88% of max in same tour
    const MAX_PER_SUPPLIER = 12;
    const now = new Date();
    const fromDateTime = now.toISOString();
    const toDateTime = new Date(now.getTime() + LOOKAHEAD_DAYS * 86400000).toISOString();
    const fromDate = fromDateTime.split('T')[0];
    const toDate = toDateTime.split('T')[0];

    const toDayDiff = (dateStr?: string | null) => {
      if (!dateStr) return null;
      const diff = Math.ceil((new Date(dateStr).getTime() - now.getTime()) / 86400000);
      return Math.max(0, diff);
    };

    // ─── 1) API wholesalers (tours + departures + prices) ───
    const { data: apiDepartures } = await supabase
      .from('departures')
      .select('id, tourId, supplierId, startDate, remainingSeats, status')
      .gte('startDate', fromDateTime)
      .lte('startDate', toDateTime)
      .gt('remainingSeats', 0)
      .order('startDate', { ascending: true })
      .limit(5000);

    const departureIds = [...new Set((apiDepartures || []).map((d: any) => d.id))];
    const apiTourIds = [...new Set((apiDepartures || []).map((d: any) => d.tourId))];

    const [apiPricesRes, apiToursRes, apiImagesRes, apiDestinationsRes, suppliersRes] = await Promise.all([
      departureIds.length > 0
        ? supabase
            .from('prices')
            .select('departureId, paxType, sellingPrice')
            .in('departureId', departureIds)
            .eq('paxType', 'ADULT')
        : Promise.resolve({ data: [] as any[] }),
      apiTourIds.length > 0
        ? supabase
            .from('tours')
            .select('id, tourCode, tourName, slug, status, supplierId')
            .in('id', apiTourIds)
            .eq('status', 'PUBLISHED')
        : Promise.resolve({ data: [] as any[] }),
      apiTourIds.length > 0
        ? supabase
            .from('tour_images')
            .select('tourId, imageUrl, isCover')
            .in('tourId', apiTourIds)
        : Promise.resolve({ data: [] as any[] }),
      apiTourIds.length > 0
        ? supabase
            .from('tour_destinations')
            .select('tourId, country')
            .in('tourId', apiTourIds)
        : Promise.resolve({ data: [] as any[] }),
      supabase.from('suppliers').select('id, displayName'),
    ]);

    const departurePriceMap: Record<string, number> = {};
    (apiPricesRes.data || []).forEach((p: any) => {
      const val = Number(p.sellingPrice || 0);
      if (val <= 0) return;
      if (!departurePriceMap[p.departureId] || val < departurePriceMap[p.departureId]) {
        departurePriceMap[p.departureId] = val;
      }
    });

    const supplierNameMap: Record<string, string> = {};
    (suppliersRes.data || []).forEach((s: any) => {
      supplierNameMap[s.id] = s.displayName || s.id;
    });

    const firstImageMap: Record<string, string> = {};
    (apiImagesRes.data || []).forEach((img: any) => {
      const url = (img.imageUrl || '').trim();
      if (!url) return;
      if (!firstImageMap[img.tourId] || img.isCover === true) {
        firstImageMap[img.tourId] = url;
      }
    });

    const countryMap: Record<string, string> = {};
    (apiDestinationsRes.data || []).forEach((d: any) => {
      if (!countryMap[d.tourId] && d.country) countryMap[d.tourId] = d.country;
    });

    const departuresByTour: Record<string, any[]> = {};
    (apiDepartures || []).forEach((d: any) => {
      const price = departurePriceMap[d.id] || 0;
      if (price <= 0) return;
      if (!departuresByTour[d.tourId]) departuresByTour[d.tourId] = [];
      departuresByTour[d.tourId].push({ ...d, price });
    });
    Object.values(departuresByTour).forEach((arr: any[]) => arr.sort((a, b) => String(a.startDate).localeCompare(String(b.startDate))));

    const apiTourRows = apiToursRes.data || [];
    const apiFlash = apiTourRows.flatMap((tour: any) => {
      const deps = departuresByTour[tour.id] || [];
      if (deps.length === 0) return [];

      const nearest = deps[0];
      const daysLeft = toDayDiff(nearest.startDate);
      const prices = deps.map((d: any) => Number(d.price || 0)).filter((p: number) => p > 0);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);

      const isFireSale = daysLeft !== null && daysLeft <= FIRE_SALE_DAYS;
      const isDiscount = prices.length >= 2 && minPrice <= maxPrice * DISCOUNT_RATIO;
      if (!isFireSale && !isDiscount) return [];
      const dealType: 'fire' | 'discount' = isFireSale ? 'fire' : 'discount';

      return [{
        id: tour.id,
        code: tour.tourCode,
        title: tour.tourName,
        country: countryMap[tour.id] || '',
        image: firstImageMap[tour.id] || null,
        supplier: supplierNameMap[tour.supplierId] || tour.supplierId,
        type: 'api',
        price: nearest.price,
        departureDate: nearest.startDate || null,
        availableSeats: Number(nearest.remainingSeats || 0),
        totalDepartures: deps.length,
        dealType,
        pdfUrl: undefined,
        link: `/tour/${tour.slug || String(tour.tourCode || '').toLowerCase()}`,
      }];
    });

    // ─── 2) Scraper wholesalers (scraper_tours + scraper_tour_periods) ───
    const { data: scraperTours } = await supabase
      .from('scraper_tours')
      .select('id, site, tour_code, title, country, price_from, cover_image_url, pdf_url, is_active')
      .eq('is_active', true)
      .gt('price_from', 0)
      .order('last_scraped_at', { ascending: false })
      .limit(2000);

    const scraperIds = [...new Set((scraperTours || []).map((t: any) => t.id))];
    const { data: scraperPeriods } = scraperIds.length > 0
      ? await supabase
          .from('scraper_tour_periods')
          .select('tour_id, start_date, price, seats_left, status')
          .in('tour_id', scraperIds)
          .gte('start_date', fromDate)
          .lte('start_date', toDate)
          .order('start_date', { ascending: true })
      : { data: [] as any[] };

    const { data: scraperFallbackImages } = await supabase
      .from('scraper_tour_images')
      .select('tour_id, public_url, original_url, sort_order, id')
      .in('tour_id', scraperIds.length > 0 ? scraperIds : [-1 as any])
      .order('sort_order', { ascending: true })
      .order('id', { ascending: true });

    const scraperImageMap: Record<number, string> = {};
    (scraperFallbackImages || []).forEach((img: any) => {
      if (scraperImageMap[img.tour_id]) return;
      const candidate = (img.public_url || img.original_url || '').trim();
      if (candidate) scraperImageMap[img.tour_id] = candidate;
    });

    const periodsByTour: Record<number, any[]> = {};
    (scraperPeriods || []).forEach((p: any) => {
      if (!periodsByTour[p.tour_id]) periodsByTour[p.tour_id] = [];
      periodsByTour[p.tour_id].push(p);
    });

    const SITE_ALIAS_MAP: Record<string, string> = {
      oneworldtour: 'worldconnection',
      'one-world-tour': 'worldconnection',
      onetour: 'worldconnection',
    };
    const SITE_LABELS: Record<string, string> = {
      worldconnection: 'World Connection',
      itravels: 'iTravels Center',
      bestintl: 'Best International',
      gs25: 'GS25 Travel',
      go365: 'Go365 Travel',
    };

    const scraperFlash = (scraperTours || []).flatMap((tour: any) => {
      const site = SITE_ALIAS_MAP[tour.site] || tour.site || '';
      const periods = (periodsByTour[tour.id] || []).filter((p: any) => {
        const seatsLeft = p.seats_left === null || p.seats_left === undefined ? null : Number(p.seats_left);
        const status = String(p.status || '').toLowerCase();
        const notFull = status !== 'full' && status !== 'close' && status !== 'closed';
        return notFull && (seatsLeft === null || seatsLeft > 0);
      });

      if (periods.length === 0) return [];

      const nearest = periods[0];
      const daysLeft = toDayDiff(nearest.start_date);
      const periodPrices = periods.map((p: any) => Number(p.price || 0)).filter((p: number) => p > 0);
      const minPrice = periodPrices.length > 0 ? Math.min(...periodPrices) : Number(tour.price_from || 0);
      const maxPrice = periodPrices.length > 0 ? Math.max(...periodPrices) : Number(tour.price_from || 0);
      const displayPrice = Number(nearest.price || minPrice || tour.price_from || 0);

      if (displayPrice <= 0) return [];

      const isFireSale = daysLeft !== null && daysLeft <= FIRE_SALE_DAYS;
      const isDiscount = periodPrices.length >= 2 && minPrice <= maxPrice * DISCOUNT_RATIO;
      if (!isFireSale && !isDiscount) return [];
      const dealType: 'fire' | 'discount' = isFireSale ? 'fire' : 'discount';

      const seats = nearest.seats_left === null || nearest.seats_left === undefined ? null : Number(nearest.seats_left);

      return [{
        id: `scraper-${tour.id}`,
        code: tour.tour_code,
        title: tour.title,
        country: tour.country || '',
        image: tour.cover_image_url || scraperImageMap[tour.id] || null,
        supplier: SITE_LABELS[site] || site,
        type: 'scraper',
        price: displayPrice,
        departureDate: nearest.start_date || null,
        availableSeats: seats,
        totalDepartures: periods.length,
        dealType,
        pdfUrl: tour.pdf_url || undefined,
        link: `/tour/s/${String(tour.tour_code || '').toLowerCase()}`,
      }];
    });

    // ─── 3) Combine + group by supplier ───
    const allDeals = [...apiFlash, ...scraperFlash]
      .sort((a, b) => (a.departureDate || '9999-12-31').localeCompare(b.departureDate || '9999-12-31'));

    const grouped: Record<string, any[]> = {};
    allDeals.forEach((deal) => {
      if (!grouped[deal.supplier]) grouped[deal.supplier] = [];
      if (grouped[deal.supplier].length < MAX_PER_SUPPLIER) {
        grouped[deal.supplier].push(deal);
      }
    });

    const suppliers = Object.keys(grouped).sort((a, b) => {
      const ca = grouped[a]?.length || 0;
      const cb = grouped[b]?.length || 0;
      return cb - ca;
    });

    const fireCount = allDeals.filter((deal: any) => deal.dealType === 'fire').length;
    const discountCount = allDeals.filter((deal: any) => deal.dealType === 'discount').length;

    return NextResponse.json({
      flashSale: allDeals,
      grouped,
      suppliers,
      total: allDeals.length,
      fireCount,
      discountCount,
    });
  } catch (e: any) {
    console.error('[flash-sale API]', e.message);
    return NextResponse.json({ error: e.message, flashSale: [], grouped: {}, suppliers: [], total: 0, fireCount: 0, discountCount: 0 }, { status: 500 });
  }
}
