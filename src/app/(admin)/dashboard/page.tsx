export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import AdminDashboardClient from './AdminDashboardClient';

export default async function AdminDashboardPage() {
  // Start of Day
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  try {
    const [
      bookingsToday,
      pendingBookings,
      waitingWholesale,
      paymentPending,
      syncErrors,
      recentDbBookings,
      apiLogs
    ] = await Promise.all([
      prisma.booking.count({ where: { createdAt: { gte: startOfDay } } }).catch(() => 0),
      prisma.booking.count({ where: { status: 'PENDING' } }).catch(() => 0),
      prisma.booking.count({ where: { status: 'WAITING_WHOLESALE' } }).catch(() => 0),
      prisma.booking.count({ where: { status: 'PAYMENT_PENDING' } }).catch(() => 0),
      prisma.apiSyncLog.count({ where: { status: 'FAILED' } }).catch(() => 0),
      prisma.booking.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { customer: true, tour: true }
      }).catch(() => []),
      prisma.apiSyncLog.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' }
      }).catch(() => [])
    ]);

    const recentBookings = (recentDbBookings as any[]).map((b, idx) => {
      const firstName = (b.customer?.firstName || '').trim();
      const lastName = (b.customer?.lastName || '').trim();
      const customer = `${firstName} ${lastName}`.trim() || 'Unknown';
      const createdAt = b.createdAt ? new Date(b.createdAt) : null;
      const safeTime = createdAt && !Number.isNaN(createdAt.getTime())
        ? createdAt.toLocaleTimeString('th-TH')
        : '-';

      return {
        id: b.bookingRef || b.id || `booking-${idx}`,
        customer,
        tour: b.tour?.tourName || 'Unknown Tour',
        pax: 1,
        total: Number(b.totalPrice ?? 0),
        status: typeof b.status === 'string' ? b.status : 'UNKNOWN',
        time: safeTime
      };
    });

    const syncStatus = (apiLogs as any[]).map((l, idx) => {
      const createdAt = l.createdAt ? new Date(l.createdAt) : null;
      const safeLastSync = createdAt && !Number.isNaN(createdAt.getTime())
        ? createdAt.toLocaleString('th-TH')
        : '-';

      return {
        supplier: l.supplierId || `supplier-${idx}`,
        lastSync: safeLastSync,
        status: l.status === 'SUCCESS' ? 'SUCCESS' : l.status === 'FAILED' ? 'ERROR' : 'WARNING',
        added: Number(l.recordsAdded ?? 0),
        updated: Number(l.recordsUpdated ?? 0),
        message: l.errorMessage || ''
      };
    });

    const data = {
      kpi: {
        bookingsToday,
        pendingBookings,
        waitingWholesale,
        paymentPending,
        aiReview: 0,
        syncErrors,
      },
      tasksToday: [],
      recentBookings,
      syncStatus,
      aiAlerts: [],
      paymentsPending: []
    };

    return <AdminDashboardClient initialData={data} />;
  } catch (error: any) {
    console.error('[Dashboard Error]', error.message);
    // Return dashboard with empty data on error
    const data = {
      kpi: {
        bookingsToday: 0,
        pendingBookings: 0,
        waitingWholesale: 0,
        paymentPending: 0,
        aiReview: 0,
        syncErrors: 0,
      },
      tasksToday: [],
      recentBookings: [],
      syncStatus: [],
      aiAlerts: [],
      paymentsPending: []
    };
    return <AdminDashboardClient initialData={data} />;
  }
}
