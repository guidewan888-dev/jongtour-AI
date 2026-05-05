"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";

const steps = ["ประเทศ", "วีซ่า+แพ็กเกจ", "ผู้สมัคร", "แผนเดินทาง", "เอกสาร", "ตรวจสอบ", "ชำระเงิน"];
const Stepper = ({ current }: { current: number }) => (
  <div className="flex items-center gap-1 overflow-x-auto py-4 px-2">{steps.map((s, i) => (<React.Fragment key={s}><div className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${i + 1 === current ? "bg-primary text-white" : i + 1 < current ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400"}`}><span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border border-current/20">{i + 1 < current ? "✓" : i + 1}</span>{s}</div>{i < steps.length - 1 && <div className="w-4 h-px bg-slate-200 shrink-0" />}</React.Fragment>))}</div>
);

export default function ApplyApplicantsPage() {
  const sp = useSearchParams();
  const country = sp.get("country") || "";
  const type = sp.get("type") || "";
  const tier = sp.get("tier") || "";
  const [count, setCount] = useState(1);
  const [expanded, setExpanded] = useState(0);

  return (
    <div className="g-container py-6 max-w-3xl mx-auto">
      <Stepper current={3} />
      <h1 className="text-2xl font-bold text-slate-900 mt-6 mb-2">ใครจะเดินทางบ้าง?</h1>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-sm text-slate-500">จำนวนผู้สมัคร:</span>
        <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden">
          <button onClick={() => setCount(Math.max(1, count - 1))} className="px-3 py-2 bg-slate-50 hover:bg-slate-100 text-lg font-bold">−</button>
          <span className="px-4 py-2 font-bold">{count}</span>
          <button onClick={() => setCount(Math.min(20, count + 1))} className="px-3 py-2 bg-slate-50 hover:bg-slate-100 text-lg font-bold">+</button>
        </div>
        {count >= 2 && <span className="text-xs text-emerald-600 font-medium bg-emerald-50 px-2 py-1 rounded-full">🎉 ส่วนลดกลุ่ม 5%</span>}
      </div>

      <div className="space-y-3">
        {Array.from({ length: count }, (_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <button onClick={() => setExpanded(expanded === i ? -1 : i)} className="w-full p-4 flex items-center justify-between hover:bg-slate-50">
              <span className="font-bold text-sm text-slate-900">👤 ผู้สมัครคนที่ {i + 1}</span>
              {expanded === i ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </button>
            {expanded === i && (
              <div className="p-4 pt-0 border-t border-slate-100 space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  <div><label className="text-xs text-slate-500">คำนำหน้า</label><select className="g-input mt-1 w-full"><option>นาย</option><option>นาง</option><option>นางสาว</option></select></div>
                  <div><label className="text-xs text-slate-500">ชื่อ (ไทย)</label><input className="g-input mt-1 w-full" /></div>
                  <div><label className="text-xs text-slate-500">นามสกุล (ไทย)</label><input className="g-input mt-1 w-full" /></div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div><label className="text-xs text-slate-500">ชื่อ (EN ตามพาสปอร์ต)</label><input className="g-input mt-1 w-full" /></div>
                  <div><label className="text-xs text-slate-500">นามสกุล (EN)</label><input className="g-input mt-1 w-full" /></div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div><label className="text-xs text-slate-500">เพศ</label><select className="g-input mt-1 w-full"><option>ชาย</option><option>หญิง</option></select></div>
                  <div><label className="text-xs text-slate-500">วันเกิด</label><input type="date" className="g-input mt-1 w-full" /></div>
                  <div><label className="text-xs text-slate-500">สัญชาติ</label><input className="g-input mt-1 w-full" defaultValue="ไทย" /></div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div><label className="text-xs text-slate-500">เบอร์โทร</label><input className="g-input mt-1 w-full" /></div>
                  <div><label className="text-xs text-slate-500">Email</label><input type="email" className="g-input mt-1 w-full" /></div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div><label className="text-xs text-slate-500">เลขพาสปอร์ต</label><input className="g-input mt-1 w-full" /></div>
                  <div><label className="text-xs text-slate-500">วันออก</label><input type="date" className="g-input mt-1 w-full" /></div>
                  <div><label className="text-xs text-slate-500">วันหมดอายุ</label><input type="date" className="g-input mt-1 w-full" /></div>
                </div>
                <div><label className="text-xs text-slate-500">อาชีพ</label><input className="g-input mt-1 w-full" /></div>
                <div className="space-y-1 text-sm">
                  <label className="flex items-center gap-2"><input type="checkbox" className="rounded" /> เคยถูกปฏิเสธวีซ่าประเทศนี้</label>
                  <label className="flex items-center gap-2"><input type="checkbox" className="rounded" /> เคยเดินทางไปประเทศนี้</label>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-6">
        <Link href={`/visa/apply/tier?country=${country}&type=${type}`} className="px-5 py-3 bg-slate-100 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-200">← ก่อนหน้า</Link>
        <Link href={`/visa/apply/travel-plan?country=${country}&type=${type}&tier=${tier}&pax=${count}`} className="px-6 py-3 bg-primary text-white rounded-xl font-bold text-sm hover:bg-orange-600">ดำเนินการต่อ →</Link>
      </div>
    </div>
  );
}
