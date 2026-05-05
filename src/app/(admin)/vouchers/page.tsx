export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';

export default async function VouchersPage() {
  const vouchers = await prisma.voucher.findMany({
    include: {
      booking: {
        include: {
          customer: true,
          tour: { select: { tourName: true } },
          travelers: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  const stats = {
    total: vouchers.length,
    active: vouchers.filter(v => v.status === 'ACTIVE').length,
    used: vouchers.filter(v => v.status === 'USED').length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Voucher (บัตรกำนัล)</h1>
        <p className="text-sm text-slate-500 mt-1">จัดการ voucher สำหรับทุกการจอง</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'ทั้งหมด', value: stats.total, color: 'bg-slate-100 text-slate-700' },
          { label: 'ใช้งานได้', value: stats.active, color: 'bg-emerald-50 text-emerald-700' },
          { label: 'ใช้แล้ว', value: stats.used, color: 'bg-blue-50 text-blue-700' },
        ].map((s) => (
          <div key={s.label} className={`${s.color} rounded-xl p-4`}>
            <p className="text-xs font-bold opacity-70">{s.label}</p>
            <p className="text-2xl font-black mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {vouchers.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
          <p className="text-4xl mb-3">🎫</p>
          <p className="text-lg font-bold text-slate-700">ยังไม่มี Voucher</p>
          <p className="text-sm text-slate-500">Voucher จะถูกสร้างเมื่อชำระเงินและยืนยันการจอง</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 font-bold text-slate-600">Voucher No</th>
                <th className="text-left px-4 py-3 font-bold text-slate-600">Booking</th>
                <th className="text-left px-4 py-3 font-bold text-slate-600">ลูกค้า</th>
                <th className="text-left px-4 py-3 font-bold text-slate-600">ทัวร์</th>
                <th className="text-left px-4 py-3 font-bold text-slate-600">ผู้เดินทาง</th>
                <th className="text-left px-4 py-3 font-bold text-slate-600">สถานะ</th>
                <th className="text-left px-4 py-3 font-bold text-slate-600">วันที่ออก</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {vouchers.map((v) => (
                <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-blue-600">{v.voucherNo}</td>
                  <td className="px-4 py-3 font-medium">{v.booking.bookingRef}</td>
                  <td className="px-4 py-3">{v.booking.customer?.firstName} {v.booking.customer?.lastName}</td>
                  <td className="px-4 py-3 max-w-[180px] truncate">{v.booking.tour?.tourName || '-'}</td>
                  <td className="px-4 py-3 font-medium">{v.booking.travelers?.length || 0} คน</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      v.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' :
                      v.status === 'USED' ? 'bg-blue-100 text-blue-700' :
                      'bg-red-100 text-red-700'
                    }`}>{v.status}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{new Date(v.issueDate).toLocaleDateString('th-TH')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
