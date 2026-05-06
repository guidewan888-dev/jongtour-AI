import { prisma } from '@/lib/prisma';
import { realDataFilter } from '@/lib/filters/realDataFilter';
import AdminToursClient from './AdminToursClient';

export const dynamic = 'force-dynamic';

export default async function AdminToursPage() {
  
  const dbTours = await prisma.tour.findMany({
    where: realDataFilter,
    include: { supplier: true },
    orderBy: { createdAt: 'desc' }
  });

  
  const formattedData = dbTours.map(t => ({
    id: t.id,
    code: t.tourCode,
    name: t.tourName,
    supplier: t.supplier?.displayName || t.supplierId,
    duration: t.durationDays + 'D' + t.durationNights + 'N',
    price: 0, // Would come from departures in a real scenario
    status: t.status.toUpperCase(),
    isAiReviewed: true,
    lastSync: t.lastSyncedAt ? t.lastSyncedAt.toISOString().split('T')[0] : 'Never',
    image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=200&auto=format&fit=crop'
  }));

  
  return <AdminToursClient initialData={formattedData} />;
}
