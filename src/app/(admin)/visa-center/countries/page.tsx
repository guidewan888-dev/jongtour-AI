import React from "react";
import Link from "next/link";
import { Globe, Edit, Plus, ToggleLeft } from "lucide-react";

const countries = [
  { emoji:"🇯🇵", name:"ญี่ปุ่น", slug:"japan", active:true, types:3, docs:6 },
  { emoji:"🇨🇳", name:"จีน", slug:"china", active:true, types:3, docs:5 },
  { emoji:"🇺🇸", name:"อเมริกา", slug:"america", active:true, types:3, docs:7 },
  { emoji:"🇬🇧", name:"อังกฤษ", slug:"england", active:true, types:2, docs:6 },
  { emoji:"🇫🇷", name:"ฝรั่งเศส", slug:"france", active:true, types:2, docs:6 },
  { emoji:"🇩🇪", name:"เยอรมนี", slug:"germany", active:true, types:2, docs:6 },
  { emoji:"🇦🇺", name:"ออสเตรเลีย", slug:"australia", active:true, types:2, docs:5 },
  { emoji:"🇨🇦", name:"แคนาดา", slug:"canada", active:true, types:2, docs:6 },
  { emoji:"🇰🇷", name:"เกาหลีใต้", slug:"korea", active:false, types:1, docs:4 },
];

export default function VisaCountriesAdmin() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><div><h1 className="text-2xl font-bold text-slate-900">🌍 Country CMS</h1><p className="text-sm text-slate-500 mt-1">จัดการข้อมูลวีซ่าแต่ละประเทศ</p></div><button className="btn-primary text-sm flex items-center gap-1"><Plus className="w-4 h-4"/>เพิ่มประเทศ</button></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {countries.map(c=>(
          <Link key={c.slug} href={`/visa-center/countries/${c.slug}`} className="g-card p-4 flex items-center gap-3 hover:shadow-lg transition-all">
            <span className="text-3xl">{c.emoji}</span>
            <div className="flex-1"><div className="font-bold text-slate-900">{c.name}</div><div className="text-xs text-slate-500">{c.types} ประเภท · {c.docs} เอกสาร</div></div>
            <div className={`w-3 h-3 rounded-full ${c.active?'bg-emerald-400':'bg-slate-300'}`} title={c.active?'Active':'Inactive'}/>
          </Link>
        ))}
      </div>
    </div>
  );
}
