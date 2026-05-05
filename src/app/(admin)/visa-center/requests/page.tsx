import React from "react";
import Link from "next/link";
import { Search, Filter, Download, Eye } from "lucide-react";

const STATUS_C: Record<string,string> = { SUBMITTED:'bg-blue-100 text-blue-700', UNDER_REVIEW:'bg-purple-100 text-purple-700', DOCUMENTS_REQUIRED:'bg-amber-100 text-amber-700', EMBASSY_SUBMITTED:'bg-indigo-100 text-indigo-700', APPROVED:'bg-emerald-100 text-emerald-700', REJECTED:'bg-red-100 text-red-700', COMPLETED:'bg-emerald-100 text-emerald-700' };
const TIER_C: Record<string,string> = { PLUS:'bg-slate-100 text-slate-600', ADVANCE:'bg-blue-50 text-blue-600', EXCLUSIVE:'bg-orange-50 text-orange-700', VIP:'bg-amber-50 text-amber-700' };

const rows = [
  { no:"V-0042", name:"สมชาย ใจดี", country:"🇺🇸", type:"B1/B2", tier:"EXCLUSIVE", status:"UNDER_REVIEW", pax:2, price:"30,121", date:"01/05/69", staff:"แอน" },
  { no:"V-0045", name:"วิภา สุดใจ", country:"🇬🇧", type:"Standard", tier:"VIP", status:"EMBASSY_SUBMITTED", pax:1, price:"16,000", date:"02/05/69", staff:"ปลา" },
  { no:"V-0048", name:"นิธิ เก่งจริง", country:"🇫🇷", type:"Schengen", tier:"ADVANCE", status:"SUBMITTED", pax:3, price:"13,500", date:"03/05/69", staff:"—" },
  { no:"V-0050", name:"สุนิสา รักดี", country:"🇯🇵", type:"ท่องเที่ยว", tier:"PLUS", status:"APPROVED", pax:1, price:"1,500", date:"04/05/69", staff:"แอน" },
  { no:"V-0051", name:"ธนพล มั่นคง", country:"🇦🇺", type:"Visitor", tier:"EXCLUSIVE", status:"DOCUMENTS_REQUIRED", pax:2, price:"17,000", date:"05/05/69", staff:"ปลา" },
];

export default function VisaRequestsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><div><h1 className="text-2xl font-bold text-slate-900">📋 คำขอวีซ่าทั้งหมด</h1><p className="text-sm text-slate-500 mt-1">{rows.length} รายการ</p></div><div className="flex gap-2"><button className="btn-outline flex items-center gap-1.5 text-sm"><Filter className="w-4 h-4" />Filter</button><button className="btn-outline flex items-center gap-1.5 text-sm"><Download className="w-4 h-4" />Export</button></div></div>
      <div className="flex gap-2"><div className="relative flex-1"><Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" /><input className="g-input w-full pl-9" placeholder="ค้นหา ชื่อ/เลขที่..." /></div>
        <select className="g-input w-40"><option>ทุกสถานะ</option><option>รอตรวจ</option><option>ยื่นสถานทูต</option><option>อนุมัติ</option></select>
        <select className="g-input w-32"><option>ทุก Tier</option><option>PLUS</option><option>ADVANCE</option><option>EXCLUSIVE</option><option>VIP</option></select>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto">
        <table className="w-full text-sm"><thead className="bg-slate-50 border-b"><tr><th className="text-left px-4 py-3">เลขที่</th><th className="text-left px-3 py-3">ชื่อ</th><th className="px-3 py-3">ประเทศ</th><th className="px-3 py-3">Tier</th><th className="px-3 py-3">Status</th><th className="px-3 py-3 text-center">Pax</th><th className="px-3 py-3 text-right">ราคา</th><th className="px-3 py-3">วันที่</th><th className="px-3 py-3">Staff</th><th className="px-3 py-3"></th></tr></thead>
          <tbody className="divide-y divide-slate-50">{rows.map(r => (
            <tr key={r.no} className="hover:bg-slate-50"><td className="px-4 py-3 font-mono font-medium text-primary">{r.no}</td><td className="px-3 py-3 font-medium">{r.name}</td><td className="px-3 py-3 text-center">{r.country} {r.type}</td><td className="px-3 py-3 text-center"><span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${TIER_C[r.tier]}`}>{r.tier}</span></td><td className="px-3 py-3 text-center"><span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${STATUS_C[r.status]}`}>{r.status}</span></td><td className="px-3 py-3 text-center">{r.pax}</td><td className="px-3 py-3 text-right font-bold">฿{r.price}</td><td className="px-3 py-3 text-slate-400">{r.date}</td><td className="px-3 py-3">{r.staff}</td><td className="px-3 py-3"><Link href={`/visa-center/requests/${r.no}`} className="text-primary hover:underline flex items-center gap-1"><Eye className="w-3.5 h-3.5" />ดู</Link></td></tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}
