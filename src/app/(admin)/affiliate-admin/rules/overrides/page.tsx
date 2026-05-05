import React from "react";
import Link from "next/link";
import { Edit } from "lucide-react";

const overrides = [
  { id:"AF-001", name:"JoyTravels", type:"Influencer", tour:"20%", visa:"10%", private:"18%", cap:"—", notes:"Top performer — special deal" },
  { id:"AF-004", name:"Sara M.", type:"Pro-staff", tour:"5%", visa:"3%", private:"5%", cap:"฿30K/mo", notes:"Staff discount" },
  { id:"AF-007", name:"MegaTravel Co.", type:"Agent B2B", tour:"15%", visa:"8%", private:"12%", cap:"—", notes:"Volume partner" },
];

export default function RuleOverridesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><div><h1 className="text-2xl font-bold text-slate-900">🎯 Per-Affiliate Overrides</h1><p className="text-sm text-slate-500 mt-1">P1 Priority — ชนะทุก rule อื่น</p></div><button className="btn-primary text-sm">+ เพิ่ม Override</button></div>
      <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto">
        <table className="w-full text-sm"><thead className="bg-slate-50 border-b"><tr><th className="text-left px-4 py-3">Affiliate</th><th className="px-3 py-3">Type</th><th className="px-3 py-3">Tour</th><th className="px-3 py-3">Visa</th><th className="px-3 py-3">Private</th><th className="px-3 py-3">Cap</th><th className="px-3 py-3">Notes</th><th className="px-3 py-3"></th></tr></thead>
          <tbody className="divide-y divide-slate-50">{overrides.map(o=>(<tr key={o.id} className="hover:bg-slate-50"><td className="px-4 py-3 font-medium">{o.name} <span className="text-xs text-slate-400">({o.id})</span></td><td className="px-3 py-3 text-center text-xs">{o.type}</td><td className="px-3 py-3 text-center font-bold text-primary">{o.tour}</td><td className="px-3 py-3 text-center font-bold text-blue-600">{o.visa}</td><td className="px-3 py-3 text-center font-bold text-purple-600">{o.private}</td><td className="px-3 py-3 text-center text-xs">{o.cap}</td><td className="px-3 py-3 text-xs text-slate-400">{o.notes}</td><td className="px-3 py-3"><button className="text-primary"><Edit className="w-3.5 h-3.5"/></button></td></tr>))}</tbody>
        </table>
      </div>
    </div>
  );
}
