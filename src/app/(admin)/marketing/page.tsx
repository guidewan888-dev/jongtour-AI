"use client";
import React from "react";
import Link from "next/link";
import { TrendingUp, Link2, PieChart, Search, Megaphone, MousePointerClick, Globe, BarChart3, Target, Zap } from "lucide-react";

const tools = [
  { name: "UTM Builder", href: "/marketing/utm-builder", icon: Link2, desc: "สร้าง UTM links", color: "bg-blue-50 text-blue-600" },
  { name: "Short Links", href: "/marketing/short-links", icon: Megaphone, desc: "จัดการ jt.lol links", color: "bg-purple-50 text-purple-600" },
  { name: "Attribution", href: "/marketing/attribution", icon: PieChart, desc: "Multi-touch analysis", color: "bg-emerald-50 text-emerald-600" },
  { name: "SEO Audit", href: "/marketing/seo", icon: Search, desc: "50+ SEO checks", color: "bg-amber-50 text-amber-600" },
];

const channels = [
  { name: "Google Organic", sessions: 5200, change: +18, icon: "🔍" },
  { name: "Facebook Ads", sessions: 3100, change: +12, icon: "📘" },
  { name: "LINE OA", sessions: 2800, change: +25, icon: "💬" },
  { name: "Direct", sessions: 1900, change: -3, icon: "🌐" },
  { name: "Google Ads", sessions: 1400, change: +8, icon: "📢" },
  { name: "TikTok", sessions: 890, change: +45, icon: "🎵" },
  { name: "Instagram", sessions: 720, change: +15, icon: "📸" },
  { name: "Affiliate", sessions: 560, change: +32, icon: "🤝" },
];

const topKeywords = [
  { kw: "ทัวร์ญี่ปุ่น", pos: 8, vol: "90K", change: +3 },
  { kw: "ทัวร์ฮอกไกโด", pos: 5, vol: "15K", change: +2 },
  { kw: "ทัวร์เกาหลี", pos: 12, vol: "60K", change: -1 },
  { kw: "วีซ่าอเมริกา", pos: 15, vol: "30K", change: +5 },
  { kw: "ทัวร์ยุโรป", pos: 18, vol: "40K", change: 0 },
  { kw: "จองทัวร์ออนไลน์", pos: 6, vol: "8K", change: +4 },
  { kw: "ทัวร์ญี่ปุ่น ซากุระ", pos: 3, vol: "5K", change: +1 },
  { kw: "ทัวร์ครอบครัว ญี่ปุ่น", pos: 7, vol: "3K", change: +6 },
];

export default function MarketingDashboardPage() {
  const totalSessions = channels.reduce((s, c) => s + c.sessions, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">📊 Marketing & SEO Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">ภาพรวม traffic, rankings, และ campaign performance</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="g-card p-4 text-center">
          <Globe className="w-5 h-5 text-primary mx-auto mb-1" />
          <div className="text-xl font-black">{(totalSessions / 1000).toFixed(1)}K</div>
          <div className="text-[10px] text-slate-400">Sessions / เดือน</div>
        </div>
        <div className="g-card p-4 text-center">
          <Target className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
          <div className="text-xl font-black">273</div>
          <div className="text-[10px] text-slate-400">Indexed Pages</div>
        </div>
        <div className="g-card p-4 text-center">
          <TrendingUp className="w-5 h-5 text-blue-500 mx-auto mb-1" />
          <div className="text-xl font-black">8</div>
          <div className="text-[10px] text-slate-400">Top 10 Keywords</div>
        </div>
        <div className="g-card p-4 text-center">
          <Zap className="w-5 h-5 text-amber-500 mx-auto mb-1" />
          <div className="text-xl font-black">93%</div>
          <div className="text-[10px] text-slate-400">SEO Score</div>
        </div>
      </div>

      {/* Quick Tools */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {tools.map((t) => (
          <Link key={t.href} href={t.href} className="g-card p-4 hover:shadow-lg hover:-translate-y-0.5 transition-all group">
            <div className={`w-10 h-10 rounded-xl ${t.color} flex items-center justify-center mb-3`}>
              <t.icon className="w-5 h-5" />
            </div>
            <div className="text-sm font-bold text-slate-800 group-hover:text-primary transition-colors">{t.name}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">{t.desc}</div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Traffic Sources */}
        <div className="g-card overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-sm">📈 Traffic Sources</h3>
            <span className="text-xs text-slate-400">{totalSessions.toLocaleString()} sessions</span>
          </div>
          <div className="divide-y divide-slate-50">
            {channels.map((ch) => (
              <div key={ch.name} className="px-5 py-3 flex items-center gap-3">
                <span className="text-lg">{ch.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{ch.name}</span>
                    <span className="text-sm font-bold">{ch.sessions.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <div className="w-full h-1.5 bg-slate-100 rounded-full mr-3 overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${(ch.sessions / totalSessions) * 100}%` }} />
                    </div>
                    <span className={`text-[10px] font-bold shrink-0 ${ch.change > 0 ? "text-emerald-500" : ch.change < 0 ? "text-red-500" : "text-slate-400"}`}>
                      {ch.change > 0 ? "+" : ""}{ch.change}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Keyword Rankings */}
        <div className="g-card overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100">
            <h3 className="font-bold text-sm">🔑 Keyword Rankings</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[10px] text-slate-400 uppercase border-b border-slate-50">
                  <th className="px-5 py-2 text-left">Keyword</th>
                  <th className="px-3 py-2 text-center">Position</th>
                  <th className="px-3 py-2 text-center">Volume</th>
                  <th className="px-3 py-2 text-center">Change</th>
                </tr>
              </thead>
              <tbody>
                {topKeywords.map((kw) => (
                  <tr key={kw.kw} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="px-5 py-2.5 font-medium">{kw.kw}</td>
                    <td className="px-3 py-2.5 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        kw.pos <= 3 ? "bg-emerald-100 text-emerald-700" :
                        kw.pos <= 10 ? "bg-blue-100 text-blue-700" :
                        kw.pos <= 20 ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"
                      }`}>#{kw.pos}</span>
                    </td>
                    <td className="px-3 py-2.5 text-center text-slate-400">{kw.vol}</td>
                    <td className="px-3 py-2.5 text-center">
                      <span className={`text-xs font-bold ${kw.change > 0 ? "text-emerald-500" : kw.change < 0 ? "text-red-500" : "text-slate-400"}`}>
                        {kw.change > 0 ? `↑${kw.change}` : kw.change < 0 ? `↓${Math.abs(kw.change)}` : "—"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Core Web Vitals */}
      <div className="g-card p-5">
        <h3 className="font-bold text-sm mb-4">⚡ Core Web Vitals</h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: "LCP", value: "1.8s", target: "< 2.5s", pass: true },
            { label: "INP", value: "80ms", target: "< 200ms", pass: true },
            { label: "CLS", value: "0.02", target: "< 0.1", pass: true },
            { label: "FCP", value: "1.2s", target: "< 1.5s", pass: true },
            { label: "TTFB", value: "520ms", target: "< 800ms", pass: true },
          ].map((v) => (
            <div key={v.label} className={`p-3 rounded-xl text-center ${v.pass ? "bg-emerald-50" : "bg-red-50"}`}>
              <div className={`text-lg font-black ${v.pass ? "text-emerald-700" : "text-red-700"}`}>{v.value}</div>
              <div className="text-xs font-bold text-slate-600">{v.label}</div>
              <div className={`text-[10px] ${v.pass ? "text-emerald-500" : "text-red-500"}`}>{v.target}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
