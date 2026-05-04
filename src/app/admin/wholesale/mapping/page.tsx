import { ArrowRightLeft, GitBranch, Save } from 'lucide-react';

export default function SchemaMappingPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto flex flex-col h-[calc(100vh-64px)]">
      <div className="flex justify-between items-end mb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 mb-1">Schema Mapping Studio</h1>
          <p className="text-slate-500 text-xs">จับคู่ข้อมูลดิบจาก Wholesale ให้ตรงกับมาตรฐานฐานข้อมูลของ Jongtour</p>
        </div>
        <div className="flex gap-2">
          <select className="bg-slate-950 border border-slate-800 text-slate-300 text-xs px-3 py-2 rounded outline-none font-mono">
            <option>SUP-5f8a9b21 (letgo_group)</option>
          </select>
          <button className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded flex items-center gap-2 transition-colors">
            <Save size={14} /> Save Mapping
          </button>
        </div>
      </div>

      <div className="flex-1 flex gap-6 min-h-0">
        {/* Left: Raw API JSON */}
        <div className="w-1/3 bg-slate-950 border border-slate-800 rounded-lg flex flex-col">
          <div className="p-3 border-b border-slate-800 bg-black flex justify-between items-center">
            <span className="text-xs font-bold text-slate-400 flex items-center gap-2">
              <GitBranch size={14} /> RAW API RESPONSE
            </span>
          </div>
          <div className="p-4 flex-1 overflow-y-auto">
            <pre className="text-[10px] font-mono text-emerald-400/70 leading-relaxed whitespace-pre-wrap">
{`{
  "status": "success",
  "data": {
    "tours": [
      {
        "package_code": "JAP-SAPP-001",
        "title_th": "ฮอกไกโด สกี 6D4N",
        "airline_code": "TG",
        "days": 6,
        "nights": 4,
        "itinerary_url": "https://...",
        "departures": [
          {
            "dep_date": "2026-10-12",
            "ret_date": "2026-10-17",
            "price_adult": 45900,
            "price_child_bed": 43900,
            "price_infant": 15000,
            "avail_seats": 5,
            "total_seats": 30
          }
        ]
      }
    ]
  }
}`}
            </pre>
          </div>
        </div>

        {/* Middle: Mapping Arrows */}
        <div className="w-16 flex flex-col items-center justify-center gap-8 text-slate-700 shrink-0">
          <ArrowRightLeft size={24} />
          <span className="text-[10px] font-bold rotate-90 tracking-widest mt-8">TRANSFORM</span>
        </div>

        {/* Right: Jongtour Database Schema Mapping */}
        <div className="flex-1 bg-slate-950 border border-slate-800 rounded-lg flex flex-col">
          <div className="p-3 border-b border-slate-800 bg-black flex justify-between items-center">
            <span className="text-xs font-bold text-slate-400">JONGTOUR DATABASE SCHEMA</span>
          </div>
          <div className="p-0 flex-1 overflow-y-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-900 text-slate-500 border-b border-slate-800">
                <tr>
                  <th className="px-4 py-2">DB Field</th>
                  <th className="px-4 py-2">Type</th>
                  <th className="px-4 py-2">JSON Path (from Raw Data)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                <tr>
                  <td className="px-4 py-3 font-bold text-indigo-400">code</td>
                  <td className="px-4 py-3 text-slate-500">String</td>
                  <td className="px-4 py-3"><input type="text" defaultValue="data.tours[].package_code" className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 outline-none text-emerald-400 focus:border-emerald-500" /></td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-bold text-indigo-400">name</td>
                  <td className="px-4 py-3 text-slate-500">String</td>
                  <td className="px-4 py-3"><input type="text" defaultValue="data.tours[].title_th" className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 outline-none text-emerald-400 focus:border-emerald-500" /></td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-bold text-indigo-400">days</td>
                  <td className="px-4 py-3 text-slate-500">Int</td>
                  <td className="px-4 py-3"><input type="text" defaultValue="data.tours[].days" className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 outline-none text-emerald-400 focus:border-emerald-500" /></td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-bold text-indigo-400">priceAdult</td>
                  <td className="px-4 py-3 text-slate-500">Float</td>
                  <td className="px-4 py-3"><input type="text" defaultValue="data.tours[].departures[].price_adult" className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 outline-none text-emerald-400 focus:border-emerald-500" /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
