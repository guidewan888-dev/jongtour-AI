export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';

export default async function ReceiptsPage() {
  const receipts = await prisma.receipt.findMany({
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">ใบเสร็จรับเงิน (Receipts)</h1>
        <p className="text-sm text-slate-500 mt-1">รายการใบเสร็จทั้งหมด</p>
      </div>

      {receipts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
          <p className="text-4xl mb-3">🧾</p>
          <p className="text-lg font-bold text-slate-700">ยังไม่มีใบเสร็จ</p>
          <p className="text-sm text-slate-500">ใบเสร็จจะถูกสร้างอัตโนมัติเมื่อชำระเงินเสร็จสิ้น</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 font-bold text-slate-600">เลขที่ใบเสร็จ</th>
                <th className="text-left px-4 py-3 font-bold text-slate-600">Booking</th>
                <th className="text-left px-4 py-3 font-bold text-slate-600">ลูกค้า</th>
                <th className="text-right px-4 py-3 font-bold text-slate-600">จำนวนเงิน</th>
                <th className="text-left px-4 py-3 font-bold text-slate-600">วันที่ออก</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {receipts.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-blue-600">{r.receiptNo}</td>
                  <td className="px-4 py-3 font-medium">{r.booking.bookingRef}</td>
                  <td className="px-4 py-3">{r.booking.customer?.firstName} {r.booking.customer?.lastName}</td>
                  <td className="px-4 py-3 text-right font-bold text-emerald-700">฿{r.amount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-slate-500">{new Date(r.issueDate).toLocaleDateString('th-TH')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
