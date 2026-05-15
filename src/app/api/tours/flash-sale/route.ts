import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

const FIRE_SALE_DAYS = 21;
const LOOKAHEAD_DAYS = 365;
const DISCOUNT_RATIO = 0.88;
const MAX_PER_SUPPLIER = 12;

const toNum = (value: any): number => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

const isDepartureBookable = (departure: any, seatAvailable: number | null) => {
  const status = String(departure.status || '').toUpperCase();
  if (status === 'CANCELLED' || status === 'FULL') return false;
  if (seatAvailable !== null && seatAvailable <= 0) return false;
  return true;
};

const toDayDiff = (now: Date, dateStr?: string | null) => {
  if (!dateStr) return null;
  const dt = new Date(`${dateStr}T00:00:00.000Z`);
  if (Number.isNaN(dt.getTime())) return null;
  const diff = Math.ceil((dt.getTime() - now.getTime()) / 86400000);
  return Math.max(0, diff);
};

/**
 * GET /api/tours/flash-sale
 * Central-only flash-sale from canonical schema.
 */
export async function GET() {
  try {
    const sb = getSupabaseAdmin();
    const now = new Date();
    const fromDate = now.toISOString().slice(0, 10);
    const toDate = new Date(now.getTime() + LOOKAHEAD_DAYS * 86400000).toISOString().slice(0, 10);

    const [toursRes, departuresRes, wholesalersRes] = await Promise.all([
      sb
        .from('canonical_tours')
        .select('id, slug, title, country, city')
        .eq('is_published', true)
        .order('updated_at', { ascending: false })
        .limit(5000),
      sb
        .from('tour_departures')
        .select('id, canonical_tour_id, wholesale_id, departure_date, status')
        .gte('departure_date', fromDate)
        .lte('departure_date', toDate)
        .limit(20000),
      sb.from('wholesalers').select('id, name, source_type').eq('is_active', true),
    ]);

    const tours = toursRes.data || [];
    const departures = departuresRes.data || [];
    if (tours.length === 0 || departures.length === 0) {
      return NextResponse.json({ flashSale: [], grouped: {}, suppliers: [], total: 0, fireCount: 0, discountCount: 0 });
    }

    const tourIds = Array.from(new Set(tours.map((tour: any) => String(tour.id)).filter(Boolean)));
    const departureIds = Array.from(new Set(departures.map((departure: any) => String(departure.id)).filter(Boolean)));

    const [mappingsRes, pricesRes, seatsRes, pdfsRes] = await Promise.all([
      sb
        .from('wholesale_tour_mappings')
        .select('canonical_tour_id, wholesale_id, source_tour_code')
        .in('canonical_tour_id', tourIds),
      sb
        .from('tour_prices')
        .select('departure_id, adult_price')
        .eq('price_type', 'central')
        .in('departure_id', departureIds),
      sb.from('tour_seats').select('departure_id, seat_available').in('departure_id', departureIds),
      sb
        .from('tour_pdfs')
        .select('canonical_tour_id, wholesale_id, departure_id, pdf_url, is_active')
        .eq('is_active', true)
        .in('canonical_tour_id', tourIds),
    ]);

    const tourById: Record<string, any> = {};
    tours.forEach((tour: any) => {
      tourById[String(tour.id)] = tour;
    });

    const wholesalerMap: Record<string, { name: string; sourceType: 'api' | 'scraper' }> = {};
    (wholesalersRes.data || []).forEach((row: any) => {
      wholesalerMap[String(row.id)] = {
        name: String(row.name || row.id),
        sourceType: String(row.source_type || 'api') === 'scraper' ? 'scraper' : 'api',
      };
    });

    const mappingCodeByKey: Record<string, string> = {};
    (mappingsRes.data || []).forEach((mapping: any) => {
      const key = `${mapping.canonical_tour_id}::${mapping.wholesale_id}`;
      if (!mappingCodeByKey[key]) mappingCodeByKey[key] = String(mapping.source_tour_code || '');
    });

    const priceByDeparture: Record<string, number> = {};
    (pricesRes.data || []).forEach((row: any) => {
      const depId = String(row.departure_id || '');
      const amount = toNum(row.adult_price);
      if (!depId || amount <= 0) return;
      if (!priceByDeparture[depId] || amount < priceByDeparture[depId]) {
        priceByDeparture[depId] = amount;
      }
    });

    const seatByDeparture: Record<string, number | null> = {};
    (seatsRes.data || []).forEach((row: any) => {
      const depId = String(row.departure_id || '');
      if (!depId) return;
      const raw = row.seat_available;
      seatByDeparture[depId] = raw === null || raw === undefined ? null : toNum(raw);
    });

    const pdfByDeparture: Record<string, string> = {};
    const pdfByTourWholesale: Record<string, string> = {};
    (pdfsRes.data || []).forEach((row: any) => {
      const depId = String(row.departure_id || '');
      const groupKey = `${row.canonical_tour_id}::${row.wholesale_id}`;
      const pdfUrl = String(row.pdf_url || '').trim();
      if (!pdfUrl) return;
      if (depId && !pdfByDeparture[depId]) pdfByDeparture[depId] = pdfUrl;
      if (!pdfByTourWholesale[groupKey]) pdfByTourWholesale[groupKey] = pdfUrl;
    });

    type GroupedRow = {
      canonicalTourId: string;
      wholesaleId: string;
      departures: Array<{ departureDate: string | null; price: number; seatAvailable: number | null; departureId: string }>;
    };

    const groupMap: Record<string, GroupedRow> = {};
    for (const departure of departures) {
      const depId = String(departure.id || '');
      const canonicalTourId = String(departure.canonical_tour_id || '');
      const wholesaleId = String(departure.wholesale_id || '');
      if (!depId || !canonicalTourId || !wholesaleId) continue;
      if (!tourById[canonicalTourId]) continue;

      const price = priceByDeparture[depId] || 0;
      if (!(price > 0)) continue;

      const seatAvailable = Object.prototype.hasOwnProperty.call(seatByDeparture, depId)
        ? seatByDeparture[depId]
        : null;
      if (!isDepartureBookable(departure, seatAvailable)) continue;

      const key = `${canonicalTourId}::${wholesaleId}`;
      if (!groupMap[key]) {
        groupMap[key] = {
          canonicalTourId,
          wholesaleId,
          departures: [],
        };
      }
      groupMap[key].departures.push({
        departureDate: departure.departure_date || null,
        price,
        seatAvailable,
        departureId: depId,
      });
    }

    const deals = Object.values(groupMap).flatMap((group) => {
      const tour = tourById[group.canonicalTourId];
      if (!tour) return [];

      const departuresSorted = [...group.departures].sort((a, b) => String(a.departureDate || '').localeCompare(String(b.departureDate || '')));
      if (departuresSorted.length === 0) return [];

      const nearest = departuresSorted[0];
      const prices = departuresSorted.map((d) => d.price).filter((p) => p > 0);
      if (prices.length === 0) return [];

      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      const daysLeft = toDayDiff(now, nearest.departureDate);
      const isFireSale = daysLeft !== null && daysLeft <= FIRE_SALE_DAYS;
      const isDiscount = prices.length >= 2 && minPrice <= maxPrice * DISCOUNT_RATIO;
      if (!isFireSale && !isDiscount) return [];

      const wholesaler = wholesalerMap[group.wholesaleId];
      const supplierName = wholesaler?.name || group.wholesaleId;
      const sourceType = wholesaler?.sourceType || 'api';
      const mapKey = `${group.canonicalTourId}::${group.wholesaleId}`;

      return [{
        id: `${group.canonicalTourId}:${group.wholesaleId}`,
        code: mappingCodeByKey[mapKey] || '',
        title: String(tour.title || ''),
        country: String(tour.country || ''),
        image: null,
        supplier: supplierName,
        type: sourceType,
        price: nearest.price,
        departureDate: nearest.departureDate,
        availableSeats: nearest.seatAvailable,
        totalDepartures: departuresSorted.length,
        dealType: isFireSale ? 'fire' : 'discount',
        pdfUrl: pdfByDeparture[nearest.departureId] || pdfByTourWholesale[mapKey] || undefined,
        link: `/tour/${tour.slug}`,
      }];
    });

    const allDeals = deals.sort((a, b) => String(a.departureDate || '9999-12-31').localeCompare(String(b.departureDate || '9999-12-31')));

    const grouped: Record<string, any[]> = {};
    allDeals.forEach((deal) => {
      if (!grouped[deal.supplier]) grouped[deal.supplier] = [];
      if (grouped[deal.supplier].length < MAX_PER_SUPPLIER) {
        grouped[deal.supplier].push(deal);
      }
    });

    const suppliers = Object.keys(grouped).sort((a, b) => (grouped[b]?.length || 0) - (grouped[a]?.length || 0));
    const fireCount = allDeals.filter((deal) => deal.dealType === 'fire').length;
    const discountCount = allDeals.filter((deal) => deal.dealType === 'discount').length;

    return NextResponse.json({
      flashSale: allDeals,
      grouped,
      suppliers,
      total: allDeals.length,
      fireCount,
      discountCount,
    });
  } catch (error: any) {
    console.error('[flash-sale API]', error?.message || error);
    return NextResponse.json(
      { error: error?.message || 'flash-sale failed', flashSale: [], grouped: {}, suppliers: [], total: 0, fireCount: 0, discountCount: 0 },
      { status: 500 },
    );
  }
}
