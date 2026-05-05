import React from "react";
import { Tag, Plus, Copy, Edit, ToggleLeft } from "lucide-react";

const coupons = [
  { code:"JOYTRAVELS", affiliate:"JoyTravels", type:"Influencer", discount:"5%", uses:48, limit:500, commission:"15%", status:"active" },
  { code:"TRAVEL2024", affiliate:"BackpackTH", type:"Link", discount:"฿500", uses:12, limit:100, commission:"8%", status:"active" },
  { code:"SONGKRAN", affiliate:"ทุกคน (Campaign)", type:"Campaign", discount:"10%", uses:85, limit:1000, commission:"+3%", status:"active" },
  { code:"MEGADEAL", affiliate:"MegaTravel", type:"B2B", discount:"Net price", uses:22, limit:0, commission:"15%", status:"active" },
  { code:"EXPIRED01", affiliate:"OldPartner", type:"Link", discount:"3%", uses:5, limit:50, commission:"8%", status:"expired" },
];

export default function CouponsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><div><h1 className="text-2xl font-bold text-slate-900">🏷️ Coupon Management</h1><p className="text-sm text-slate-500 mt-1">{coupons.length} coupons</p></div><button className="btn-primary text-sm flex items-center gap-1"><Plus className="w-4 h-4"/>สร้าง Coupon</button></div>
      <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto">
        <table className="w-full text-sm"><thead className="bg-slate-50 border-b"><tr><th className="text-left px-4 py-3">Code</th><th className="px-3 py-3">Affiliate</th><th className="px-3 py-3">Discount</th><th className="px-3 py-3">Uses</th><th className="px-3 py-3">Commission</th><th className="px-3 py-3">Status</th><th className="px-3 py-3"></th></tr></thead>
          <tbody className="divide-y divide-slate-50">{coupons.map(c=>(<tr key={c.code} className="hover:bg-slate-50"><td className="px-4 py-3 font-mono font-bold text-primary">{c.code}</td><td className="px-3 py-3">{c.affiliate} <span className="text-xs text-slate-400">({c.type})</span></td><td className="px-3 py-3 text-center font-bold">{c.discount}</td><td className="px-3 py-3 text-center">{c.uses}{c.limit>0?`/${c.limit}`:""}</td><td className="px-3 py-3 text-center font-bold text-emerald-600">{c.commission}</td><td className="px-3 py-3 text-center"><span className={`w-2 h-2 rounded-full inline-block mr-1 ${c.status==="active"?"bg-emerald-400":"bg-slate-300"}`}/>{c.status}</td><td className="px-3 py-3 flex gap-1"><button className="text-slate-400"><Copy className="w-3.5 h-3.5"/></button><button className="text-primary"><Edit className="w-3.5 h-3.5"/></button></td></tr>))}</tbody>
        </table>
      </div>
    </div>
  );
}
