"use client";
import React from "react";
import Link from "next/link";
import { DollarSign, MousePointerClick, TrendingUp, Award, ArrowRight, Sparkles, Copy } from "lucide-react";

const kpis = [
  { l:"Commission เดือนนี้", v:"฿14,800", icon:<DollarSign className="w-5 h-5"/>, c:"+฿2,400", color:"from-primary/10 to-orange-50", iconBg:"bg-primary/10 text-primary" },
  { l:"Clicks", v:"1,245", icon:<MousePointerClick className="w-5 h-5"/>, c:"+18%", color:"from-purple-50 to-violet-50", iconBg:"bg-purple-100 text-purple-600" },
  { l:"Conversions", v:"28", icon:<TrendingUp className="w-5 h-5"/>, c:"+5", color:"from-emerald-50 to-green-50", iconBg:"bg-emerald-100 text-emerald-600" },
  { l:"Pending Payout", v:"฿8,600", icon:<DollarSign className="w-5 h-5"/>, color:"from-amber-50 to-yellow-50", iconBg:"bg-amber-100 text-amber-600" },
];

const quickLinks = [
  { href:"/affiliate/links", icon:"🔗", label:"Links/Codes", desc:"จัดการลิงก์และ QR" },
  { href:"/affiliate/bookings", icon:"📦", label:"Bookings", desc:"รายการจองที่แนะนำ" },
  { href:"/affiliate/commissions", icon:"💰", label:"Commissions", desc:"Commission ทั้งหมด" },
  { href:"/affiliate/payouts", icon:"💸", label:"Payouts", desc:"ประวัติการจ่ายเงิน" },
  { href:"/affiliate/performance", icon:"📈", label:"Performance", desc:"วิเคราะห์ผลงาน" },
  { href:"/affiliate/marketing", icon:"🎨", label:"Materials", desc:"Banner & สื่อ" },
  { href:"/affiliate/sub-affiliates", icon:"🌳", label:"Sub-affiliates", desc:"ทีมที่แนะนำ" },
  { href:"/affiliate/tax-banking", icon:"🏦", label:"Tax & Banking", desc:"ข้อมูลบัญชี" },
];

export default function AffiliatePortalDashboard() {
  return (
    <div className="g-container py-6 sm:py-8 max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Welcome Header */}
      <div className="g-gradient-warm rounded-2xl p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-4 right-4 opacity-10 text-8xl">🤝</div>
        <div className="relative">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-primary animate-float" />
            <span className="text-xs font-bold text-primary bg-white/80 px-3 py-1 rounded-full">Affiliate Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">สวัสดี BackpackTH! 👋</h1>
          <p className="text-sm text-slate-600 mt-1">สรุปผลงาน Affiliate ของคุณ</p>
        </div>
      </div>

      {/* Tier Progress */}
      <div className="g-card p-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-amber-100/50 to-transparent rounded-bl-full" />
        <div className="relative flex items-center gap-3 mb-3">
          <Award className="w-6 h-6 text-amber-500" />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm">🥈 Silver Tier</h3>
              <span className="text-xs text-slate-400">฿185K / ฿200K</span>
            </div>
            <div className="g-progress mt-2">
              <div className="g-progress-bar" style={{width:"92%"}} />
            </div>
          </div>
        </div>
        <p className="text-xs text-primary font-bold flex items-center gap-1">
          <Sparkles className="w-3 h-3" /> อีก ฿15K ก็ได้ Gold! (+2% commission bonus)
        </p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 stagger-children">
        {kpis.map(k => (
          <div key={k.l} className={`bg-gradient-to-br ${k.color} p-4 rounded-2xl border border-slate-200/30 g-hover-lift`}>
            <div className="flex items-center justify-between mb-2">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${k.iconBg}`}>{k.icon}</div>
              {k.c && <span className="g-stat-change-up">{k.c}</span>}
            </div>
            <div className="text-2xl font-black text-slate-900">{k.v}</div>
            <div className="text-xs text-slate-500 mt-0.5">{k.l}</div>
          </div>
        ))}
      </div>

      {/* Referral Link Quick Copy */}
      <div className="g-card p-5 bg-gradient-to-r from-primary/5 to-transparent">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">🔗</span>
          <h3 className="font-bold text-sm">Quick Share</h3>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-white border border-primary/20 px-4 py-2.5 rounded-xl text-sm font-mono text-primary truncate">
            jongtour.com/?ref=backpackth
          </div>
          <button className="btn-primary text-sm flex items-center gap-1 whitespace-nowrap">
            <Copy className="w-4 h-4" /> Copy
          </button>
        </div>
        <div className="flex gap-3 mt-2 text-xs text-slate-400">
          <span>Coupon: <b className="text-primary">BACKPACKTH</b></span>
          <span>·</span>
          <span>Cookie: 30 วัน</span>
        </div>
      </div>

      {/* Quick Navigation */}
      <h3 className="font-bold text-sm text-slate-500 flex items-center gap-2">
        <ArrowRight className="w-4 h-4" /> เมนูด่วน
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 stagger-children">
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
