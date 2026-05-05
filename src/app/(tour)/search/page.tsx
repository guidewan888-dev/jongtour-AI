export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import SearchClient from './SearchClient';

export const metadata = {
  title: 'ค้นหาทัวร์ | Jongtour',
  description: 'ค้นหาโปรแกรมทัวร์ต่างประเทศจากทุก Wholesale เปรียบเทียบราคา ตาราง เส้นทาง',
};

export default async function TourSearchPage({ searchParams }: { searchParams: { q?: string } }) {
  const keyword = searchParams.q || '';

  let formattedTours: {
    id: string; slug: string; code: string; title: string; supplier: string;
    country: string; city: string; durationDays: number; durationNights: number;
    nextDeparture: string; price: number; availableSeats: number;
  }[] = [];

  try {
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
    // DB not available — show empty state
  }

  return <SearchClient initialTours={formattedTours} />;
}
