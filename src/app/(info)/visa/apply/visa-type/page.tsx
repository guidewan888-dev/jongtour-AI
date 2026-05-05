"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const steps = ["ประเทศ", "วีซ่า+แพ็กเกจ", "ผู้สมัคร", "แผนเดินทาง", "เอกสาร", "ตรวจสอบ", "ชำระเงิน"];
const Stepper = ({ current }: { current: number }) => (
  <div className="flex items-center gap-1 overflow-x-auto py-4 px-2">{steps.map((s, i) => (<React.Fragment key={s}><div className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${i + 1 === current ? "bg-primary text-white" : i + 1 < current ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400"}`}><span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border border-current/20">{i + 1 < current ? "✓" : i + 1}</span>{s}</div>{i < steps.length - 1 && <div className="w-4 h-px bg-slate-200 shrink-0" />}</React.Fragment>))}</div>
);

const visaTypes = [
  { key: "tourist", icon: "🏝️", name: "ท่องเที่ยว", desc: "เดินทางท่องเที่ยวระยะสั้น", range: "฿1,500 - ฿20,000" },
  { key: "visit", icon: "👨‍👩‍👧", name: "เยี่ยมเยียน", desc: "เยี่ยมญาติ/เพื่อนในต่างประเทศ", range: "฿2,000 - ฿20,000" },
  { key: "business", icon: "💼", name: "ธุรกิจ", desc: "ประชุม สัมมนา ติดต่อธุรกิจ", range: "฿3,000 - ฿25,000" },
  { key: "transit", icon: "✈️", name: "Transit", desc: "แวะเปลี่ยนเครื่อง/ผ่านทาง", range: "฿1,000 - ฿5,000" },
];

export default function ApplyVisaTypePage() {
  const sp = useSearchParams();
  const country = sp.get("country") || "";
  const [selected, setSelected] = useState("");

  return (
    <div className="g-container py-6 max-w-3xl mx-auto">
      <Stepper current={2} />
      <h1 className="text-2xl font-bold text-slate-900 mt-6 mb-1">เลือกประเภทวีซ่า</h1>
      <p className="text-sm text-slate-500 mb-6">สำหรับ <span className="font-bold text-slate-900">{country}</span> · <Link href="/visa/apply/country" className="text-primary">เปลี่ยนประเทศ</Link></p>
      <div className="grid grid-cols-2 gap-3">
        {visaTypes.map(v => (
          <button key={v.key} onClick={() => setSelected(v.key)} className={`p-5 rounded-2xl border-2 text-left transition-all ${selected === v.key ? "border-primary bg-primary/5 shadow-md" : "border-slate-200 hover:border-slate-300 bg-white"}`}>
            <div className="text-3xl mb-2">{v.icon}</div>
            <h3 className="font-bold text-slate-900">{v.name}</h3>
            <p className="text-xs text-slate-500 mt-1">{v.desc}</p>
            <div className="text-sm font-bold text-primary mt-2">{v.range}</div>
          </button>
        ))}
      </div>
      <div className="flex justify-between mt-6">
        <Link href="/visa/apply/country" className="px-5 py-3 bg-slate-100 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-200">← ก่อนหน้า</Link>
        <Link href={selected ? `/visa/apply/tier?country=${country}&type=${selected}` : "#"} className={`px-6 py-3 rounded-xl font-bold text-sm ${selected ? "bg-primary text-white hover:bg-orange-600" : "bg-slate-100 text-slate-400 cursor-not-allowed"}`}>ดำเนินการต่อ →</Link>
      </div>
    </div>
  );
}
