import React from "react";

const cols = [
  { key:"NEW", label:"📨 ใหม่", color:"bg-blue-50 border-blue-200", items:[{no:"V-0055",name:"คุณมานะ",country:"🇫🇷",tier:"ADVANCE"},{no:"V-0056",name:"คุณปราณี",country:"🇯🇵",tier:"PLUS"}] },
  { key:"REVIEW", label:"🔍 ตรวจเอกสาร", color:"bg-purple-50 border-purple-200", items:[{no:"V-0042",name:"คุณสมชาย",country:"🇺🇸",tier:"EXCLUSIVE"},{no:"V-0051",name:"คุณธนพล",country:"🇦🇺",tier:"EXCLUSIVE"}] },
  { key:"DOCS", label:"📄 รอเอกสาร", color:"bg-amber-50 border-amber-200", items:[{no:"V-0048",name:"คุณนิธิ",country:"🇫🇷",tier:"ADVANCE"}] },
  { key:"READY", label:"📋 พร้อมยื่น", color:"bg-cyan-50 border-cyan-200", items:[] },
  { key:"EMBASSY", label:"🏛️ ยื่นสถานทูต", color:"bg-indigo-50 border-indigo-200", items:[{no:"V-0045",name:"คุณวิภา",country:"🇬🇧",tier:"VIP"}] },
  { key:"RESULT", label:"📬 รอผล", color:"bg-slate-50 border-slate-200", items:[] },
  { key:"DONE", label:"✅ เสร็จ", color:"bg-emerald-50 border-emerald-200", items:[{no:"V-0050",name:"คุณสุนิสา",country:"🇯🇵",tier:"PLUS"}] },
];
const TIER_C: Record<string,string> = { PLUS:"bg-slate-100 text-slate-600", ADVANCE:"bg-blue-50 text-blue-600", EXCLUSIVE:"bg-orange-50 text-orange-700", VIP:"bg-amber-50 text-amber-700" };

export default function VisaQueuePage() {
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-slate-900">📌 Kanban Queue</h1><p className="text-sm text-slate-500 mt-1">ลาก & วาง เพื่อย้ายสถานะ</p></div>
      <div className="flex gap-3 overflow-x-auto pb-4">
        {cols.map(c=>(<div key={c.key} className={`min-w-[220px] rounded-2xl border p-3 ${c.color}`}><div className="font-bold text-sm mb-3 flex justify-between"><span>{c.label}</span><span className="text-xs text-slate-400">{c.items.length}</span></div>
          <div className="space-y-2">{c.items.map(item=>(<div key={item.no} className="bg-white p-3 rounded-xl shadow-sm border border-slate-100 cursor-grab hover:shadow-md transition-all"><div className="flex items-center gap-2 mb-1"><span>{item.country}</span><span className="font-medium text-sm">{item.name}</span></div><div className="flex items-center gap-1.5"><span className="text-[10px] text-slate-400 font-mono">{item.no}</span><span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${TIER_C[item.tier]}`}>{item.tier}</span></div></div>))}{c.items.length===0&&<div className="text-xs text-slate-400 text-center py-4">ว่าง</div>}</div>
        </div>))}
      </div>
    </div>
  );
}
