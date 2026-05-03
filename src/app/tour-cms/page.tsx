import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Search, Filter, Edit, Trash2, MapPin } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function TourCmsPage({
  searchParams,
}: {
  searchParams: { q?: string; source?: string };
}) {
  const query = searchParams.q || "";
  const sourceFilter = searchParams.source || "ALL";

  // Build where clause
  const where: any = {};
  if (query) {
    where.OR = [
      { tourName: { contains: query, mode: "insensitive" } },
      { destinations: { some: { country: { contains: query, mode: "insensitive" } } } },
    ];
  }
  if (sourceFilter !== "ALL") {
    where.supplier = { bookingMethod: sourceFilter };
  }

  const tours = await prisma.tour.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      supplier: true,
      destinations: true,
      images: { take: 1 },
      departures: {
        take: 1,
        include: { prices: true }
      },
      _count: {
        select: { departures: true }
      }
    },
    take: 50,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800">รายการแพ็กเกจทัวร์</h2>
          <p className="text-sm text-slate-500">จัดการข้อมูลแพ็กเกจทัวร์ทั้งหมดในระบบ</p>
        </div>
        <Link 
          href="/tour-cms/new"
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          เพิ่มทัวร์ใหม่
        </Link>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {/* Filters */}
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-4 bg-slate-50">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <form action="/tour-cms" method="GET">
              <input
                type="text"
                name="q"
                defaultValue={query}
                placeholder="ค้นหาชื่อทัวร์ หรือ จุดหมายปลายทาง..."
                className="pl-9 block w-full rounded-md border border-slate-300 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              <input type="hidden" name="source" value={sourceFilter} />
            </form>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <form action="/tour-cms" method="GET">
              <input type="hidden" name="q" value={query} />
              <select 
                name="source"
                defaultValue={sourceFilter}
                onChange={(e) => e.target.form?.submit()}
                className="block w-full rounded-md border border-slate-300 py-2 pl-3 pr-10 text-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="ALL">ทุกแหล่งที่มา</option>
                <option value="MANUAL">ทำมือ (Manual)</option>
                <option value="API_ZEGO">Zego API</option>
                <option value="API_GO365">Go365 API</option>
              </select>
            </form>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-white text-slate-500 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">แพ็กเกจทัวร์</th>
                <th className="px-6 py-4">ปลายทาง</th>
                <th className="px-6 py-4">ระยะเวลา</th>
                <th className="px-6 py-4">ราคาเริ่มต้น</th>
                <th className="px-6 py-4">แหล่งที่มา</th>
                <th className="px-6 py-4">รอบเดินทาง</th>
                <th className="px-6 py-4 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {tours.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    ไม่พบข้อมูลแพ็กเกจทัวร์
                  </td>
                </tr>
              ) : (
                tours.map((tour) => (
                  <tr key={tour.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                          {tour.images[0]?.imageUrl ? (
                            <img src={tour.images[0].imageUrl} alt={tour.tourName} className="w-full h-full object-cover" />
                          ) : (
                            <MapPin className="w-5 h-5 text-slate-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition-colors" title={tour.tourName}>
                            {tour.tourName}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {tour.supplier?.displayName || "Jongtour"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{tour.destinations?.map(d => d.country).join(', ') || '-'}</td>
                    <td className="px-6 py-4 text-slate-600">{tour.durationDays} วัน</td>
                    <td className="px-6 py-4 font-medium text-slate-900">
                      ฿{(tour.departures?.[0]?.prices?.[0]?.sellingPrice || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase ${
                        tour.supplier?.bookingMethod === 'MANUAL' ? 'bg-purple-100 text-purple-700' :
                        tour.supplier?.bookingMethod?.includes('API') ? 'bg-orange-100 text-orange-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {tour.supplier?.bookingMethod || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {tour._count.departures} รอบ
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link 
                          href={`/tour-cms/${tour.id}`}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                          title="แก้ไขทัวร์"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        {tour.supplier?.bookingMethod === 'MANUAL' && (
                          <button 
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            title="ลบทัวร์"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
