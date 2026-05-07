'use server';

import { prisma } from '@/lib/prisma';

function toThaiDate(date: Date): string {
  return date.toLocaleDateString('sv-SE', { timeZone: 'Asia/Bangkok' }); // YYYY-MM-DD
}

function toThaiTime(date: Date): string {
  return date.toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' });
}

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

  // Failed sync logs (real data for Failed Jobs Queue)
  const failedLogs = await prisma.supplierSyncLog.findMany({
    where: { status: 'FAILED' },
    include: { supplier: { select: { displayName: true } } },
    orderBy: { startedAt: 'desc' },
    take: 5,
  });

  // Recent sync logs (real data for Real-time System Logs)
  const recentLogs = await prisma.supplierSyncLog.findMany({
    include: { supplier: { select: { displayName: true } } },
    orderBy: { startedAt: 'desc' },
    take: 10,
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
        ? toThaiDate(lastSync.startedAt)
        : 'ยังไม่เคย sync',
    };
  });

  const mappedFailedLogs = failedLogs.map((log) => ({
    id: log.id,
    supplier: log.supplier.displayName,
    error: log.errorMessage || 'Unknown error',
    time: toThaiTime(log.startedAt),
  }));

  const mappedRecentLogs = recentLogs.map((log) => {
    const time = log.startedAt.toLocaleTimeString('th-TH', { timeZone: 'Asia/Bangkok', hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const status = log.status === 'SUCCESS' ? 'OK' : log.status === 'FAILED' ? 'ERROR' : 'INFO';
    const msg = log.status === 'SUCCESS'
      ? `${log.supplier.displayName}: Synced ${log.totalRecords} tours successfully.`
      : log.status === 'FAILED'
      ? `${log.supplier.displayName}: ${log.errorMessage || 'Sync failed'}`
      : `${log.supplier.displayName}: Sync ${log.status}...`;
    return { time: `[${time}]`, status, msg };
  });

  return {
    metrics: {
      supplierCount: suppliers.length,
      apiStatus: 'ONLINE',
      lastSync: latestSync
        ? toThaiDate(latestSync.startedAt)
        : 'ไม่มีข้อมูล',
      syncErrors,
      missingLinks,
      needReview,
      totalSyncedTours: mappedSuppliers.reduce((sum, s) => sum + s.toursCount, 0),
    },
    suppliers: mappedSuppliers,
    failedLogs: mappedFailedLogs,
    recentLogs: mappedRecentLogs,
  };
}
