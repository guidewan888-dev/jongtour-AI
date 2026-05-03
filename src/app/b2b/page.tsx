import { Package, Users, Receipt, TrendingUp, FileText, CalendarDays } from 'lucide-react';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function B2BDashboardPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();

  let dbUser = null;
  let company = null;
  let tourCount = 0;
  let recentBookings: any[] = [];
  let recentQuotations: any[] = [];
  let totalBookings = 0;
  let outstandingBalance = 0;
  
  if (user) {
    dbUser = await prisma.user.findUnique({
      where: { email: user.email || "" },
      include: { agent: true }
    });
    
    if (dbUser?.agent) {
      company = dbUser.agent;
      tourCount = await prisma.tour.count();
      
      // Calculate total bookings
      totalBookings = await prisma.booking.count({
        where: { agentId: company.id }
      });

      // Calculate Outstanding Balance (Bookings that are UNPAID or DEPOSIT_PAID)
      const unpaidBookings = await prisma.booking.findMany({
         where: { 
           agentId: company.id, 
           status: { in: ['PENDING', 'DEPOSIT_PAID'] }
         }
      });
      outstandingBalance = unpaidBookings.reduce((sum, b) => sum + b.totalPrice, 0);
      
      // Fetch recent bookings
      recentBookings = await prisma.booking.findMany({
        where: { agentId: company.id },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          departure: { include: { tour: true } }
        }
      });

      // Fetch recent quotations
      recentQuotations = await prisma.quotation.findMany({
        where: { agentId: company.id },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          departure: { include: { tour: true } }
        }
      });
    }
  }

  const stats = [
    { label: "Total Bookings", value: totalBookings.toString(), change: "Success", icon: <Receipt className="text-blue-500" /> },
    { label: "Available Tours", value: tourCount.toString(), change: "Active", icon: <Package className="text-indigo-500" /> },
    { label: "Credit Limit (THB)", value: `฿${(company?.creditLimit || 0).toLocaleString()}`, change: company?.tier || "STANDARD", icon: <TrendingUp className="text-emerald-500" /> },
    { label: "Outstanding Balance", value: `฿${outstandingBalance.toLocaleString()}`, change: "Unpaid", icon: <FileText className="text-amber-500" /> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800">Welcome, {dbUser?.name || dbUser?.email}</h2>
          <p className="text-sm text-slate-500">{company?.companyName || 'Jongtour B2B Portal'}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/b2b/tours" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-sm">
            ค้นหาทัวร์ใหม่
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100">
                {stat.icon}
              </div>
              <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                {stat.change}
              </span>
            </div>
            <p className="text-sm font-medium text-slate-500">{stat.label}</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Bookings */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-center">
            <h3 className="font-semibold text-slate-800">Recent Bookings</h3>
            <button className="text-sm text-indigo-600 font-medium hover:text-indigo-800">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3">Booking Ref</th>
                  <th className="px-6 py-3">Tour</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Amount</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {recentBookings.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                      ไม่มีรายการจองล่าสุด
                    </td>
                  </tr>
                ) : (
                  recentBookings.map((booking) => {
                    let statusColor = "bg-slate-100 text-slate-700";
                    if (booking.status === 'CONFIRMED' || booking.status === 'FULL_PAID') statusColor = "bg-emerald-100 text-emerald-700";
                    else if (booking.status === 'PENDING') statusColor = "bg-amber-100 text-amber-700";
                    else if (booking.status === 'CANCELLED') statusColor = "bg-red-100 text-red-700";
                    else if (booking.status === 'DEPOSIT_PAID') statusColor = "bg-blue-100 text-blue-700";
                    
                    return (
                      <tr key={booking.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-900">{booking.bookingRef}</td>
                        <td className="px-6 py-4 text-slate-600 truncate max-w-xs">{booking.departure?.tour?.tourName || 'Unknown Tour'}</td>
                        <td className="px-6 py-4 text-slate-600">{new Date(booking.createdAt).toLocaleDateString('th-TH')}</td>
                        <td className="px-6 py-4 font-medium text-slate-900">฿{booking.totalPrice.toLocaleString()}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColor}`}>
                            {booking.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Quotations */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-slate-800">Recent Quotations</h3>
              <Link href="/b2b/quotations" className="text-xs font-medium text-indigo-600 hover:text-indigo-800">View All</Link>
            </div>
            <div className="space-y-4">
              {recentQuotations.length === 0 ? (
                <div className="text-center py-6 text-sm text-slate-500 border border-dashed border-slate-200 rounded-lg">
                  ยังไม่มีใบเสนอราคา
                </div>
              ) : (
                recentQuotations.map((q) => (
                  <div key={q.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50 hover:bg-slate-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-indigo-100 flex items-center justify-center text-indigo-600">
                        <FileText size={16} />
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-sm font-medium text-slate-900 truncate">{q.customerName}</p>
                        <p className="text-xs text-slate-500 truncate">{q.quotationRef}</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-700 bg-white px-2 py-1 rounded shadow-sm border border-slate-200">
                      ฿{q.totalSellingPrice.toLocaleString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
