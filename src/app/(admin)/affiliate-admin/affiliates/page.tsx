import React from "react";
import Link from "next/link";
import { Search, Filter, Download, Eye, Plus } from "lucide-react";

const TYPE_C: Record<string,string> = { "Agent B2B":"bg-blue-100 text-blue-700", "Affiliate Link":"bg-purple-100 text-purple-700", Influencer:"bg-pink-100 text-pink-700", "Pro-staff":"bg-slate-100 text-slate-700", "Sub-agent":"bg-emerald-100 text-emerald-700" };
const TIER_C: Record<string,string> = { Bronze:"bg-amber-50 text-amber-700", Silver:"bg-slate-100 text-slate-600", Gold:"bg-amber-100 text-amber-700", Platinum:"bg-indigo-100 text-indigo-700" };

const rows = [
  { id:"AF-001", name:"JoyTravels", type:"Influencer", tier:"Gold", status:"active", revenue:"฿480K", commission:"฿72K", rate:"15%", kyc:true },
  { id:"AF-002", name:"TravelMore Co.", type:"Agent B2B", tier:"Platinum", status:"active", revenue:"฿620K", commission:"฿62K", rate:"10%", kyc:true },
  { id:"AF-003", name:"BackpackTH", type:"Affiliate Link", tier:"Silver", status:"active", revenue:"฿185K", commission:"฿14.8K", rate:"8%", kyc:true },
  { id:"AF-004", name:"Sara M.", type:"Pro-staff", tier:"—", status:"active", revenue:"฿95K", commission:"฿4.7K", rate:"5%", kyc:true },
  { id:"AF-005", name:"PhuketDeals", type:"Sub-agent", tier:"Bronze", status:"pending", revenue:"฿12K", commission:"฿960", rate:"8%+1%", kyc:false },
  { id:"AF-006", name:"NomadThailand", type:"Influencer", tier:"Silver", status:"suspended", revenue:"฿45K", commission:"฿0", rate:"15%", kyc:true },
];

export default function AffiliateListPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><div><h1 className="text-2xl font-bold text-slate-900">👥 Affiliates</h1><p className="text-sm text-slate-500 mt-1">{rows.length} affiliates</p></div><div className="flex gap-2"><button className="btn-outline text-sm flex items-center gap-1"><Download className="w-4 h-4"/>Export</button><Link href="/affiliate-admin/affiliates/new" className="btn-primary text-sm flex items-center gap-1"><Plus className="w-4 h-4"/>เพิ่ม</Link></div></div>
      <div className="flex gap-2"><div className="relative flex-1"><Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"/><input className="g-input w-full pl-9" placeholder="ค้นหา ชื่อ/ID..."/></div><select className="g-input w-36"><option>ทุกประเภท</option><option>Agent B2B</option><option>Affiliate Link</option><option>Influencer</option><option>Pro-staff</option><option>Sub-agent</option></select><select className="g-input w-28"><option>ทุก Tier</option><option>Bronze</option><option>Silver</option><option>Gold</option><option>Platinum</option></select><select className="g-input w-28"><option>ทุกสถานะ</option><option>Active</option><option>Pending</option><option>Suspended</option></select></div>
      <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto">
        <table className="w-full text-sm"><thead className="bg-slate-50 border-b"><tr><th className="text-left px-4 py-3">ID</th><th className="text-left px-3 py-3">ชื่อ</th><th className="px-3 py-3">ประเภท</th><th className="px-3 py-3">Tier</th><th className="px-3 py-3">Status</th><th className="px-3 py-3">Rate</th><th className="px-3 py-3 text-right">Revenue</th><th className="px-3 py-3 text-right">Commission</th><th className="px-3 py-3">KYC</th><th className="px-3 py-3"></th></tr></thead>
          <tbody className="divide-y divide-slate-50">{rows.map(r=>(<tr key={r.id} className="hover:bg-slate-50"><td className="px-4 py-3 font-mono text-xs text-primary">{r.id}</td><td className="px-3 py-3 font-medium">{r.name}</td><td className="px-3 py-3 text-center"><span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${TYPE_C[r.type]||""}`}>{r.type}</span></td><td className="px-3 py-3 text-center"><span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${TIER_C[r.tier]||"bg-slate-50 text-slate-400"}`}>{r.tier}</span></td><td className="px-3 py-3 text-center"><span className={`w-2 h-2 rounded-full inline-block mr-1 ${r.status==="active"?"bg-emerald-400":r.status==="pending"?"bg-amber-400":"bg-red-400"}`}/>{r.status}</td><td className="px-3 py-3 text-center font-mono">{r.rate}</td><td className="px-3 py-3 text-right">{r.revenue}</td><td className="px-3 py-3 text-right font-bold text-primary">{r.commission}</td><td className="px-3 py-3 text-center">{r.kyc?"✅":"⏳"}</td><td className="px-3 py-3"><Link href={`/affiliate-admin/affiliates/${r.id}`} className="text-primary text-xs font-bold hover:underline flex items-center gap-1"><Eye className="w-3.5 h-3.5"/>ดู</Link></td></tr>))}</tbody>
        </table>
      </div>
    </div>
  );
}
