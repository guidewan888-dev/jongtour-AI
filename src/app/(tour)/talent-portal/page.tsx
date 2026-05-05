import React from "react";
import Link from "next/link";
import { Calendar, DollarSign, CheckCircle, Clock, Star, ArrowRight, Sparkles, MapPin } from "lucide-react";

const kpis = [
  { l:"Upcoming Trips", v:"3", icon:<Calendar className="w-5 h-5"/>, color:"from-blue-50 to-sky-50", iconBg:"bg-blue-100 text-blue-600" },
  { l:"Pending Requests", v:"2", icon:<Clock className="w-5 h-5"/>, c:"new", color:"from-amber-50 to-yellow-50", iconBg:"bg-amber-100 text-amber-600" },
  { l:"Earnings (MTD)", v:"฿33,000", icon:<DollarSign className="w-5 h-5"/>, c:"+฿8K", color:"from-primary/5 to-orange-50", iconBg:"bg-primary/10 text-primary" },
  { l:"Rating", v:"4.9", icon:<Star className="w-5 h-5"/>, color:"from-purple-50 to-violet-50", iconBg:"bg-purple-100 text-purple-600" },
];

const upcoming = [
  { id:"TR-002", tour:"Hokkaido Premium 7D", customer:"คุณวิภา + 3", date:"20-26 ก.ค.", pax:4, emoji:"🏔️", daysLeft:14 },
  { id:"TR-006", tour:"Bangkok Food Tour", customer:"Mr. Chen + 1", date:"12 ก.ค.", pax:2, emoji:"🍜", daysLeft:6 },
  { id:"TR-009", tour:"Private Chiang Mai", customer:"คุณนิธิ + 5", date:"28 ก.ค.", pax:6, emoji:"🌿", daysLeft:22 },
];

const quickLinks = [
  { href:"/talent-portal/schedule", icon:"📅", label:"ตารางงาน", desc:"จัดการวันว่าง" },
  { href:"/talent-portal/requests", icon:"📩", label:"Requests", desc:"คำขอใหม่" },
  { href:"/talent-portal/trips", icon:"✈️", label:"ทริป", desc:"ทริปทั้งหมด" },
  { href:"/talent-portal/earnings", icon:"💰", label:"รายได้", desc:"ประวัติเงิน" },
  { href:"/talent-portal/reviews", icon:"⭐", label:"Reviews", desc:"รีวิวจากลูกค้า" },
  { href:"/talent-portal/profile", icon:"👤", label:"โปรไฟล์", desc:"แก้ไขข้อมูล" },
  { href:"/talent-portal/settings", icon:"⚙️", label:"ตั้งค่า", desc:"การแจ้งเตือน" },
];

export default function TalentPortalDashboard() {
  return (
    <div className="g-container py-6 sm:py-8 max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Welcome Header */}
      <div className="g-gradient-warm rounded-2xl p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-4 right-4 opacity-10 text-8xl">👩‍🦰</div>
        <div className="relative">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-primary animate-float" />
            <span className="text-xs font-bold text-primary bg-white/80 px-3 py-1 rounded-full">Talent Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">สวัสดี พี่ก้อย! 👋</h1>
          <p className="text-sm text-slate-600 mt-1">จัดการทริปและรายได้ของคุณ</p>
          <div className="flex items-center gap-3 mt-3 text-xs">
            <span className="bg-white/80 px-3 py-1.5 rounded-full backdrop-blur-sm flex items-center gap-1">
              <Star className="w-3 h-3 text-amber-400 fill-amber-400"/> 4.9 Rating
            </span>
            <span className="bg-white/80 px-3 py-1.5 rounded-full backdrop-blur-sm">💎 Premium Tier</span>
            <span className="bg-white/80 px-3 py-1.5 rounded-full backdrop-blur-sm">245 ทริป</span>
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 stagger-children">
        {kpis.map(k => (
          <div key={k.l} className={`bg-gradient-to-br ${k.color} p-4 rounded-2xl border border-slate-200/30 g-hover-lift`}>
            <div className="flex items-center justify-between mb-2">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${k.iconBg}`}>{k.icon}</div>
              {k.c && <span className={k.c === "new" ? "g-stat-change-down" : "g-stat-change-up"}>{k.c === "new" ? "📩 new" : k.c}</span>}
            </div>
            <div className="text-2xl font-black text-slate-900">{k.v}</div>
            <div className="text-xs text-slate-500 mt-0.5">{k.l}</div>
          </div>
        ))}
      </div>

      {/* Upcoming Trips */}
      <div className="g-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-sm flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-500"/>📅 Upcoming Trips
          </h3>
          <Link href="/talent-portal/trips" className="text-xs text-primary font-bold flex items-center gap-1">
            ดูทั้งหมด <ArrowRight className="w-3 h-3"/>
          </Link>
        </div>
        <div className="space-y-2">
          {upcoming.map(u => (
            <Link key={u.id} href={`/talent-portal/trips/${u.id}`}
              className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl hover:bg-white hover:shadow-md transition-all duration-200">
              <span className="text-2xl">{u.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm truncate">{u.tour}</div>
                <div className="text-xs text-slate-500">{u.customer} · {u.pax} pax · {u.date}</div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className={`text-xs font-bold ${u.daysLeft <= 7 ? "text-red-600" : "text-slate-400"}`}>
                  {u.daysLeft <= 7 ? `⚡ ${u.daysLeft} วัน` : `${u.daysLeft} วัน`}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick Navigation */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 stagger-children">
        {quickLinks.map(n => (
          <Link key={n.href} href={n.href} className="g-card p-4 text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
            <span className="text-3xl block mb-2 group-hover:scale-110 transition-transform">{n.icon}</span>
            <span className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors">{n.label}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">{n.desc}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
