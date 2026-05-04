import { Calendar, Search, Filter, MoreVertical, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export default async function DeparturesManagementPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const today = new Date().toISOString();
  
  const { data: depsData } = await supabase
    .from('departures')
    .select(`
      id, 
      startDate, 
      endDate, 
      status, 
      totalSeats, 
      remainingSeats,
      supplierId,
      tours (tourCode, tourName),
      prices(paxType, sellingPrice, netPrice)
    `)
    .gte('startDate', today)
    .order('startDate', { ascending: true })
    .limit(50);

  const departures = (depsData || []).map((d: any) => {
    const adultPrice = d.prices?.find((p: any) => p.paxType === 'ADULT') || d.prices?.[0];
    return {
      id: d.id,
      tourCode: d.tours?.tourCode || 'UNKNOWN',
      title: d.tours?.tourName || 'Unknown Tour',
      date: `${new Date(d.startDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit' })} - ${new Date(d.endDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}`,
      status: d.remainingSeats > 0 ? (d.remainingSeats < 5 ? 'Almost Full' : 'Available') : 'Full',
      totalSeats: d.totalSeats || 0,
      availableSeats: d.remainingSeats || 0,
      retailPrice: adultPrice?.sellingPrice || 0,
      netPrice: adultPrice?.netPrice || 0,
      supplier: d.supplierId === 'SUP_LETGO' ? "Let's Go" : d.supplierId === 'SUP_TOURFACTORY' ? "Tour Factory" : d.supplierId === 'SUP_CHECKIN' ? "Check In" : d.supplierId
    };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800">Inventory & Departures</h2>
          <p className="text-sm text-slate-500">Manage seats, dates, and B2B pricing for all tours.</p>
        </div>
        <div className="flex gap-2">
          <button className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-sm flex items-center gap-2">
            <Calendar size={16} />
            Calendar View
          </button>
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-sm">
            Add Departure
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col md:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by tour code or title..." 
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <input type="month" className="border border-slate-200 rounded-md text-sm text-slate-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" defaultValue="2026-12" />
          <select className="border border-slate-200 rounded-md text-sm text-slate-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option>All Status</option>
            <option>Available</option>
            <option>Almost Full</option>
            <option>Full</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-3">Tour / Date</th>
                <th className="px-6 py-3">Supplier</th>
                <th className="px-6 py-3">Seats (Avail/Total)</th>
                <th className="px-6 py-3">Net Price (B2B)</th>
                <th className="px-6 py-3">Retail Price</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {departures.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">No departures found</td>
                </tr>
              ) : departures.map((dep) => (
                <tr key={dep.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-900">{dep.tourCode}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{dep.date}</p>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{dep.supplier}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-full bg-slate-100 rounded-full h-2 max-w-[100px]">
                        <div 
                          className={`h-2 rounded-full ${
                            dep.availableSeats === 0 ? 'bg-red-500' : 
                            (dep.availableSeats / (dep.totalSeats || 1)) < 0.2 ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.max(0, 100 - (dep.availableSeats / (dep.totalSeats || 1) * 100))}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-medium text-slate-700">{dep.availableSeats}/{dep.totalSeats}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-semibold text-indigo-600">
                    ฿{dep.netPrice.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-slate-600 line-through decoration-slate-300">
                    ฿{dep.retailPrice.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium w-fit
                      ${dep.status === 'Available' ? 'bg-emerald-100 text-emerald-700' : 
                        dep.status === 'Almost Full' ? 'bg-amber-100 text-amber-700' : 
                        dep.status === 'Full' ? 'bg-red-100 text-red-700' :
                        'bg-blue-100 text-blue-700'}`}>
                      {dep.status === 'Available' && <CheckCircle2 size={12} />}
                      {dep.status === 'Almost Full' && <Clock size={12} />}
                      {dep.status === 'Full' && <AlertCircle size={12} />}
                      {dep.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-slate-400 hover:text-indigo-600">
                      <MoreVertical size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
