"use client";
import React, { useState } from "react";
import Link from "next/link";

export default function RulesCalculatorPage() {
  const [result, setResult] = useState<any>(null);
  const calc = () => setResult({
    rules:[{pri:"P5 Type Default",name:"Influencer Default",rate:"15%"},{pri:"P4 Tier Bonus",name:"Gold +2%",rate:"+2%"},{pri:"P3 Per-Product",name:"Hokkaido Premium",rate:"+2%"},{pri:"P2 Campaign",name:"Songkran Boost",rate:"+3%"}],
    base:"15%", stacked:"+7%", final:"22%", amount:17600, bookingValue:80000
  });

  return (
    <div className="space-y-6 max-w-3xl">
      <div><div className="text-sm text-slate-400 mb-1"><Link href="/affiliate-admin/rules" className="hover:text-primary">← Rules</Link></div><h1 className="text-xl font-bold text-slate-900">🧮 Commission Calculator</h1><p className="text-sm text-slate-500 mt-1">ทดสอบการคำนวณ commission ก่อน activate rule</p></div>
      <div className="g-card p-5 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-xs text-slate-500">Affiliate</label><select className="g-input mt-1 w-full"><option>AF-001 JoyTravels (Influencer, Gold)</option><option>AF-002 TravelMore (Agent B2B, Platinum)</option><option>AF-003 BackpackTH (Link, Silver)</option></select></div>
          <div><label className="text-xs text-slate-500">Product</label><select className="g-input mt-1 w-full"><option>Tour: Hokkaido Premium ฿80,000</option><option>Tour: Tokyo Explorer ฿45,000</option><option>Visa: อเมริกา EXCLUSIVE ฿12,000</option></select></div>
          <div><label className="text-xs text-slate-500">Booking Value</label><input className="g-input mt-1 w-full" defaultValue="80000"/></div>
          <div><label className="text-xs text-slate-500">Campaign Active</label><select className="g-input mt-1 w-full"><option>Songkran Boost (+3%)</option><option>— ไม่มี —</option></select></div>
        </div>
        <button onClick={calc} className="btn-primary">🧮 คำนวณ</button>
      </div>
      {result && (
        <div className="g-card p-5 space-y-4">
          <h3 className="font-bold text-sm">📋 Rule Resolution (Stackable)</h3>
          <div className="space-y-2">{result.rules.map((r:any,i:number)=>(<div key={i} className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-xl text-sm"><span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">{r.pri}</span><span className="flex-1 font-medium">{r.name}</span><span className="font-bold text-primary">{r.rate}</span></div>))}</div>
          <div className="border-t pt-3 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-slate-500">Base Rate</span><span className="font-bold">{result.base}</span></div>
            <div className="flex justify-between text-emerald-600"><span>Stacked Bonus</span><span className="font-bold">{result.stacked}</span></div>
            <div className="flex justify-between text-lg font-black"><span>Final Rate</span><span className="text-primary">{result.final}</span></div>
            <div className="flex justify-between text-lg font-black border-t pt-2"><span>Commission</span><span className="text-primary">฿{result.amount.toLocaleString()}</span></div>
            <div className="text-xs text-slate-400">Booking Value: ฿{result.bookingValue.toLocaleString()} × {result.final} = ฿{result.amount.toLocaleString()}</div>
          </div>
        </div>
      )}
    </div>
  );
}
