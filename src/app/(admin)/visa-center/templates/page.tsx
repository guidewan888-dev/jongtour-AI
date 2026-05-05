import React from "react";
import { FileText, Plus, Copy, Download } from "lucide-react";

const templates = [
  { name:"เอกสารพื้นฐาน — ญี่ปุ่น", country:"🇯🇵", docs:6, updated:"01/05/69" },
  { name:"เอกสาร B1/B2 — อเมริกา", country:"🇺🇸", docs:8, updated:"28/04/69" },
  { name:"เอกสาร Schengen — ฝรั่งเศส", country:"🇫🇷", docs:7, updated:"25/04/69" },
  { name:"เอกสาร Standard — อังกฤษ", country:"🇬🇧", docs:7, updated:"20/04/69" },
  { name:"Cover Letter Template", country:"📝", docs:1, updated:"15/04/69" },
];

export default function VisaTemplatesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><div><h1 className="text-2xl font-bold text-slate-900">📄 Document Templates</h1><p className="text-sm text-slate-500 mt-1">จัดการเทมเพลตเอกสารวีซ่า</p></div><button className="btn-primary text-sm flex items-center gap-1"><Plus className="w-4 h-4"/>สร้างเทมเพลต</button></div>
      <div className="space-y-3">{templates.map(t=>(<div key={t.name} className="g-card p-4 flex items-center gap-4"><span className="text-2xl">{t.country}</span><div className="flex-1"><div className="font-bold text-sm">{t.name}</div><div className="text-xs text-slate-500">{t.docs} รายการ · อัพเดท {t.updated}</div></div><div className="flex gap-2"><button className="p-2 hover:bg-slate-100 rounded-lg"><Copy className="w-4 h-4 text-slate-400"/></button><button className="p-2 hover:bg-slate-100 rounded-lg"><Download className="w-4 h-4 text-slate-400"/></button></div></div>))}</div>
    </div>
  );
}
