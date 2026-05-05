import React from "react";
import { CreditCard, TrendingUp, AlertTriangle, Clock, ArrowUpRight } from "lucide-react";

export default function AgentCreditPage() {
  const limit = 500000;
  const used = 120000;
  const available = limit - used;
  const pct = (used / limit) * 100;

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <header className="bg-slate-900 text-white py-4 px-6"><div className="max-w-7xl mx-auto text-xl font-black tracking-tighter">JONGTOUR <span className="text-orange-500 font-normal text-lg">AGENT</span></div></header>
      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">Credit Limit</h1>

        <div className="bg-white p-8 rounded-2xl border border-slate-200">
          <div className="flex items-end gap-2 mb-6">
            <div className="text-4xl font-black text-slate-900">฿{available.toLocaleString()}</div>
            <div className="text-slate-400 mb-1">/ ฿{limit.toLocaleString()}</div>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden mb-2">
            <div className={`h-full rounded-full transition-all ${pct > 80 ? "bg-red-500" : pct > 50 ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${pct}%` }} />
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">ใช้ไปแล้ว ฿{used.toLocaleString()} ({Math.round(pct)}%)</span>
            <span className="text-emerald-600 font-bold">เหลือ ฿{available.toLocaleString()}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200"><CreditCard className="w-5 h-5 text-blue-500 mb-2" /><div className="text-sm text-slate-500">วงเงินทั้งหมด</div><div className="text-xl font-bold">฿{limit.toLocaleString()}</div></div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200"><TrendingUp className="w-5 h-5 text-amber-500 mb-2" /><div className="text-sm text-slate-500">ใช้ไปแล้ว</div><div className="text-xl font-bold">฿{used.toLocaleString()}</div></div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200"><Clock className="w-5 h-5 text-red-500 mb-2" /><div className="text-sm text-slate-500">ครบกำหนดชำระ</div><div className="text-xl font-bold">15 มิ.ย. 2026</div></div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100"><h3 className="font-bold text-slate-900">ประวัติการชำระ</h3></div>
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 border-b"><tr><th className="text-left px-4 py-3">วันที่</th><th className="text-left px-4 py-3">รายการ</th><th className="text-right px-4 py-3">จำนวน</th><th className="text-center px-4 py-3">ประเภท</th></tr></thead>
            <tbody className="divide-y divide-slate-50">
              <tr><td className="px-4 py-3">3 พ.ค. 2026</td><td className="px-4 py-3">JT-202605-001</td><td className="px-4 py-3 text-right text-red-600">-฿120,000</td><td className="px-4 py-3 text-center"><span className="bg-red-50 text-red-600 px-2 py-0.5 rounded-full text-xs font-bold">ใช้เครดิต</span></td></tr>
              <tr><td className="px-4 py-3">1 พ.ค. 2026</td><td className="px-4 py-3">ชำระยอดเดือน เม.ย.</td><td className="px-4 py-3 text-right text-emerald-600">+฿200,000</td><td className="px-4 py-3 text-center"><span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full text-xs font-bold">Top-up</span></td></tr>
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
