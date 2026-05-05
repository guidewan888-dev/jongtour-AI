import { prisma } from '@/lib/prisma';
import AdminManualBookingForm from './AdminManualBookingForm';

export const dynamic = 'force-dynamic';

export default async function AdminManualBookingPage() {
  const [customers, tours, suppliers] = await Promise.all([
    prisma.customer.findMany({
      where: { status: 'ACTIVE', deletedAt: null },
      select: { id: true, firstName: true, lastName: true, email: true },
      orderBy: { createdAt: 'desc' },
      take: 200,
    }),
    prisma.tour.findMany({
      where: { status: 'PUBLISHED', isMock: false, isVisible: true },
      select: { id: true, tourName: true, tourCode: true, durationDays: true, durationNights: true },
      orderBy: { tourName: 'asc' },
      take: 500,
    }),
    prisma.supplier.findMany({
      where: { status: 'ACTIVE' },
      select: { id: true, displayName: true, bookingMethod: true },
      orderBy: { displayName: 'asc' },
    }),
  ]);

  const formCustomers = customers.map(c => ({ id: c.id, name: `${c.firstName} ${c.lastName} (${c.email})` }));
  const formTours = tours.map(t => ({ id: t.id, name: `${t.tourName} (${t.tourCode}) ${t.durationDays}D${t.durationNights}N`, basePrice: 0 }));
  const formSuppliers = suppliers.map(s => ({ id: s.id, name: `${s.displayName} (${s.bookingMethod})` }));

  return <AdminManualBookingForm customers={formCustomers} tours={formTours} suppliers={formSuppliers} />;
}
