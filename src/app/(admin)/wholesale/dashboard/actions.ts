'use server';

import { prisma } from '@/lib/prisma';

export async function getWholesaleDashboardData() {
  const suppliers = await prisma.supplier.findMany({
    include: {
      _count: { select: { tours: true } },
      syncLogs: {
        orderBy: { startedAt: 'desc' },
        take: 1,
        select: { startedAt: true, status: true, totalRecords: true },
      },
    },
  });

  const missingLinks = await prisma.tour.count({
    where: { bookingUrl: null },
  });

  const needReview = await prisma.tour.count({
    where: { status: 'DRAFT' },
  });

  // Sync errors in last 24h
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const syncErrors = await prisma.supplierSyncLog.count({
    where: { status: 'FAILED', startedAt: { gte: twentyFourHoursAgo } },
  });

  // Latest sync across all suppliers
  const latestSync = await prisma.supplierSyncLog.findFirst({
    orderBy: { startedAt: 'desc' },
    select: { startedAt: true },
  });

  const colors = ['blue', 'emerald', 'indigo', 'violet', 'orange', 'rose'];

  const mappedSuppliers = suppliers.map((sup) => {
    const colorIndex = sup.displayName.charCodeAt(0) % colors.length;
    const lastSync = sup.syncLogs[0];

    return {
      id: sup.id,
      name: sup.displayName,
      color: colors[colorIndex],
      type: sup.bookingMethod,
      status: sup.status === 'ACTIVE' ? 'ONLINE' : 'ERROR',
      toursCount: sup._count.tours,
      errorRate: '0.0%',
      lastPulled: lastSync
        ? lastSync.startedAt.toISOString().split('T')[0]
        : 'ยังไม่เคย sync',
    };
  });

  return {
    metrics: {
      supplierCount: suppliers.length,
      apiStatus: 'ONLINE',
      lastSync: latestSync
        ? latestSync.startedAt.toISOString().split('T')[0]
        : 'ไม่มีข้อมูล',
      syncErrors,
      missingLinks,
      needReview,
      totalSyncedTours: mappedSuppliers.reduce((sum, s) => sum + s.toursCount, 0),
    },
    suppliers: mappedSuppliers,
  };
}
