import { Calendar, Search, Filter, MoreVertical, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function DeparturesManagementPage() {
  // Mock data for MVP presentation
  const departures = [
    { id: '1', tourCode: 'ZGJPN01', title: 'Japan Classic Snow Hokkaido', date: 'Dec 15 - Dec 19, 2026', status: 'Available', totalSeats: 30, availableSeats: 12, retailPrice: 35000, netPrice: 32000, supplier: "Let's Go" },
    { id: '2', tourCode: 'ZGJPN01', title: 'Japan Classic Snow Hokkaido', date: 'Dec 22 - Dec 26, 2026', status: 'Almost Full', totalSeats: 30, availableSeats: 3, retailPrice: 38000, netPrice: 35000, supplier: "Let's Go" },
    { id: '3', tourCode: 'ZGKR02', title: 'Korea Winter Ski Resort', date: 'Dec 10 - Dec 14, 2026', status: 'Full', totalSeats: 25, availableSeats: 0, retailPrice: 28900, netPrice: 26000, supplier: "Let's Go" },
    { id: '4', tourCode: 'EUSW01', title: 'Grand Switzerland', date: 'Nov 05 - Nov 12, 2026', status: 'Available', totalSeats: 20, availableSeats: 15, retailPrice: 89000, netPrice: 82000, supplier: "Go365" },
    { id: '5', tourCode: 'VNDN01', title: 'Danang Ba Na Hills', date: 'Oct 20 - Oct 23, 2026', status: 'On Request', totalSeats: 15, availableSeats: 15, retailPrice: 15900, netPrice: 14500, supplier: "Tour Factory" },
  ];

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
              {departures.map((dep) => (
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
                            (dep.availableSeats / dep.totalSeats) < 0.2 ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.max(0, 100 - (dep.availableSeats / dep.totalSeats * 100))}%` }}
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
