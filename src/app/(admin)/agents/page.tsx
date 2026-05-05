import React from "react";
import Link from "next/link";
import { Users, Search, Plus, Building, Star, MoreHorizontal } from "lucide-react";

const agents = [
  { id: "AG-001", name: "บจก. ทราเวลเอ็กซ์เพิร์ท", tier: "Gold", bookings: 142, commission: 245000, status: "active" },
  { id: "AG-002", name: "บจก. สยามทัวร์ เอเจนซี่", tier: "Silver", bookings: 89, commission: 120000, status: "active" },
  { id: "AG-003", name: "บจก. แฮปปี้โก ทราเวล", tier: "Bronze", bookings: 34, commission: 45000, status: "active" },
  { id: "AG-004", name: "ร้านตั๋วดอทคอม", tier: "Bronze", bookings: 12, commission: 15000, status: "pending" },
];

export default function AgentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Agent Management</h1>
          <p className="text-slate-500 text-sm mt-1">จัดการตัวแทนจำหน่าย B2B</p>
        </div>
        <button className="bg-primary hover:bg-primary-600 text-white font-semibold px-4 py-2.5 rounded-xl text-sm flex items-center gap-2 transition-colors">
          <Plus className="w-4 h-4" /> เพิ่ม Agent ใหม่
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200"><div className="text-sm text-slate-500">Agent ทั้งหมด</div><div className="text-2xl font-bold mt-1">{agents.length}</div></div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200"><div className="text-sm text-slate-500">ยอดจองรวม</div><div className="text-2xl font-bold mt-1">{agents.reduce((s,a) => s+a.bookings, 0)}</div></div>
        <div className="bg-white p-5 rounded-2xl border border-emerald-100"><div className="text-sm text-emerald-600">คอมมิชชันจ่ายรวม</div><div className="text-2xl font-bold mt-1 text-emerald-700">฿{agents.reduce((s,a) => s+a.commission, 0).toLocaleString()}</div></div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center gap-3">
          <div className="relative flex-1"><Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" /><input className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm" placeholder="ค้นหา Agent..." /></div>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
            <tr><th className="text-left px-4 py-3">Agent</th><th className="text-left px-4 py-3">Tier</th><th className="text-right px-4 py-3">Bookings</th><th className="text-right px-4 py-3">Commission</th><th className="text-center px-4 py-3">Status</th><th className="px-4 py-3"></th></tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {agents.map((a) => (
              <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3"><div className="flex items-center gap-3"><Building className="w-5 h-5 text-slate-400" /><div><div className="font-medium text-slate-900">{a.name}</div><div className="text-xs text-slate-400">{a.id}</div></div></div></td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-bold ${a.tier === "Gold" ? "bg-amber-100 text-amber-700" : a.tier === "Silver" ? "bg-slate-100 text-slate-600" : "bg-orange-50 text-orange-600"}`}><Star className="w-3 h-3 inline mr-1" />{a.tier}</span></td>
                <td className="px-4 py-3 text-right font-medium">{a.bookings}</td>
                <td className="px-4 py-3 text-right font-bold text-emerald-600">฿{a.commission.toLocaleString()}</td>
                <td className="px-4 py-3 text-center"><span className={`px-2 py-0.5 rounded-full text-xs font-bold ${a.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>{a.status}</span></td>
                <td className="px-4 py-3 text-center"><button className="p-1 hover:bg-slate-100 rounded-lg"><MoreHorizontal className="w-4 h-4 text-slate-400" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
