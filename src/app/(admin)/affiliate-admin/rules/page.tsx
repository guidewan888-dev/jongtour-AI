import React from "react";
import Link from "next/link";
import { Plus, Edit, Trash2, ArrowUpDown } from "lucide-react";

const PRI = ["P1 Per-Affiliate","P2 Campaign","P3 Per-Product","P4 Tier Bonus","P5 Type Default","P6 Global Default"];
const rules = [
  { id:"R-001", name:"JoyTravels Override", priority:1, who:"AF-001 JoyTravels", what:"ทุกสินค้า", rate:"20% fixed", status:"active", created:"01/04/69" },
  { id:"R-002", name:"Songkran Boost", priority:2, who:"ทุก Affiliate", what:"ทัวร์เอเชีย", rate:"+3% bonus", status:"active", created:"01/04/69" },
  { id:"R-003", name:"Hokkaido Premium", priority:3, who:"ทุก Affiliate", what:"Tour: Hokkaido Premium", rate:"+2% bonus", status:"active", created:"15/03/69" },
  { id:"R-004", name:"Gold Tier Bonus", priority:4, who:"Tier: Gold", what:"ทุกสินค้า", rate:"+2%", status:"active", created:"01/01/69" },
  { id:"R-005", name:"Influencer Default", priority:5, who:"Type: Influencer", what:"Tour", rate:"15%", status:"active", created:"01/01/69" },
  { id:"R-006", name:"Global Fallback", priority:6, who:"ทุกคน", what:"ทุกสินค้า", rate:"8%", status:"active", created:"01/01/69" },
];

export default function AffiliateRulesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><div><h1 className="text-2xl font-bold text-slate-900">📐 Commission Rules</h1><p className="text-sm text-slate-500 mt-1">Stackable rules — 6 priority levels, ระบบ resolve อัตโนมัติ</p></div><div className="flex gap-2"><Link href="/affiliate-admin/rules/calculator" className="btn-outline text-sm">🧮 Calculator</Link><Link href="/affiliate-admin/rules/builder" className="btn-primary text-sm flex items-center gap-1"><Plus className="w-4 h-4"/>สร้าง Rule</Link></div></div>
      <div className="bg-blue-50 p-3 rounded-xl text-sm text-blue-800 flex items-start gap-2"><span>💡</span>Priority: P1 ชนะทุกอัน → P6 คือ fallback สุดท้าย ระบบเลือก rule priority สูงสุดที่ match</div>
      <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto">
        <table className="w-full text-sm"><thead className="bg-slate-50 border-b"><tr><th className="text-left px-4 py-3">Priority</th><th className="text-left px-3 py-3">Rule Name</th><th className="px-3 py-3">WHO</th><th className="px-3 py-3">WHAT</th><th className="px-3 py-3">RATE</th><th className="px-3 py-3">Status</th><th className="px-3 py-3"></th></tr></thead>
          <tbody className="divide-y divide-slate-50">{rules.map(r=>(<tr key={r.id} className="hover:bg-slate-50"><td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${r.priority<=2?"bg-red-100 text-red-700":r.priority<=4?"bg-amber-100 text-amber-700":"bg-slate-100 text-slate-600"}`}>{PRI[r.priority-1]}</span></td><td className="px-3 py-3 font-medium">{r.name}</td><td className="px-3 py-3 text-xs text-slate-500">{r.who}</td><td className="px-3 py-3 text-xs text-slate-500">{r.what}</td><td className="px-3 py-3 font-bold text-primary">{r.rate}</td><td className="px-3 py-3"><span className="w-2 h-2 rounded-full bg-emerald-400 inline-block mr-1"/>{r.status}</td><td className="px-3 py-3 flex gap-1"><button className="text-primary text-xs"><Edit className="w-3.5 h-3.5"/></button><button className="text-red-400 text-xs"><Trash2 className="w-3.5 h-3.5"/></button></td></tr>))}</tbody>
        </table>
      </div>
    </div>
  );
}
