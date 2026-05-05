export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export default async function SalesDashboardPage() {
  // Real aggregation queries
  const [
    totalLeads,
    newLeads,
    wonLeads,
    lostLeads,
    recentLeads,
    recentBookings,
    quotationCount,
    totalRevenue,
  ] = await Promise.all([
    prisma.lead.count(),
    prisma.lead.count({ where: { status: 'NEW' } }),
    prisma.lead.count({ where: { status: 'WON' } }),
    prisma.lead.count({ where: { status: 'LOST' } }),
    prisma.lead.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: { sale: { select: { email: true } } },
    }),
    prisma.booking.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        customer: { select: { firstName: true, lastName: true } },
        tour: { select: { tourName: true } },
      },
    }),
    prisma.quotation.count(),
    prisma.booking.aggregate({ _sum: { totalPrice: true } }),
  ]);

  const conversionRate = totalLeads > 0 ? Math.round((wonLeads / totalLeads) * 100) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Sale CRM Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">ภาพรวมงานขายและ Lead ทั้งหมด</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Lead ทั้งหมด', value: totalLeads, icon: '👥', color: 'bg-blue-50 text-blue-700' },
          { label: 'Lead ใหม่', value: newLeads, icon: '🆕', color: 'bg-amber-50 text-amber-700' },
          { label: 'ปิดการขายได้', value: wonLeads, icon: '🏆', color: 'bg-emerald-50 text-emerald-700' },
          { label: 'อัตราปิดการขาย', value: `${conversionRate}%`, icon: '📊', color: 'bg-purple-50 text-purple-700' },
        ].map((kpi) => (
          <div key={kpi.label} className={`${kpi.color} rounded-2xl p-5`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">{kpi.icon}</span>
            </div>
            <p className="text-3xl font-black">{kpi.value}</p>
            <p className="text-xs font-bold opacity-70 mt-1">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Revenue + Quotations */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl p-6 text-white">
          <p className="text-sm font-bold opacity-80">รายได้รวม (Booking)</p>
          <p className="text-3xl font-black mt-2">฿{(totalRevenue._sum.totalPrice || 0).toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl p-6 text-white">
          <p className="text-sm font-bold opacity-80">ใบเสนอราคาทั้งหมด</p>
          <p className="text-3xl font-black mt-2">{quotationCount}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Leads */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="font-bold text-slate-800">Lead ล่าสุด</h2>
            <Link href="/sales/leads" className="text-xs font-bold text-blue-600 hover:underline">ดูทั้งหมด →</Link>
          </div>
          {recentLeads.length === 0 ? (
            <div className="p-8 text-center text-slate-400">ยังไม่มี Lead</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentLeads.map((lead) => (
                <div key={lead.id} className="px-6 py-3 flex items-center justify-between hover:bg-slate-50">
                  <div>
                    <p className="font-medium text-slate-800">{lead.customerName}</p>
                    <p className="text-xs text-slate-500">{lead.contactInfo} • {lead.source}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      lead.status === 'NEW' ? 'bg-blue-100 text-blue-700' :
                      lead.status === 'WON' ? 'bg-emerald-100 text-emerald-700' :
                      lead.status === 'LOST' ? 'bg-red-100 text-red-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>{lead.status}</span>
                    {lead.estimatedValue && (
                      <span className="text-xs font-bold text-slate-600">฿{lead.estimatedValue.toLocaleString()}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Bookings */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="font-bold text-slate-800">Booking ล่าสุด</h2>
            <Link href="/bookings" className="text-xs font-bold text-blue-600 hover:underline">ดูทั้งหมด →</Link>
          </div>
          {recentBookings.length === 0 ? (
            <div className="p-8 text-center text-slate-400">ยังไม่มี Booking</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentBookings.map((b) => (
                <div key={b.id} className="px-6 py-3 flex items-center justify-between hover:bg-slate-50">
                  <div>
                    <p className="font-medium text-slate-800">{b.customer?.firstName} {b.customer?.lastName}</p>
                    <p className="text-xs text-slate-500 max-w-[200px] truncate">{b.tour?.tourName}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-800">฿{b.totalPrice.toLocaleString()}</p>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      b.status === 'paid' ? 'bg-emerald-100 text-emerald-700' :
                      b.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                      'bg-slate-100 text-slate-600'
                    }`}>{b.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Pipeline Summary */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="font-bold text-slate-800 mb-4">📊 Pipeline Summary</h2>
        <div className="grid grid-cols-5 gap-3">
          {[
            { label: 'NEW', count: newLeads, color: 'bg-blue-500' },
            { label: 'CONTACTED', count: await prisma.lead.count({ where: { status: 'CONTACTED' } }), color: 'bg-amber-500' },
            { label: 'QUOTED', count: await prisma.lead.count({ where: { status: 'QUOTED' } }), color: 'bg-purple-500' },
            { label: 'WON', count: wonLeads, color: 'bg-emerald-500' },
            { label: 'LOST', count: lostLeads, color: 'bg-red-500' },
          ].map((stage) => (
            <div key={stage.label} className="text-center">
              <div className={`${stage.color} text-white rounded-xl py-4 mb-2`}>
                <p className="text-2xl font-black">{stage.count}</p>
              </div>
              <p className="text-xs font-bold text-slate-600">{stage.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
