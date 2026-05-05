"use client";
import React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Calendar, MapPin, Plane, Hotel } from "lucide-react";

const steps = ["ประเทศ", "วีซ่า+แพ็กเกจ", "ผู้สมัคร", "แผนเดินทาง", "เอกสาร", "ตรวจสอบ", "ชำระเงิน"];
const Stepper = ({ current }: { current: number }) => (
  <div className="flex items-center gap-1 overflow-x-auto py-4 px-2">{steps.map((s, i) => (<React.Fragment key={s}><div className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${i + 1 === current ? "bg-primary text-white" : i + 1 < current ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400"}`}><span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border border-current/20">{i + 1 < current ? "✓" : i + 1}</span>{s}</div>{i < steps.length - 1 && <div className="w-4 h-px bg-slate-200 shrink-0" />}</React.Fragment>))}</div>
);

export default function ApplyTravelPlanPage() {
  const sp = useSearchParams();
  const country = sp.get("country") || "";
  const qs = sp.toString();

  return (
    <div className="g-container py-6 max-w-3xl mx-auto">
      <Stepper current={4} />
      <h1 className="text-2xl font-bold text-slate-900 mt-6 mb-6">บอกเราเกี่ยวกับแผนเดินทาง</h1>
      <div className="space-y-4">
        <div className="g-card p-5 space-y-3">
          <h3 className="font-bold text-sm flex items-center gap-2"><Calendar className="w-4 h-4 text-primary" /> วันเดินทาง</h3>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-slate-500">วันเดินทางไป</label><input type="date" className="g-input mt-1 w-full" /></div>
            <div><label className="text-xs text-slate-500">วันเดินทางกลับ</label><input type="date" className="g-input mt-1 w-full" /></div>
          </div>
        </div>

        <div className="g-card p-5 space-y-3">
          <h3 className="font-bold text-sm flex items-center gap-2"><MapPin className="w-4 h-4 text-blue-500" /> เมือง/สถานที่ที่จะไป</h3>
          <input className="g-input w-full" placeholder="เช่น โตเกียว, โอซาก้า, เกียวโต" />
          <div className="flex items-center gap-2 text-sm"><input type="checkbox" className="rounded" /><span className="text-slate-600">มีการจองทัวร์กับ Jongtour แล้ว</span></div>
        </div>

        <div className="g-card p-5 space-y-3">
          <h3 className="font-bold text-sm flex items-center gap-2"><Plane className="w-4 h-4 text-sky-500" /> ตั๋วเครื่องบิน</h3>
          <div className="space-y-2 text-sm">
            <label className="flex items-center gap-2"><input type="radio" name="ticket" defaultChecked /><span>ยังไม่มี — ต้องการ <b className="text-primary">ตั๋ว Dummy (฿500)</b></span></label>
            <label className="flex items-center gap-2"><input type="radio" name="ticket" /><span>มีตั๋วแล้ว — จะอัพโหลดในขั้นถัดไป</span></label>
          </div>
        </div>

        <div className="g-card p-5 space-y-3">
          <h3 className="font-bold text-sm flex items-center gap-2"><Hotel className="w-4 h-4 text-purple-500" /> โรงแรม</h3>
          <div className="space-y-2 text-sm">
            <label className="flex items-center gap-2"><input type="radio" name="hotel" defaultChecked /><span>ยังไม่มี — ต้องการ <b className="text-primary">ใบจองโรงแรม Dummy (฿300/คืน)</b></span></label>
            <label className="flex items-center gap-2"><input type="radio" name="hotel" /><span>มีจองแล้ว — จะอัพโหลดในขั้นถัดไป</span></label>
          </div>
        </div>

        <div className="g-card p-5"><h3 className="font-bold text-sm mb-2">งบประมาณการเดินทาง (ประมาณ)</h3><input className="g-input w-full" placeholder="เช่น 100,000 บาท" /></div>
      </div>
      <div className="flex justify-between mt-6">
        <Link href={`/visa/apply/applicants?${qs}`} className="px-5 py-3 bg-slate-100 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-200">← ก่อนหน้า</Link>
        <Link href={`/visa/apply/documents?${qs}`} className="px-6 py-3 bg-primary text-white rounded-xl font-bold text-sm hover:bg-orange-600">ดำเนินการต่อ →</Link>
      </div>
    </div>
  );
}
