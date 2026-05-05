"use client";
import React, { useState } from "react";
import { BarChart3, TrendingUp, Users, MousePointerClick, Zap, Target } from "lucide-react";

const channelData = [
  { channel: "Facebook", icon: "📘", bookings: 23, revenue: 1840000, spend: 18000, color: "#1877F2" },
  { channel: "Google Organic", icon: "🔍", bookings: 15, revenue: 1200000, spend: 0, color: "#34A853" },
  { channel: "Google Ads", icon: "📢", bookings: 12, revenue: 936000, spend: 14000, color: "#FBBC04" },
  { channel: "LINE", icon: "💬", bookings: 8, revenue: 624000, spend: 3000, color: "#06C755" },
  { channel: "Direct", icon: "🌐", bookings: 5, revenue: 390000, spend: 0, color: "#6366F1" },
  { channel: "Affiliate", icon: "🤝", bookings: 4, revenue: 312000, spend: 24000, color: "#F97316" },
  { channel: "TikTok", icon: "🎵", bookings: 2, revenue: 156000, spend: 5000, color: "#000000" },
  { channel: "Instagram", icon: "📸", bookings: 3, revenue: 234000, spend: 8000, color: "#E1306C" },
];

const topPaths = [
  { path: "FB Ad → Direct → Purchase", pct: 12 },
  { path: "Google → Email → Purchase", pct: 10 },
  { path: "TikTok → FB → LINE → Purchase", pct: 8 },
  { path: "LINE OA → Direct → Purchase", pct: 7 },
  { path: "Affiliate → Direct → Purchase", pct: 6 },
];

export default function AttributionPage() {
  const [model, setModel] = useState<"last" | "first" | "linear">("last");
  const totalRevenue = channelData.reduce((s, c) => s + c.revenue, 0);
  const totalBookings = channelData.reduce((s, c) => s + c.bookings, 0);
  const totalSpend = channelData.reduce((s, c) => s + c.spend, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">📊 Attribution Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Multi-touch attribution analysis — มกราคม 2026</p>
        </div>
        <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
          {(["last", "first", "linear"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setModel(m)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${model === m ? "bg-white text-primary shadow-sm" : "text-slate-500"}`}
            >
              {m === "last" ? "Last-click" : m === "first" ? "First-click" : "Linear"}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="g-card p-4 text-center">
          <TrendingUp className="w-5 h-5 mx-auto text-primary mb-1" />
          <div className="text-xl font-black text-slate-900">฿{(totalRevenue / 1000000).toFixed(1)}M</div>
          <div className="text-[10px] text-slate-400">Total Revenue</div>
        </div>
        <div className="g-card p-4 text-center">
          <Target className="w-5 h-5 mx-auto text-emerald-500 mb-1" />
          <div className="text-xl font-black text-slate-900">{totalBookings}</div>
          <div className="text-[10px] text-slate-400">Total Bookings</div>
        </div>
        <div className="g-card p-4 text-center">
          <Zap className="w-5 h-5 mx-auto text-amber-500 mb-1" />
          <div className="text-xl font-black text-slate-900">{totalSpend > 0 ? Math.round(totalRevenue / totalSpend) : '∞'}x</div>
          <div className="text-[10px] text-slate-400">Overall ROAS</div>
        </div>
        <div className="g-card p-4 text-center">
          <MousePointerClick className="w-5 h-5 mx-auto text-blue-500 mb-1" />
          <div className="text-xl font-black text-slate-900">3.2</div>
          <div className="text-[10px] text-slate-400">Avg Touches</div>
        </div>
      </div>

      {/* Channel Performance */}
      <div className="g-card overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100">
          <h3 className="font-bold text-sm">Channel Performance ({model === "last" ? "Last-click" : model === "first" ? "First-click" : "Linear"})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[10px] text-slate-400 uppercase border-b border-slate-50">
                <th className="px-5 py-3 text-left">Channel</th>
                <th className="px-3 py-3 text-right">Bookings</th>
                <th className="px-3 py-3 text-right">Revenue</th>
                <th className="px-3 py-3 text-right">Spend</th>
                <th className="px-3 py-3 text-right">ROAS</th>
                <th className="px-3 py-3 text-right">CAC</th>
                <th className="px-5 py-3 text-right">% Rev</th>
              </tr>
            </thead>
            <tbody>
              {channelData.sort((a, b) => b.revenue - a.revenue).map((c) => (
                <tr key={c.channel} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-3 flex items-center gap-2 font-medium">
                    <span className="text-lg">{c.icon}</span>
                    <span>{c.channel}</span>
                  </td>
                  <td className="px-3 py-3 text-right font-bold">{c.bookings}</td>
                  <td className="px-3 py-3 text-right font-bold text-emerald-600">฿{(c.revenue / 1000).toFixed(0)}K</td>
                  <td className="px-3 py-3 text-right text-slate-500">{c.spend > 0 ? `฿${(c.spend / 1000).toFixed(0)}K` : "—"}</td>
                  <td className="px-3 py-3 text-right font-bold text-primary">{c.spend > 0 ? `${Math.round(c.revenue / c.spend)}x` : "∞"}</td>
                  <td className="px-3 py-3 text-right text-slate-500">{c.spend > 0 && c.bookings > 0 ? `฿${Math.round(c.spend / c.bookings).toLocaleString()}` : "—"}</td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${(c.revenue / totalRevenue) * 100}%`, background: c.color }} />
                      </div>
                      <span className="text-xs text-slate-400">{((c.revenue / totalRevenue) * 100).toFixed(0)}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Journey */}
      <div className="g-card p-5">
        <h3 className="font-bold text-sm mb-4">🗺️ Top Conversion Paths</h3>
        <div className="space-y-3">
          {topPaths.map((p, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</span>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{p.path}</span>
                  <span className="text-xs font-bold text-primary">{p.pct}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${p.pct * 5}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3 mt-5 pt-4 border-t border-slate-100">
          <div className="text-center">
            <div className="text-lg font-black text-slate-900">3.2</div>
            <div className="text-xs text-slate-400">Avg touches before conversion</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-black text-slate-900">7 วัน</div>
            <div className="text-xs text-slate-400">Avg time to conversion</div>
          </div>
        </div>
      </div>
    </div>
  );
}
