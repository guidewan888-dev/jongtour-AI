import React from "react";
import { MapPin, Plus, Edit, Globe } from "lucide-react";

const dests = [
  { country: "🇯🇵 ญี่ปุ่น", cities: ["โตเกียว", "โอซาก้า", "เกียวโต", "ฮอกไกโด"], tours: 45 },
  { country: "🇰🇷 เกาหลี", cities: ["โซล", "ปูซาน", "เชจู"], tours: 28 },
  { country: "🇨🇳 จีน", cities: ["ปักกิ่ง", "เซี่ยงไฮ้", "กุ้ยหลิน", "จางเจียเจี้ย"], tours: 22 },
  { country: "🇪🇺 ยุโรป", cities: ["ปารีส", "โรม", "ลอนดอน", "ซูริค"], tours: 18 },
];

export default function TourDestinationsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-slate-900">Destinations</h1><p className="text-slate-500 text-sm mt-1">จัดการปลายทาง</p></div>
        <button className="bg-primary hover:bg-primary-600 text-white font-semibold px-4 py-2.5 rounded-xl text-sm flex items-center gap-2"><Plus className="w-4 h-4" /> เพิ่มปลายทาง</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {dests.map(d => (
          <div key={d.country} className="bg-white p-5 rounded-2xl border border-slate-200 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-900 text-lg">{d.country}</h3>
              <span className="text-sm text-slate-400">{d.tours} ทัวร์</span>
            </div>
            <div className="flex flex-wrap gap-1.5">{d.cities.map(c => <span key={c} className="px-2.5 py-1 bg-slate-50 text-slate-600 rounded-full text-xs font-medium">{c}</span>)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
