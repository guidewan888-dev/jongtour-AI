import { prisma } from '@/lib/prisma';
import AdminPaymentClient from './AdminPaymentClient';

export const dynamic = 'force-dynamic';

export default async function AdminPaymentPage() {
  
  const dbPayments = await prisma.payment.findMany({
    include: { booking: { include: { customer: true } } },
    orderBy: { createdAt: 'desc' }
  });

  
  const transactions = dbPayments.map(p => ({
    id: p.id,
    bookingRef: p.booking?.bookingRef || 'Unknown',
    customer: p.booking?.customer?.firstName + ' ' + (p.booking?.customer?.lastName || ''),
    amount: p.amount,
    method: p.paymentMethod || "".toUpperCase(),
    bank: '-',
    date: p.createdAt.toISOString().split('T')[0],
    status: p.status.toUpperCase(),
    slipUrl: p?.slipUrl || '' || ""
  }));

  
  const formattedData = {
    metrics: {
      pendingVerifications: dbPayments.filter(p => p.status === 'PENDING').length,
      pendingAmount: dbPayments.filter(p => p.status === 'PENDING').reduce((sum, p) => sum + p.amount, 0),
      verifiedToday: dbPayments.filter(p => p.status === 'COMPLETED').length,
      verifiedAmount: dbPayments.filter(p => p.status === 'COMPLETED').reduce((sum, p) => sum + p.amount, 0),
      refundsPending: dbPayments.filter(p => p.status === 'REFUNDED').length
    },
    transactions
  };

  return <AdminPaymentClient initialData={formattedData} />;
}
