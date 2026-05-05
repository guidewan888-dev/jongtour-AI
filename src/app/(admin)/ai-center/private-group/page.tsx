import React from "react";
import { Users, MapPin, Calendar, DollarSign, Search, Eye, MessageCircle } from "lucide-react";

const requests = [
  { id: "PG-001", customer: "คุณสมชาย", destination: "ญี่ปุ่น", pax: 15, budget: "฿450,000", date: "ก.ค. 2026", status: "ai_drafted", aiScore: 92 },
  { id: "PG-002", customer: "บริษัท ABC", destination: "ยุโรปตะวันตก", pax: 8, budget: "฿800,000", date: "ส.ค. 2026", status: "pending_review", aiScore: 85 },
  { id: "PG-003", customer: "คุณวิภา", destination: "เกาหลี", pax: 20, budget: "฿300,000", date: "มิ.ย. 2026", status: "sent_to_customer", aiScore: 95 },
];

export default function AIPrivateGroupPage() {
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-slate-900">AI Private Group Manager</h1><p className="text-slate-500 text-sm mt-1">ระบบ AI สร้าง Itinerary สำหรับกรุ๊ปส่วนตัว</p></div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200"><div className="text-sm text-slate-500">คำขอทั้งหมด</div><div className="text-2xl font-bold mt-1">{requests.length}</div></div>
        <div className="bg-purple-50 p-5 rounded-2xl border border-purple-100"><div className="text-sm text-purple-600">AI Draft สำเร็จ</div><div className="text-2xl font-bold mt-1 text-purple-700">2</div></div>
        <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100"><div className="text-sm text-emerald-600">ส่งลูกค้าแล้ว</div><div className="text-2xl font-bold mt-1 text-emerald-700">1</div></div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
            <tr><th className="text-left px-4 py-3">Request</th><th className="text-left px-4 py-3">Destination</th><th className="text-center px-4 py-3">Pax</th><th className="text-right px-4 py-3">Budget</th><th className="text-center px-4 py-3">AI Score</th><th className="text-center px-4 py-3">Status</th><th className="px-4 py-3"></th></tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {requests.map((r) => (
              <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3"><div className="font-medium text-slate-900">{r.customer}</div><div className="text-xs text-slate-400">{r.id} • {r.date}</div></td>
                <td className="px-4 py-3 flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-400" /> {r.destination}</td>
                <td className="px-4 py-3 text-center">{r.pax}</td>
                <td className="px-4 py-3 text-right font-medium">{r.budget}</td>
                <td className="px-4 py-3 text-center"><span className={`px-2 py-0.5 rounded-full text-xs font-bold ${r.aiScore >= 90 ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>{r.aiScore}%</span></td>
                <td className="px-4 py-3 text-center"><span className={`px-2 py-0.5 rounded-full text-xs font-bold ${r.status === "sent_to_customer" ? "bg-emerald-100 text-emerald-700" : r.status === "ai_drafted" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}`}>{r.status.replace(/_/g," ")}</span></td>
                <td className="px-4 py-3"><button className="p-1.5 hover:bg-slate-100 rounded-lg"><Eye className="w-4 h-4 text-slate-400" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
