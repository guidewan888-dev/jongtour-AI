export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import AdminDashboardClient from './AdminDashboardClient';

export default async function AdminDashboardPage() {
  // Start of Day
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [
    bookingsToday,
    pendingBookings,
    waitingWholesale,
    paymentPending,
    syncErrors,
    recentDbBookings,
    apiLogs
  ] = await Promise.all([
    prisma.booking.count({ where: { createdAt: { gte: startOfDay } } }),
    prisma.booking.count({ where: { status: 'PENDING' } }),
    prisma.booking.count({ where: { status: 'WAITING_WHOLESALE' } }),
    prisma.booking.count({ where: { status: 'PAYMENT_PENDING' } }),
    prisma.apiSyncLog.count({ where: { status: 'FAILED' } }),
    prisma.booking.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { customer: true, tour: true }
    }),
    prisma.apiSyncLog.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' }
    })
  ]);

  const recentBookings = recentDbBookings.map(b => ({
    id: b.bookingRef,
    customer: b.customer?.firstName + ' ' + b.customer?.lastName || 'Unknown',
    tour: b.tour?.tourName || 'Unknown Tour',
    pax: 1, // Add calculation if needed
    total: b.totalPrice,
    status: b.status,
    time: b.createdAt.toLocaleTimeString('th-TH')
  }));

  const syncStatus = apiLogs.map(l => ({
    supplier: l.supplierId,
    lastSync: l.createdAt.toLocaleString('th-TH'),
    status: l.status === 'SUCCESS' ? 'SUCCESS' : l.status === 'FAILED' ? 'ERROR' : 'WARNING',
    added: l.recordsAdded,
    updated: l.recordsUpdated,
    message: l.errorMessage || ''
  }));

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
}

