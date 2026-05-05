import React from "react";
import { Users, FileText, Calendar, Clock, Search, Eye, Star } from "lucide-react";

const apps = [
  { id: "TL-001", name: "คุณวิชัย เก่งกล้า", experience: "5 ปี", countries: "ญี่ปุ่น, เกาหลี", status: "reviewing", date: "4 พ.ค." },
  { id: "TL-002", name: "คุณปรีชา นำทัวร์", experience: "8 ปี", countries: "ยุโรป, ตุรกี", status: "interview", date: "1 พ.ค." },
];

export default function TourLeadersPage() {
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-slate-900">Tour Leader Applications</h1><p className="text-slate-500 text-sm mt-1">ใบสมัครหัวหน้าทัวร์</p></div>
      <div className="space-y-3">
        {apps.map(a => (
          <div key={a.id} className="bg-white p-5 rounded-2xl border border-slate-200 hover:shadow-md transition-all flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center"><Users className="w-6 h-6 text-purple-600" /></div>
            <div className="flex-1"><div className="font-bold text-slate-900">{a.name}</div><div className="text-xs text-slate-500">{a.id} • ประสบการณ์ {a.experience} • {a.countries}</div></div>
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${a.status === "interview" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}`}>{a.status}</span>
            <button className="p-2 hover:bg-slate-100 rounded-lg"><Eye className="w-4 h-4 text-slate-400" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}
