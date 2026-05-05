"use client";
import React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Upload, CheckCircle, AlertTriangle, Eye } from "lucide-react";

const steps = ["ประเทศ", "วีซ่า+แพ็กเกจ", "ผู้สมัคร", "แผนเดินทาง", "เอกสาร", "ตรวจสอบ", "ชำระเงิน"];
const Stepper = ({ current }: { current: number }) => (
  <div className="flex items-center gap-1 overflow-x-auto py-4 px-2">{steps.map((s, i) => (<React.Fragment key={s}><div className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${i + 1 === current ? "bg-primary text-white" : i + 1 < current ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400"}`}><span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border border-current/20">{i + 1 < current ? "✓" : i + 1}</span>{s}</div>{i < steps.length - 1 && <div className="w-4 h-px bg-slate-200 shrink-0" />}</React.Fragment>))}</div>
);

const docs = [
  { cat: "เอกสารส่วนตัว", items: [{ name: "พาสปอร์ต (หน้าข้อมูล)", required: true, ai: true }, { name: "รูปถ่าย 2x2 นิ้ว", required: true, ai: true }, { name: "สำเนาบัตรประชาชน", required: true }, { name: "สำเนาทะเบียนบ้าน", required: true }] },
  { cat: "เอกสารการเงิน", items: [{ name: "Statement ย้อนหลัง 6 เดือน", required: true, ai: true }, { name: "หนังสือรับรองเงินฝาก (ถ้ามี)", required: false }] },
  { cat: "เอกสารการทำงาน", items: [{ name: "หนังสือรับรองการทำงาน", required: true }, { name: "ใบอนุญาตประกอบธุรกิจ (เจ้าของ)", required: false }] },
  { cat: "เอกสารการเดินทาง", items: [{ name: "ตั๋วเครื่องบิน / Booking", required: false }, { name: "ใบจองโรงแรม", required: false }, { name: "แผนการเดินทาง", required: false }] },
];

export default function ApplyDocumentsPage() {
  const sp = useSearchParams();
  const qs = sp.toString();

  return (
    <div className="g-container py-6 max-w-3xl mx-auto">
      <Stepper current={5} />
      <h1 className="text-2xl font-bold text-slate-900 mt-6 mb-2">อัปโหลดเอกสาร</h1>
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 bg-slate-100 rounded-full h-2.5"><div className="bg-primary h-full rounded-full" style={{ width: "0%" }} /></div>
        <span className="text-xs text-slate-400 shrink-0">0% ครบ</span>
      </div>

      <div className="space-y-4">
        {docs.map(cat => (
          <details key={cat.cat} className="bg-white rounded-2xl border border-slate-200 overflow-hidden" open>
            <summary className="p-4 font-bold text-sm text-slate-900 cursor-pointer hover:bg-slate-50 list-none flex justify-between"><span>📁 {cat.cat}</span><span className="text-xs text-slate-400">{cat.items.length} รายการ</span></summary>
            <div className="border-t border-slate-100 divide-y divide-slate-50">
              {cat.items.map(doc => (
                <div key={doc.name} className="p-4 flex items-center gap-3">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-slate-900 flex items-center gap-2">{doc.name}{doc.required && <span className="text-red-500 text-xs">*จำเป็น</span>}{doc.ai && <span className="text-[10px] bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded-full">AI ตรวจ</span>}</div>
                    <div className="text-xs text-slate-400 mt-0.5">PDF, JPG &lt; 10MB</div>
                  </div>
                  <label className="px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-medium text-slate-600 cursor-pointer flex items-center gap-1.5"><Upload className="w-3.5 h-3.5" /> เลือกไฟล์<input type="file" className="hidden" /></label>
                </div>
              ))}
            </div>
          </details>
        ))}
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded-xl text-sm text-blue-700 flex items-start gap-2">
        <span className="shrink-0">💡</span> สามารถข้ามขั้นตอนนี้ได้ แล้วอัพโหลดเอกสารทีหลังผ่านหน้าติดตามสถานะ
      </div>

      <div className="flex justify-between mt-6">
        <Link href={`/visa/apply/travel-plan?${qs}`} className="px-5 py-3 bg-slate-100 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-200">← ก่อนหน้า</Link>
        <Link href={`/visa/apply/review?${qs}`} className="px-6 py-3 bg-primary text-white rounded-xl font-bold text-sm hover:bg-orange-600">ดำเนินการต่อ →</Link>
      </div>
    </div>
  );
}
