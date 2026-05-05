import React from "react";
import Link from "next/link";
import { Users, Clock, AlertTriangle, CheckCircle, DollarSign, BarChart3, ArrowRight, Zap, Star, Calendar } from "lucide-react";

const kpis = [
  { l:"Active Talents", v:"24", icon:<Users className="w-5 h-5"/>, color:"bg-blue-50", iconBg:"bg-blue-100 text-blue-600" },
  { l:"Pending Requests", v:"5", icon:<Clock className="w-5 h-5"/>, c:"urgent", color:"bg-amber-50", iconBg:"bg-amber-100 text-amber-600" },
  { l:"Confirmed (MTD)", v:"18", icon:<CheckCircle className="w-5 h-5"/>, c:"+3", color:"bg-emerald-50", iconBg:"bg-emerald-100 text-emerald-600" },
  { l:"Premium Revenue", v:"฿48K", icon:<DollarSign className="w-5 h-5"/>, c:"+22%", color:"bg-primary/5", iconBg:"bg-primary/10 text-primary" },
  { l:"Fulfillment Rate", v:"85%", icon:<BarChart3 className="w-5 h-5"/>, color:"bg-indigo-50", iconBg:"bg-indigo-100 text-indigo-600" },
  { l:"Avg Rating", v:"4.72", icon:<Star className="w-5 h-5"/>, color:"bg-purple-50", iconBg:"bg-purple-100 text-purple-600" },
  { l:"Conflicts", v:"2", icon:<AlertTriangle className="w-5 h-5"/>, color:"bg-red-50", iconBg:"bg-red-100 text-red-600" },
  { l:"SLA Breaches", v:"0", icon:<CheckCircle className="w-5 h-5"/>, color:"bg-emerald-50", iconBg:"bg-emerald-100 text-emerald-600" },
];

const pending = [
  { id:"TR-001", customer:"คุณสมชาย", talent:"พี่ก้อย", tour:"Tokyo Explorer", date:"15 ก.ค.", urgent:false, hours:2 },
  { id:"TR-005", customer:"คุณวิภา", talent:"พี่เจมส์", tour:"Private Chiang Mai", date:"8 ก.ค.", urgent:true, hours:18 },
  { id:"TR-008", customer:"Mr. Chen", talent:"พี่มิ้นท์", tour:"Bangkok Luxury", date:"20 ก.ค.", urgent:false, hours:1 },
];

const quickLinks = [
  { href:"/talent-admin/talents", icon:"👥", label:"Talents", desc:"จัดการไกด์" },
  { href:"/talent-admin/requests", icon:"📋", label:"Requests", desc:"คิวทั้งหมด" },
  { href:"/talent-admin/conflicts", icon:"⚠️", label:"Conflicts", desc:"ตรวจตารางซ้อน" },
  { href:"/talent-admin/emergency", icon:"🚨", label:"Emergency", desc:"ไกด์ป่วย/ฉุกเฉิน" },
  { href:"/talent-admin/reports", icon:"📊", label:"Reports", desc:"วิเคราะห์ผลงาน" },
  { href:"/talent-admin/settings", icon:"⚙️", label:"Settings", desc:"ตั้งค่าระบบ" },
];

export default function TalentAdminDashboard() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold text-slate-900">Talent Center</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">Dashboard ระบบไกด์ — {pending.length} requests pending</p>
        </div>
        <Link href="/talent-admin/talents/new" className="btn-primary text-sm">+ เพิ่มไกด์</Link>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 stagger-children">
        {kpis.map(k => (
          <div key={k.l} className={`${k.color} p-4 rounded-2xl border border-slate-200/30 g-hover-lift`}>
            <div className="flex items-center justify-between mb-2">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${k.iconBg}`}>{k.icon}</div>
              {k.c && <span className={k.c === "urgent" ? "g-stat-change-down" : "g-stat-change-up"}>{k.c === "urgent" ? "⚡ urgent" : k.c}</span>}
            </div>
            <div className="text-2xl font-black text-slate-900">{k.v}</div>
            <div className="text-xs text-slate-500 mt-0.5">{k.l}</div>
          </div>
        ))}
      </div>

      {/* Pending Requests */}
      <div className="g-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-sm flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-500" />⚡ Pending Requests
          </h3>
          <Link href="/talent-admin/requests" className="text-xs text-primary font-bold flex items-center gap-1">
            ดูทั้งหมด <ArrowRight className="w-3 h-3"/>
          </Link>
        </div>
        <div className="space-y-2">
          {pending.map(p => (
            <Link key={p.id} href={`/talent-admin/requests/${p.id}`}
              className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 hover:shadow-md ${p.urgent ? "bg-red-50/80 border border-red-100 hover:bg-red-50" : "bg-slate-50 hover:bg-white"}`}>
              <div className={`w-2 h-2 rounded-full ${p.urgent ? "bg-red-500 animate-pulse" : "bg-amber-400"}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm truncate">{p.customer}</span>
                  <ArrowRight className="w-3 h-3 text-slate-300 flex-shrink-0" />
                  <span className="text-sm text-primary truncate">{p.talent}</span>
                </div>
                <div className="text-xs text-slate-400">{p.tour} · {p.date}</div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-xs text-slate-400">{p.hours}h ago</div>
                {p.urgent && <span className="text-[10px] text-red-600 font-bold">URGENT</span>}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick Links */}
      <h3 className="font-bold text-sm text-slate-500 flex items-center gap-2">
        <ArrowRight className="w-4 h-4" /> เมนูด่วน
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {quickLinks.map(q => (
          <Link key={q.href} href={q.href} className="g-card p-4 text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
            <span className="text-2xl block mb-1.5 group-hover:scale-110 transition-transform">{q.icon}</span>
            <span className="text-sm font-bold group-hover:text-primary transition-colors">{q.label}</span>
            <span className="text-[10px] text-slate-400 block">{q.desc}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
