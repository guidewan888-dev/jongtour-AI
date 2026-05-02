import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Save, CalendarDays, ExternalLink } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function EditTourCmsPage({ params }: { params: { id: string } }) {
  const { id } = params;

  const tour = await prisma.tour.findUnique({
    where: { id },
    include: {
      departures: {
        orderBy: { startDate: 'asc' },
        take: 5
      }
    }
  });

  if (!tour) {
    notFound();
  }

  const isApiTour = tour.source.includes("API");

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link 
            href="/tour-cms"
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-200 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-800">
              {isApiTour ? "รายละเอียดแพ็กเกจทัวร์" : "แก้ไขแพ็กเกจทัวร์"}
            </h2>
            <p className="text-sm text-slate-500">ID: {tour.id}</p>
          </div>
        </div>
        
        {isApiTour && (
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold tracking-wide">
            {tour.source} (Read-only)
          </span>
        )}
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 bg-slate-50">
          <h3 className="font-semibold text-slate-800">ข้อมูลพื้นฐาน (Basic Information)</h3>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              ชื่อแพ็กเกจทัวร์ (Tour Title)
            </label>
            <input
              type="text"
              defaultValue={tour.title}
              disabled={isApiTour}
              className="block w-full rounded-md border-gray-300 border focus:ring-indigo-500 focus:border-indigo-500 px-4 py-2 sm:text-sm disabled:bg-slate-50 disabled:text-slate-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Destination */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                จุดหมายปลายทาง (Destination)
              </label>
              <input
                type="text"
                defaultValue={tour.destination}
                disabled={isApiTour}
                className="block w-full rounded-md border-gray-300 border focus:ring-indigo-500 focus:border-indigo-500 px-4 py-2 sm:text-sm disabled:bg-slate-50 disabled:text-slate-500"
              />
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                จำนวนวัน (Duration Days)
              </label>
              <div className="relative">
                <input
                  type="number"
                  defaultValue={tour.durationDays}
                  disabled={isApiTour}
                  className="block w-full rounded-md border-gray-300 border focus:ring-indigo-500 focus:border-indigo-500 pl-4 pr-12 py-2 sm:text-sm disabled:bg-slate-50 disabled:text-slate-500"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-slate-500 sm:text-sm">วัน</span>
                </div>
              </div>
            </div>
          </div>

          {/* Price & Image */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                ราคาเริ่มต้น (Starting Price)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-slate-500 sm:text-sm">฿</span>
                </div>
                <input
                  type="number"
                  defaultValue={tour.price}
                  disabled={isApiTour}
                  className="block w-full rounded-md border-gray-300 border focus:ring-indigo-500 focus:border-indigo-500 pl-8 pr-4 py-2 sm:text-sm disabled:bg-slate-50 disabled:text-slate-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                ลิงก์รูปภาพ (Image URL)
              </label>
              <input
                type="url"
                defaultValue={tour.imageUrl || ""}
                disabled={isApiTour}
                className="block w-full rounded-md border-gray-300 border focus:ring-indigo-500 focus:border-indigo-500 px-4 py-2 sm:text-sm disabled:bg-slate-50 disabled:text-slate-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              รายละเอียดแบบย่อ (Description)
            </label>
            <textarea
              defaultValue={tour.description || ""}
              disabled={isApiTour}
              rows={4}
              className="block w-full rounded-md border-gray-300 border focus:ring-indigo-500 focus:border-indigo-500 px-4 py-2 sm:text-sm disabled:bg-slate-50 disabled:text-slate-500"
            />
          </div>
        </div>

        {!isApiTour && (
          <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
            <button
              className="flex items-center gap-2 px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <Save className="w-4 h-4" />
              บันทึกการเปลี่ยนแปลง
            </button>
          </div>
        )}
      </div>

      {/* Departures Preview */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden mt-8">
        <div className="px-6 py-5 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-indigo-500" />
            รอบวันเดินทาง (Departures)
          </h3>
          <Link href={`/tour-cms/${tour.id}/departures`} className="text-sm text-indigo-600 font-medium hover:text-indigo-800 flex items-center gap-1">
            จัดการรอบเดินทาง <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
        <div className="p-0">
          <table className="w-full text-sm text-left">
            <thead className="bg-white text-slate-500 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-3">วันเดินทางไป</th>
                <th className="px-6 py-3">วันเดินทางกลับ</th>
                <th className="px-6 py-3">ที่นั่งว่าง / ทั้งหมด</th>
                <th className="px-6 py-3 text-right">ราคาผู้ใหญ่</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {tour.departures.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                    ยังไม่มีรอบเดินทางสำหรับทัวร์นี้
                  </td>
                </tr>
              ) : (
                tour.departures.map((dep) => (
                  <tr key={dep.id} className="hover:bg-slate-50">
                    <td className="px-6 py-3">{new Date(dep.startDate).toLocaleDateString('th-TH')}</td>
                    <td className="px-6 py-3">{new Date(dep.endDate).toLocaleDateString('th-TH')}</td>
                    <td className="px-6 py-3">
                      <span className="font-medium text-slate-900">{dep.availableSeats}</span> / {dep.totalSeats}
                    </td>
                    <td className="px-6 py-3 text-right font-medium text-indigo-600">
                      ฿{dep.price.toLocaleString()}
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
