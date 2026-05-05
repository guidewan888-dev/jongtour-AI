export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';

export default async function QuotationsPage() {
  const quotations = await prisma.quotation.findMany({
    include: {
      departure: {
        include: {
          tour: { select: { tourName: true, tourCode: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  const stats = {
    total: quotations.length,
    active: quotations.filter(q => q.status === 'ACTIVE').length,
    expired: quotations.filter(q => q.status === 'EXPIRED').length,
    booked: quotations.filter(q => q.status === 'BOOKED').length,
    totalValue: quotations.reduce((sum, q) => sum + q.totalSellingPrice, 0),
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">ใบเสนอราคา (Quotations)</h1>
        <p className="text-sm text-slate-500 mt-1">จัดการใบเสนอราคาทั้งหมด</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'ทั้งหมด', value: stats.total, color: 'bg-slate-100 text-slate-700' },
          { label: 'Active', value: stats.active, color: 'bg-emerald-50 text-emerald-700' },
          { label: 'หมดอายุ', value: stats.expired, color: 'bg-amber-50 text-amber-700' },
          { label: 'มูลค่ารวม', value: `฿${stats.totalValue.toLocaleString()}`, color: 'bg-blue-50 text-blue-700' },
        ].map((s) => (
          <div key={s.label} className={`${s.color} rounded-xl p-4`}>
            <p className="text-xs font-bold opacity-70">{s.label}</p>
            <p className="text-2xl font-black mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {quotations.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
          <p className="text-4xl mb-3">📋</p>
          <p className="text-lg font-bold text-slate-700">ยังไม่มีใบเสนอราคา</p>
          <p className="text-sm text-slate-500">ใบเสนอราคาจะถูกสร้างเมื่อ Sale ส่งราคาให้ลูกค้า</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 font-bold text-slate-600">เลขที่</th>
                <th className="text-left px-4 py-3 font-bold text-slate-600">ลูกค้า</th>
                <th className="text-left px-4 py-3 font-bold text-slate-600">ทัวร์</th>
                <th className="text-center px-4 py-3 font-bold text-slate-600">Pax</th>
                <th className="text-right px-4 py-3 font-bold text-slate-600">ราคารวม</th>
                <th className="text-left px-4 py-3 font-bold text-slate-600">สถานะ</th>
                <th className="text-left px-4 py-3 font-bold text-slate-600">หมดอายุ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {quotations.map((q) => (
                <tr key={q.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <a href={`/sales/quotations/${q.id}`} className="font-mono font-bold text-blue-600 hover:underline">{q.quotationRef}</a>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{q.customerName}</p>
                    {q.customerEmail && <p className="text-xs text-slate-400">{q.customerEmail}</p>}
                  </td>
                  <td className="px-4 py-3 max-w-[200px] truncate">{q.departure?.tour?.tourName || '-'}</td>
                  <td className="px-4 py-3 text-center font-medium">{q.paxAdult}A {q.paxChild > 0 ? `${q.paxChild}C` : ''}</td>
                  <td className="px-4 py-3 text-right font-bold text-emerald-700">฿{q.totalSellingPrice.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      q.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' :
                      q.status === 'BOOKED' ? 'bg-blue-100 text-blue-700' :
                      'bg-slate-100 text-slate-600'
                    }`}>{q.status}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{new Date(q.validUntil).toLocaleDateString('th-TH')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
