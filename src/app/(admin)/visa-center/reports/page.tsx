import React from "react";
import { BarChart3, TrendingUp, DollarSign, Globe, Users } from "lucide-react";

const kpis = [
  { label:"Total Revenue", value:"฿1.85M", icon:<DollarSign className="w-5 h-5 text-primary"/>, change:"+18%" },
  { label:"Avg Approval Rate", value:"91.3%", icon:<TrendingUp className="w-5 h-5 text-emerald-500"/>, change:"+2.1%" },
  { label:"คำขอทั้งหมด (YTD)", value:"342", icon:<Users className="w-5 h-5 text-blue-500"/>, change:"+45" },
  { label:"ประเทศ Active", value:"28", icon:<Globe className="w-5 h-5 text-purple-500"/> },
];
const topCountries = [
  { flag:"🇺🇸", name:"อเมริกา", count:48, rev:"฿380K", rate:"76%" },
  { flag:"🇯🇵", name:"ญี่ปุ่น", count:65, rev:"฿175K", rate:"95%" },
  { flag:"🇬🇧", name:"อังกฤษ", count:35, rev:"฿280K", rate:"85%" },
  { flag:"🇫🇷", name:"ฝรั่งเศส", count:42, rev:"฿210K", rate:"88%" },
  { flag:"🇦🇺", name:"ออสเตรเลีย", count:28, rev:"฿196K", rate:"90%" },
];
const tierDist = [{ tier:"PLUS", pct:35 },{ tier:"ADVANCE", pct:25 },{ tier:"EXCLUSIVE", pct:30 },{ tier:"VIP", pct:10 }];

export default function VisaReportsPage() {
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-slate-900">📊 Reports</h1><p className="text-sm text-slate-500 mt-1">รายงานภาพรวมวีซ่า</p></div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">{kpis.map(k=>(<div key={k.label} className="bg-white p-4 rounded-2xl border border-slate-200"><div className="flex items-center justify-between mb-2">{k.icon}{k.change&&<span className="text-xs text-emerald-600 font-bold">{k.change}</span>}</div><div className="text-2xl font-black text-slate-900">{k.value}</div><div className="text-xs text-slate-500">{k.label}</div></div>))}</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="g-card p-5"><h3 className="font-bold text-sm mb-3">🏆 Top ประเทศ</h3><div className="space-y-2">{topCountries.map(c=>(<div key={c.name} className="flex items-center gap-3 text-sm"><span className="text-xl">{c.flag}</span><div className="flex-1"><div className="font-medium">{c.name}</div><div className="text-xs text-slate-400">{c.count} คำขอ</div></div><div className="text-right"><div className="font-bold text-primary">{c.rev}</div><div className="text-xs text-slate-400">อนุมัติ {c.rate}</div></div></div>))}</div></div>
        <div className="g-card p-5"><h3 className="font-bold text-sm mb-3">📊 Tier Distribution</h3><div className="space-y-3">{tierDist.map(t=>(<div key={t.tier}><div className="flex justify-between text-sm mb-1"><span className="font-medium">{t.tier}</span><span className="text-slate-500">{t.pct}%</span></div><div className="w-full bg-slate-100 rounded-full h-2.5"><div className="bg-primary h-full rounded-full" style={{width:`${t.pct}%`}}/></div></div>))}</div></div>
      </div>
    </div>
  );
}
