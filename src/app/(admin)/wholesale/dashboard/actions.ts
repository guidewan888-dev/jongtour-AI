'use server';

import { prisma } from '@/lib/prisma';

export async function getWholesaleDashboardData() {
  const suppliers = await prisma.supplier.findMany({
    include: {
      _count: { select: { tours: true } }
    }
  });

  const missingLinks = await prisma.tour.count({
    where: { bookingUrl: null }
  });

  const needReview = await prisma.tour.count({
    where: { status: 'DRAFT' }
  });

  const mappedSuppliers = suppliers.map(sup => {
    // Generate a consistent color based on ID length or first letter
    const colors = ['blue', 'emerald', 'indigo', 'violet', 'orange', 'rose'];
    const colorIndex = sup.displayName.charCodeAt(0) % colors.length;
    
    return {
      id: sup.id,
      name: sup.displayName,
      color: colors[colorIndex],
      type: sup.bookingMethod,
      status: sup.status === 'ACTIVE' ? 'ONLINE' : 'ERROR',
      toursCount: sup._count.tours,
      errorRate: "0.0%",
      lastPulled: sup.updatedAt.toISOString().split('T')[0]
    };
  });

  return {
    metrics: {
      supplierCount: suppliers.length,
      apiStatus: 'ONLINE',
      lastSync: new Date().toISOString().split('T')[0],
      syncErrors: 0,
      missingLinks,
      needReview,
      totalSyncedTours: mappedSuppliers.reduce((sum, s) => sum + s.toursCount, 0)
    },
    suppliers: mappedSuppliers
  };
}
