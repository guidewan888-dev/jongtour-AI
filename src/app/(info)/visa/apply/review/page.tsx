"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle, Edit, Shield, Tag } from "lucide-react";

const steps = ["ประเทศ", "วีซ่า+แพ็กเกจ", "ผู้สมัคร", "แผนเดินทาง", "เอกสาร", "ตรวจสอบ", "ชำระเงิน"];
const Stepper = ({ current }: { current: number }) => (
  <div className="flex items-center gap-1 overflow-x-auto py-4 px-2">{steps.map((s, i) => (<React.Fragment key={s}><div className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${i + 1 === current ? "bg-primary text-white" : i + 1 < current ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400"}`}><span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border border-current/20">{i + 1 < current ? "✓" : i + 1}</span>{s}</div>{i < steps.length - 1 && <div className="w-4 h-px bg-slate-200 shrink-0" />}</React.Fragment>))}</div>
);

const addons = [
  { key: "insurance", name: "🛡️ ประกันเดินทาง", price: 1200, note: "⚠️ บังคับสำหรับ Schengen", locked: false },
  { key: "ticket", name: "✈️ ตั๋ว Dummy", price: 500, note: "", locked: false },
  { key: "hotel", name: "🏨 โรงแรม Dummy", price: 300, note: "ราคาต่อคืน", locked: false },
  { key: "translate", name: "📝 แปลเอกสารเพิ่ม", price: 800, note: "ราคาต่อฉบับ", locked: false },
  { key: "cover", name: "📄 Cover Letter", price: 1500, note: "", locked: false },
  { key: "itinerary", name: "🗺️ แผนการเดินทาง", price: 1000, note: "", locked: false },
];

const bundles = [
  { name: "Quick Submit Bundle", items: "ตั๋ว + โรงแรม + ประกัน", original: 2000, price: 1700, discount: "15%" },
  { name: "Document Master Bundle", items: "แปล×3 + Cover Letter + รับรอง×2", original: 4400, price: 3500, discount: "20%" },
];

export default function ApplyReviewPage() {
  const sp = useSearchParams();
  const country = sp.get("country") || "japan";
  const type = sp.get("type") || "tourist";
  const tier = sp.get("tier") || "exclusive";
  const pax = parseInt(sp.get("pax") || "1");
  const qs = sp.toString();
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [promo, setPromo] = useState("");

  const tierPrice = tier === "plus" ? 2500 : tier === "advance" ? 4500 : tier === "exclusive" ? 7500 : 15000;
  const addonTotal = selectedAddons.reduce((sum, k) => sum + (addons.find(a => a.key === k)?.price || 0), 0);
  const subtotal = tierPrice * pax + addonTotal;
  const discount = pax >= 2 ? Math.round(subtotal * 0.05) : 0;
  const total = subtotal - discount;

  return (
    <div className="g-container py-6 max-w-4xl mx-auto">
      <Stepper current={6} />
      <h1 className="text-2xl font-bold text-slate-900 mt-6 mb-6">ตรวจสอบและเพิ่มบริการเสริม</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Summary + Addons */}
        <div className="lg:col-span-2 space-y-4">
          {/* Summary */}
          <div className="g-card p-5 space-y-3">
            <div className="flex justify-between items-center"><h3 className="font-bold text-sm">📋 สรุปการสมัคร</h3><button className="text-xs text-primary font-medium flex items-center gap-1"><Edit className="w-3 h-3" /> แก้ไข</button></div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><span className="text-slate-500">ประเทศ:</span> <b>{country}</b></div>
              <div><span className="text-slate-500">ประเภท:</span> <b>{type}</b></div>
              <div><span className="text-slate-500">แพ็กเกจ:</span> <b className="text-primary uppercase">{tier}</b></div>
              <div><span className="text-slate-500">ผู้สมัคร:</span> <b>{pax} ท่าน</b></div>
            </div>
          </div>

          {/* Add-ons */}
          <div className="g-card p-5 space-y-3">
            <h3 className="font-bold text-sm">✨ บริการเสริม</h3>
            <div className="space-y-2">
              {addons.map(a => (
                <label key={a.key} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100">
                  <input type="checkbox" checked={selectedAddons.includes(a.key)} onChange={e => setSelectedAddons(e.target.checked ? [...selectedAddons, a.key] : selectedAddons.filter(x => x !== a.key))} className="rounded" />
                  <div className="flex-1"><span className="text-sm font-medium">{a.name}</span>{a.note && <span className="text-xs text-amber-600 ml-2">{a.note}</span>}</div>
                  <span className="text-sm font-bold text-primary">฿{a.price.toLocaleString()}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Bundles */}
          <div className="g-card p-5 space-y-3">
            <h3 className="font-bold text-sm">📦 Bundle ประหยัดกว่า</h3>
            {bundles.map(b => (
              <div key={b.name} className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-3">
                <input type="radio" name="bundle" className="rounded-full" />
                <div className="flex-1"><div className="text-sm font-medium">{b.name}</div><div className="text-xs text-slate-500">{b.items}</div></div>
                <div className="text-right"><div className="text-xs text-slate-400 line-through">฿{b.original.toLocaleString()}</div><div className="text-sm font-bold text-emerald-700">฿{b.price.toLocaleString()} <span className="text-xs">(-{b.discount})</span></div></div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 text-sm"><input type="checkbox" className="rounded" /><span>ยอมรับ <a href="/terms" className="text-primary underline">ข้อตกลงการใช้บริการ</a> และ <a href="/pdpa" className="text-primary underline">นโยบายข้อมูลส่วนบุคคล</a></span></div>
        </div>

        {/* Right: Price */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-white rounded-2xl border-2 border-primary/20 p-5 space-y-3">
            <h3 className="font-bold text-slate-900">📋 สรุปราคา</h3>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between"><span>ค่าบริการ {tier.toUpperCase()} × {pax}</span><span>฿{(tierPrice * pax).toLocaleString()}</span></div>
              {selectedAddons.length > 0 && <div className="flex justify-between text-slate-500"><span>บริการเสริม</span><span>฿{addonTotal.toLocaleString()}</span></div>}
              {discount > 0 && <div className="flex justify-between text-emerald-600"><span>ส่วนลดกลุ่ม (-5%)</span><span>-฿{discount.toLocaleString()}</span></div>}
            </div>
            <div className="border-t border-slate-100 pt-3 flex justify-between font-bold text-lg"><span>รวม</span><span className="text-primary">฿{total.toLocaleString()}</span></div>
            <div className="flex gap-2"><Tag className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" /><input value={promo} onChange={e => setPromo(e.target.value)} className="g-input flex-1 text-xs" placeholder="ใส่ Promo Code" /><button className="px-3 py-1.5 bg-slate-100 rounded-lg text-xs font-medium">ใช้</button></div>
            <p className="text-[10px] text-slate-400">* ยังไม่รวมค่าธรรมเนียมสถานทูต</p>
            <Link href={`/visa/apply/payment?${qs}&total=${total}`} className="block text-center bg-primary text-white py-3 rounded-xl font-bold text-sm hover:bg-orange-600 transition-colors">ดำเนินการชำระเงิน →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
