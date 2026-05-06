import React from "react";
import { MapPin, Plus, Search, Globe, Edit } from "lucide-react";

const cats = [
  { id: 1, name: "ทัวร์กรุ๊ป", tours: 85, slug: "group-tours" },
  { id: 2, name: "ทัวร์ส่วนตัว", tours: 12, slug: "private-tours" },
  { id: 3, name: "Flash Sale", tours: 18, slug: "flash-sale" },
  { id: 4, name: "Luxury", tours: 6, slug: "luxury" },
  { id: 5, name: "ฮันนีมูน", tours: 4, slug: "honeymoon" },
];

export default function TourCategoriesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-slate-900">Tour Categories</h1><p className="text-slate-500 text-sm mt-1">จัดการหมวดหมู่ทัวร์</p></div>
        <button className="bg-primary hover:bg-primary-600 text-white font-semibold px-4 py-2.5 rounded-xl text-sm flex items-center gap-2"><Plus className="w-4 h-4" /> เพิ่มหมวดหมู่</button>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 border-b"><tr><th className="text-left px-4 py-3">Category</th><th className="text-center px-4 py-3">Tours</th><th className="text-left px-4 py-3">Slug</th><th className="px-4 py-3"></th></tr></thead>
          <tbody className="divide-y divide-slate-50">
            {cats.map(c => (
              <tr key={c.id} className="hover:bg-slate-50"><td className="px-4 py-3 font-medium">{c.name}</td><td className="px-4 py-3 text-center">{c.tours}</td><td className="px-4 py-3 text-slate-400 font-mono text-xs">/{c.slug}</td><td className="px-4 py-3"><button className="p-1 hover:bg-slate-100 rounded-lg"><Edit className="w-4 h-4 text-slate-400" /></button></td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
