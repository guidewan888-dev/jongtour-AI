/**
 * TourService — Tour master data, search, filtering, and availability
 */
import { prisma } from '@/lib/prisma';

export class TourService {

  /** Get tour by slug (for detail page) */
  static async getTourBySlug(slug: string) {
    return prisma.tour.findFirst({
      where: { slug, status: 'PUBLISHED' },
      include: {
        images: { orderBy: { isCover: 'desc' } },
        departures: {
          where: { startDate: { gte: new Date() }, remainingSeats: { gt: 0 } },
          include: { prices: true },
          orderBy: { startDate: 'asc' },
          take: 10,
        },
        supplier: { select: { displayName: true, canonicalName: true } },
      },
    });
  }

  /** Search tours with complex filters */
  static async searchTours(filters: {
    country?: string; keyword?: string; minPrice?: number; maxPrice?: number;
    month?: number; year?: number; duration?: number; supplierId?: string;
    page?: number; limit?: number;
  }) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = { status: 'PUBLISHED' };

    if (filters.keyword) {
      where.OR = [
        { tourName: { contains: filters.keyword, mode: 'insensitive' } },
        { tourCode: { contains: filters.keyword, mode: 'insensitive' } },
      ];
    }

    if (filters.supplierId) where.supplierId = filters.supplierId;
    if (filters.duration) where.durationDays = filters.duration;

    const [tours, total] = await Promise.all([
      prisma.tour.findMany({
        where,
        include: {
          images: { where: { isCover: true }, take: 1 },
          departures: {
            where: {
              startDate: { gte: new Date() },
              remainingSeats: { gt: 0 },
              ...(filters.month && filters.year && {
                startDate: {
                  gte: new Date(filters.year, filters.month - 1, 1),
                  lt: new Date(filters.year, filters.month, 1),
                },
              }),
            },
            include: { prices: { where: { paxType: 'ADULT' }, take: 1 } },
            orderBy: { startDate: 'asc' },
            take: 3,
          },
          supplier: { select: { displayName: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.tour.count({ where }),
    ]);

    // Apply price filter post-query
    let filtered = tours;
    if (filters.minPrice || filters.maxPrice) {
      filtered = tours.filter(t => {
        const price = t.departures[0]?.prices[0]?.sellingPrice || 0;
        if (filters.minPrice && price < filters.minPrice) return false;
        if (filters.maxPrice && price > filters.maxPrice) return false;
        return true;
      });
    }

    return {
      tours: filtered.map(t => ({
        id: t.id,
        tourCode: t.tourCode,
        tourName: t.tourName,
        slug: t.slug,
        durationDays: t.durationDays,
        durationNights: t.durationNights,
        coverImage: t.images[0]?.imageUrl || null,
        supplier: t.supplier?.displayName || '',
        startingPrice: t.departures[0]?.prices[0]?.sellingPrice || null,
        nextDeparture: t.departures[0]?.startDate || null,
        remainingSeats: t.departures[0]?.remainingSeats || 0,
        departureCount: t.departures.length,
      })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  /** Get tours by country/region */
  static async getToursByCountry(country: string, limit = 20) {
    return prisma.tour.findMany({
      where: {
        status: 'PUBLISHED',
        OR: [
          { tourName: { contains: country, mode: 'insensitive' } },
          { tourCode: { startsWith: country.substring(0, 2).toUpperCase() } },
        ],
      },
      include: {
        images: { where: { isCover: true }, take: 1 },
        departures: {
          where: { startDate: { gte: new Date() }, remainingSeats: { gt: 0 } },
          include: { prices: { where: { paxType: 'ADULT' }, take: 1 } },
          take: 1,
          orderBy: { startDate: 'asc' },
        },
      },
      take: limit,
    });
  }

  /** Get fire sale / last minute tours */
  static async getFireSaleTours(daysAhead = 30, limit = 10) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() + daysAhead);

    return prisma.tour.findMany({
      where: {
        status: 'PUBLISHED',
        departures: {
          some: {
            startDate: { gte: new Date(), lte: cutoff },
            remainingSeats: { gt: 0 },
          },
        },
      },
      include: {
        images: { where: { isCover: true }, take: 1 },
        departures: {
          where: { startDate: { gte: new Date(), lte: cutoff }, remainingSeats: { gt: 0 } },
          include: { prices: true },
          orderBy: { startDate: 'asc' },
          take: 1,
        },
      },
      take: limit,
    });
  }

  /** Get tour count by status */
  static async getStats() {
    const [total, published, draft] = await Promise.all([
      prisma.tour.count(),
      prisma.tour.count({ where: { status: 'PUBLISHED' } }),
      prisma.tour.count({ where: { status: 'DRAFT' } }),
    ]);
    return { total, published, draft };
  }
}
