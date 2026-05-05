import React from "react";
import { MousePointerClick, ShoppingCart, TrendingUp, Globe } from "lucide-react";

const kpis = [{l:"Clicks Today",v:"1,245",c:"+18%"},{l:"Conversions",v:"16",c:"+3"},{l:"Conv Rate",v:"1.28%"},{l:"Active Links",v:"342"}];
const sources = [{name:"Direct Link",clicks:580,conv:8,rate:"1.4%"},{name:"Coupon Code",clicks:320,conv:5,rate:"1.6%"},{name:"QR Code",clicks:180,conv:2,rate:"1.1%"},{name:"Banner",clicks:165,conv:1,rate:"0.6%"}];

export default function TrackingDashboardPage() {
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-slate-900">📈 Tracking Dashboard</h1><p className="text-sm text-slate-500 mt-1">Click tracking, attribution, conversion funnel</p></div>
      <div className="grid grid-cols-4 gap-3">{kpis.map(k=>(<div key={k.l} className="bg-white p-4 rounded-2xl border border-slate-200"><div className="text-2xl font-black text-slate-900">{k.v}</div><div className="text-xs text-slate-500 flex justify-between mt-1"><span>{k.l}</span><span className="text-emerald-600 font-bold">{k.c}</span></div></div>))}</div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="g-card p-5"><h3 className="font-bold text-sm mb-3">📊 Source Breakdown</h3><div className="space-y-2">{sources.map(s=>(<div key={s.name} className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-xl text-sm"><div className="flex-1 font-medium">{s.name}</div><div className="text-xs text-slate-500">{s.clicks} clicks</div><div className="text-xs font-bold text-primary">{s.conv} conv</div><div className="text-xs text-slate-400">{s.rate}</div></div>))}</div></div>
        <div className="g-card p-5"><h3 className="font-bold text-sm mb-3">🔥 Conversion Funnel</h3><div className="space-y-2">{[{step:"Click",n:1245,pct:"100%"},{step:"View Product",n:890,pct:"71%"},{step:"Add to Cart",n:145,pct:"12%"},{step:"Checkout",n:48,pct:"3.9%"},{step:"Paid",n:16,pct:"1.3%"}].map(s=>(<div key={s.step}><div className="flex justify-between text-xs mb-1"><span>{s.step}</span><span className="text-slate-400">{s.n} ({s.pct})</span></div><div className="w-full bg-slate-100 rounded-full h-2"><div className="bg-primary h-full rounded-full" style={{width:s.pct}}/></div></div>))}</div></div>
      </div>
    </div>
  );
}
