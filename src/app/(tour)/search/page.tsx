export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import SearchClient from './SearchClient';

export const metadata = {
  title: 'ค้นหาทัวร์ | Jongtour',
  description: 'ค้นหาโปรแกรมทัวร์ต่างประเทศจากทุก Wholesale เปรียบเทียบราคา ตาราง เส้นทาง',
};

type FormattedTour = {
  id: string; slug: string; code: string; title: string; supplier: string;
  country: string; city: string; durationDays: number; durationNights: number;
  nextDeparture: string; price: number; availableSeats: number;
};

/** Fallback: fetch tours via Supabase REST API when Prisma DB connection fails */
async function fetchToursViaREST(keyword: string): Promise<FormattedTour[]> {
  try {
    const sb = getSupabaseAdmin();

    // Step 1: Get tours with supplier info
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
      console.error('Supabase REST tours error:', error);
      return [];
    }

    const tourIds = tours.map((t: any) => t.id);
    const supplierIds = [...new Set(tours.map((t: any) => t.supplierId))];

    // Step 2: Get suppliers
    const { data: suppliers } = await sb
      .from('suppliers')
      .select('id, "canonicalName"')
      .in('id', supplierIds);

    const supplierMap: Record<string, string> = {};
    (suppliers || []).forEach((s: any) => { supplierMap[s.id] = s.canonicalName; });

    // Step 3: Get destinations
    const { data: destinations } = await sb
      .from('tour_destinations')
      .select('"tourId", country, city')
      .in('tourId', tourIds);

    const destMap: Record<string, { country: string; city: string }> = {};
    (destinations || []).forEach((d: any) => {
      if (!destMap[d.tourId]) destMap[d.tourId] = { country: d.country || '', city: d.city || '' };
    });

    // Step 4: Get next departure + price for each tour  
    const now = new Date().toISOString();
    const { data: departures } = await sb
      .from('departures')
      .select('id, "tourId", "startDate", "remainingSeats"')
      .in('tourId', tourIds)
      .gte('startDate', now)
      .order('startDate', { ascending: true });

    // Group departures by tourId — take first (soonest)
    const depMap: Record<string, any> = {};
    (departures || []).forEach((d: any) => {
      if (!depMap[d.tourId]) depMap[d.tourId] = d;
    });

    // Step 5: Get prices for those departures
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

    return tours.map((t: any) => {
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
  } catch (e) {
    console.error('REST fallback failed:', e);
    return [];
  }
}

export default async function TourSearchPage({ searchParams }: { searchParams: { q?: string } }) {
  const keyword = searchParams.q || '';
  let formattedTours: FormattedTour[] = [];

  try {
    // Primary: Prisma direct DB connection
    const tours = await prisma.tour.findMany({
      where: {
        status: 'PUBLISHED',
        ...(keyword ? {
          OR: [
            { tourName: { contains: keyword, mode: 'insensitive' as const } },
            { destinations: { some: { country: { contains: keyword, mode: 'insensitive' as const } } } },
          ]
        } : {})
      },
      include: {
        supplier: true,
        destinations: true,
        departures: {
          where: { startDate: { gte: new Date() } },
          orderBy: { startDate: 'asc' },
          take: 1,
          include: { prices: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    formattedTours = tours.map(t => {
      const nextDep = t.departures[0];
      const price = nextDep?.prices[0]?.sellingPrice || 0;
      return {
        id: t.id,
        slug: t.slug,
        code: t.tourCode,
        title: t.tourName,
        supplier: t.supplier.canonicalName,
        country: t.destinations[0]?.country || '',
        city: t.destinations[0]?.city || '',
        durationDays: t.durationDays,
        durationNights: t.durationNights,
        nextDeparture: nextDep ? nextDep.startDate.toLocaleDateString('th-TH') : 'N/A',
        price: Number(price),
        availableSeats: nextDep?.remainingSeats || 0,
      };
    });
  } catch (_e) {
    // Prisma failed — fallback to Supabase REST API
    console.warn('Prisma DB unavailable, falling back to Supabase REST API');
    formattedTours = await fetchToursViaREST(keyword);
  }

  return <SearchClient initialTours={formattedTours} />;
}
