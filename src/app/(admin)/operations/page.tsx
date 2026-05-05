export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';

export default async function OperationsPage() {
  const [pendingBookings, activeTickets, recentPayments, todayBookings] = await Promise.all([
    prisma.booking.findMany({
      where: { status: { in: ['PENDING', 'waiting_admin_review', 'payment_pending'] } },
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        customer: { select: { firstName: true, lastName: true } },
        tour: { select: { tourName: true } },
        departure: { select: { startDate: true } },
      },
    }),
    prisma.supportTicket.findMany({
      where: { status: { in: ['OPEN', 'IN_PROGRESS'] } },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: { customer: { select: { firstName: true, lastName: true } } },
    }),
    prisma.payment.findMany({
      where: { status: 'COMPLETED' },
      orderBy: { paidAt: 'desc' },
      take: 10,
      include: { booking: { select: { bookingRef: true } } },
    }),
    prisma.booking.count({
      where: { createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Operations Center</h1>
        <p className="text-sm text-slate-500 mt-1">จัดการงาน operation ประจำวัน</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-amber-50 text-amber-700 rounded-2xl p-5">
          <p className="text-xs font-bold opacity-70">Booking รอดำเนินการ</p>
          <p className="text-3xl font-black mt-1">{pendingBookings.length}</p>
        </div>
        <div className="bg-red-50 text-red-700 rounded-2xl p-5">
          <p className="text-xs font-bold opacity-70">Ticket เปิดอยู่</p>
          <p className="text-3xl font-black mt-1">{activeTickets.length}</p>
        </div>
        <div className="bg-blue-50 text-blue-700 rounded-2xl p-5">
          <p className="text-xs font-bold opacity-70">Booking วันนี้</p>
          <p className="text-3xl font-black mt-1">{todayBookings}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Bookings */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="font-bold text-slate-800">⏳ Booking รอดำเนินการ</h2>
          </div>
          {pendingBookings.length === 0 ? (
            <div className="p-8 text-center text-slate-400">ไม่มี booking ค้าง ✅</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {pendingBookings.map((b) => (
                <a key={b.id} href={`/bookings/${b.bookingRef}`} className="block px-6 py-3 hover:bg-slate-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-mono font-bold text-blue-600 text-sm">{b.bookingRef}</p>
                      <p className="text-xs text-slate-500">{b.customer?.firstName} {b.customer?.lastName} • {b.tour?.tourName}</p>
                    </div>
                    <div className="text-right">
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-xs font-bold">{b.status}</span>
                      <p className="text-xs text-slate-400 mt-1">{b.departure?.startDate ? new Date(b.departure.startDate).toLocaleDateString('th-TH') : '-'}</p>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Support Tickets */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="font-bold text-slate-800">🎫 Support Tickets</h2>
          </div>
          {activeTickets.length === 0 ? (
            <div className="p-8 text-center text-slate-400">ไม่มี ticket เปิดอยู่ ✅</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {activeTickets.map((t) => (
                <div key={t.id} className="px-6 py-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-sm text-slate-800">{t.ticketNo} — {t.topic}</p>
                      <p className="text-xs text-slate-500">{t.customer?.firstName} {t.customer?.lastName}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                        t.priority === 'URGENT' ? 'bg-red-100 text-red-700' :
                        t.priority === 'HIGH' ? 'bg-amber-100 text-amber-700' :
                        'bg-slate-100 text-slate-600'
                      }`}>{t.priority}</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                        t.status === 'OPEN' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                      }`}>{t.status}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Payments */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="font-bold text-slate-800">💳 Payment ล่าสุด</h2>
        </div>
        {recentPayments.length === 0 ? (
          <div className="p-8 text-center text-slate-400">ยังไม่มี payment</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50"><tr>
              <th className="text-left px-4 py-3 font-bold text-slate-600">Payment Ref</th>
              <th className="text-left px-4 py-3 font-bold text-slate-600">Booking</th>
              <th className="text-left px-4 py-3 font-bold text-slate-600">Method</th>
              <th className="text-right px-4 py-3 font-bold text-slate-600">จำนวน</th>
              <th className="text-left px-4 py-3 font-bold text-slate-600">เวลา</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-100">
              {recentPayments.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono text-xs">{p.paymentRef}</td>
                  <td className="px-4 py-3 font-medium">{p.booking?.bookingRef}</td>
                  <td className="px-4 py-3">{p.paymentMethod}</td>
                  <td className="px-4 py-3 text-right font-bold text-emerald-700">฿{p.amount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">{p.paidAt ? new Date(p.paidAt).toLocaleString('th-TH') : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
