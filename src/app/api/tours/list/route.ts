import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const keyword = searchParams.get('q') || '';

  try {
    const sb = getSupabaseAdmin();

    let query = sb
      .from('tours')
      .select('id, slug, "tourCode", "tourName", "durationDays", "durationNights", "supplierId"')
      .eq('status', 'PUBLISHED')
      .order('createdAt', { ascending: false })
      .limit(50);

    if (keyword) {
      query = query.ilike('tourName', `%${keyword}%`);
    }

    const { data: tours, error } = await query;
    if (error || !tours || tours.length === 0) {
      return NextResponse.json({ tours: [], error: error?.message || 'No tours' });
    }

    const tourIds = tours.map((t: any) => t.id);
    const supplierIds = [...new Set(tours.map((t: any) => t.supplierId))];

    // Get suppliers
    const { data: suppliers } = await sb.from('suppliers').select('id, "canonicalName"').in('id', supplierIds);
    const supplierMap: Record<string, string> = {};
    (suppliers || []).forEach((s: any) => { supplierMap[s.id] = s.canonicalName; });

    // Get destinations
    const { data: destinations } = await sb.from('tour_destinations').select('"tourId", country, city').in('tourId', tourIds);
    const destMap: Record<string, { country: string; city: string }> = {};
    (destinations || []).forEach((d: any) => {
      if (!destMap[d.tourId]) destMap[d.tourId] = { country: d.country || '', city: d.city || '' };
    });

    // Get departures
    const now = new Date().toISOString();
    const { data: departures } = await sb
      .from('departures')
      .select('id, "tourId", "startDate", "remainingSeats"')
      .in('tourId', tourIds)
      .gte('startDate', now)
      .order('startDate', { ascending: true });

    const depMap: Record<string, any> = {};
    (departures || []).forEach((d: any) => { if (!depMap[d.tourId]) depMap[d.tourId] = d; });

    // Get prices
    const depIds = Object.values(depMap).map((d: any) => d.id);
    const { data: prices } = depIds.length > 0
      ? await sb.from('prices').select('"departureId", "sellingPrice"').in('departureId', depIds)
      : { data: [] };

    const priceMap: Record<string, number> = {};
    (prices || []).forEach((p: any) => {
      if (!priceMap[p.departureId] || p.sellingPrice < priceMap[p.departureId]) {
        priceMap[p.departureId] = p.sellingPrice;
      }
    });

    const formatted = tours.map((t: any) => {
      const dep = depMap[t.id];
      const dest = destMap[t.id];
      const price = dep ? (priceMap[dep.id] || 0) : 0;
      return {
        id: t.id,
        slug: t.slug || '',
        code: t.tourCode || '',
        title: t.tourName || '',
        supplier: supplierMap[t.supplierId] || '',
        country: dest?.country || '',
        city: dest?.city || '',
        durationDays: t.durationDays || 0,
        durationNights: t.durationNights || 0,
        nextDeparture: dep ? new Date(dep.startDate).toLocaleDateString('th-TH') : 'N/A',
        price: Number(price),
        availableSeats: dep?.remainingSeats || 0,
      };
    });

    return NextResponse.json({ tours: formatted });
  } catch (e: any) {
    console.error('API tours error:', e);
    return NextResponse.json({ tours: [], error: e.message }, { status: 500 });
  }
}
