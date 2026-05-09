// Scraper Dashboard — Scrape Run History
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";

export default async function ScraperRunsPage() {
  const supabase = createClient();

  const { data: runs } = await supabase
    .from("scraper_runs")
    .select("*")
    .order("started_at", { ascending: false })
    .limit(50);

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-400 mb-2">
            <Link href="/scraper" className="hover:text-orange-500">Dashboard</Link>
            <span>/</span>
            <span className="text-slate-600">Scrape History</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800">📊 Scrape Run History</h1>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left">
              <tr>
                <th className="p-3 font-medium text-slate-600">เวลาเริ่ม</th>
                <th className="p-3 font-medium text-slate-600">เว็บ</th>
                <th className="p-3 font-medium text-slate-600">สถานะ</th>
                <th className="p-3 font-medium text-slate-600 text-center">เจอ</th>
                <th className="p-3 font-medium text-slate-600 text-center">สำเร็จ</th>
                <th className="p-3 font-medium text-slate-600 text-center">ล้มเหลว</th>
                <th className="p-3 font-medium text-slate-600 text-center">รูป</th>
                <th className="p-3 font-medium text-slate-600">ระยะเวลา</th>
              </tr>
            </thead>
            <tbody>
              {runs?.map((r) => {
                const duration = r.finished_at && r.started_at
                  ? Math.round((new Date(r.finished_at).getTime() - new Date(r.started_at).getTime()) / 1000)
                  : null;

                return (
                  <tr key={r.id} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="p-3 whitespace-nowrap">
                      {new Date(r.started_at).toLocaleString("th-TH", { dateStyle: "short", timeStyle: "short" })}
                    </td>
                    <td className="p-3">
                      <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                        r.site === "worldconnection" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"
                      }`}>
                        {r.site}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                        r.status === "success" ? "bg-green-100 text-green-700" :
                        r.status === "failed" ? "bg-red-100 text-red-700" :
                        "bg-amber-100 text-amber-700"
                      }`}>
                        {r.status === "success" ? "✅ สำเร็จ" :
                         r.status === "failed" ? "❌ ล้มเหลว" : "⏳ กำลังรัน"}
                      </span>
                    </td>
                    <td className="p-3 text-center font-medium">{r.urls_found ?? 0}</td>
                    <td className="p-3 text-center font-medium text-green-600">{r.urls_scraped ?? 0}</td>
                    <td className="p-3 text-center font-medium text-red-600">{r.urls_failed ?? 0}</td>
                    <td className="p-3 text-center">{r.images_saved ?? 0}</td>
                    <td className="p-3 text-xs text-slate-400">
                      {duration !== null ? formatDuration(duration) : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {(!runs || runs.length === 0) && (
          <div className="text-center py-12 text-slate-400">
            <p className="text-3xl mb-2">📊</p>
            <p className="text-sm">ยังไม่มีประวัติการ scrape</p>
          </div>
        )}
      </div>
    </div>
  );
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m}m`;
}
