"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";

const steps = ["ประเทศ", "วีซ่า+แพ็กเกจ", "ผู้สมัคร", "แผนเดินทาง", "เอกสาร", "ตรวจสอบ", "ชำระเงิน"];
const Stepper = ({ current }: { current: number }) => (
  <div className="flex items-center gap-1 overflow-x-auto py-4 px-2">
    {steps.map((s, i) => (
      <React.Fragment key={s}>
        <div className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${i + 1 === current ? "bg-primary text-white" : i + 1 < current ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400"}`}>
          <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border border-current/20">{i + 1 < current ? "✓" : i + 1}</span>{s}
        </div>
        {i < steps.length - 1 && <div className="w-4 h-px bg-slate-200 shrink-0" />}
      </React.Fragment>
    ))}
  </div>
);

const popular = [
  { flag: "🇯🇵", name: "ญี่ปุ่น", slug: "japan" }, { flag: "🇨🇳", name: "จีน", slug: "china" },
  { flag: "🇺🇸", name: "อเมริกา", slug: "america" }, { flag: "🇬🇧", name: "อังกฤษ", slug: "england" },
  { flag: "🇦🇺", name: "ออสเตรเลีย", slug: "australia" }, { flag: "🇨🇦", name: "แคนาดา", slug: "canada" },
  { flag: "🇫🇷", name: "ฝรั่งเศส", slug: "france" }, { flag: "🇩🇪", name: "เยอรมนี", slug: "germany" },
  { flag: "🇰🇷", name: "เกาหลีใต้", slug: "korea" }, { flag: "🇮🇹", name: "อิตาลี", slug: "italy" },
  { flag: "🇪🇸", name: "สเปน", slug: "spain" }, { flag: "🇹🇷", name: "ตุรกี", slug: "turkey" },
];

export default function ApplyCountryPage() {
  const [selected, setSelected] = useState("");
  const [search, setSearch] = useState("");
  const filtered = popular.filter(c => c.name.includes(search) || c.slug.includes(search.toLowerCase()));

  return (
    <div className="g-container py-6 max-w-3xl mx-auto">
      <Stepper current={1} />
      <h1 className="text-2xl font-bold text-slate-900 mt-6 mb-2">เริ่มต้นด้วยประเทศที่คุณต้องการไป</h1>
      <div className="relative mb-4"><Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" /><input value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" placeholder="ค้นหาประเทศ..." /></div>
      <p className="text-sm text-slate-500 mb-3">ประเทศยอดนิยม</p>
      <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
        {filtered.map(c => (
          <button key={c.slug} onClick={() => setSelected(c.slug)} className={`p-4 rounded-2xl border-2 text-center transition-all ${selected === c.slug ? "border-primary bg-primary/5 shadow-md" : "border-slate-200 hover:border-slate-300 bg-white"}`}>
            <span className="text-3xl block mb-1">{c.flag}</span>
            <span className="text-sm font-medium text-slate-900">{c.name}</span>
          </button>
        ))}
      </div>
      <div className="flex justify-end mt-6">
        <Link href={selected ? `/visa/apply/visa-type?country=${selected}` : "#"} className={`px-6 py-3 rounded-xl font-bold text-sm transition-colors ${selected ? "bg-primary text-white hover:bg-orange-600" : "bg-slate-100 text-slate-400 cursor-not-allowed"}`}>ดำเนินการต่อ →</Link>
      </div>
    </div>
  );
}
