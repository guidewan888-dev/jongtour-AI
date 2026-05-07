"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CreditCard, Building, Clock, Shield, Copy, Check, AlertCircle, Loader2 } from "lucide-react";
import { getBookingSession, calculateTotal, clearBookingSession, type BookingSession } from "@/lib/bookingSession";

const paymentMethods = [
  { id: "STRIPE", icon: CreditCard, label: "Stripe Checkout", desc: "บัตรเครดิต/PromptPay ผ่าน Stripe · ปลอดภัย 100%", badge: "แนะนำ", color: "from-blue-500 to-indigo-500" },
  { id: "BANK_TRANSFER", icon: Building, label: "โอนเงินผ่านธนาคาร", desc: "โอนเงินแล้วแนบสลิป ยืนยันภายใน 1 ชม.", color: "from-emerald-500 to-teal-500" },
];

const bankInfo = { bankName: "ธนาคารกสิกรไทย (KBank)", accountNo: "123-4-56789-0", accountName: "บจก. จองทัวร์", branch: "สำนักงานใหญ่" };
const fmt = (n: number) => `฿${n.toLocaleString()}`;

export default function PaymentPage() {
  const router = useRouter();
  const [session, setSession] = useState<BookingSession | null>(null);
  const [payType, setPayType] = useState<"LATER" | "DEPOSIT" | "FULL">("FULL");
  const [method, setMethod] = useState("STRIPE");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");

  useEffect(() => {
    const s = getBookingSession();
    if (!s?.tourId || !s.travelers?.length) { router.replace("/search"); return; }
    setSession(s);
    // Calculate days until departure
    const daysUntil = Math.ceil((new Date(s.departureDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    // Default: deposit if available AND departure > 30 days
    if ((s.totalDeposit || 0) > 0 && daysUntil > 30) setPayType("DEPOSIT");
    else setPayType("FULL");
  }, [router]);

  const totalFull = useMemo(() => {
    if (!session) return 0;
    return session.totalPrice || calculateTotal(session);
  }, [session]);
  const depositAmount = useMemo(() => session?.totalDeposit || 0, [session]);
  const daysUntilDeparture = useMemo(() => {
    if (!session) return 999;
    return Math.ceil((new Date(session.departureDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  }, [session]);
  const canDeposit = depositAmount > 0 && daysUntilDeparture > 30;
  const remainingAfterDeposit = totalFull - depositAmount;

  const amountToPay = useMemo(() => {
    if (payType === "LATER") return 0;
    if (payType === "DEPOSIT" && canDeposit) return depositAmount;
    return totalFull;
  }, [payType, totalFull, depositAmount, canDeposit]);

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
          paymentType: payType,
          amountToPay,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "เกิดข้อผิดพลาดในการสร้างการจอง"); setLoading(false); return; }
      if (method === "STRIPE" && payType !== "LATER" && data.checkoutUrl) {
        clearBookingSession();
        window.location.href = data.checkoutUrl;
      } else {
        clearBookingSession();
        router.push(`/book/confirmation/${data.bookingRef}`);
      }
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาด กรุณาลองใหม่");
      setLoading(false);
    }
  };

  if (!session) return <div className="bg-slate-50 min-h-[60vh] flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary-600" /></div>;

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Stepper */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-center gap-2 text-sm">
            {["เลือกทัวร์", "ข้อมูลผู้เดินทาง", "ตรวจสอบ", "ชำระเงิน", "ยืนยัน"].map((s, i) => (
              <React.Fragment key={s}>
                <div className={`flex items-center gap-1.5 ${i === 3 ? "text-primary-600 font-bold" : i < 3 ? "text-emerald-600" : "text-slate-400"}`}>
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === 3 ? "bg-primary-600 text-white" : i < 3 ? "bg-emerald-100 text-emerald-600" : "bg-slate-200 text-slate-500"}`}>{i < 3 ? "✓" : i + 1}</span>
                  <span className="hidden sm:inline">{s}</span>
                </div>
                {i < 4 && <div className={`w-6 h-0.5 ${i < 3 ? "bg-emerald-300" : "bg-slate-200"}`} />}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">
        {/* Detailed Price Summary */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="text-xs text-slate-400 font-bold">{session.tourCode}</div>
              <div className="text-sm font-bold text-slate-900 line-clamp-1">{session.tourName}</div>
              <div className="text-xs text-slate-400 mt-0.5">📅 {new Date(session.departureDate).toLocaleDateString("th-TH", { day: "numeric", month: "long", year: "numeric" })} · {session.durationDays} วัน {session.durationNights} คืน</div>
            </div>
          </div>
          <hr className="border-slate-100 mb-3" />
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">ผู้ใหญ่ ×{session.adults || 1}</span>
              <span className="font-medium">{fmt((session.adults || 1) * session.priceAdult)}</span>
            </div>
            {(session.children || 0) > 0 && <div className="flex justify-between">
              <span className="text-slate-500">เด็ก ×{session.children}</span>
              <span className="font-medium">{fmt((session.children || 0) * (session.priceChild || session.priceAdult))}</span>
            </div>}
            {(session.singleRooms || 0) > 0 && session.priceSingle && <div className="flex justify-between">
              <span className="text-slate-500">พักเดี่ยว ×{session.singleRooms}</span>
              <span className="font-medium">{fmt((session.singleRooms || 0) * session.priceSingle)}</span>
            </div>}
            {session.addOns?.includes('insurance') && <div className="flex justify-between text-xs">
              <span className="text-slate-400">ประกันภัยการเดินทาง ×{(session.adults || 1) + (session.children || 0)}</span>
              <span className="text-slate-500">{fmt(800 * ((session.adults || 1) + (session.children || 0)))}</span>
            </div>}
            {session.addOns?.includes('airport') && <div className="flex justify-between text-xs">
              <span className="text-slate-400">รถรับส่งสนามบิน</span>
              <span className="text-slate-500">{fmt(1500)}</span>
            </div>}
            <hr className="border-slate-100" />
            <div className="flex justify-between text-lg font-bold">
              <span className="text-slate-800">ยอดรวมทั้งหมด</span>
              <span className="text-primary-600">{fmt(totalFull)}</span>
            </div>
            {depositAmount > 0 && (
              <div className="flex justify-between bg-orange-50 rounded-lg px-3 py-2">
                <span className="text-orange-700 font-medium text-xs">💰 มัดจำ/ท่าน</span>
                <span className="text-orange-700 font-bold">{fmt(depositAmount)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
            <div><p className="text-sm font-bold text-red-700">เกิดข้อผิดพลาด</p><p className="text-xs text-red-600 mt-0.5">{error}</p></div>
          </div>
        )}

        {/* ─── STEP 1: Payment Type ─── */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="font-bold text-slate-900 text-lg mb-4">💰 เลือกประเภทการชำระ</h2>
          <div className="space-y-3">
            {/* Option 1: Book now, pay later */}
            <label className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${payType === "LATER" ? "border-amber-400 bg-amber-50" : "border-slate-200 hover:border-slate-300"}`}>
              <input type="radio" name="payType" checked={payType === "LATER"} onChange={() => setPayType("LATER")} className="w-4 h-4 mt-1 text-amber-500 focus:ring-amber-400" />
              <div className="flex-1">
                <div className="font-semibold text-slate-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-500" /> จองก่อน ชำระทีหลัง
                </div>
                <p className="text-xs text-amber-600 mt-1">⏰ กรุณาชำระเงินภายใน 24 ชั่วโมง มิฉะนั้นระบบจะยกเลิกการจองอัตโนมัติ</p>
              </div>
              <div className="text-right shrink-0">
                <div className="font-bold text-amber-600">฿0</div>
                <div className="text-[10px] text-slate-400">จ่ายทีหลัง</div>
              </div>
            </label>

            {/* Option 2: Deposit — only if > 30 days */}
            {canDeposit && (
              <label className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${payType === "DEPOSIT" ? "border-orange-400 bg-orange-50" : "border-slate-200 hover:border-slate-300"}`}>
                <input type="radio" name="payType" checked={payType === "DEPOSIT"} onChange={() => setPayType("DEPOSIT")} className="w-4 h-4 mt-1 text-orange-500 focus:ring-orange-400" />
                <div className="flex-1">
                  <div className="font-semibold text-slate-900 flex items-center gap-2">
                    💳 ชำระมัดจำ
                    <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-[10px] font-bold rounded-full">ยอดนิยม</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">ชำระมัดจำเพื่อยืนยันที่นั่ง ส่วนที่เหลือชำระก่อนการเดินทาง 30 วัน</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-bold text-orange-600">{fmt(depositAmount)}</div>
                  <div className="text-[10px] text-slate-400">มัดจำ</div>
                </div>
              </label>
            )}
            {/* Deposit not available notice */}
            {depositAmount > 0 && !canDeposit && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>วันเดินทางอยู่ภายใน 30 วัน จำเป็นต้อง<strong>ชำระเต็มจำนวน</strong>เท่านั้น (ไม่สามารถเลือกมัดจำได้)</span>
              </div>
            )}

            {/* Option 3: Full */}
            <label className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${payType === "FULL" ? "border-primary-400 bg-primary-50" : "border-slate-200 hover:border-slate-300"}`}>
              <input type="radio" name="payType" checked={payType === "FULL"} onChange={() => setPayType("FULL")} className="w-4 h-4 mt-1 text-primary-500 focus:ring-primary-400" />
              <div className="flex-1">
                <div className="font-semibold text-slate-900 flex items-center gap-2">
                  ✅ ชำระเต็มจำนวน
                </div>
                <p className="text-xs text-slate-500 mt-1">ชำระครบ ไม่ต้องจ่ายเพิ่ม สบายใจตลอดทริป</p>
              </div>
              <div className="text-right shrink-0">
                <div className="font-bold text-primary-600">{fmt(totalFull)}</div>
                <div className="text-[10px] text-slate-400">เต็มจำนวน</div>
              </div>
            </label>
          </div>

          {/* Deposit explanation */}
          {payType === "DEPOSIT" && canDeposit && (
            <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-xl space-y-2">
              <h4 className="font-bold text-orange-800 text-sm flex items-center gap-2">📋 เงื่อนไขการชำระมัดจำ</h4>
              <ul className="text-xs text-orange-700 space-y-1.5 list-disc list-inside">
                <li>ชำระมัดจำ <strong>{fmt(depositAmount)}</strong> เพื่อยืนยันการจองที่นั่ง</li>
                <li>ส่วนที่เหลือ <strong>{fmt(remainingAfterDeposit)}</strong> ชำระก่อนการเดินทางอย่างน้อย 30 วัน</li>
                <li>หากไม่ชำระส่วนที่เหลือตามกำหนด ระบบจะยกเลิกการจองและสงวนสิทธิ์ไม่คืนมัดจำ</li>
                <li>เมื่อชำระมัดจำแล้ว ทีมงานจะส่งอีเมลยืนยันและรายละเอียดการชำระส่วนที่เหลือ</li>
              </ul>
            </div>
          )}
        </div>

        {/* ─── STEP 2: Payment Method (hide for "pay later") ─── */}
        {payType !== "LATER" && (
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h2 className="font-bold text-slate-900 text-lg mb-4">💳 เลือกช่องทางชำระเงิน</h2>
            <div className="space-y-3">
              {paymentMethods.map(m => (
                <label key={m.id} className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${method === m.id ? "border-primary-400 bg-primary-50 shadow-sm" : "border-slate-200 hover:border-slate-300"}`}>
                  <input type="radio" name="payment" checked={method === m.id} onChange={() => setMethod(m.id)} className="w-4 h-4 text-primary-600 focus:ring-primary-500" />
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

            {/* Detail Panel */}
            <div className="mt-5 bg-slate-50 rounded-xl p-5">
              {method === "STRIPE" && (
                <div className="text-center space-y-3">
                  <h3 className="font-bold text-lg">Stripe Checkout</h3>
                  <p className="text-sm text-slate-500">กดปุ่มด้านล่างเพื่อชำระผ่าน Stripe ที่รองรับบัตรเครดิต/เดบิต และ PromptPay</p>
                  <div className="text-3xl font-black text-primary-600">{fmt(amountToPay)}</div>
                  <div className="flex items-center gap-2 justify-center text-xs text-slate-400">
                    <Shield className="w-4 h-4" /><span>ข้อมูลเข้ารหัส SSL 256-bit · PCI DSS Compliant</span>
                  </div>
                  <div className="flex gap-2 justify-center">
                    {["VISA", "MC", "JCB", "PromptPay"].map(c => <span key={c} className="px-3 py-1 bg-white rounded border text-xs font-bold text-slate-500">{c}</span>)}
                  </div>
                </div>
              )}
              {method === "BANK_TRANSFER" && (
                <div className="space-y-4">
                  <h3 className="font-bold text-lg">🏦 โอนเงินผ่านธนาคาร</h3>
                  <div className="bg-white rounded-xl p-4 space-y-3 border border-slate-200">
                    {Object.entries(bankInfo).map(([key, val]) => (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-sm text-slate-500">{key === "bankName" ? "ธนาคาร" : key === "accountNo" ? "เลขบัญชี" : key === "accountName" ? "ชื่อบัญชี" : "สาขา"}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm">{val}</span>
                          {key === "accountNo" && <button onClick={() => copyText(val, "accountNo")} className="text-primary-600">{copied === "accountNo" ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}</button>}
                        </div>
                      </div>
                    ))}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <span className="text-sm text-slate-500">ยอดโอน</span>
                      <span className="font-black text-lg text-primary-600">{fmt(amountToPay)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Security badges */}
        <div className="flex items-center justify-center gap-4 text-[10px] text-slate-400">
          <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> SSL Encrypted</span>
          <span>·</span><span>PCI DSS Compliant</span>
          <span>·</span><span>Powered by Stripe</span>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-2">
          <Link href="/book/checkout/review" className="px-5 py-2.5 border border-slate-300 rounded-xl text-sm font-medium text-slate-600 hover:bg-white transition-colors w-full sm:w-auto text-center">← ย้อนกลับ</Link>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-primary-600 to-orange-500 text-white font-bold text-base shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> กำลังดำเนินการ...</> :
             payType === "LATER" ? "ยืนยันการจอง (ชำระทีหลัง) →" :
             payType === "DEPOSIT" ? `ชำระมัดจำ ${fmt(amountToPay)} →` :
             `ชำระ ${fmt(amountToPay)} →`}
          </button>
        </div>
      </div>
    </div>
  );
}
