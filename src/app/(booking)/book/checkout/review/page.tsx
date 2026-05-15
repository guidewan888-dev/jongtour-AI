"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MapPin, Calendar, Users, Shield, ChevronRight } from "lucide-react";
import { getBookingSession, calculateTotal, type BookingSession } from "@/lib/bookingSession";

export default function ReviewPage() {
  const router = useRouter();
  const [session, setSession] = useState<BookingSession | null>(null);

  useEffect(() => {
    const s = getBookingSession();
    if (!s?.tourId || !s.travelers?.length) {
      router.replace("/search");
      return;
    }
    setSession(s);
  }, [router]);

  if (!session) {
    return (
      <div className="bg-white min-h-[60vh] flex items-center justify-center">
        <p className="text-slate-500">กำลังโหลด...</p>
      </div>
    );
  }

  const childTitles = ["เด็กชาย", "เด็กหญิง", "Master", "Miss"];
  const adultCount = session.adults || 1;
  const childWithBedCount = session.childWithBedCount ?? session.children ?? 0;
  const childWithoutBedCount = session.childWithoutBedCount ?? 0;
  const infantCount = session.infantCount ?? 0;
  const insurancePax = adultCount + childWithBedCount + childWithoutBedCount;
  const total = calculateTotal(session);

  return (
    <div className="bg-white">
      {/* Stepper */}
      <div className="bg-slate-50 border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-center gap-2 text-sm">
            {["เลือกทัวร์", "ข้อมูลผู้เดินทาง", "ตรวจสอบ", "ชำระเงิน", "ยืนยัน"].map((s, i) => (
              <React.Fragment key={s}>
                <div className={`flex items-center gap-1.5 ${i === 2 ? "text-primary font-bold" : i < 2 ? "text-emerald-600" : "text-slate-400"}`}>
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === 2 ? "bg-primary text-white" : i < 2 ? "bg-emerald-100 text-emerald-600" : "bg-slate-200 text-slate-500"}`}>{i < 2 ? "✓" : i + 1}</span>
                  <span className="hidden sm:inline">{s}</span>
                </div>
                {i < 4 && <div className={`w-6 h-0.5 ${i < 2 ? "bg-emerald-300" : "bg-slate-200"}`} />}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">ตรวจสอบข้อมูลก่อนชำระเงิน</h1>

        {/* Tour Summary */}
        <div className="g-card p-6">
          <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><MapPin className="w-5 h-5 text-primary" /> ข้อมูลทัวร์</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-slate-500">รหัสทัวร์</span><span className="font-bold text-primary">{session.tourCode}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">โปรแกรม</span><span className="font-medium text-right max-w-[60%] line-clamp-2">{session.tourName}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Wholesale</span><span className="font-medium">{session.supplier}</span></div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> วันเดินทาง</span>
              <span className="font-medium">
                {session.departureDate && !isNaN(new Date(session.departureDate).getTime())
                  ? new Date(session.departureDate).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" })
                  : session.departureDate || 'สอบถาม'}
                {" → "}
                {session.departureEndDate && !isNaN(new Date(session.departureEndDate).getTime())
                  ? new Date(session.departureEndDate).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" })
                  : session.departureEndDate || 'สอบถาม'}
              </span>
            </div>
            <div className="flex justify-between"><span className="text-slate-500">ระยะเวลา</span><span className="font-medium">{session.durationDays} วัน {session.durationNights} คืน</span></div>
          </div>
        </div>

        {/* Traveler Summary */}
        <div className="g-card p-6">
          <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><Users className="w-5 h-5 text-primary" /> ผู้เดินทาง ({session.travelers.length} ท่าน)</h3>
          <div className="space-y-3">
            {session.travelers.map((t, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <div>
                  <div className="font-medium text-slate-900">{t.titleTh} {t.firstNameEn} {t.lastNameEn}</div>
                  <div className="text-xs text-slate-500">
                    {t.passportNumber ? `Passport: ${t.passportNumber}` : "ยังไม่ได้กรอก Passport"}
                    {" • "}
                    {childTitles.includes(t.titleTh) ? "เด็ก" : "ผู้ใหญ่"}
                  </div>
                </div>
                <Link href="/book/checkout/travelers" className="text-xs text-primary font-medium hover:underline">แก้ไข</Link>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Info */}
        <div className="g-card p-6">
          <h3 className="font-bold text-slate-900 mb-4">📞 ข้อมูลผู้ติดต่อ</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-slate-500">อีเมล</span><span className="font-medium">{session.contactEmail}</span></div>
            {session.contactPhone && <div className="flex justify-between"><span className="text-slate-500">เบอร์โทร</span><span className="font-medium">{session.contactPhone}</span></div>}
          </div>
        </div>

        {/* Price Summary */}
        <div className="g-card p-6">
          <h3 className="font-bold text-slate-900 mb-4">🧾 สรุปราคา</h3>
          <div className="space-y-2 text-sm">
            {adultCount > 0 && (
              <div className="flex justify-between">
                <span className="text-slate-500">ผู้ใหญ่ ×{adultCount}</span>
                <span>฿{(adultCount * session.priceAdult).toLocaleString()}</span>
              </div>
            )}
            {childWithBedCount > 0 && (
              <div className="flex justify-between">
                <span className="text-slate-500">เด็กมีเตียง ×{childWithBedCount}</span>
                <span>฿{(childWithBedCount * (session.priceChildWithBed || session.priceChild || session.priceAdult)).toLocaleString()}</span>
              </div>
            )}
            {childWithoutBedCount > 0 && (
              <div className="flex justify-between">
                <span className="text-slate-500">เด็กไม่มีเตียง ×{childWithoutBedCount}</span>
                <span>฿{(childWithoutBedCount * (session.priceChildWithoutBed || session.priceChild || session.priceAdult)).toLocaleString()}</span>
              </div>
            )}
            {infantCount > 0 && (
              <div className="flex justify-between">
                <span className="text-slate-500">ทารก ×{infantCount}</span>
                <span>฿{(infantCount * (session.priceInfant || 0)).toLocaleString()}</span>
              </div>
            )}
            {(session.singleRooms || 0) > 0 && session.priceSingle && (
              <div className="flex justify-between">
                <span className="text-slate-500">พักเดี่ยว ×{session.singleRooms}</span>
                <span>฿{((session.singleRooms || 0) * session.priceSingle).toLocaleString()}</span>
              </div>
            )}
            {session.addOns?.includes('insurance') && (
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">ประกันภัยการเดินทาง ×{insurancePax}</span>
                <span className="text-slate-500">฿{(800 * insurancePax).toLocaleString()}</span>
              </div>
            )}
            {(session.addOns?.includes('airport_transfer') || session.addOns?.includes('airport')) && (
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">รถรับส่งสนามบิน</span>
                <span className="text-slate-500">฿1,500</span>
              </div>
            )}
            <hr className="border-slate-100" />
            <div className="flex justify-between text-lg font-bold">
              <span>ยอดรวมทั้งหมด</span>
              <span className="text-primary">฿{(session.totalPrice || total).toLocaleString()}</span>
            </div>
            {(session.totalDeposit || 0) > 0 && (
              <div className="flex justify-between bg-orange-50 rounded-lg px-3 py-2">
                <span className="text-orange-700 font-medium text-xs">💰 ชำระมัดจำ</span>
                <span className="text-orange-700 font-bold">฿{session.totalDeposit!.toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>

        {/* Terms */}
        <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-2xl border border-blue-100">
          <Shield className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">เงื่อนไขการจอง</p>
            <p className="text-blue-600">กรุณาตรวจสอบข้อมูลให้ถูกต้อง ชื่อ-นามสกุล ต้องตรงกับหนังสือเดินทาง เมื่อชำระเงินแล้วจะไม่สามารถเปลี่ยนชื่อได้</p>
          </div>
        </div>

        <div className="flex justify-between items-center pt-4">
          <Link href="/book/checkout/travelers" className="btn-outline">← แก้ไขข้อมูล</Link>
          <Link href="/book/payment" className="btn-primary">ไปหน้าชำระเงิน →</Link>
        </div>
      </div>
    </div>
  );
}


