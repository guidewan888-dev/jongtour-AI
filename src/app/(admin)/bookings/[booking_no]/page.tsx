export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import WholesaleAutomationPanel from '@/components/admin/WholesaleAutomationPanel';

export default async function BookingDetailPage({ params }: { params: { booking_no: string } }) {
  const booking = await prisma.booking.findFirst({
    where: { bookingRef: params.booking_no },
    include: {
      customer: true,
      tour: { select: { tourName: true, tourCode: true, durationDays: true, durationNights: true } },
      departure: { select: { startDate: true, endDate: true, status: true }, include: { prices: true } },
      supplier: { select: { displayName: true } },
      travelers: { orderBy: { createdAt: 'asc' } },
      payments: { orderBy: { createdAt: 'desc' } },
      invoices: true,
      vouchers: true,
      refunds: true,
    },
  });

  if (!booking) return notFound();

  return (
    <div className="space-y-6">
      <div>
        <a href="/bookings" className="text-xs font-bold text-blue-600 hover:underline">← กลับไปรายการ Booking</a>
        <h1 className="text-2xl font-black text-slate-900 mt-1">Booking {booking.bookingRef}</h1>
        <div className="flex items-center gap-2 mt-1">
          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
            booking.status === 'paid' ? 'bg-emerald-100 text-emerald-700' :
            booking.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
            booking.status === 'cancelled' ? 'bg-red-100 text-red-700' :
            'bg-blue-100 text-blue-700'
          }`}>{booking.status}</span>
          <span className="text-sm text-slate-500">Source: {booking.bookingSource}</span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs font-bold text-slate-500">ราคารวม</p>
          <p className="text-xl font-black text-emerald-700 mt-1">฿{booking.totalPrice.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs font-bold text-slate-500">ผู้เดินทาง</p>
          <p className="text-xl font-black text-slate-800 mt-1">{booking.travelers.length} คน</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs font-bold text-slate-500">วันเดินทาง</p>
          <p className="text-sm font-bold text-slate-800 mt-1">{booking.departure ? new Date(booking.departure.startDate).toLocaleDateString('th-TH') : '-'}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs font-bold text-slate-500">Supplier</p>
          <p className="text-sm font-bold text-slate-800 mt-1">{booking.supplier?.displayName || '-'}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Customer */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="font-bold text-slate-800 mb-3">👤 ลูกค้า</h2>
          <p className="font-medium">{booking.customer?.firstName} {booking.customer?.lastName}</p>
          <p className="text-sm text-slate-500">{booking.customer?.email}</p>
          <p className="text-sm text-slate-500">{booking.customer?.phone}</p>
        </div>

        {/* Tour */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="font-bold text-slate-800 mb-3">🏖️ ทัวร์</h2>
          <p className="font-medium">{booking.tour?.tourName}</p>
          <p className="text-sm text-slate-500 font-mono">{booking.tour?.tourCode}</p>
          <p className="text-sm text-slate-500">{booking.tour?.durationDays}D{booking.tour?.durationNights}N</p>
        </div>
      </div>

      {/* Travelers */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="font-bold text-slate-800">✈️ ผู้เดินทาง ({booking.travelers.length})</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-slate-50"><tr>
            <th className="text-left px-4 py-3 font-bold text-slate-600">#</th>
            <th className="text-left px-4 py-3 font-bold text-slate-600">ประเภท</th>
            <th className="text-left px-4 py-3 font-bold text-slate-600">ชื่อ</th>
            <th className="text-left px-4 py-3 font-bold text-slate-600">Passport</th>
          </tr></thead>
          <tbody className="divide-y divide-slate-100">
            {booking.travelers.map((t, i) => (
              <tr key={t.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-bold text-slate-400">{i + 1}</td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded text-xs font-bold ${t.paxType === 'ADULT' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'}`}>{t.paxType}</span></td>
                <td className="px-4 py-3 font-medium">{t.title} {t.firstName} {t.lastName}</td>
                <td className="px-4 py-3 font-mono text-slate-500">{t.passportNo || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Payments */}
      {booking.payments.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="font-bold text-slate-800">💳 Payments</h2>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-slate-50"><tr>
              <th className="text-left px-4 py-3 font-bold text-slate-600">Ref</th>
              <th className="text-right px-4 py-3 font-bold text-slate-600">จำนวน</th>
              <th className="text-left px-4 py-3 font-bold text-slate-600">Method</th>
              <th className="text-left px-4 py-3 font-bold text-slate-600">สถานะ</th>
              <th className="text-left px-4 py-3 font-bold text-slate-600">วันที่</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-100">
              {booking.payments.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-3 font-mono text-xs">{p.paymentRef}</td>
                  <td className="px-4 py-3 text-right font-bold text-emerald-700">฿{p.amount.toLocaleString()}</td>
                  <td className="px-4 py-3">{p.paymentMethod}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded text-xs font-bold ${p.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{p.status}</span></td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{p.paidAt ? new Date(p.paidAt).toLocaleString('th-TH') : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Wholesale Automation Panel */}
      <WholesaleAutomationPanel bookingId={booking.id} />
    </div>
  );
}
