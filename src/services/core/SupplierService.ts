/**
 * SupplierService - Wholesale partner management, data sync, and mapping
 */
import { prisma } from '@/lib/prisma';

const slugify = (value: string) =>
  String(value || '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 100);

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
      where: { status: 'ACTIVE' },
      include: {
        _count: { select: { tours: true } },
      },
      orderBy: { displayName: 'asc' },
    });
  }

  /** Get supplier sync status */
  static async getSyncStatus() {
    const suppliers = await prisma.supplier.findMany({
      where: { status: 'ACTIVE' },
      select: {
        id: true,
        displayName: true,
        canonicalName: true,
        _count: { select: { tours: true } },
        syncLogs: {
          select: { startedAt: true, status: true },
          orderBy: { startedAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { displayName: 'asc' },
    });

    return suppliers.map((s) => {
      const lastSync = s.syncLogs[0]?.startedAt ?? null;
      return {
        id: s.id,
        name: s.displayName,
        slug: s.canonicalName,
        lastSync,
        lastSyncStatus: s.syncLogs[0]?.status ?? null,
        tourCount: s._count.tours,
        isStale: lastSync ? Date.now() - lastSync.getTime() > 24 * 60 * 60 * 1000 : true,
      };
    });
  }

  /** Map raw wholesale data to tour schema */
  static mapRawTourData(rawData: any, supplierId: string) {
    const code = String(rawData?.code || rawData?.tour_code || rawData?.id || '').trim();
    const name = String(rawData?.name || rawData?.title || rawData?.tour_name || '').trim();
    const safeCode = code || `RAW-${Date.now()}`;

    return {
      supplierId,
      externalTourId: String(rawData?.externalTourId || rawData?.external_tour_id || safeCode),
      tourCode: safeCode,
      tourName: name || safeCode,
      slug: slugify(name || safeCode),
      durationDays: Number(rawData?.days || rawData?.duration_days || 1),
      durationNights: Number(rawData?.nights || rawData?.duration_nights || 0),
      status: 'DRAFT' as const,
      sourceType: 'API' as const,
      sourceUrl: rawData?.sourceUrl || rawData?.url || null,
      bookingUrl: rawData?.bookingUrl || rawData?.booking_url || null,
    };
  }

  /** Upsert tour from wholesale data */
  static async upsertFromWholesale(supplierId: string, rawData: any) {
    const mapped = this.mapRawTourData(rawData, supplierId);

    const existing = await prisma.tour.findFirst({
      where: {
        supplierId,
        OR: [{ externalTourId: mapped.externalTourId }, { tourCode: mapped.tourCode }],
      },
    });

    if (existing) {
      return prisma.tour.update({
        where: { id: existing.id },
        data: {
          externalTourId: mapped.externalTourId,
          tourCode: mapped.tourCode,
          tourName: mapped.tourName,
          slug: mapped.slug || existing.slug,
          durationDays: Number.isFinite(mapped.durationDays) && mapped.durationDays > 0 ? mapped.durationDays : existing.durationDays,
          durationNights:
            Number.isFinite(mapped.durationNights) && mapped.durationNights >= 0 ? mapped.durationNights : existing.durationNights,
          sourceUrl: mapped.sourceUrl,
          bookingUrl: mapped.bookingUrl,
          sourceType: mapped.sourceType,
          status: existing.status,
          updatedAt: new Date(),
        },
      });
    }

    return prisma.tour.create({ data: mapped });
  }

  /** Get supplier tour count stats */
  static async getStats() {
    const suppliers = await prisma.supplier.findMany({
      where: { status: 'ACTIVE' },
      include: { _count: { select: { tours: true } } },
    });

    return {
      totalSuppliers: suppliers.length,
      totalTours: suppliers.reduce((s, sup) => s + sup._count.tours, 0),
      suppliers: suppliers.map((s) => ({ name: s.displayName, tours: s._count.tours })),
    };
  }
}
