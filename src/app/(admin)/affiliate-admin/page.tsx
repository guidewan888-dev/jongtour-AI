import React from "react";
import Link from "next/link";
import { Users, DollarSign, TrendingUp, MousePointerClick, ShoppingCart, BarChart3, AlertTriangle, Award, ArrowRight, Zap } from "lucide-react";

const kpis = [
  { label:"Active Affiliates", value:"142", icon:<Users className="w-5 h-5 text-blue-500"/>, change:"+12", color:"bg-blue-50" },
  { label:"Total Commission (MTD)", value:"฿485K", icon:<DollarSign className="w-5 h-5 text-primary"/>, change:"+18%", color:"bg-primary/5" },
  { label:"Pending Payout", value:"฿128K", icon:<DollarSign className="w-5 h-5 text-amber-500"/>, color:"bg-amber-50" },
  { label:"Total Clicks (MTD)", value:"24.5K", icon:<MousePointerClick className="w-5 h-5 text-purple-500"/>, change:"+32%", color:"bg-purple-50" },
  { label:"Conversions", value:"312", icon:<ShoppingCart className="w-5 h-5 text-emerald-500"/>, change:"+8%", color:"bg-emerald-50" },
  { label:"Conversion Rate", value:"1.27%", icon:<TrendingUp className="w-5 h-5 text-sky-500"/>, color:"bg-sky-50" },
  { label:"Revenue via Affiliate", value:"฿3.2M", icon:<BarChart3 className="w-5 h-5 text-indigo-500"/>, change:"+22%", color:"bg-indigo-50" },
  { label:"Fraud Flags", value:"3", icon:<AlertTriangle className="w-5 h-5 text-red-500"/>, color:"bg-red-50" },
];
const top = [
  { name:"JoyTravels", type:"Influencer", emoji:"📱", rev:"฿480K", comm:"฿72K", tier:"Gold", rank:1 },
  { name:"TravelMore Co.", type:"Agent B2B", emoji:"🏢", rev:"฿620K", comm:"฿62K", tier:"Platinum", rank:2 },
  { name:"BackpackTH", type:"Affiliate Link", emoji:"🔗", rev:"฿185K", comm:"฿14.8K", tier:"Silver", rank:3 },
  { name:"Sara (Staff)", type:"Pro-staff", emoji:"👔", rev:"฿95K", comm:"฿4.7K", tier:"—", rank:4 },
];

const quickLinks = [
  { href:"/affiliate-admin/rules/builder", icon:"⚙️", label:"Rules Builder", desc:"สร้างกฎ commission" },
  { href:"/affiliate-admin/payouts", icon:"💸", label:"Payouts", desc:"จัดการจ่ายเงิน" },
  { href:"/affiliate-admin/tracking", icon:"📊", label:"Tracking", desc:"Click & conversion" },
  { href:"/affiliate-admin/reports", icon:"📈", label:"Reports", desc:"ROI & Performance" },
];

export default function AffiliateDashboard() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold text-slate-900">Affiliate Dashboard</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">ภาพรวมระบบ Affiliate & Commission</p>
        </div>
        <Link href="/affiliate-admin/affiliates/new" className="btn-primary text-sm inline-flex items-center gap-2">
          + เพิ่ม Affiliate
        </Link>
      </div>

      {/* KPI Grid with individual backgrounds */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 stagger-children">
        {kpis.map(k => (
          <div key={k.label} className={`${k.color} p-4 rounded-2xl border border-slate-200/50 g-hover-lift`}>
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-sm">{k.icon}</div>
              {k.change && <span className="g-stat-change-up">{k.change}</span>}
            </div>
            <div className="text-2xl font-black text-slate-900">{k.value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{k.label}</div>
          </div>
        ))}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {quickLinks.map(q => (
          <Link key={q.href} href={q.href} className="g-card p-4 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
            <span className="text-2xl block mb-2">{q.icon}</span>
            <div className="font-bold text-sm group-hover:text-primary transition-colors">{q.label}</div>
            <div className="text-[10px] text-slate-400">{q.desc}</div>
          </Link>
        ))}
      </div>

      {/* Charts & Top Affiliates */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Commission Chart */}
        <div className="g-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary"/>Commission รายเดือน
            </h3>
            <span className="text-xs text-slate-400">2569</span>
          </div>
          <div className="flex items-end gap-1 h-36">
            {[120,180,150,220,195,280,240,310,265,350,320,400].map((v,i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                <div className="opacity-0 group-hover:opacity-100 text-[9px] text-primary font-bold transition-opacity">฿{v}K</div>
                <div className="w-full bg-gradient-to-t from-primary/30 to-primary/10 rounded-t hover:from-primary/50 hover:to-primary/20 transition-all duration-300 cursor-pointer" 
                  style={{height:`${(v/400)*100}%`}}/>
                <span className="text-[8px] text-slate-400">{["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."][i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Affiliates */}
        <div className="g-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500"/>Top Affiliates
            </h3>
            <Link href="/affiliate-admin/reports/top-performers" className="text-xs text-primary font-bold flex items-center gap-1">
              ดูทั้งหมด <ArrowRight className="w-3 h-3"/>
            </Link>
          </div>
          <div className="space-y-2">
            {top.map(t => (
              <Link key={t.name} href="/affiliate-admin/affiliates" 
                className={`flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-all duration-200 ${t.rank <= 3 ? "border-l-4" : ""} ${t.rank === 1 ? "border-l-amber-400 bg-amber-50/30" : t.rank === 2 ? "border-l-slate-300 bg-slate-50/30" : t.rank === 3 ? "border-l-amber-600/50 bg-amber-50/20" : ""}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${t.rank === 1 ? "bg-amber-100 text-amber-700" : t.rank === 2 ? "bg-slate-100 text-slate-600" : t.rank === 3 ? "bg-amber-50 text-amber-600" : "bg-slate-50 text-slate-400"}`}>
                  {t.rank}
                </div>
                <span className="text-xl">{t.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{t.name}</div>
                  <div className="text-xs text-slate-400">{t.type} · {t.tier}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-primary">{t.comm}</div>
                  <div className="text-[10px] text-slate-400">rev {t.rev}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
