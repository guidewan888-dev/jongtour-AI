"use client";
import React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CreditCard, Building, QrCode, Shield, Clock } from "lucide-react";

const steps = ["ประเทศ", "วีซ่า+แพ็กเกจ", "ผู้สมัคร", "แผนเดินทาง", "เอกสาร", "ตรวจสอบ", "ชำระเงิน"];
const Stepper = ({ current }: { current: number }) => (
  <div className="flex items-center gap-1 overflow-x-auto py-4 px-2">{steps.map((s, i) => (<React.Fragment key={s}><div className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${i + 1 === current ? "bg-primary text-white" : i + 1 < current ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400"}`}><span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border border-current/20">{i + 1 < current ? "✓" : i + 1}</span>{s}</div>{i < steps.length - 1 && <div className="w-4 h-px bg-slate-200 shrink-0" />}</React.Fragment>))}</div>
);

export default function ApplyPaymentPage() {
  const sp = useSearchParams();
  const total = parseInt(sp.get("total") || "7500");
  const half = Math.ceil(total / 2);

  return (
    <div className="g-container py-6 max-w-3xl mx-auto">
      <Stepper current={7} />
      <h1 className="text-2xl font-bold text-slate-900 mt-6 mb-2">ชำระค่าวีซ่า</h1>
      <div className="flex items-center gap-2 mb-6 text-sm text-amber-700 bg-amber-50 p-3 rounded-xl"><Clock className="w-4 h-4" /> กรุณาชำระภายใน 15 นาที</div>

      <div className="space-y-4">
        {/* Payment amount */}
        <div className="g-card p-5 space-y-3">
          <h3 className="font-bold text-sm">💰 เลือกยอดชำระ</h3>
          <div className="space-y-2">
            <label className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl cursor-pointer"><input type="radio" name="amount" defaultChecked className="rounded-full" /><div className="flex-1"><span className="font-medium">ชำระเต็มจำนวน</span></div><span className="font-bold text-primary">฿{total.toLocaleString()}</span></label>
            <label className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer"><input type="radio" name="amount" className="rounded-full" /><div className="flex-1"><span className="font-medium">มัดจำ 50%</span><span className="text-xs text-slate-500 ml-2">ส่วนที่เหลือชำระก่อนยื่น</span></div><span className="font-bold">฿{half.toLocaleString()}</span></label>
          </div>
        </div>

        {/* Payment methods */}
        <div className="g-card p-5 space-y-3">
          <h3 className="font-bold text-sm">💳 ช่องทางชำระเงิน</h3>
          <div className="space-y-2">
            <label className="flex items-center gap-3 p-4 bg-white border-2 border-primary rounded-xl cursor-pointer">
              <input type="radio" name="method" defaultChecked className="rounded-full" />
              <QrCode className="w-6 h-6 text-primary" /><div><span className="font-medium">PromptPay QR</span><div className="text-xs text-slate-500">สแกนจ่ายทันที</div></div>
            </label>
            <label className="flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-xl cursor-pointer">
              <input type="radio" name="method" className="rounded-full" />
              <CreditCard className="w-6 h-6 text-blue-500" /><div><span className="font-medium">บัตรเครดิต/เดบิต</span><div className="text-xs text-slate-500">Visa, Mastercard, JCB</div></div>
            </label>
            <label className="flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-xl cursor-pointer">
              <input type="radio" name="method" className="rounded-full" />
              <Building className="w-6 h-6 text-emerald-500" /><div><span className="font-medium">โอนเงินผ่านธนาคาร</span><div className="text-xs text-slate-500">กสิกร, กรุงเทพ, SCB, กรุงไทย</div></div>
            </label>
          </div>
        </div>

        <div className="flex items-start gap-2 text-xs text-slate-500 p-3 bg-slate-50 rounded-xl"><Shield className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />ข้อมูลการชำระเงินถูกเข้ารหัสด้วย SSL 256-bit ปลอดภัย 100%</div>
      </div>

      <div className="flex justify-between mt-6">
        <Link href="/visa/apply/review" className="px-5 py-3 bg-slate-100 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-200">← ก่อนหน้า</Link>
        <Link href="/visa/apply/success" className="px-8 py-3 bg-primary text-white rounded-xl font-bold text-sm hover:bg-orange-600">ชำระเงิน ฿{total.toLocaleString()} →</Link>
      </div>
    </div>
  );
}
