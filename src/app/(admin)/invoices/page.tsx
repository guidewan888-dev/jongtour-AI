export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export default async function InvoicesPage() {
  const invoices = await prisma.invoice.findMany({
    include: {
      booking: {
        include: {
          customer: true,
          tour: { select: { tourName: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  const stats = {
    total: invoices.length,
    unpaid: invoices.filter(i => i.status === 'UNPAID').length,
    paid: invoices.filter(i => i.status === 'PAID').length,
    totalAmount: invoices.reduce((sum, i) => sum + (i.totalAmount || 0), 0),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">ใบแจ้งหนี้ (Invoices)</h1>
          <p className="text-sm text-slate-500 mt-1">จัดการใบแจ้งหนี้ทั้งหมดในระบบ</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'ทั้งหมด', value: stats.total, color: 'bg-slate-100 text-slate-700' },
          { label: 'ยังไม่ชำระ', value: stats.unpaid, color: 'bg-amber-50 text-amber-700' },
          { label: 'ชำระแล้ว', value: stats.paid, color: 'bg-emerald-50 text-emerald-700' },
          { label: 'ยอดรวม', value: `฿${stats.totalAmount.toLocaleString()}`, color: 'bg-blue-50 text-blue-700' },
        ].map((s) => (
          <div key={s.label} className={`${s.color} rounded-xl p-4`}>
            <p className="text-xs font-bold opacity-70">{s.label}</p>
            <p className="text-2xl font-black mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      {invoices.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
          <p className="text-4xl mb-3">📄</p>
          <p className="text-lg font-bold text-slate-700">ยังไม่มีใบแจ้งหนี้</p>
          <p className="text-sm text-slate-500">ใบแจ้งหนี้จะถูกสร้างอัตโนมัติเมื่อมีการจอง</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 font-bold text-slate-600">เลขที่</th>
                <th className="text-left px-4 py-3 font-bold text-slate-600">Booking</th>
                <th className="text-left px-4 py-3 font-bold text-slate-600">ลูกค้า</th>
                <th className="text-left px-4 py-3 font-bold text-slate-600">ทัวร์</th>
                <th className="text-right px-4 py-3 font-bold text-slate-600">จำนวนเงิน</th>
                <th className="text-left px-4 py-3 font-bold text-slate-600">สถานะ</th>
                <th className="text-left px-4 py-3 font-bold text-slate-600">ครบกำหนด</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-blue-600">{inv.invoiceNo}</td>
                  <td className="px-4 py-3">
                    <Link href={`/bookings/${inv.booking.bookingRef}`} className="text-blue-600 hover:underline font-medium">
                      {inv.booking.bookingRef}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{inv.booking.customer?.firstName} {inv.booking.customer?.lastName}</td>
                  <td className="px-4 py-3 max-w-[200px] truncate">{inv.booking.tour?.tourName || '-'}</td>
                  <td className="px-4 py-3 text-right font-bold">฿{inv.totalAmount.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      inv.status === 'PAID' ? 'bg-emerald-100 text-emerald-700' :
                      inv.status === 'UNPAID' ? 'bg-amber-100 text-amber-700' :
                      inv.status === 'VOID' ? 'bg-red-100 text-red-700' :
                      'bg-slate-100 text-slate-600'
                    }`}>{inv.status}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{new Date(inv.dueDate).toLocaleDateString('th-TH')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
