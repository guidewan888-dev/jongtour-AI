import React from "react";
import { AlertTriangle, Shield, Ban, Eye } from "lucide-react";

const rules = [
  { name:"Self-referral Block", desc:"บล็อก email/IP/device/payment เดียวกัน", active:true },
  { name:"High Volume Flag", desc:">10 bookings/day จาก affiliate เดียว", active:true },
  { name:"Suspicious Conversion", desc:">50% conversion rate", active:true },
  { name:"Coupon Abuse", desc:"ใช้ coupon code >5 ครั้งจาก IP เดียว", active:true },
  { name:"Duplicate Booking", desc:"Same customer + same tour within 24hr", active:false },
  { name:"Manual Review Threshold", desc:"Commission >฿20,000/booking ต้อง manual approve", active:true },
];
const flags = [
  { affiliate:"NomadThailand", type:"Influencer", reason:"50+ bookings in 3 days", severity:"high", date:"03/05/69" },
  { affiliate:"Unknown-AF-012", type:"Affiliate Link", reason:"Self-referral detected (same email)", severity:"critical", date:"04/05/69" },
  { affiliate:"PhuketDeals", type:"Sub-agent", reason:"Coupon used 8x from same IP", severity:"medium", date:"05/05/69" },
];

export default function AntiFraudPage() {
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-slate-900">🛡️ Anti-fraud Rules</h1><p className="text-sm text-slate-500 mt-1">ตั้งค่ากฎป้องกันการทุจริต + ดูรายการ flagged</p></div>
      <div className="g-card p-5"><h3 className="font-bold text-sm mb-3">⚙️ กฎที่ตั้งไว้</h3><div className="space-y-2">{rules.map(r=>(<div key={r.name} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl"><input type="checkbox" className="rounded" defaultChecked={r.active}/><div className="flex-1"><div className="text-sm font-medium">{r.name}</div><div className="text-xs text-slate-400">{r.desc}</div></div><button className="text-xs text-primary font-bold">แก้ไข</button></div>))}</div></div>
      <div className="g-card p-5"><h3 className="font-bold text-sm mb-3 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-red-500"/>Flagged ({flags.length})</h3><div className="space-y-2">{flags.map(f=>(<div key={f.affiliate+f.date} className={`p-3 rounded-xl flex items-center gap-3 ${f.severity==="critical"?"bg-red-50 border border-red-200":f.severity==="high"?"bg-amber-50 border border-amber-200":"bg-yellow-50 border border-yellow-100"}`}><span className={`text-xs font-bold px-2 py-0.5 rounded-full ${f.severity==="critical"?"bg-red-100 text-red-700":"bg-amber-100 text-amber-700"}`}>{f.severity.toUpperCase()}</span><div className="flex-1"><div className="text-sm font-medium">{f.affiliate} <span className="text-xs text-slate-400">({f.type})</span></div><div className="text-xs text-slate-500">{f.reason}</div></div><span className="text-xs text-slate-400">{f.date}</span><div className="flex gap-1"><button className="text-xs bg-white border px-2 py-1 rounded-lg hover:bg-slate-50">Review</button><button className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded-lg hover:bg-red-100">Ban</button></div></div>))}</div></div>
    </div>
  );
}
