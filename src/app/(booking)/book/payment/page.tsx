"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, Building, Check, Clock, Copy, CreditCard, Loader2, Shield } from "lucide-react";
import { calculateTotal, clearBookingSession, getBookingSession, type BookingSession } from "@/lib/bookingSession";

const DEFAULT_LINE_URL = "https://line.me/R/ti/p/@jongtour";

const paymentMethods = [
  {
    id: "STRIPE",
    icon: CreditCard,
    label: "Stripe Checkout",
    desc: "Pay by card or PromptPay via Stripe",
    badge: "Recommended",
    color: "from-blue-500 to-indigo-500",
  },
  {
    id: "BANK_TRANSFER",
    icon: Building,
    label: "Bank Transfer",
    desc: "Transfer and upload payment slip",
    badge: "",
    color: "from-emerald-500 to-teal-500",
  },
] as const;

const bankInfo = {
  bankName: "Kasikorn Bank (KBank)",
  accountNo: "123-4-56789-0",
  accountName: "JongTour Co., Ltd.",
  branch: "Head Office",
};

const fmt = (n: number) => `฿${Math.max(0, Number(n || 0)).toLocaleString()}`;

export default function PaymentPage() {
  const router = useRouter();
  const [session, setSession] = useState<BookingSession | null>(null);
  const [payType, setPayType] = useState<"LATER" | "DEPOSIT" | "FULL">("FULL");
  const [method, setMethod] = useState<(typeof paymentMethods)[number]["id"]>("STRIPE");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");

  const bookingMode = session?.bookingMode || "ONLINE";
  const isContactStaffMode = bookingMode === "CONTACT_STAFF";
  const isPayLaterOnlyMode = bookingMode === "PAY_LATER_ONLY";
  const isAssistedMode = isContactStaffMode || isPayLaterOnlyMode;
  const lineContactUrl = session?.lineContactUrl || DEFAULT_LINE_URL;

  useEffect(() => {
    const s = getBookingSession();
    if (!s?.tourId || !s.travelers?.length) {
      router.replace("/search");
      return;
    }
    setSession(s);

    if (s.bookingMode === "CONTACT_STAFF" || s.bookingMode === "PAY_LATER_ONLY") {
      setPayType("LATER");
      return;
    }

    const daysUntil = Math.ceil((new Date(s.departureDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if ((s.totalDeposit || 0) > 0 && daysUntil > 30) {
      setPayType("DEPOSIT");
    } else {
      setPayType("FULL");
    }
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
  const remainingAfterDeposit = Math.max(totalFull - depositAmount, 0);

  const adultCount = session?.adults || 1;
  const childWithBedCount = session?.childWithBedCount ?? session?.children ?? 0;
  const childWithoutBedCount = session?.childWithoutBedCount ?? 0;
  const infantCount = session?.infantCount ?? 0;
  const insurancePax = adultCount + childWithBedCount + childWithoutBedCount;

  const amountToPay = useMemo(() => {
    if (payType === "LATER") return 0;
    if (payType === "DEPOSIT" && canDeposit) return depositAmount;
    return totalFull;
  }, [payType, totalFull, depositAmount, canDeposit]);

  const copyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(""), 1500);
  };

  const openLineContact = (activeSession: BookingSession, reason?: string) => {
    const lines = [
      "Booking request via staff",
      `Tour: ${activeSession.tourCode} ${activeSession.tourName}`,
      `Departure: ${new Date(activeSession.departureDate).toLocaleDateString("th-TH")}`,
      `Pax: Adult ${activeSession.adults || 1}, Child bed ${activeSession.childWithBedCount ?? activeSession.children ?? 0}, Child no bed ${activeSession.childWithoutBedCount ?? 0}, Infant ${activeSession.infantCount ?? 0}`,
      reason ? `Note: ${reason}` : "",
    ].filter(Boolean);

    const text = encodeURIComponent(lines.join("\n"));
    const joiner = lineContactUrl.includes("?") ? "&" : "?";
    window.open(`${lineContactUrl}${joiner}text=${text}`, "_blank", "noopener,noreferrer");
  };

  const handleSubmit = async () => {
    if (!session) return;

    setLoading(true);
    setError("");

    try {
      if (isContactStaffMode) {
        openLineContact(session, session.bookingHint || "Need staff confirmation");
        setLoading(false);
        return;
      }

      const travelers = session.travelers.map((t) => ({
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
          wholesaleId: session.wholesaleId,
          departureId: session.departureId,
          selectedDate: session.departureDate,
          travelDate: session.departureDate,
          travelers,
          contactEmail: session.contactEmail,
          contactPhone: session.contactPhone || undefined,
          specialRequests: session.specialRequests || undefined,
          paymentType: payType,
          amountToPay,
          adultCount: session.adults || 1,
          childWithBedCount: session.childWithBedCount ?? session.children ?? 0,
          childWithoutBedCount: session.childWithoutBedCount ?? 0,
          infantCount: session.infantCount ?? 0,
          singleRoomCount: session.singleRooms ?? 0,
          wantsSingleRoom: (session.singleRooms ?? 0) > 0,
          pdfUrl: session.pdfUrl || undefined,
          pricingMeta: {
            adultCount: session.adults || 1,
            childWithBedCount: session.childWithBedCount ?? session.children ?? 0,
            childWithoutBedCount: session.childWithoutBedCount ?? 0,
            infantCount: session.infantCount ?? 0,
            singleRoomCount: session.singleRooms ?? 0,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        const backendError = String(data?.error || "");
        if (backendError.toLowerCase().includes("line") || backendError.includes("เจ้าหน้าที่")) {
          openLineContact(session, backendError);
        }
        setError(data.error || "Cannot create booking");
        setLoading(false);
        return;
      }

      if (method === "STRIPE" && payType !== "LATER" && data.checkoutUrl) {
        clearBookingSession();
        window.location.href = data.checkoutUrl;
      } else {
        clearBookingSession();
        router.push(`/book/confirmation/${data.bookingRef}`);
      }
    } catch (err: any) {
      setError(err?.message || "Unexpected error");
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="bg-slate-50 min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="text-sm text-slate-600 font-medium">Checkout: Payment</div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="text-xs text-slate-400 font-bold">{session.tourCode}</div>
          <div className="text-sm font-bold text-slate-900 line-clamp-1">{session.tourName}</div>
          <div className="text-xs text-slate-400 mt-0.5">
            {new Date(session.departureDate).toLocaleDateString("th-TH", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}{" "}
            | {session.durationDays} days {session.durationNights} nights
          </div>

          <hr className="border-slate-100 my-3" />

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Adult x{adultCount}</span>
              <span className="font-medium">{fmt(adultCount * session.priceAdult)}</span>
            </div>
            {childWithBedCount > 0 && (
              <div className="flex justify-between">
                <span className="text-slate-500">Child with bed x{childWithBedCount}</span>
                <span className="font-medium">{fmt(childWithBedCount * (session.priceChildWithBed || session.priceChild || session.priceAdult))}</span>
              </div>
            )}
            {childWithoutBedCount > 0 && (
              <div className="flex justify-between">
                <span className="text-slate-500">Child no bed x{childWithoutBedCount}</span>
                <span className="font-medium">{fmt(childWithoutBedCount * (session.priceChildWithoutBed || session.priceChild || session.priceAdult))}</span>
              </div>
            )}
            {infantCount > 0 && (
              <div className="flex justify-between">
                <span className="text-slate-500">Infant x{infantCount}</span>
                <span className="font-medium">{fmt(infantCount * (session.priceInfant || 0))}</span>
              </div>
            )}
            {(session.singleRooms || 0) > 0 && session.priceSingle && (
              <div className="flex justify-between">
                <span className="text-slate-500">Single room x{session.singleRooms}</span>
                <span className="font-medium">{fmt((session.singleRooms || 0) * session.priceSingle)}</span>
              </div>
            )}
            {session.addOns?.includes("insurance") && (
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Insurance x{insurancePax}</span>
                <span className="text-slate-500">{fmt(800 * insurancePax)}</span>
              </div>
            )}
            {(session.addOns?.includes("airport_transfer") || session.addOns?.includes("airport")) && (
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Airport transfer</span>
                <span className="text-slate-500">{fmt(1500)}</span>
              </div>
            )}
            <hr className="border-slate-100" />
            <div className="flex justify-between text-lg font-bold">
              <span className="text-slate-800">Total</span>
              <span className="text-primary-600">{fmt(totalFull)}</span>
            </div>
            {depositAmount > 0 && (
              <div className="flex justify-between bg-orange-50 rounded-lg px-3 py-2">
                <span className="text-orange-700 font-medium text-xs">Deposit reference</span>
                <span className="text-orange-700 font-bold">{fmt(depositAmount)}</span>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-bold text-red-700">Booking error</p>
              <p className="text-xs text-red-600 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {isPayLaterOnlyMode && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700">
            {session.bookingHint || "Some data is incomplete. Booking is still available with pay-later mode."}
          </div>
        )}

        {isContactStaffMode && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-sm text-emerald-700">
            {session.bookingHint || "This departure requires staff confirmation. Continue via LINE."}
          </div>
        )}

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="font-bold text-slate-900 text-lg mb-4">Select payment type</h2>
          <div className="space-y-3">
            <label className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${payType === "LATER" ? "border-amber-400 bg-amber-50" : "border-slate-200 hover:border-slate-300"}`}>
              <input type="radio" name="payType" checked={payType === "LATER"} onChange={() => setPayType("LATER")} className="w-4 h-4 mt-1 text-amber-500 focus:ring-amber-400" />
              <div className="flex-1">
                <div className="font-semibold text-slate-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-500" /> Book now, pay later
                </div>
                <p className="text-xs text-amber-600 mt-1">We will confirm payment in the next step.</p>
              </div>
              <div className="text-right shrink-0">
                <div className="font-bold text-amber-600">฿0</div>
                <div className="text-[10px] text-slate-400">Later</div>
              </div>
            </label>

            {canDeposit && !isAssistedMode && (
              <label className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${payType === "DEPOSIT" ? "border-orange-400 bg-orange-50" : "border-slate-200 hover:border-slate-300"}`}>
                <input type="radio" name="payType" checked={payType === "DEPOSIT"} onChange={() => setPayType("DEPOSIT")} className="w-4 h-4 mt-1 text-orange-500 focus:ring-orange-400" />
                <div className="flex-1">
                  <div className="font-semibold text-slate-900">Deposit</div>
                  <p className="text-xs text-slate-500 mt-1">Pay deposit now and settle the rest later.</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-bold text-orange-600">{fmt(depositAmount)}</div>
                  <div className="text-[10px] text-slate-400">Deposit</div>
                </div>
              </label>
            )}

            {!isAssistedMode && (
              <label className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${payType === "FULL" ? "border-primary-400 bg-primary-50" : "border-slate-200 hover:border-slate-300"}`}>
                <input type="radio" name="payType" checked={payType === "FULL"} onChange={() => setPayType("FULL")} className="w-4 h-4 mt-1 text-primary-500 focus:ring-primary-400" />
                <div className="flex-1">
                  <div className="font-semibold text-slate-900">Full payment</div>
                  <p className="text-xs text-slate-500 mt-1">Pay all now.</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-bold text-primary-600">{fmt(totalFull)}</div>
                  <div className="text-[10px] text-slate-400">Full</div>
                </div>
              </label>
            )}
          </div>

          {payType === "DEPOSIT" && canDeposit && (
            <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-xl text-xs text-orange-700">
              Remaining after deposit: <strong>{fmt(remainingAfterDeposit)}</strong>
            </div>
          )}
        </div>

        {payType !== "LATER" && !isContactStaffMode && (
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h2 className="font-bold text-slate-900 text-lg mb-4">Select payment method</h2>
            <div className="space-y-3">
              {paymentMethods.map((m) => (
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

            {method === "BANK_TRANSFER" && (
              <div className="mt-5 bg-slate-50 rounded-xl p-5">
                <div className="bg-white rounded-xl p-4 space-y-3 border border-slate-200">
                  {Object.entries(bankInfo).map(([key, val]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-sm text-slate-500">{key}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm">{val}</span>
                        {key === "accountNo" && (
                          <button onClick={() => copyText(val, "accountNo")} className="text-primary-600" type="button">
                            {copied === "accountNo" ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <span className="text-sm text-slate-500">Amount</span>
                    <span className="font-black text-lg text-primary-600">{fmt(amountToPay)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-center gap-4 text-[10px] text-slate-400">
          <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> SSL Encrypted</span>
          <span>|</span><span>PCI DSS Compliant</span>
          <span>|</span><span>Powered by Stripe</span>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-2">
          <Link href="/book/checkout/review" className="px-5 py-2.5 border border-slate-300 rounded-xl text-sm font-medium text-slate-600 hover:bg-white transition-colors w-full sm:w-auto text-center">
            Back
          </Link>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-primary-600 to-orange-500 text-white font-bold text-base shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Processing...
              </>
            ) : isContactStaffMode ? (
              "Contact Staff via LINE ->"
            ) : payType === "LATER" ? (
              "Confirm Booking (Pay Later) ->"
            ) : payType === "DEPOSIT" ? (
              `Pay Deposit ${fmt(amountToPay)} ->`
            ) : (
              `Pay ${fmt(amountToPay)} ->`
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
