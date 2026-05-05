import React from "react";
import Link from "next/link";
import { Plus, Calendar, TrendingUp, Eye } from "lucide-react";

const campaigns = [
  { id:"C-001", name:"Songkran Asia Boost", period:"1-30 เม.ย. 69", bonus:"+3%", scope:"ทัวร์เอเชีย", status:"active", revenue:"฿1.2M", commission:"฿48K" },
  { id:"C-002", name:"Summer Europe", period:"1 พ.ค. - 30 มิ.ย. 69", bonus:"+5%", scope:"ทัวร์ยุโรป", status:"active", revenue:"฿380K", commission:"฿22K" },
  { id:"C-003", name:"Visa Flash Sale", period:"15-31 พ.ค. 69", bonus:"+2% + ฿200 flat", scope:"วีซ่าทุกประเทศ", status:"scheduled", revenue:"—", commission:"—" },
  { id:"C-004", name:"New Year Rush", period:"1-31 ธ.ค. 68", bonus:"+4%", scope:"ทุกสินค้า", status:"ended", revenue:"฿2.1M", commission:"฿96K" },
];

export default function CampaignsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><div><h1 className="text-2xl font-bold text-slate-900">🎪 Campaigns</h1><p className="text-sm text-slate-500 mt-1">Campaign commission boost — P2 Priority</p></div><Link href="/affiliate-admin/campaigns/new" className="btn-primary text-sm flex items-center gap-1"><Plus className="w-4 h-4"/>สร้าง Campaign</Link></div>
      <div className="space-y-3">{campaigns.map(c=>(<Link key={c.id} href={`/affiliate-admin/campaigns/${c.id}`} className="g-card p-5 flex items-center gap-4 hover:shadow-lg transition-all">
        <div className={`w-3 h-12 rounded-full ${c.status==="active"?"bg-emerald-400":c.status==="scheduled"?"bg-blue-400":"bg-slate-300"}`}/>
        <div className="flex-1"><div className="font-bold text-sm">{c.name}</div><div className="text-xs text-slate-500 flex items-center gap-2"><Calendar className="w-3 h-3"/>{c.period}</div><div className="text-xs text-slate-400 mt-0.5">{c.scope}</div></div>
        <div className="text-center"><div className="text-lg font-bold text-primary">{c.bonus}</div><div className="text-[10px] text-slate-400">bonus rate</div></div>
        <div className="text-right text-xs text-slate-500"><div>Rev: {c.revenue}</div><div>Comm: {c.commission}</div></div>
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${c.status==="active"?"bg-emerald-100 text-emerald-700":c.status==="scheduled"?"bg-blue-100 text-blue-700":"bg-slate-100 text-slate-500"}`}>{c.status}</span>
      </Link>))}</div>
    </div>
  );
}
