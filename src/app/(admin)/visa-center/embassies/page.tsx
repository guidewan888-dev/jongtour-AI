import React from "react";
import { MapPin, Phone, Clock, Globe, Plus, Edit } from "lucide-react";

const list = [
  { country:"🇯🇵", name:"สถานทูตญี่ปุ่น", type:"Embassy", addr:"177 ถ.วิทยุ กรุงเทพฯ", tel:"02-207-8500", hrs:"จ-ศ 08:30-11:30" },
  { country:"🇺🇸", name:"สถานทูตสหรัฐฯ", type:"Embassy", addr:"95 ถ.วิทยุ กรุงเทพฯ", tel:"02-205-4000", hrs:"จ-ศ 07:00-15:00" },
  { country:"🇬🇧", name:"VFS Global UK", type:"VFS", addr:"Trendy ชั้น 28 สุขุมวิท 13", tel:"02-118-7100", hrs:"จ-ศ 08:00-15:00" },
  { country:"🇫🇷", name:"TLS Contact France", type:"TLS", addr:"Sathorn Square ชั้น 12", tel:"02-838-6789", hrs:"จ-ศ 08:00-16:00" },
  { country:"🇨🇳", name:"สถานทูตจีน", type:"Embassy", addr:"57 ถ.รัชดาภิเษก กรุงเทพฯ", tel:"02-245-7032", hrs:"จ-ศ 09:00-11:30" },
];

export default function VisaEmbassiesAdmin() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><div><h1 className="text-2xl font-bold text-slate-900">🏛️ Embassy & VFS</h1><p className="text-sm text-slate-500 mt-1">จัดการข้อมูลสถานทูตและศูนย์ยื่นวีซ่า</p></div><button className="btn-primary text-sm flex items-center gap-1"><Plus className="w-4 h-4"/>เพิ่ม</button></div>
      <div className="space-y-3">{list.map(e=>(<div key={e.name} className="g-card p-4"><div className="flex items-start justify-between mb-2"><div><h3 className="font-bold text-sm">{e.country} {e.name}</h3><span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${e.type==="Embassy"?"bg-blue-100 text-blue-700":e.type==="VFS"?"bg-purple-100 text-purple-700":"bg-emerald-100 text-emerald-700"}`}>{e.type}</span></div><button className="text-primary text-xs font-bold flex items-center gap-1"><Edit className="w-3 h-3"/>แก้ไข</button></div>
        <div className="grid grid-cols-2 gap-1.5 text-xs text-slate-500"><div className="flex items-center gap-1"><MapPin className="w-3 h-3"/>{e.addr}</div><div className="flex items-center gap-1"><Phone className="w-3 h-3"/>{e.tel}</div><div className="flex items-center gap-1"><Clock className="w-3 h-3"/>{e.hrs}</div></div></div>))}</div>
    </div>
  );
}
