import { prisma } from '@/lib/prisma';
import AdminBookingsClient from './AdminBookingsClient';

export const dynamic = 'force-dynamic';

export default async function AdminBookingsPage() {
  const dbBookings = await prisma.booking.findMany({
    include: {
      tour: true,
      wholesaleActions: { take: 1, orderBy: { createdAt: 'desc' } }
    },
    orderBy: { createdAt: 'desc' }
  });

  const formattedData = (dbBookings as any[]).map(b => ({
    id: b.bookingRef,
    customer: b.customerId || 'Unknown',
    isAgent: false,
    tour: b.tour?.tourName || b.tour?.tourCode || 'Unknown Tour',
    supplier: b.tour?.supplierId || 'Direct',
    departure: b.createdAt.toISOString().split('T')[0],
    pax: 1,
    bookingStatus: b.status.toUpperCase(),
    paymentStatus: b.status === 'CONFIRMED' ? 'PAID' : b.status === 'PENDING_PAYMENT' ? 'UNPAID' : 'PARTIAL',
    wholesaleStatus: (b.wholesaleStatus as string | null)?.toUpperCase() || 'PENDING',
    amount: b.totalPrice,
    staff: 'SYS'
  }));

  return <AdminBookingsClient initialData={formattedData} />;
}
