import React from "react";
import { Users, BarChart3 } from "lucide-react";

const staff = [
  { name:"แอน", role:"Senior Visa Officer", active:12, completed:45, rate:"94%", avatar:"👩‍💼" },
  { name:"ปลา", role:"Visa Officer", active:8, completed:32, rate:"91%", avatar:"👩‍💻" },
  { name:"บอส", role:"Junior Officer", active:4, completed:18, rate:"89%", avatar:"👨‍💼" },
  { name:"มิ้นท์", role:"Document Reviewer", active:6, completed:55, rate:"97%", avatar:"👩" },
];

export default function VisaStaffPage() {
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-slate-900">👥 Staff Assignments</h1><p className="text-sm text-slate-500 mt-1">จัดการงานและ Workload ทีมวีซ่า</p></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {staff.map(s=>(<div key={s.name} className="g-card p-5"><div className="flex items-center gap-3 mb-3"><span className="text-3xl">{s.avatar}</span><div><div className="font-bold text-slate-900">{s.name}</div><div className="text-xs text-slate-500">{s.role}</div></div></div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-blue-50 p-2 rounded-xl"><div className="text-lg font-bold text-blue-600">{s.active}</div><div className="text-[10px] text-slate-500">กำลังทำ</div></div>
            <div className="bg-emerald-50 p-2 rounded-xl"><div className="text-lg font-bold text-emerald-600">{s.completed}</div><div className="text-[10px] text-slate-500">เสร็จแล้ว</div></div>
            <div className="bg-amber-50 p-2 rounded-xl"><div className="text-lg font-bold text-amber-600">{s.rate}</div><div className="text-[10px] text-slate-500">Approval</div></div>
          </div>
          <div className="mt-3"><div className="flex justify-between text-xs mb-1"><span className="text-slate-500">Workload</span><span>{s.active}/15</span></div><div className="w-full bg-slate-100 rounded-full h-2"><div className={`h-full rounded-full ${s.active>10?'bg-red-400':s.active>7?'bg-amber-400':'bg-emerald-400'}`} style={{width:`${(s.active/15)*100}%`}}/></div></div>
        </div>))}
      </div>
    </div>
  );
}
