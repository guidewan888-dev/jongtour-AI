import React from "react";
import { MapPin, Users, DollarSign, Eye, Clock, Search } from "lucide-react";

const requests = [
  { id: "PG-001", name: "คุณสมชาย", dest: "ญี่ปุ่น", pax: 15, budget: "฿450K", status: "reviewing", date: "3 พ.ค." },
  { id: "PG-002", name: "บจก. ABC", dest: "ยุโรปตะวันตก", pax: 8, budget: "฿800K", status: "quoted", date: "1 พ.ค." },
  { id: "PG-003", name: "คุณวิภา", dest: "เกาหลี", pax: 20, budget: "฿300K", status: "new", date: "5 พ.ค." },
];

export default function SalePrivateGroupsPage() {
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-slate-900">Private Group Requests</h1><p className="text-slate-500 text-sm mt-1">คำขอกรุ๊ปส่วนตัวจากลูกค้า</p></div>

      <div className="space-y-3">
        {requests.map(r => (
          <div key={r.id} className="bg-white p-5 rounded-2xl border border-slate-200 hover:shadow-md transition-all cursor-pointer">
            <div className="flex items-center justify-between mb-3">
              <div><div className="font-bold text-slate-900">{r.name}</div><div className="text-xs text-slate-400">{r.id} • {r.date}</div></div>
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${r.status === "new" ? "bg-blue-100 text-blue-700" : r.status === "reviewing" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>{r.status}</span>
            </div>
            <div className="flex gap-4 text-sm text-slate-500">
              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {r.dest}</span>
              <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {r.pax} คน</span>
              <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" /> {r.budget}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
