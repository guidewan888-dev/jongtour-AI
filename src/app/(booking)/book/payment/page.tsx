"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { CreditCard, Building, QrCode, Smartphone, ChevronRight, Copy, Check, Clock, Shield, Upload, AlertCircle } from "lucide-react";

const methods = [
  { id: "PROMPT_PAY", icon: QrCode, label: "QR PromptPay", desc: "สแกน QR ชำระทันที · ไม่มีค่าธรรมเนียม", badge: "แนะนำ", color: "from-blue-500 to-indigo-500" },
  { id: "BANK_TRANSFER", icon: Building, label: "โอนเงินผ่านธนาคาร", desc: "โอนเงินแล้วแนบสลิป ยืนยันภายใน 1 ชม.", color: "from-emerald-500 to-teal-500" },
  { id: "CREDIT_CARD", icon: CreditCard, label: "บัตรเครดิต / เดบิต", desc: "Visa, Mastercard, JCB · ค่าธรรมเนียม 2.5%", color: "from-purple-500 to-violet-500" },
  { id: "INSTALLMENT", icon: Smartphone, label: "ผ่อนชำระ 0%", desc: "ผ่อน 3-10 เดือน (บัตรเครดิตที่ร่วมรายการ)", color: "from-amber-500 to-orange-500" },
];

const bankInfo = { bankName: "ธนาคารกสิกรไทย (KBank)", accountNo: "123-4-56789-0", accountName: "บจก. จองทัวร์", branch: "สำนักงานใหญ่" };

