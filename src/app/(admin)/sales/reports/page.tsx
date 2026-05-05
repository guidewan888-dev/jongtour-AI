import React from "react";
import { TrendingUp, Users, DollarSign, Target, BarChart3, ArrowUp, ArrowDown } from "lucide-react";

export default function SaleReportsPage() {
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-slate-900">Sale Reports</h1><p className="text-slate-500 text-sm mt-1">ผลงานการขาย</p></div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200"><div className="text-sm text-slate-500">Revenue เดือนนี้</div><div className="text-2xl font-bold mt-1">฿1.2M</div><div className="text-xs text-emerald-600 flex items-center gap-0.5 mt-1"><ArrowUp className="w-3 h-3" />+15%</div></div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200"><div className="text-sm text-slate-500">Booking เดือนนี้</div><div className="text-2xl font-bold mt-1">34</div><div className="text-xs text-emerald-600 flex items-center gap-0.5 mt-1"><ArrowUp className="w-3 h-3" />+8%</div></div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200"><div className="text-sm text-slate-500">Conversion Rate</div><div className="text-2xl font-bold mt-1">24%</div><div className="text-xs text-red-600 flex items-center gap-0.5 mt-1"><ArrowDown className="w-3 h-3" />-2%</div></div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200"><div className="text-sm text-slate-500">Avg. Deal Size</div><div className="text-2xl font-bold mt-1">฿35K</div></div>
      </div>

      <div className="g-card p-6">
        <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-primary" /> Monthly Performance</h3>
        <div className="flex items-end gap-2 h-40">
          {[65, 80, 45, 90, 70, 100, 85, 95, 110, 75, 120, 105].map((v, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full bg-primary/20 rounded-t-lg transition-all hover:bg-primary/40" style={{ height: `${(v / 120) * 100}%` }} />
              <span className="text-[10px] text-slate-400">{["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."][i]}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="g-card p-6">
        <h3 className="font-bold text-slate-900 mb-4">Top Destinations</h3>
        <div className="space-y-3">
          {[{ dest: "🇯🇵 ญี่ปุ่น", pct: 35, amount: "฿420K" }, { dest: "🇰🇷 เกาหลี", pct: 25, amount: "฿300K" }, { dest: "🇪🇺 ยุโรป", pct: 20, amount: "฿240K" }, { dest: "🇨🇳 จีน", pct: 12, amount: "฿144K" }].map(d => (
            <div key={d.dest} className="flex items-center gap-3">
              <span className="w-24 text-sm font-medium">{d.dest}</span>
              <div className="flex-1 bg-slate-100 rounded-full h-3 overflow-hidden"><div className="bg-primary h-full rounded-full" style={{ width: `${d.pct}%` }} /></div>
              <span className="text-sm font-bold text-slate-600 w-16 text-right">{d.amount}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
