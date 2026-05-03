import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Save, Plus, Trash2, CalendarDays } from "lucide-react";
import { createDeparture, deleteDeparture } from "./actions";

export const dynamic = "force-dynamic";

export default async function TourDeparturesCmsPage({ params }: { params: { id: string } }) {
  const { id } = params;

  const tour = await prisma.tour.findUnique({
    where: { id },
    include: {
      supplier: true,
      departures: {
        orderBy: { startDate: 'asc' },
        include: {
          prices: true,
          _count: {
            select: { bookings: true }
          }
        }
      }
    }
  });

  if (!tour) {
    notFound();
  }

  const isApiTour = tour.supplier?.bookingMethod?.includes("API") || false;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link 
          href={`/tour-cms/${id}`}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-200 transition-colors shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800 flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-indigo-500" />
            จัดการรอบวันเดินทาง (Departures)
          </h2>
          <p className="text-sm text-slate-500">ทัวร์: {tour.tourName}</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <h3 className="font-semibold text-slate-800">รอบวันเดินทางทั้งหมด</h3>
        </div>
        
        {/* Table of Existing Departures */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">วันเดินทางไป - กลับ</th>
                <th className="px-6 py-4">ราคาขาย (ผู้ใหญ่)</th>
                <th className="px-6 py-4 text-slate-400">ราคาเน็ต (Net)</th>
                <th className="px-6 py-4 text-slate-400">มัดจำ</th>
                <th className="px-6 py-4 text-center">ที่นั่ง (ว่าง/ทั้งหมด)</th>
                <th className="px-6 py-4 text-center">ยอดจอง</th>
                <th className="px-6 py-4 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {tour.departures.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    ยังไม่มีรอบเดินทางสำหรับทัวร์นี้
                  </td>
                </tr>
              ) : (
                tour.departures.map((dep) => (
                  <tr key={dep.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">
                        {new Date(dep.startDate).toLocaleDateString('th-TH')} - {new Date(dep.endDate).toLocaleDateString('th-TH')}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-indigo-600">
                      ฿{(dep.prices?.[0]?.sellingPrice || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {dep.prices?.[0]?.netPrice ? `฿${dep.prices[0].netPrice.toLocaleString()}` : '-'}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      -
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`font-bold ${dep.remainingSeats <= 5 ? 'text-orange-500' : 'text-emerald-600'}`}>
                        {dep.remainingSeats}
                      </span> / {dep.totalSeats}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {dep._count.bookings > 0 ? (
                        <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-bold">
                          {dep._count.bookings}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {!isApiTour && (
                        <form action={async () => {
                          "use server";
                          await deleteDeparture(dep.id, tour.id);
                        }}>
                          <button 
                            type="submit"
                            disabled={dep._count.bookings > 0}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400"
                            title={dep._count.bookings > 0 ? "ไม่สามารถลบได้เนื่องจากมียอดจองแล้ว" : "ลบรอบเดินทางนี้"}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </form>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Inline Form for New Departure (Only for Manual Tours) */}
        {!isApiTour && (
          <div className="border-t-2 border-indigo-100 bg-indigo-50/30 p-6">
            <h4 className="font-bold text-indigo-900 flex items-center gap-2 mb-4">
              <Plus className="w-4 h-4" />
              เพิ่มรอบวันเดินทางใหม่
            </h4>
            
            <form action={async (formData) => {
              "use server";
              await createDeparture(tour.id, formData);
            }}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                {/* Dates */}
                <div className="lg:col-span-1">
                  <label htmlFor="startDate" className="block text-xs font-medium text-slate-700 mb-1">วันไป *</label>
                  <input type="date" id="startDate" name="startDate" required className="block w-full rounded-md border-gray-300 border focus:ring-indigo-500 focus:border-indigo-500 px-3 py-1.5 text-sm" />
                </div>
                <div className="lg:col-span-1">
                  <label htmlFor="endDate" className="block text-xs font-medium text-slate-700 mb-1">วันกลับ *</label>
                  <input type="date" id="endDate" name="endDate" required className="block w-full rounded-md border-gray-300 border focus:ring-indigo-500 focus:border-indigo-500 px-3 py-1.5 text-sm" />
                </div>
                
                {/* Seats */}
                <div className="lg:col-span-1">
                  <label htmlFor="totalSeats" className="block text-xs font-medium text-slate-700 mb-1">จำนวนที่นั่งทั้งหมด *</label>
                  <input type="number" id="totalSeats" name="totalSeats" required min={1} className="block w-full rounded-md border-gray-300 border focus:ring-indigo-500 focus:border-indigo-500 px-3 py-1.5 text-sm" placeholder="เช่น 30" />
                </div>

                {/* Price */}
                <div className="lg:col-span-1">
                  <label htmlFor="price" className="block text-xs font-medium text-slate-700 mb-1">ราคาขาย (ผู้ใหญ่) *</label>
                  <input type="number" id="price" name="price" required min={0} className="block w-full rounded-md border-gray-300 border focus:ring-indigo-500 focus:border-indigo-500 px-3 py-1.5 text-sm" placeholder="เช่น 39900" />
                </div>

                {/* Net Price (Optional) */}
                <div className="lg:col-span-1">
                  <label htmlFor="netPrice" className="block text-xs font-medium text-slate-500 mb-1">ราคา Net (ถ้ามี)</label>
                  <input type="number" id="netPrice" name="netPrice" min={0} className="block w-full rounded-md border-gray-300 border focus:ring-indigo-500 focus:border-indigo-500 px-3 py-1.5 text-sm" placeholder="เช่น 35000" />
                </div>
              </div>

              {/* Advanced Optional Prices */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-indigo-100/50">
                <div>
                  <label htmlFor="childPrice" className="block text-xs font-medium text-slate-500 mb-1">ราคาเด็ก (Optional)</label>
                  <input type="number" id="childPrice" name="childPrice" min={0} className="block w-full rounded-md border-gray-300 border px-3 py-1.5 text-sm" />
                </div>
                <div>
                  <label htmlFor="singleRoomPrice" className="block text-xs font-medium text-slate-500 mb-1">ราคาพักเดี่ยว (Optional)</label>
                  <input type="number" id="singleRoomPrice" name="singleRoomPrice" min={0} className="block w-full rounded-md border-gray-300 border px-3 py-1.5 text-sm" />
                </div>
                <div>
                  <label htmlFor="depositPrice" className="block text-xs font-medium text-slate-500 mb-1">ราคามัดจำ (Optional)</label>
                  <input type="number" id="depositPrice" name="depositPrice" min={0} className="block w-full rounded-md border-gray-300 border px-3 py-1.5 text-sm" />
                </div>
                
                {/* Submit Button */}
                <div className="flex items-end justify-end">
                  <button type="submit" className="w-full flex items-center justify-center gap-2 px-4 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <Save className="w-4 h-4" />
                    บันทึกรอบเดินทาง
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
