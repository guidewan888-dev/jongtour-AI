import React from "react";
import { Calendar, Clock, MapPin } from "lucide-react";

const days = ["จ","อ","พ","พฤ","ศ","ส","อา"];
const appointments = [
  { date:"6 พ.ค.", time:"09:00", name:"คุณสมชาย", country:"🇺🇸", embassy:"สถานทูตสหรัฐ", type:"สัมภาษณ์", color:"bg-blue-100 border-blue-300" },
  { date:"6 พ.ค.", time:"10:30", name:"คุณวิภา", country:"🇬🇧", embassy:"VFS UK", type:"ยื่นเอกสาร", color:"bg-purple-100 border-purple-300" },
  { date:"7 พ.ค.", time:"08:30", name:"คุณนิธิ", country:"🇫🇷", embassy:"TLS France", type:"ยื่นเอกสาร", color:"bg-emerald-100 border-emerald-300" },
  { date:"8 พ.ค.", time:"09:00", name:"คุณธนพล", country:"🇦🇺", embassy:"VFS Australia", type:"ยื่น+Biometric", color:"bg-amber-100 border-amber-300" },
];

export default function VisaCalendarPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><div><h1 className="text-2xl font-bold text-slate-900">📅 Appointment Calendar</h1><p className="text-sm text-slate-500 mt-1">นัดหมายสถานทูต/VFS</p></div><button className="btn-primary text-sm">+ นัดหมายใหม่</button></div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-3">{appointments.map((a,i)=>(<div key={i} className={`p-4 rounded-2xl border-l-4 ${a.color} bg-white`}><div className="flex items-center justify-between mb-1"><span className="font-bold text-sm">{a.country} {a.name}</span><span className="text-xs text-slate-500">{a.date} · {a.time}</span></div><div className="flex items-center gap-3 text-xs text-slate-500"><span className="flex items-center gap-1"><MapPin className="w-3 h-3"/>{a.embassy}</span><span className="flex items-center gap-1"><Calendar className="w-3 h-3"/>{a.type}</span></div></div>))}</div>
        <div className="g-card p-5"><h3 className="font-bold text-sm mb-3">สรุปสัปดาห์นี้</h3><div className="space-y-2">{[{label:"นัดสัมภาษณ์",n:1,c:"text-blue-600"},{label:"ยื่นเอกสาร",n:2,c:"text-purple-600"},{label:"ยื่น+Biometric",n:1,c:"text-amber-600"},{label:"รับผล",n:3,c:"text-emerald-600"}].map(s=>(<div key={s.label} className="flex justify-between text-sm"><span className="text-slate-500">{s.label}</span><span className={`font-bold ${s.c}`}>{s.n}</span></div>))}</div></div>
      </div>
    </div>
  );
}
