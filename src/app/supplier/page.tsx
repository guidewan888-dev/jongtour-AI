import { Package, CalendarClock, Users, Wallet, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function SupplierDashboardPage() {
  // Mock Data for Supplier Dashboard
  const stats = [
    { label: "Active Tours", value: "12", subtext: "2 Pending Approval", icon: <Package className="text-indigo-500" /> },
    { label: "Pax This Week", value: "148", subtext: "Across 4 departures", icon: <Users className="text-teal-500" /> },
    { label: "Booking Requests", value: "5", subtext: "Needs Confirmation", icon: <CalendarClock className="text-amber-500" /> },
    { label: "Pending Payout", value: "฿450,200", subtext: "Next cycle: 15 May", icon: <Wallet className="text-emerald-500" /> },
  ];

  const pendingBookings = [
    { id: "B-88392", agent: "Travel Guide Co.", tour: "OSAKA-KYOTO 5D3N", date: "10 May 2026", pax: 4, amount: "฿120,000", status: "WAITING_CONFIRM" },
    { id: "B-88394", agent: "Siam Holiday", tour: "OSAKA-KYOTO 5D3N", date: "10 May 2026", pax: 2, amount: "฿60,000", status: "WAITING_CONFIRM" },
    { id: "B-88398", agent: "Direct B2C", tour: "HOKKAIDO SUMMER 6D4N", date: "12 May 2026", pax: 6, amount: "฿210,000", status: "WAITING_CONFIRM" },
  ];

  const upcomingDepartures = [
    { tour: "OSAKA-KYOTO 5D3N", date: "10 May 2026", totalPax: 28, capacity: 30, manifestReady: true },
    { tour: "HOKKAIDO SUMMER 6D4N", date: "12 May 2026", totalPax: 15, capacity: 20, manifestReady: false },
    { tour: "TOKYO-FUJI 5D3N", date: "15 May 2026", totalPax: 30, capacity: 30, manifestReady: true },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800">Supplier Dashboard</h2>
          <p className="text-sm text-slate-500">Manage your tours, allotments, and operations efficiently.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/supplier/tours/create" className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-sm">
            + New Tour Package
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-slate-500">{stat.label}</p>
              <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100">
                {stat.icon}
              </div>
            </div>
            <p className="text-3xl font-black text-slate-800">{stat.value}</p>
            <p className="text-xs text-slate-500 mt-2 font-medium">{stat.subtext}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Booking Requests */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Clock size={18} className="text-amber-500" />
              Action Required: Confirm Bookings
            </h3>
            <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-1 rounded-full">{pendingBookings.length} pending</span>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-sm text-left">
              <thead className="bg-white text-slate-500 font-medium border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3">Ref</th>
                  <th className="px-6 py-3">Agent</th>
                  <th className="px-6 py-3">Tour</th>
                  <th className="px-6 py-3 text-center">Pax</th>
                  <th className="px-6 py-3 text-right">Net Amount</th>
                  <th className="px-6 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {pendingBookings.map((booking, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-mono font-medium text-slate-900">{booking.id}</td>
                    <td className="px-6 py-4 text-slate-600">{booking.agent}</td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-800">{booking.tour}</p>
                      <p className="text-xs text-slate-500">{booking.date}</p>
                    </td>
                    <td className="px-6 py-4 text-center font-medium">{booking.pax}</td>
                    <td className="px-6 py-4 text-right font-bold text-teal-600">{booking.amount}</td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex gap-2 justify-center">
                        <button className="bg-teal-50 text-teal-700 hover:bg-teal-100 px-3 py-1.5 rounded text-xs font-bold transition-colors">Confirm</button>
                        <button className="bg-slate-50 text-slate-600 hover:bg-slate-100 px-3 py-1.5 rounded text-xs font-medium transition-colors border border-slate-200">Reject</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Upcoming Departures */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-200 bg-slate-50">
            <h3 className="font-bold text-slate-800">Upcoming Departures</h3>
            <p className="text-xs text-slate-500 mt-1">Next 7 days operations</p>
          </div>
          <div className="p-4 space-y-4">
            {upcomingDepartures.map((dep, i) => (
              <div key={i} className="border border-slate-200 rounded-lg p-4 relative overflow-hidden group">
                {/* Status Bar */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${dep.totalPax >= dep.capacity ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
                
                <p className="font-bold text-slate-800 text-sm mb-1">{dep.tour}</p>
                <div className="flex justify-between items-center mb-3">
                  <p className="text-xs text-slate-500">{dep.date}</p>
                  <p className="text-xs font-medium bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                    {dep.totalPax}/{dep.capacity} Seats
                  </p>
                </div>
                
                {dep.manifestReady ? (
                  <button className="w-full flex items-center justify-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 py-2 rounded text-xs font-bold transition-colors">
                    <CheckCircle size={14} />
                    Download Manifest
                  </button>
                ) : (
                  <div className="w-full flex items-center justify-center gap-2 bg-slate-50 text-slate-500 py-2 rounded text-xs font-medium border border-slate-200 border-dashed">
                    <AlertCircle size={14} />
                    Pending Final Names
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
