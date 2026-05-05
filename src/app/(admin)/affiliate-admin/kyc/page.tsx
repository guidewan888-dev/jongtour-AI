import React from "react";
import { Shield, CheckCircle, Clock, XCircle, Eye, Download } from "lucide-react";

const queue = [
  { id:"AF-005", name:"PhuketDeals", type:"Sub-agent", submitted:"03/05/69", docs:[{n:"บัตรประชาชน",s:"ok"},{n:"บัญชีธนาคาร",s:"ok"},{n:"ทะเบียนธุรกิจ",s:"pending"}] },
  { id:"AF-008", name:"ChiangMaiLocal", type:"Affiliate Link", submitted:"04/05/69", docs:[{n:"บัตรประชาชน",s:"ok"},{n:"บัญชีธนาคาร",s:"pending"}] },
  { id:"AF-009", name:"BangkokTourPro", type:"Agent B2B", submitted:"05/05/69", docs:[{n:"บัตรประชาชน",s:"review"},{n:"บัญชีธนาคาร",s:"review"},{n:"ทะเบียนธุรกิจ",s:"review"},{n:"หนังสือมอบอำนาจ",s:"review"}] },
];

export default function AffiliateKYCPage() {
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-slate-900">🔍 KYC Review Queue</h1><p className="text-sm text-slate-500 mt-1">{queue.length} รอตรวจสอบ</p></div>
      <div className="space-y-3">{queue.map(q=>(<div key={q.id} className="g-card p-5"><div className="flex items-start justify-between mb-3"><div><div className="font-bold text-sm">{q.name} <span className="text-slate-400 font-mono text-xs">({q.id})</span></div><div className="text-xs text-slate-500">{q.type} · ส่งเมื่อ {q.submitted}</div></div><div className="flex gap-2"><button className="bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-xl text-xs font-bold hover:bg-emerald-100">✓ Approve</button><button className="bg-red-50 text-red-600 px-3 py-1.5 rounded-xl text-xs font-bold hover:bg-red-100">✗ Reject</button></div></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">{q.docs.map(d=>(<div key={d.n} className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${d.s==="ok"?"bg-emerald-50":d.s==="pending"?"bg-amber-50":"bg-blue-50"}`}>{d.s==="ok"?<CheckCircle className="w-3.5 h-3.5 text-emerald-500"/>:d.s==="pending"?<Clock className="w-3.5 h-3.5 text-amber-500"/>:<Eye className="w-3.5 h-3.5 text-blue-500"/>}<span className="flex-1">{d.n}</span></div>))}</div></div>))}</div>
    </div>
  );
}
