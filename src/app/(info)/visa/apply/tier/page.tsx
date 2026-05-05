"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const steps = ["ประเทศ", "วีซ่า+แพ็กเกจ", "ผู้สมัคร", "แผนเดินทาง", "เอกสาร", "ตรวจสอบ", "ชำระเงิน"];
const Stepper = ({ current }: { current: number }) => (
  <div className="flex items-center gap-1 overflow-x-auto py-4 px-2">{steps.map((s, i) => (<React.Fragment key={s}><div className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${i + 1 === current ? "bg-primary text-white" : i + 1 < current ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400"}`}><span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border border-current/20">{i + 1 < current ? "✓" : i + 1}</span>{s}</div>{i < steps.length - 1 && <div className="w-4 h-px bg-slate-200 shrink-0" />}</React.Fragment>))}</div>
);

const tiers = [
  { key: "plus", name: "PLUS", price: "฿2,500", days: "5 วัน", features: ["เอกสารมาตรฐาน", "กรอกฟอร์ม", "นัดหมาย", "แปล 4 ฉบับ", "ปรึกษาพื้นฐาน"], color: "border-slate-300" },
  { key: "advance", name: "ADVANCE", price: "฿4,500", days: "7-10 วัน", features: ["ทุกอย่างใน Plus", "วิเคราะห์เคส", "แปล 6 ฉบับ", "ตั๋ว+โรงแรม Dummy", "ปรึกษาเชิงลึก"], color: "border-blue-400" },
  { key: "exclusive", name: "EXCLUSIVE", price: "฿7,500", days: "10-14 วัน", badge: "🔥 BEST SELLER", features: ["ทุกอย่างใน Advance", "วิเคราะห์ Exclusive", "แปล 8 ฉบับ", "Itinerary+Cover Letter", "ประสานเร่งด่วน"], color: "border-primary ring-2 ring-primary/20 -translate-y-1 shadow-xl" },
  { key: "vip", name: "VIP", price: "฿15,000", days: "14-21 วัน", badge: "👑 GUARANTEE", features: ["ทุกอย่างใน Exclusive", "แปลทุกฉบับ", "ซ้อมสัมภาษณ์", "ค่าสถานทูตรวม", "ยื่นรอบ 2 ฟรี"], color: "border-amber-400" },
];

export default function ApplyTierPage() {
  const sp = useSearchParams();
  const country = sp.get("country") || "";
  const type = sp.get("type") || "";
  const [selected, setSelected] = useState("exclusive");

  return (
    <div className="g-container py-6 max-w-4xl mx-auto">
      <Stepper current={2} />
      <h1 className="text-2xl font-bold text-slate-900 mt-6 mb-1">เลือกแพ็กเกจที่เหมาะกับคุณ</h1>
      <p className="text-sm text-slate-500 mb-6">{country} · {type} · <Link href={`/visa/apply/visa-type?country=${country}`} className="text-primary">เปลี่ยน</Link></p>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {tiers.map(t => (
          <button key={t.key} onClick={() => setSelected(t.key)} className={`p-5 rounded-2xl border-2 text-left transition-all ${selected === t.key ? t.color : "border-slate-200 bg-white hover:border-slate-300"}`}>
            {t.badge && <div className="text-xs font-bold text-primary mb-2">{t.badge}</div>}
            <h3 className="font-black text-slate-900">{t.name}</h3>
            <div className="text-xl font-black text-primary mt-1">{t.price}<span className="text-xs text-slate-400 font-normal">/ท่าน</span></div>
            <div className="text-xs text-slate-500 mt-1">⏱️ {t.days}</div>
            <ul className="mt-3 space-y-1 text-xs text-slate-600">{t.features.map(f => <li key={f}>✓ {f}</li>)}</ul>
          </button>
        ))}
      </div>
      <div className="flex justify-between mt-6">
        <Link href={`/visa/apply/visa-type?country=${country}`} className="px-5 py-3 bg-slate-100 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-200">← ก่อนหน้า</Link>
        <Link href={`/visa/apply/applicants?country=${country}&type=${type}&tier=${selected}`} className="px-6 py-3 bg-primary text-white rounded-xl font-bold text-sm hover:bg-orange-600">ดำเนินการต่อ →</Link>
      </div>
    </div>
  );
}
