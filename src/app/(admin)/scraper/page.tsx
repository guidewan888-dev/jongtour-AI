// Scraper Dashboard — Tour List + Sync Control
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import ScraperSyncButton from "./ScraperSyncButton";

export default async function ScraperDashboard({
  searchParams,
}: {
  searchParams: { site?: string; q?: string };
}) {
  const supabase = createClient();
  const { site, q } = searchParams;

  let query = supabase
    .from("scraper_tours")
    .select("id, site, tour_code, title, price_from, country, duration, airline, cover_image_url, last_scraped_at, is_active")
    .order("last_scraped_at", { ascending: false })
    .limit(60);

  if (site) query = query.eq("site", site);
  if (q) query = query.ilike("title", `%${q}%`);

  const { data: tours, error } = await query;

  // Stats per site
  const { count: totalCount } = await supabase.from("scraper_tours").select("id", { count: "exact", head: true });
  const { count: owtCount } = await supabase.from("scraper_tours").select("id", { count: "exact", head: true }).eq("site", "worldconnection");
  const { count: itCount } = await supabase.from("scraper_tours").select("id", { count: "exact", head: true }).eq("site", "itravels");
  const { count: bestCount } = await supabase.from("scraper_tours").select("id", { count: "exact", head: true }).eq("site", "bestintl");
  const { count: gsCount } = await supabase.from("scraper_tours").select("id", { count: "exact", head: true }).eq("site", "gs25");

  // Last sync run
  const { data: lastRun } = await supabase.from("scraper_runs").select("*").order("started_at", { ascending: false }).limit(1);
  const lastSync = lastRun?.[0];

  const SITE_COLORS: Record<string, string> = {
    worldconnection: "bg-orange-100 text-orange-700",
    itravels: "bg-sky-100 text-sky-700",
    bestintl: "bg-red-100 text-red-700",
    gs25: "bg-emerald-100 text-emerald-700",
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">🕷️ Tour Scraper Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">ข้อมูลทัวร์ที่ scrape จากเว็บพาร์ทเนอร์ — ซิ้งอัตโนมัติวันละ 1 ครั้ง</p>
        </div>
        <div className="flex items-center gap-3">
          <ScraperSyncButton />
          <Link
            href="/scraper/runs"
            className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
          >
            📊 Scrape History
          </Link>
        </div>
      </div>

      {/* Last Sync Info */}
      {lastSync && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className={`w-3 h-3 rounded-full ${lastSync.status === 'done' ? 'bg-green-500' : lastSync.status === 'running' ? 'bg-yellow-500 animate-pulse' : 'bg-red-500'}`} />
            <div>
              <p className="text-sm font-medium text-slate-700">
                Last Sync: <span className="font-bold">{lastSync.site_name || 'All Sites'}</span>
              </p>
              <p className="text-xs text-slate-500">
                {lastSync.started_at ? new Date(lastSync.started_at).toLocaleString('th-TH') : '-'}
                {lastSync.status === 'done' && lastSync.tours_scraped ? ` — ${lastSync.tours_scraped} tours scraped` : ''}
                {lastSync.status === 'error' ? ` — ❌ Error` : ''}
              </p>
            </div>
          </div>
          <span className={`px-3 py-1 text-xs font-bold rounded-full ${
            lastSync.status === 'done' ? 'bg-green-100 text-green-700' :
            lastSync.status === 'running' ? 'bg-yellow-100 text-yellow-700' :
            'bg-red-100 text-red-700'
          }`}>
            {lastSync.status?.toUpperCase() || 'UNKNOWN'}
          </span>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-sm text-slate-500">ทั้งหมด</p>
          <p className="text-2xl font-bold text-slate-800">{totalCount ?? 0}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-sm text-orange-600 font-medium">World Connection</p>
          <p className="text-2xl font-bold text-orange-600">{owtCount ?? 0}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-sm text-sky-600 font-medium">iTravels</p>
          <p className="text-2xl font-bold text-sky-600">{itCount ?? 0}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-sm text-red-600 font-medium">Best International</p>
          <p className="text-2xl font-bold text-red-600">{bestCount ?? 0}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-sm text-emerald-600 font-medium">GS25 Travel</p>
          <p className="text-2xl font-bold text-emerald-600">{gsCount ?? 0}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <form className="flex gap-2">
          <input
            name="q"
            defaultValue={q}
            placeholder="ค้นหาชื่อทัวร์..."
            className="px-3 py-2 text-sm border border-slate-200 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300"
          />
          <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600">
            ค้นหา
          </button>
        </form>
        <div className="flex gap-1 ml-auto flex-wrap">
          <Link href="/scraper" className={`px-3 py-1.5 text-sm rounded-lg ${!site ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
            ทั้งหมด
          </Link>
          <Link href="/scraper?site=worldconnection" className={`px-3 py-1.5 text-sm rounded-lg ${site === "worldconnection" ? "bg-orange-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
            World Connection
          </Link>
          <Link href="/scraper?site=itravels" className={`px-3 py-1.5 text-sm rounded-lg ${site === "itravels" ? "bg-sky-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
            iTravels
          </Link>
          <Link href="/scraper?site=bestintl" className={`px-3 py-1.5 text-sm rounded-lg ${site === "bestintl" ? "bg-red-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
            Best International
          </Link>
          <Link href="/scraper?site=gs25" className={`px-3 py-1.5 text-sm rounded-lg ${site === "gs25" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
            GS25
          </Link>
        </div>
      </div>

      {/* Tour Grid */}
      {error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
          ❌ {error.message}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {tours?.map((t) => (
            <Link
              href={`/tour/s/${(t.tour_code || '').toLowerCase()}`}
              key={t.id}
              className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              {t.cover_image_url ? (
                <div className="aspect-[3/4] bg-slate-100 overflow-hidden">
                  <img
                    src={t.cover_image_url}
                    alt={t.title ?? ""}
                    className="w-full h-full object-contain"
                    loading="lazy"
                  />
                </div>
              ) : (
                <div className="aspect-[3/4] bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center text-3xl">
                  🏝️
                </div>
              )}
              <div className="p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${SITE_COLORS[t.site] || "bg-slate-100 text-slate-700"}`}>
                    {t.site}
                  </span>
                  <span className="text-[11px] text-slate-400">{t.tour_code}</span>
                  {!t.is_active && <span className="text-[10px] px-1.5 py-0.5 bg-red-100 text-red-600 rounded font-medium">ปิด</span>}
                </div>
                <h3 className="text-sm font-medium text-slate-800 line-clamp-2 leading-snug">{t.title}</h3>
                <div className="flex items-center justify-between mt-2">
                  {t.price_from ? (
                    <span className="text-sm font-bold text-emerald-600">
                      ฿{Number(t.price_from).toLocaleString()}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400">ไม่ระบุราคา</span>
                  )}
                  <span className="text-[10px] text-slate-400">
                    {t.last_scraped_at ? new Date(t.last_scraped_at).toLocaleDateString("th-TH") : ""}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {(!tours || tours.length === 0) && !error && (
        <div className="text-center py-16 text-slate-400">
          <p className="text-4xl mb-3">🕷️</p>
          <p className="text-sm">ยังไม่มีข้อมูลทัวร์ — กดปุ่ม Sync เพื่อเริ่มดึงข้อมูล</p>
        </div>
      )}
    </div>
  );
}
