/**
 * SupplierService — Wholesale partner management, data sync, and mapping
 */
import { prisma } from '@/lib/prisma';

export class SupplierService {

  /** Get supplier by ID */
  static async getSupplier(supplierId: string) {
    return prisma.supplier.findUnique({
      where: { id: supplierId },
      include: {
        _count: { select: { tours: true } },
      },
    });
  }

  /** List all active suppliers */
  static async listSuppliers() {
    return prisma.supplier.findMany({
      where: { isActive: true },
      include: {
        _count: { select: { tours: true } },
      },
      orderBy: { displayName: 'asc' },
    });
  }

  /** Get supplier sync status */
  static async getSyncStatus() {
    const suppliers = await prisma.supplier.findMany({
      where: { isActive: true },
      select: {
        id: true,
        displayName: true,
        canonicalName: true,
        lastSyncAt: true,
        _count: { select: { tours: true } },
      },
      orderBy: { lastSyncAt: 'desc' },
    });

    return suppliers.map(s => ({
      id: s.id,
      name: s.displayName,
      slug: s.canonicalName,
      lastSync: s.lastSyncAt,
      tourCount: s._count.tours,
      isStale: s.lastSyncAt ? (Date.now() - s.lastSyncAt.getTime()) > 24 * 60 * 60 * 1000 : true,
    }));
  }

  /** Map raw wholesale data to our schema */
  static mapRawTourData(rawData: any, supplierId: string) {
    return {
      tourCode: rawData.code || rawData.tour_code || rawData.id || '',
      tourName: rawData.name || rawData.title || rawData.tour_name || '',
      slug: (rawData.name || rawData.title || '')
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9ก-๙\-]/g, '')
        .substring(0, 100),
      supplierId,
      durationDays: rawData.days || rawData.duration_days || 0,
      durationNights: rawData.nights || rawData.duration_nights || 0,
      description: rawData.description || rawData.detail || '',
      highlights: rawData.highlights || [],
      inclusions: rawData.inclusions || rawData.included || [],
      exclusions: rawData.exclusions || rawData.excluded || [],
      status: 'DRAFT',
    };
  }

  /** Upsert tour from wholesale data */
  static async upsertFromWholesale(supplierId: string, rawData: any) {
    const mapped = this.mapRawTourData(rawData, supplierId);

    const existing = await prisma.tour.findFirst({
      where: { tourCode: mapped.tourCode, supplierId },
    });

    if (existing) {
      return prisma.tour.update({
        where: { id: existing.id },
        data: { ...mapped, updatedAt: new Date() },
      });
    }

    return prisma.tour.create({ data: mapped });
  }

  /** Get supplier tour count stats */
  static async getStats() {
    const suppliers = await prisma.supplier.findMany({
      where: { isActive: true },
      include: { _count: { select: { tours: true } } },
    });

    return {
      totalSuppliers: suppliers.length,
      totalTours: suppliers.reduce((s, sup) => s + sup._count.tours, 0),
      suppliers: suppliers.map(s => ({ name: s.displayName, tours: s._count.tours })),
    };
  }
}
