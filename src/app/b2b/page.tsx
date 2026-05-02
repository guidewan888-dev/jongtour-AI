import { Package, Users, Receipt, TrendingUp, Building2, CalendarDays } from 'lucide-react';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma'; // Assumes this is available

export const dynamic = 'force-dynamic';

export default async function B2BDashboardPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();

  let dbUser = null;
  let company = null;
  let tourCount = 0;
  
  if (user) {
    dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { company: true }
    });
    
    if (dbUser?.company) {
      company = dbUser.company;
      if (company.type === 'SUPPLIER') {
        tourCount = await prisma.tour.count({
          where: { supplierId: company.id }
        });
      } else {
        tourCount = await prisma.tour.count(); // Agent sees all tours
      }
    }
  }

  const stats = [
    { label: "Total Bookings", value: "0", change: "0%", icon: <Receipt className="text-blue-500" /> },
    { label: company?.type === 'SUPPLIER' ? "My Tours" : "Available Tours", value: tourCount.toString(), change: "-", icon: <Package className="text-indigo-500" /> },
    { label: "Status", value: company?.type || "AGENT", change: "Active", icon: <Building2 className="text-emerald-500" /> },
    { label: "Credit Limit (THB)", value: `฿${(company?.creditLimit || 0).toLocaleString()}`, change: "-", icon: <TrendingUp className="text-amber-500" /> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800">Welcome, {dbUser?.name || 'Partner'}</h2>
          <p className="text-sm text-slate-500">{company?.name || 'Jongtour B2B Portal'}</p>
        </div>
        <div className="flex items-center gap-2">
          <select className="bg-white border border-slate-200 text-sm rounded-md px-3 py-2 text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
            <option>Last 30 Days</option>
            <option>This Month</option>
            <option>This Year</option>
          </select>
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-sm">
            Download Report
          </button>
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
            <h3 className="font-semibold text-slate-800">Recent Bookings (B2B)</h3>
            <button className="text-sm text-indigo-600 font-medium hover:text-indigo-800">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3">Booking Ref</th>
                  <th className="px-6 py-3">Agent</th>
                  <th className="px-6 py-3">Tour</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Amount</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {[
                  { ref: "BK-2026-0501", agent: "Global Travel Co.", tour: "Japan Classic 5D3N", date: "Oct 12, 2026", amount: "฿125,000", status: "Confirmed", statusColor: "bg-emerald-100 text-emerald-700" },
                  { ref: "BK-2026-0502", agent: "Siam Holiday", tour: "Swiss Alps Explorer", date: "Nov 05, 2026", amount: "฿340,000", status: "Pending", statusColor: "bg-amber-100 text-amber-700" },
                  { ref: "BK-2026-0503", agent: "Wanderlust TH", tour: "Vietnam Danang", date: "Sep 20, 2026", amount: "฿45,000", status: "Paid", statusColor: "bg-blue-100 text-blue-700" },
                  { ref: "BK-2026-0504", agent: "Global Travel Co.", tour: "Korea Winter Snow", date: "Dec 15, 2026", amount: "฿88,000", status: "Confirmed", statusColor: "bg-emerald-100 text-emerald-700" },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{row.ref}</td>
                    <td className="px-6 py-4 text-slate-600">{row.agent}</td>
                    <td className="px-6 py-4 text-slate-600">{row.tour}</td>
                    <td className="px-6 py-4 text-slate-600">{row.date}</td>
                    <td className="px-6 py-4 font-medium text-slate-900">{row.amount}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${row.statusColor}`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions & Approvals */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="font-semibold text-slate-800 mb-4">Pending Approvals</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-orange-100 flex items-center justify-center text-orange-600">
                    <Users size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">New Agent Reg.</p>
                    <p className="text-xs text-slate-500">Traveloka Partner</p>
                  </div>
                </div>
                <button className="text-xs bg-indigo-50 text-indigo-600 font-medium px-2 py-1 rounded hover:bg-indigo-100">Review</button>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-purple-100 flex items-center justify-center text-purple-600">
                    <Building2 size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">New Supplier</p>
                    <p className="text-xs text-slate-500">KTC Tour</p>
                  </div>
                </div>
                <button className="text-xs bg-indigo-50 text-indigo-600 font-medium px-2 py-1 rounded hover:bg-indigo-100">Review</button>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="font-semibold text-slate-800 mb-4">System Health</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600">API Sync (Zego)</span>
                  <span className="text-emerald-600 font-medium">99.9%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-emerald-500 h-2 rounded-full w-[99%]"></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600">API Sync (Go365)</span>
                  <span className="text-emerald-600 font-medium">98.5%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-emerald-500 h-2 rounded-full w-[98.5%]"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
