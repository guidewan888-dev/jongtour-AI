// Scraper Dashboard — Tour List
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";

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

  // Stats
  const { count: totalCount } = await supabase.from("scraper_tours").select("id", { count: "exact", head: true });
  const { count: owtCount } = await supabase.from("scraper_tours").select("id", { count: "exact", head: true }).eq("site", "oneworldtour");
  const { count: itCount } = await supabase.from("scraper_tours").select("id", { count: "exact", head: true }).eq("site", "itravels");

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">🕷️ Tour Scraper Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">ข้อมูลทัวร์ที่ scrape จากเว็บภายนอก</p>
        </div>
        <Link
          href="/scraper/runs"
          className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
        >
          📊 Scrape History
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-sm text-slate-500">ทั้งหมด</p>
          <p className="text-2xl font-bold text-slate-800">{totalCount ?? 0}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-sm text-slate-500">OneWorldTour</p>
          <p className="text-2xl font-bold text-blue-600">{owtCount ?? 0}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-sm text-slate-500">iTravels</p>
          <p className="text-2xl font-bold text-purple-600">{itCount ?? 0}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4">
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
        <div className="flex gap-1 ml-auto">
          <Link href="/scraper" className={`px-3 py-1.5 text-sm rounded-lg ${!site ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
            ทั้งหมด
          </Link>
          <Link href="/scraper?site=oneworldtour" className={`px-3 py-1.5 text-sm rounded-lg ${site === "oneworldtour" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
            OneWorldTour
          </Link>
          <Link href="/scraper?site=itravels" className={`px-3 py-1.5 text-sm rounded-lg ${site === "itravels" ? "bg-purple-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
            iTravels
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
              href={`/scraper/tours/${t.id}`}
              key={t.id}
              className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              {t.cover_image_url ? (
                <div className="aspect-video bg-slate-100 overflow-hidden">
                  <img
                    src={t.cover_image_url}
                    alt={t.title ?? ""}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              ) : (
                <div className="aspect-video bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center text-3xl">
                  🏝️
                </div>
              )}
              <div className="p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                    t.site === "oneworldtour" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"
                  }`}>
                    {t.site}
                  </span>
                  <span className="text-[11px] text-slate-400">{t.tour_code}</span>
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
          <p className="text-sm">ยังไม่มีข้อมูลทัวร์ — รัน scraper ก่อน</p>
        </div>
      )}
    </div>
  );
}
