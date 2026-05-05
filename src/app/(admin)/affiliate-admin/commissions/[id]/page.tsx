import React from "react";
import Link from "next/link";

export default function CommissionDetailPage({ params }:{ params:{ id:string } }) {
  return (
    <div className="space-y-6 max-w-3xl">
      <div><div className="text-sm text-slate-400 mb-1"><Link href="/affiliate-admin/commissions" className="hover:text-primary">← Commissions</Link></div><h1 className="text-xl font-bold text-slate-900">💰 Commission {params.id}</h1></div>
      <div className="g-card p-5 grid grid-cols-2 gap-3 text-sm">
        <div><span className="text-slate-500">Affiliate:</span> <b>JoyTravels (AF-001)</b></div>
        <div><span className="text-slate-500">Booking:</span> <b className="text-blue-600">B-1234</b></div>
        <div><span className="text-slate-500">Product:</span> <b>Tour: Hokkaido Premium</b></div>
        <div><span className="text-slate-500">Booking Value:</span> <b>฿80,000</b></div>
        <div><span className="text-slate-500">Rate:</span> <b className="text-primary">22%</b></div>
        <div><span className="text-slate-500">Commission:</span> <b className="text-primary text-lg">฿17,600</b></div>
      </div>
      <div className="g-card p-5"><h3 className="font-bold text-sm mb-3">📐 Rule Breakdown</h3><div className="space-y-1.5 text-sm">{[{r:"P5 Influencer Default",v:"15%"},{r:"P4 Gold Tier",v:"+2%"},{r:"P3 Hokkaido Premium",v:"+2%"},{r:"P2 Songkran Boost",v:"+3%"}].map(r=>(<div key={r.r} className="flex justify-between p-2 bg-slate-50 rounded-lg"><span>{r.r}</span><span className="font-bold text-primary">{r.v}</span></div>))}<div className="flex justify-between p-2 bg-primary/10 rounded-lg font-bold"><span>Final</span><span className="text-primary">22%</span></div></div></div>
      <div className="g-card p-5"><h3 className="font-bold text-sm mb-3">📋 Status Timeline</h3><div className="space-y-2">{[{s:"Pending",d:"01/05 10:30",done:true},{s:"Confirmed (booking paid)",d:"01/05 15:00",done:true},{s:"Holding (14 days)",d:"15/05",done:true},{s:"Approved",d:"16/05 09:00",done:true},{s:"Paid",d:"—",done:false}].map(t=>(<div key={t.s} className="flex items-center gap-3 text-sm"><div className={`w-3 h-3 rounded-full ${t.done?"bg-primary":"bg-slate-300"}`}/><span className={t.done?"font-medium":"text-slate-400"}>{t.s}</span><span className="text-xs text-slate-400 ml-auto">{t.d}</span></div>))}</div></div>
      <div className="flex gap-2"><button className="btn-primary">✓ Approve & Queue Payout</button><button className="bg-red-50 text-red-600 px-4 py-2 rounded-xl text-sm font-bold">✗ Reject</button></div>
    </div>
  );
}
