import React from "react";
import { MapPin, Calendar, Users, DollarSign, Star, Plane, Hotel, Download, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AgentTourDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <header className="bg-slate-900 text-white py-4 px-6"><div className="max-w-7xl mx-auto text-xl font-black tracking-tighter">JONGTOUR <span className="text-orange-500 font-normal text-lg">AGENT</span></div></header>
      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <Link href="/agent-portal/search" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800"><ArrowLeft className="w-4 h-4" /> กลับค้นหา</Link>

        {/* Hero */}
        <div className="relative bg-gradient-to-r from-slate-900 to-slate-700 rounded-2xl overflow-hidden p-8 text-white">
          <div className="text-xs bg-orange-500 px-2 py-0.5 rounded-full w-fit mb-2 font-bold">LET&apos;GO</div>
          <h1 className="text-2xl font-bold">ทัวร์ญี่ปุ่น โตเกียว โอซาก้า 6D4N</h1>
          <p className="text-slate-300 mt-1 flex items-center gap-4 flex-wrap text-sm">
            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> ญี่ปุ่น</span>
            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> 6 วัน 4 คืน</span>
            <span className="flex items-center gap-1"><Plane className="w-3.5 h-3.5" /> Thai Airways</span>
            <span className="flex items-center gap-1"><Hotel className="w-3.5 h-3.5" /> 4 ดาว</span>
          </p>
        </div>

        {/* Agent Pricing */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200">
            <div className="text-sm text-slate-500">ราคาขาย</div>
            <div className="text-2xl font-bold">฿35,900<span className="text-sm text-slate-400 font-normal">/ท่าน</span></div>
          </div>
          <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100">
            <div className="text-sm text-emerald-600">Agent Net Price</div>
            <div className="text-2xl font-bold text-emerald-700">฿32,310<span className="text-sm text-emerald-500 font-normal">/ท่าน</span></div>
          </div>
          <div className="bg-orange-50 p-5 rounded-2xl border border-orange-100">
            <div className="text-sm text-orange-600">Commission</div>
            <div className="text-2xl font-bold text-orange-700">฿3,590 <span className="text-sm font-normal">(10%)</span></div>
          </div>
        </div>

        {/* Departures */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100"><h3 className="font-bold text-slate-900">วันเดินทาง</h3></div>
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 border-b"><tr><th className="text-left px-4 py-3">วันเดินทาง</th><th className="text-center px-4 py-3">ที่นั่ง</th><th className="text-right px-4 py-3">ราคา Net</th><th className="px-4 py-3"></th></tr></thead>
            <tbody className="divide-y divide-slate-50">
              {[{ date: "15 มิ.ย. 2026", seats: "8/30", price: 32310 }, { date: "22 มิ.ย. 2026", seats: "15/30", price: 32310 }, { date: "6 ก.ค. 2026", seats: "25/30", price: 31500 }].map((d, i) => (
                <tr key={i} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium">{d.date}</td>
                  <td className="px-4 py-3 text-center">{d.seats}</td>
                  <td className="px-4 py-3 text-right font-bold text-emerald-600">฿{d.price.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right"><button className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 py-1.5 rounded-lg text-xs transition-colors">Book for Customer</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex gap-3">
          <button className="btn-outline flex items-center gap-2"><Download className="w-4 h-4" /> ดาวน์โหลด PDF</button>
          <Link href="/agent-portal/quotations" className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors">สร้างใบเสนอราคา</Link>
        </div>
      </main>
    </div>
  );
}
