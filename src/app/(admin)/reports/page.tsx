export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';

export default async function ReportsPage() {
  const [bookingCount, totalRevenue, customerCount, tourCount, leadCount, paidBookings] = await Promise.all([
    prisma.booking.count(),
    prisma.booking.aggregate({ _sum: { totalPrice: true } }),
    prisma.customer.count(),
    prisma.tour.count(),
    prisma.lead.count(),
    prisma.booking.count({ where: { status: 'paid' } }),
  ]);

  const avgOrderValue = bookingCount > 0 ? Math.round((totalRevenue._sum.totalPrice || 0) / bookingCount) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">รายงาน (Reports)</h1>
        <p className="text-sm text-slate-500 mt-1">ภาพรวมข้อมูลธุรกิจ Jongtour</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label: 'Bookings ทั้งหมด', value: bookingCount, icon: '🎫', color: 'bg-blue-50 text-blue-700' },
          { label: 'รายได้รวม', value: `฿${(totalRevenue._sum.totalPrice || 0).toLocaleString()}`, icon: '💰', color: 'bg-emerald-50 text-emerald-700' },
          { label: 'ลูกค้า', value: customerCount, icon: '👥', color: 'bg-purple-50 text-purple-700' },
          { label: 'ทัวร์ในระบบ', value: tourCount, icon: '🌍', color: 'bg-orange-50 text-orange-700' },
          { label: 'Leads', value: leadCount, icon: '📋', color: 'bg-amber-50 text-amber-700' },
          { label: 'Booking ชำระแล้ว', value: paidBookings, icon: '✅', color: 'bg-teal-50 text-teal-700' },
        ].map((kpi) => (
          <div key={kpi.label} className={`${kpi.color} rounded-2xl p-5`}>
            <span className="text-2xl">{kpi.icon}</span>
            <p className="text-2xl font-black mt-2">{kpi.value}</p>
            <p className="text-xs font-bold opacity-70 mt-1">{kpi.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-slate-700 to-slate-900 rounded-2xl p-6 text-white">
          <p className="text-sm font-bold opacity-80">Average Order Value</p>
          <p className="text-3xl font-black mt-2">฿{avgOrderValue.toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white">
          <p className="text-sm font-bold opacity-80">Conversion Rate (Paid/Total)</p>
          <p className="text-3xl font-black mt-2">{bookingCount > 0 ? Math.round((paidBookings / bookingCount) * 100) : 0}%</p>
        </div>
      </div>

      {/* Recent bookings by status */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="font-bold text-slate-800 mb-4">📊 Booking Status Distribution</h2>
        <div className="space-y-2">
          {await Promise.all(
            ['PENDING', 'paid', 'confirmed', 'cancelled', 'completed'].map(async (status) => {
              const count = await prisma.booking.count({ where: { status } });
              const pct = bookingCount > 0 ? Math.round((count / bookingCount) * 100) : 0;
              return { status, count, pct };
            })
          ).then(results => results.map(({ status, count, pct }) => (
            <div key={status} className="flex items-center gap-3">
              <span className="w-24 text-xs font-bold text-slate-600">{status}</span>
              <div className="flex-1 bg-slate-100 rounded-full h-4 overflow-hidden">
                <div className={`h-full rounded-full ${
                  status === 'paid' ? 'bg-emerald-500' :
                  status === 'PENDING' ? 'bg-amber-500' :
                  status === 'cancelled' ? 'bg-red-500' :
                  'bg-blue-500'
                }`} style={{ width: `${Math.max(pct, 2)}%` }} />
              </div>
              <span className="text-xs font-bold text-slate-500 w-16 text-right">{count} ({pct}%)</span>
            </div>
          )))}
        </div>
      </div>
    </div>
  );
}
