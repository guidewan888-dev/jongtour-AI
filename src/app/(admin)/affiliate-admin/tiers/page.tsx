import React from "react";
import { Award, Edit, TrendingUp } from "lucide-react";

const tiers = [
  { name:"Bronze", emoji:"🥉", color:"bg-amber-50 border-amber-200", min:"฿0", max:"฿49,999", bonus:"+0%", affiliates:42, benefits:["Standard commission rate","Basic reporting","Email support"] },
  { name:"Silver", emoji:"🥈", color:"bg-slate-50 border-slate-300", min:"฿50,000", max:"฿199,999", bonus:"+1%", affiliates:35, benefits:["Silver +1% bonus","Priority support","Monthly report","Custom coupon code"] },
  { name:"Gold", emoji:"🥇", color:"bg-amber-50 border-amber-300", min:"฿200,000", max:"฿499,999", bonus:"+2%", affiliates:12, benefits:["Gold +2% bonus","Dedicated manager","Weekly payouts","Co-marketing materials","Priority listing"] },
  { name:"Platinum", emoji:"💎", color:"bg-indigo-50 border-indigo-300", min:"฿500,000+", max:"—", bonus:"+3%", affiliates:3, benefits:["Platinum +3% bonus","Custom rate override","Daily payouts","VIP events","Revenue sharing options","API access"] },
];

export default function AffiliateTiersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><div><h1 className="text-2xl font-bold text-slate-900">🏆 Tier Management</h1><p className="text-sm text-slate-500 mt-1">ตั้งค่าระดับ Affiliate — auto-upgrade ตามยอดขายสะสม</p></div><button className="btn-primary text-sm">+ เพิ่ม Tier</button></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">{tiers.map(t=>(<div key={t.name} className={`rounded-2xl border-2 p-5 ${t.color}`}><div className="flex items-center justify-between mb-3"><span className="text-3xl">{t.emoji}</span><button className="text-primary text-xs font-bold flex items-center gap-1"><Edit className="w-3 h-3"/>แก้ไข</button></div><h3 className="font-black text-lg text-slate-900">{t.name}</h3><div className="text-sm text-primary font-bold mt-1">{t.bonus} commission bonus</div><div className="mt-2 text-xs text-slate-500">ยอดสะสม: {t.min} — {t.max}</div><div className="mt-1 text-xs text-slate-500">{t.affiliates} affiliates</div><div className="mt-3 border-t pt-3 space-y-1">{t.benefits.map(b=>(<div key={b} className="text-xs text-slate-600 flex items-center gap-1.5">✓ {b}</div>))}</div></div>))}</div>
      <div className="g-card p-5"><h3 className="font-bold text-sm mb-3 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-emerald-500"/>Auto-upgrade Rules</h3><div className="space-y-2 text-sm"><div className="flex items-center gap-2"><input type="checkbox" className="rounded" defaultChecked/><span>Auto-upgrade เมื่อถึงยอดสะสม</span></div><div className="flex items-center gap-2"><input type="checkbox" className="rounded"/><span>Auto-downgrade ถ้าไม่ active 90 วัน</span></div><div className="flex items-center gap-2"><input type="checkbox" className="rounded" defaultChecked/><span>แจ้ง email เมื่อ upgrade</span></div></div></div>
    </div>
  );
}