export default function PaymentPage() {
  const [selected, setSelected] = useState("PROMPT_PAY");
  const [countdown, setCountdown] = useState(900);
  const [copied, setCopied] = useState("");
  const [slipUploaded, setSlipUploaded] = useState(false);

  useEffect(() => {
    if (selected !== "PROMPT_PAY") return;
    const timer = setInterval(() => setCountdown(p => p > 0 ? p - 1 : 0), 1000);
    return () => clearInterval(timer);
  }, [selected]);

  const fmtTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;
  const copyText = (text: string, label: string) => { navigator.clipboard.writeText(text); setCopied(label); setTimeout(() => setCopied(""), 2000); };

  const amount = 29900;
  const booking = { ref: "BK-2569050001", tour: "Tokyo Explorer 5D", pax: 2, date: "15 ก.ค. 2569" };

  return (
    <div className="bg-white min-h-screen">
      {/* Stepper */}
      <div className="bg-slate-50 border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-center gap-2 text-sm">
            {["เลือกทัวร์", "ข้อมูลผู้เดินทาง", "ตรวจสอบ", "ชำระเงิน", "ยืนยัน"].map((s, i) => (
              <React.Fragment key={s}>
                <div className={`flex items-center gap-1.5 ${i === 3 ? "text-primary font-bold" : i < 3 ? "text-emerald-600" : "text-slate-400"}`}>
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === 3 ? "bg-primary text-white" : i < 3 ? "bg-emerald-100 text-emerald-600" : "bg-slate-200 text-slate-500"}`}>{i < 3 ? "✓" : i + 1}</span>
                  <span className="hidden sm:inline">{s}</span>
                </div>
                {i < 4 && <div className={`w-6 h-0.5 ${i < 3 ? "bg-emerald-300" : "bg-slate-200"}`} />}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6 animate-fade-in">
        <h1 className="text-2xl font-bold text-slate-900">💳 เลือกช่องทางชำระเงิน</h1>

        {/* Booking Summary */}
        <div className="g-card p-4 bg-gradient-to-r from-primary/5 to-transparent">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-sm text-slate-600">Booking: <b>{booking.ref}</b></div>
              <div className="text-xs text-slate-400">{booking.tour} · {booking.pax} pax · {booking.date}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-400">ยอดที่ต้องชำระ</div>
              <div className="text-2xl font-black text-primary">฿{amount.toLocaleString()}</div>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="space-y-3">
          {methods.map(m => (
            <label key={m.id}
              className={`g-card p-4 flex items-center gap-4 cursor-pointer transition-all ${selected === m.id ? "ring-2 ring-primary border-primary shadow-md" : "hover:border-slate-300 hover:shadow-sm"}`}>
              <input type="radio" name="payment" checked={selected === m.id} onChange={() => setSelected(m.id)} className="w-4 h-4 text-primary focus:ring-primary" />
              <div className={`w-10 h-10 bg-gradient-to-br ${m.color} rounded-xl flex items-center justify-center shrink-0`}>
                <m.icon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-slate-900 flex items-center gap-2">
                  {m.label}
                  {m.badge && <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full">{m.badge}</span>}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{m.desc}</p>
              </div>
            </label>
          ))}
        </div>

        {/* Payment Detail Panel */}
        <div className="g-card p-6 animate-scale-in">
          {selected === "PROMPT_PAY" && (
            <div className="text-center space-y-4">
              <h3 className="font-bold text-lg">สแกน QR PromptPay</h3>
              <div className="inline-block bg-white p-4 rounded-2xl border-2 border-primary/20 shadow-lg">
                <div className="w-48 h-48 bg-slate-100 rounded-xl flex items-center justify-center text-6xl mx-auto">
                  📱
                </div>
                <div className="text-xs text-slate-400 mt-2">PromptPay QR Code</div>
              </div>
              <div className="text-3xl font-black text-primary">฿{amount.toLocaleString()}</div>
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold ${countdown < 120 ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>
                <Clock className="w-4 h-4" />
                หมดอายุใน {fmtTime(countdown)}
              </div>
              <p className="text-xs text-slate-500">เปิดแอปธนาคาร → สแกน QR → ยืนยันจ่ายเงิน</p>
              <div className="flex items-center gap-2 justify-center">
                <div className="flex gap-1">
                  {["🏦", "🟢", "🔵", "🟡", "🟣"].map((b, i) => (
                    <span key={i} className="text-xl">{b}</span>
                  ))}
                </div>
                <span className="text-[10px] text-slate-400">ทุกธนาคาร</span>
              </div>
            </div>
          )}

          {selected === "BANK_TRANSFER" && (
            <div className="space-y-4">
              <h3 className="font-bold text-lg">🏦 โอนเงินผ่านธนาคาร</h3>
              <div className="bg-emerald-50 rounded-xl p-4 space-y-3">
                {Object.entries(bankInfo).map(([key, val]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">{key === "bankName" ? "ธนาคาร" : key === "accountNo" ? "เลขบัญชี" : key === "accountName" ? "ชื่อบัญชี" : "สาขา"}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm">{val}</span>
                      {key === "accountNo" && (
                        <button onClick={() => copyText(val, "accountNo")} className="text-primary">
                          {copied === "accountNo" ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                <div className="flex items-center justify-between pt-2 border-t border-emerald-200">
                  <span className="text-sm text-slate-500">ยอดโอน</span>
                  <span className="font-black text-lg text-primary">฿{amount.toLocaleString()}</span>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-xs text-amber-800">
                <AlertCircle className="w-4 h-4 inline mr-1" />
                โอนเงินแล้วกรุณาแนบสลิปภายใน 24 ชม. มิฉะนั้นการจองจะถูกยกเลิกอัตโนมัติ
              </div>

              <label className={`g-card p-4 border-2 border-dashed cursor-pointer flex flex-col items-center gap-2 transition-all ${slipUploaded ? "border-emerald-300 bg-emerald-50" : "border-slate-300 hover:border-primary"}`}>
                {slipUploaded ? (
                  <>
                    <Check className="w-8 h-8 text-emerald-500" />
                    <span className="text-sm text-emerald-700 font-bold">อัปโหลดสลิปแล้ว ✓</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-slate-400" />
                    <span className="text-sm text-slate-600">แนบสลิปการโอนเงิน</span>
                    <span className="text-[10px] text-slate-400">JPG, PNG, PDF (ไม่เกิน 5MB)</span>
                  </>
                )}
                <input type="file" accept="image/*,.pdf" className="hidden" onChange={() => setSlipUploaded(true)} />
              </label>
            </div>
          )}

          {selected === "CREDIT_CARD" && (
            <div className="space-y-4">
              <h3 className="font-bold text-lg">💳 บัตรเครดิต / เดบิต</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-slate-500 block mb-1">หมายเลขบัตร</label>
                  <input className="g-input font-mono" placeholder="1234 5678 9012 3456" maxLength={19} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-500 block mb-1">วันหมดอายุ</label>
                    <input className="g-input font-mono" placeholder="MM/YY" maxLength={5} />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 block mb-1">CVV</label>
                    <input className="g-input font-mono" placeholder="•••" maxLength={4} type="password" />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-slate-500 block mb-1">ชื่อบนบัตร</label>
                  <input className="g-input" placeholder="JOHN DOE" />
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Shield className="w-4 h-4" />
                <span>ข้อมูลบัตรเข้ารหัส SSL 256-bit · ผ่าน Omise Payment Gateway</span>
              </div>
              <div className="flex gap-2">
                {["VISA", "MC", "JCB"].map(c => (
                  <span key={c} className="px-3 py-1 bg-slate-100 rounded text-xs font-bold text-slate-500">{c}</span>
                ))}
              </div>
            </div>
          )}

          {selected === "INSTALLMENT" && (
            <div className="space-y-4">
              <h3 className="font-bold text-lg">📱 ผ่อนชำระ 0%</h3>
              <div className="space-y-2">
                {[3, 6, 10].map(m => (
                  <label key={m} className="g-card p-3 flex items-center gap-3 cursor-pointer hover:bg-slate-50 transition-colors">
                    <input type="radio" name="installment" className="w-4 h-4 text-primary" defaultChecked={m === 3} />
                    <div className="flex-1">
                      <span className="font-bold text-sm">{m} เดือน</span>
                      <span className="text-xs text-slate-400 ml-2">ดอกเบี้ย 0%</span>
                    </div>
                    <span className="font-bold text-primary">฿{Math.ceil(amount / m).toLocaleString()}/เดือน</span>
                  </label>
                ))}
              </div>
              <div className="text-xs text-slate-400">บัตรเครดิตที่ร่วมรายการ: KBank, SCB, BBL, Krungsri, KTC</div>
            </div>
          )}
        </div>

        {/* Security badges */}
        <div className="flex items-center justify-center gap-4 text-[10px] text-slate-400">
          <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> SSL Encrypted</span>
          <span>·</span>
          <span>PCI DSS Compliant</span>
          <span>·</span>
          <span>Powered by Omise</span>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-4">
          <Link href="/book/checkout/review" className="btn-outline w-full sm:w-auto">← ย้อนกลับ</Link>
          <button className="btn-primary w-full sm:w-auto text-base px-8 py-3">
            {selected === "PROMPT_PAY" ? "ฉันสแกนแล้ว ✓" :
             selected === "BANK_TRANSFER" ? (slipUploaded ? "ส่งสลิป ✓" : "แนบสลิปก่อน") :
             `ชำระ ฿${amount.toLocaleString()} →`}
          </button>
        </div>
      </div>
    </div>
  );
}
