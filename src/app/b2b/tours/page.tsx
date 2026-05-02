import { Plus, Search, Filter, MoreVertical, Edit2, Copy, Trash2, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function TourManagementPage() {
  // In real MVP, fetch tours from database:
  // const tours = await prisma.tour.findMany({ include: { supplier: true, departures: true }});
  
  // Mock data for UI presentation
  const tours = [
    { id: '1', code: 'ZGJPN01', title: 'Japan Classic Snow Hokkaido', destination: 'Japan', duration: '5D3N', supplier: "Let's Go", status: 'Published', minPrice: 35000, departuresCount: 12 },
    { id: '2', code: 'ZGKR02', title: 'Korea Winter Ski Resort', destination: 'South Korea', duration: '5D3N', supplier: "Let's Go", status: 'Published', minPrice: 28900, departuresCount: 8 },
    { id: '3', code: 'EUSW01', title: 'Grand Switzerland', destination: 'Switzerland', duration: '8D5N', supplier: "Go365", status: 'Published', minPrice: 89000, departuresCount: 4 },
    { id: '4', code: 'VNDN01', title: 'Danang Ba Na Hills', destination: 'Vietnam', duration: '4D3N', supplier: "Tour Factory", status: 'Draft', minPrice: 15900, departuresCount: 0 },
    { id: '5', code: 'TWTP01', title: 'Taiwan Alishan Cherry Blossom', destination: 'Taiwan', duration: '5D4N', supplier: "Check in Group", status: 'Hidden', minPrice: 22000, departuresCount: 2 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800">Tour Products</h2>
          <p className="text-sm text-slate-500">Manage tour packages, itineraries, and media.</p>
        </div>
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-sm flex items-center gap-2">
          <Plus size={16} />
          Create New Tour
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col md:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by tour code, title, or destination..." 
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50">
            <Filter size={16} />
            Filters
          </button>
          <select className="border border-slate-200 rounded-md text-sm text-slate-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option>All Suppliers</option>
            <option>Let's Go</option>
            <option>Go365</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-3">Tour Code</th>
                <th className="px-6 py-3 min-w-[250px]">Tour Title</th>
                <th className="px-6 py-3">Destination</th>
                <th className="px-6 py-3">Supplier</th>
                <th className="px-6 py-3">Price From</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {tours.map((tour) => (
                <tr key={tour.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-1 rounded">
                      {tour.code}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-900">{tour.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{tour.duration} • {tour.departuresCount} active departures</p>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{tour.destination}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-sm bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold">
                        {tour.supplier.charAt(0)}
                      </div>
                      <span className="text-slate-600">{tour.supplier}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-900">
                    ฿{tour.minPrice.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium 
                      ${tour.status === 'Published' ? 'bg-emerald-100 text-emerald-700' : 
                        tour.status === 'Draft' ? 'bg-slate-100 text-slate-700' : 
                        'bg-amber-100 text-amber-700'}`}>
                      {tour.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded" title="Edit">
                        <Edit2 size={16} />
                      </button>
                      <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded" title="Duplicate">
                        <Copy size={16} />
                      </button>
                      <button className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded" title="View Portal">
                        <ExternalLink size={16} />
                      </button>
                      <button className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded" title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <span className="text-sm text-slate-500">Showing 1 to 5 of 142 entries</span>
          <div className="flex gap-1">
            <button className="px-3 py-1 border border-slate-200 rounded text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-50">Previous</button>
            <button className="px-3 py-1 border border-slate-200 rounded text-sm text-slate-600 hover:bg-slate-50">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
