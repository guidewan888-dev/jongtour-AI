// Scraper Dashboard — Tour Detail
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";

export default async function ScraperTourDetail({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const tourId = Number(params.id);

  const [{ data: tour }, { data: periods }, { data: images }] = await Promise.all([
    supabase.from("scraper_tours").select("*").eq("id", tourId).single(),
    supabase.from("scraper_tour_periods").select("*").eq("tour_id", tourId).order("start_date"),
    supabase.from("scraper_tour_images").select("*").eq("tour_id", tourId).order("sort_order"),
  ]);

  if (!tour) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <p className="text-slate-500">ไม่พบทัวร์</p>
        <Link href="/scraper" className="text-orange-500 text-sm mt-2 inline-block">← กลับ</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-400 mb-4">
        <Link href="/scraper" className="hover:text-orange-500">Dashboard</Link>
        <span>/</span>
        <span className="text-slate-600">{tour.tour_code}</span>
      </div>

      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                tour.site === "worldconnection" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"
              }`}>
                {tour.site}
              </span>
              <span className="text-sm text-slate-500">{tour.tour_code}</span>
              <span className={`text-xs px-2 py-0.5 rounded ${tour.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                {tour.is_active ? "Active" : "Inactive"}
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-800">{tour.title}</h1>
            <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
              {tour.duration && <span>⏱ {tour.duration}</span>}
              {tour.airline && <span>✈️ {tour.airline}</span>}
              {tour.country && <span>📍 {tour.country}</span>}
            </div>
          </div>
          <div className="text-right">
            {tour.price_from && (
              <p className="text-2xl font-bold text-emerald-600">฿{Number(tour.price_from).toLocaleString()}</p>
            )}
            <p className="text-xs text-slate-400 mt-1">
              อัปเดต: {tour.last_scraped_at ? new Date(tour.last_scraped_at).toLocaleString("th-TH") : "-"}
            </p>
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <a href={tour.source_url} target="_blank" rel="noopener noreferrer"
             className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100">
            ↗ เปิดต้นทาง
          </a>
          {tour.pdf_url && (
            <a href={tour.pdf_url} target="_blank" rel="noopener noreferrer"
               className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100">
              📄 ดาวน์โหลด PDF
            </a>
          )}
        </div>
      </div>

      {/* Images */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
        <h2 className="text-base font-semibold text-slate-800 mb-3">🖼️ รูปภาพ ({images?.length ?? 0})</h2>
        {images && images.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {images.map((img) => (
              <a key={img.id} href={img.public_url} target="_blank" rel="noopener noreferrer" className="group">
                <div className="aspect-square rounded-lg overflow-hidden bg-slate-100">
                  <img
                    src={img.public_url}
                    alt=""
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    loading="lazy"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1 truncate">{img.width}×{img.height} • {Math.round(img.file_size / 1024)}KB</p>
              </a>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400">ไม่มีรูปภาพ</p>
        )}
      </div>

      {/* Periods */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
        <h2 className="text-base font-semibold text-slate-800 mb-3">📅 วันเดินทาง ({periods?.length ?? 0})</h2>
        {periods && periods.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left">
                <tr>
                  <th className="p-2.5 font-medium text-slate-600">เริ่ม</th>
                  <th className="p-2.5 font-medium text-slate-600">สิ้นสุด</th>
                  <th className="p-2.5 font-medium text-slate-600">ราคา</th>
                  <th className="p-2.5 font-medium text-slate-600">ที่นั่ง</th>
                  <th className="p-2.5 font-medium text-slate-600">สถานะ</th>
                  <th className="p-2.5 font-medium text-slate-600">Raw</th>
                </tr>
              </thead>
              <tbody>
                {periods.map((p) => (
                  <tr key={p.id} className="border-t border-slate-100">
                    <td className="p-2.5">{p.start_date ?? "-"}</td>
                    <td className="p-2.5">{p.end_date ?? "-"}</td>
                    <td className="p-2.5 font-medium">{p.price ? `฿${Number(p.price).toLocaleString()}` : "-"}</td>
                    <td className="p-2.5">{p.seats_left ?? "-"}</td>
                    <td className="p-2.5">
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        p.status === "open" ? "bg-green-100 text-green-700" :
                        p.status === "full" ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-600"
                      }`}>{p.status}</span>
                    </td>
                    <td className="p-2.5 text-xs text-slate-400 max-w-[200px] truncate">{p.raw_text}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-slate-400">ไม่มีข้อมูลวันเดินทาง</p>
        )}
      </div>

      {/* Itinerary */}
      {tour.itinerary_html && (
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <h2 className="text-base font-semibold text-slate-800 mb-3">📋 โปรแกรมทัวร์</h2>
          <div
            className="prose prose-sm max-w-none text-slate-700"
            dangerouslySetInnerHTML={{ __html: tour.itinerary_html }}
          />
        </div>
      )}
    </div>
  );
}
