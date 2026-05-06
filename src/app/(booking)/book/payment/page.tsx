"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CreditCard, Building, QrCode, Smartphone, Copy, Check, Clock, Shield, Upload, AlertCircle, Loader2 } from "lucide-react";
import { getBookingSession, calculateTotal, clearBookingSession, type BookingSession } from "@/lib/bookingSession";

const methods = [
  { id: "STRIPE", icon: CreditCard, label: "Stripe Checkout", desc: "บัตรเครดิต/PromptPay ผ่าน Stripe · ปลอดภัย 100%", badge: "แนะนำ", color: "from-blue-500 to-indigo-500" },
  { id: "BANK_TRANSFER", icon: Building, label: "โอนเงินผ่านธนาคาร", desc: "โอนเงินแล้วแนบสลิป ยืนยันภายใน 1 ชม.", color: "from-emerald-500 to-teal-500" },
];

const bankInfo = { bankName: "ธนาคารกสิกรไทย (KBank)", accountNo: "123-4-56789-0", accountName: "บจก. จองทัวร์", branch: "สำนักงานใหญ่" };

export default function PaymentPage() {
  const router = useRouter();
  const [selected, setSelected] = useState("STRIPE");
  const [session, setSession] = useState<BookingSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");
  const [slipUploaded, setSlipUploaded] = useState(false);

  useEffect(() => {
    const s = getBookingSession();
    if (!s?.tourId || !s.travelers?.length) {
      router.replace("/search");
      return;
    }
    setSession(s);
  }, [router]);

  const copyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(""), 2000);
  };

  const handleSubmit = async () => {
    if (!session) return;
    setLoading(true);
    setError("");

    try {
      // Build travelers with Thai name fallbacks
      const travelers = session.travelers.map(t => ({
        titleTh: t.titleTh,
        firstNameTh: t.firstNameTh || t.firstNameEn,
        lastNameTh: t.lastNameTh || t.lastNameEn,
        firstNameEn: t.firstNameEn,
        lastNameEn: t.lastNameEn,
        passportNumber: t.passportNumber || undefined,
        dateOfBirth: t.dateOfBirth || undefined,
      }));

      const res = await fetch("/api/bookings/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tourId: session.tourId,
          departureId: session.departureId,
          travelers,
          contactEmail: session.contactEmail,
          contactPhone: session.contactPhone || undefined,
          specialRequests: session.specialRequests || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "เกิดข้อผิดพลาดในการสร้างการจอง");
        setLoading(false);
        return;
      }

      if (selected === "STRIPE" && data.checkoutUrl) {
        // Redirect to Stripe Checkout
        clearBookingSession();
        window.location.href = data.checkoutUrl;
      } else {
        // Bank transfer — go to confirmation page
        clearBookingSession();
        router.push(`/book/confirmation/${data.bookingRef}`);
      }
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาด กรุณาลองใหม่");
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="bg-white min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  const total = calculateTotal(session);

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

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-bold text-red-700">เกิดข้อผิดพลาด</p>
              <p className="text-xs text-red-600 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* Booking Summary */}
        <div className="g-card p-4 bg-gradient-to-r from-primary/5 to-transparent">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-xs text-slate-400 font-bold">{session.tourCode}</div>
              <div className="text-sm font-bold text-slate-900 line-clamp-1">{session.tourName}</div>
              <div className="text-xs text-slate-400 mt-0.5">
                {session.travelers.length} ท่าน · {new Date(session.departureDate).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" })}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-400">ยอดที่ต้องชำระ</div>
              <div className="text-2xl font-black text-primary">฿{total.toLocaleString()}</div>
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
        <div className="g-card p-6">
          {selected === "STRIPE" && (
            <div className="text-center space-y-4">
              <h3 className="font-bold text-lg">Stripe Checkout</h3>
              <p className="text-sm text-slate-500">กดปุ่มด้านล่างเพื่อชำระผ่าน Stripe ที่รองรับบัตรเครดิต/เดบิต และ PromptPay</p>
              <div className="text-3xl font-black text-primary">฿{total.toLocaleString()}</div>
              <div className="flex items-center gap-2 justify-center text-xs text-slate-400">
                <Shield className="w-4 h-4" />
                <span>ข้อมูลเข้ารหัส SSL 256-bit · PCI DSS Compliant</span>
              </div>
              <div className="flex gap-2 justify-center">
                {["VISA", "MC", "JCB", "PromptPay"].map(c => (
                  <span key={c} className="px-3 py-1 bg-slate-100 rounded text-xs font-bold text-slate-500">{c}</span>
                ))}
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
                  <span className="font-black text-lg text-primary">฿{total.toLocaleString()}</span>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-xs text-amber-800">
                <AlertCircle className="w-4 h-4 inline mr-1" />
                ระบบจะสร้างการจองให้อัตโนมัติ ทีมงานจะตรวจสอบหลังจากคุณโอนเงิน
              </div>
            </div>
          )}
        </div>

        {/* Security badges */}
        <div className="flex items-center justify-center gap-4 text-[10px] text-slate-400">
          <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> SSL Encrypted</span>
          <span>·</span>
          <span>PCI DSS Compliant</span>
          <span>·</span>
          <span>Powered by Stripe</span>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-4">
          <Link href="/book/checkout/review" className="btn-outline w-full sm:w-auto">← ย้อนกลับ</Link>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="btn-primary w-full sm:w-auto text-base px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                กำลังดำเนินการ...
              </>
            ) : selected === "STRIPE" ? (
              `ชำระ ฿${total.toLocaleString()} ผ่าน Stripe →`
            ) : (
              `สร้างการจอง ฿${total.toLocaleString()} →`
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
