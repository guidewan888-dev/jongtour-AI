import React from "react";
import { BarChart3, Users, FileText, Clock, CheckCircle, XCircle, DollarSign, TrendingUp } from "lucide-react";

const kpis = [
  { label: "คำขอใหม่วันนี้", value: "8", icon: <FileText className="w-5 h-5 text-blue-500" />, change: "+3" },
  { label: "กำลังดำเนินการ", value: "24", icon: <Clock className="w-5 h-5 text-amber-500" /> },
  { label: "ยื่นสถานทูตแล้ว", value: "12", icon: <Users className="w-5 h-5 text-purple-500" /> },
  { label: "อนุมัติเดือนนี้", value: "45", icon: <CheckCircle className="w-5 h-5 text-emerald-500" />, change: "+8" },
  { label: "ไม่อนุมัติ", value: "3", icon: <XCircle className="w-5 h-5 text-red-500" /> },
  { label: "Approval Rate", value: "93.7%", icon: <TrendingUp className="w-5 h-5 text-emerald-500" /> },
  { label: "Revenue เดือนนี้", value: "฿485K", icon: <DollarSign className="w-5 h-5 text-primary" />, change: "+12%" },
  { label: "Avg Processing", value: "8.2 วัน", icon: <Clock className="w-5 h-5 text-slate-500" /> },
];

const pending = [
  { no: "V-0042", name: "คุณสมชาย", country: "🇺🇸", action: "รอ Statement", urgent: true },
  { no: "V-0045", name: "คุณวิภา", country: "🇬🇧", action: "นัดสถานทูตพรุ่งนี้", urgent: true },
  { no: "V-0048", name: "คุณนิธิ", country: "🇫🇷", action: "ตรวจเอกสาร", urgent: false },
];

export default function VisaAdminDashboard() {
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-slate-900">🛂 Visa Center</h1><p className="text-slate-500 text-sm mt-1">Dashboard ภาพรวมวีซ่า</p></div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {kpis.map(k => (<div key={k.label} className="bg-white p-4 rounded-2xl border border-slate-200"><div className="flex items-center justify-between mb-2">{k.icon}{k.change && <span className="text-xs text-emerald-600 font-bold">{k.change}</span>}</div><div className="text-2xl font-black text-slate-900">{k.value}</div><div className="text-xs text-slate-500 mt-0.5">{k.label}</div></div>))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="g-card p-5"><h3 className="font-bold text-sm mb-3 flex items-center gap-2"><BarChart3 className="w-4 h-4 text-primary" /> Volume รายเดือน</h3><div className="flex items-end gap-1 h-32">{[30,45,38,52,48,65,58,72,60,80,75,90].map((v,i) => (<div key={i} className="flex-1 flex flex-col items-center gap-1"><div className="w-full bg-primary/20 rounded-t hover:bg-primary/40 transition-colors" style={{height:`${(v/90)*100}%`}} /><span className="text-[8px] text-slate-400">{i+1}</span></div>))}</div></div>
        <div className="g-card p-5"><h3 className="font-bold text-sm mb-3">⚡ ต้องดำเนินการ</h3><div className="space-y-2">{pending.map(p => (<div key={p.no} className={`flex items-center gap-3 p-2.5 rounded-xl text-sm ${p.urgent ? 'bg-red-50 border border-red-100' : 'bg-slate-50'}`}><span className="text-xl">{p.country}</span><div className="flex-1"><span className="font-medium">{p.name}</span><span className="text-xs text-slate-400 ml-2">{p.no}</span></div><span className={`text-xs font-bold ${p.urgent ? 'text-red-600' : 'text-slate-500'}`}>{p.action}</span></div>))}</div></div>
      </div>
    </div>
  );
}
