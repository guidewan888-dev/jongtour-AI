import React from "react";
import { Globe, Clock, Eye, Search } from "lucide-react";

const visaLeads = [
  { id: "VL-001", name: "คุณสมศรี ใจดี", country: "🇯🇵 ญี่ปุ่น", type: "ท่องเที่ยว", status: "new", date: "5 พ.ค." },
  { id: "VL-002", name: "คุณประวิทย์ รักเรียน", country: "🇨🇳 จีน", type: "ธุรกิจ", status: "in_progress", date: "3 พ.ค." },
  { id: "VL-003", name: "คุณมานะ จริงใจ", country: "🇪🇺 เชงเก้น", type: "ท่องเที่ยว", status: "docs_pending", date: "1 พ.ค." },
];

export default function SaleVisaLeadsPage() {
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-slate-900">Visa Leads</h1><p className="text-slate-500 text-sm mt-1">คำขอวีซ่าที่ต้อง follow up</p></div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100"><div className="relative"><Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" /><input className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm" placeholder="ค้นหา..." /></div></div>
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 border-b"><tr><th className="text-left px-4 py-3">ลูกค้า</th><th className="text-left px-4 py-3">ประเทศ</th><th className="text-left px-4 py-3">ประเภท</th><th className="text-center px-4 py-3">สถานะ</th><th className="text-right px-4 py-3">วันที่</th><th className="px-4 py-3"></th></tr></thead>
          <tbody className="divide-y divide-slate-50">
            {visaLeads.map(l => (
              <tr key={l.id} className="hover:bg-slate-50">
                <td className="px-4 py-3"><div className="font-medium">{l.name}</div><div className="text-xs text-slate-400">{l.id}</div></td>
                <td className="px-4 py-3">{l.country}</td>
                <td className="px-4 py-3 text-slate-500">{l.type}</td>
                <td className="px-4 py-3 text-center"><span className={`px-2 py-0.5 rounded-full text-xs font-bold ${l.status === "new" ? "bg-blue-100 text-blue-700" : l.status === "in_progress" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>{l.status.replace(/_/g, " ")}</span></td>
                <td className="px-4 py-3 text-right text-slate-400">{l.date}</td>
                <td className="px-4 py-3"><button className="p-1 hover:bg-slate-100 rounded-lg"><Eye className="w-4 h-4 text-slate-400" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
