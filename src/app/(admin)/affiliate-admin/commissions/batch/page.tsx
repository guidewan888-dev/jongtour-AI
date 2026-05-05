import React from "react";
import Link from "next/link";

const pending = [
  { id:"CM-001", affiliate:"JoyTravels", amount:"฿17,600", booking:"B-1234", date:"01/05/69", selected:true },
  { id:"CM-002", affiliate:"TravelMore", amount:"฿5,400", booking:"B-1240", date:"02/05/69", selected:true },
  { id:"CM-004", affiliate:"JoyTravels", amount:"฿50,400", booking:"B-1250", date:"04/05/69", selected:false },
];

export default function BatchApprovePage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div><div className="text-sm text-slate-400 mb-1"><Link href="/affiliate-admin/commissions" className="hover:text-primary">← Commissions</Link></div><h1 className="text-xl font-bold text-slate-900">📋 Batch Approve</h1></div>
      <div className="space-y-2">{pending.map(p=>(<div key={p.id} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200"><input type="checkbox" className="rounded" defaultChecked={p.selected}/><div className="flex-1"><div className="text-sm font-medium">{p.affiliate} <span className="text-xs text-slate-400">({p.id})</span></div><div className="text-xs text-slate-500">{p.booking} · {p.date}</div></div><span className="font-bold text-primary">{p.amount}</span></div>))}</div>
      <div className="flex items-center justify-between p-4 bg-primary/5 rounded-xl"><span className="font-bold">เลือก 2 รายการ — รวม ฿23,000</span><div className="flex gap-2"><button className="btn-primary text-sm">✓ Approve Selected</button><button className="bg-red-50 text-red-600 px-4 py-2 rounded-xl text-sm font-bold">✗ Reject</button></div></div>
    </div>
  );
}
