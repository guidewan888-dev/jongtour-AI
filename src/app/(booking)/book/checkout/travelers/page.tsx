"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Phone, Mail, FileText, Plus, Trash2, AlertCircle } from "lucide-react";
import { getBookingSession, setBookingSession, type BookingTraveler } from "@/lib/bookingSession";

const emptyTraveler = (): BookingTraveler => ({
  titleTh: "นาย",
  firstNameTh: "",
  lastNameTh: "",
  firstNameEn: "",
  lastNameEn: "",
  passportNumber: "",
  phone: "",
  email: "",
});

export default function TravelersPage() {
  const router = useRouter();
  const [travelers, setTravelers] = useState<BookingTraveler[]>([emptyTraveler()]);
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [tourInfo, setTourInfo] = useState<{ tourCode: string; tourName: string; departureDate: string; priceAdult: number } | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    const session = getBookingSession();
    if (!session?.tourId) {
      router.replace("/search");
      return;
    }
    setTourInfo({
      tourCode: session.tourCode,
      tourName: session.tourName,
      departureDate: session.departureDate,
      priceAdult: session.priceAdult,
    });
    // Restore travelers if returning from review
    if (session.travelers?.length > 0) {
      setTravelers(session.travelers);
    }
    if (session.contactEmail) setContactEmail(session.contactEmail);
    if (session.contactPhone) setContactPhone(session.contactPhone);
  }, [router]);

  const addTraveler = () => setTravelers((prev) => [...prev, emptyTraveler()]);
  const removeTraveler = (idx: number) => setTravelers((prev) => prev.filter((_, i) => i !== idx));

  const updateTraveler = (idx: number, field: keyof BookingTraveler, value: string) => {
    setTravelers((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  };

  const handleNext = () => {
    const errs: string[] = [];

    // Validate travelers
    travelers.forEach((t, i) => {
      if (!t.firstNameEn.trim()) errs.push(`ผู้เดินทางคนที่ ${i + 1}: กรุณากรอกชื่อ (EN)`);
      if (!t.lastNameEn.trim()) errs.push(`ผู้เดินทางคนที่ ${i + 1}: กรุณากรอกนามสกุล (EN)`);
    });

    // Validate contact
    if (!contactEmail.trim() || !contactEmail.includes("@")) errs.push("กรุณากรอกอีเมลผู้ติดต่อ");

    if (errs.length > 0) {
      setErrors(errs);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // Save to session
    setBookingSession({
      travelers,
      contactEmail: contactEmail.trim(),
      contactPhone: contactPhone.trim(),
    });

    router.push("/book/checkout/review");
  };

  if (!tourInfo) {
    return (
      <div className="bg-white min-h-[60vh] flex items-center justify-center">
        <p className="text-slate-500">กำลังโหลด...</p>
      </div>
    );
  }

  return (
    <div className="bg-white">
      {/* Stepper */}
      <div className="bg-slate-50 border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-center gap-2 text-sm">
            {["เลือกทัวร์", "ข้อมูลผู้เดินทาง", "ตรวจสอบ", "ชำระเงิน", "ยืนยัน"].map((s, i) => (
              <React.Fragment key={s}>
                <div className={`flex items-center gap-1.5 ${i === 1 ? "text-primary font-bold" : i < 1 ? "text-emerald-600" : "text-slate-400"}`}>
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === 1 ? "bg-primary text-white" : i < 1 ? "bg-emerald-100 text-emerald-600" : "bg-slate-200 text-slate-500"}`}>{i < 1 ? "✓" : i + 1}</span>
                  <span className="hidden sm:inline">{s}</span>
                </div>
                {i < 4 && <div className={`w-6 h-0.5 ${i < 1 ? "bg-emerald-300" : "bg-slate-200"}`} />}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Tour Info Bar */}
        <div className="g-card p-4 bg-gradient-to-r from-primary/5 to-transparent">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-xs text-slate-400 font-bold">{tourInfo.tourCode}</div>
              <div className="text-sm font-bold text-slate-900 line-clamp-1">{tourInfo.tourName}</div>
              <div className="text-xs text-slate-500 mt-0.5">📅 {new Date(tourInfo.departureDate).toLocaleDateString("th-TH", { day: "numeric", month: "long", year: "numeric" })}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-400">ราคา/ท่าน</div>
              <div className="text-lg font-bold text-primary">฿{tourInfo.priceAdult.toLocaleString()}</div>
            </div>
          </div>
        </div>

        {/* Errors */}
        {errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-1">
            <div className="flex items-center gap-2 text-red-700 font-bold text-sm">
              <AlertCircle className="w-4 h-4" />กรุณาแก้ไขข้อมูล
            </div>
            {errors.map((e, i) => (
              <p key={i} className="text-xs text-red-600">• {e}</p>
            ))}
          </div>
        )}

        <div>
          <h1 className="text-2xl font-bold text-slate-900">ข้อมูลผู้เดินทาง</h1>
          <p className="text-slate-500 mt-1">กรอกข้อมูลตามหนังสือเดินทาง (Passport) ภาษาอังกฤษ</p>
        </div>

        {travelers.map((traveler, idx) => (
          <div key={idx} className="g-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                ผู้เดินทางคนที่ {idx + 1}
              </h3>
              {travelers.length > 1 && (
                <button onClick={() => removeTraveler(idx)} className="text-red-400 hover:text-red-600 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">คำนำหน้า</label>
                <select
                  value={traveler.titleTh}
                  onChange={(e) => updateTraveler(idx, "titleTh", e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                >
                  <option>นาย</option><option>นาง</option><option>นางสาว</option><option>เด็กชาย</option><option>เด็กหญิง</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">ชื่อ (EN) *</label>
                <input
                  type="text" placeholder="First Name"
                  value={traveler.firstNameEn}
                  onChange={(e) => updateTraveler(idx, "firstNameEn", e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">นามสกุล (EN) *</label>
                <input
                  type="text" placeholder="Last Name"
                  value={traveler.lastNameEn}
                  onChange={(e) => updateTraveler(idx, "lastNameEn", e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">ชื่อ (TH)</label>
                <input
                  type="text" placeholder="ชื่อภาษาไทย"
                  value={traveler.firstNameTh}
                  onChange={(e) => updateTraveler(idx, "firstNameTh", e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">นามสกุล (TH)</label>
                <input
                  type="text" placeholder="นามสกุลภาษาไทย"
                  value={traveler.lastNameTh}
                  onChange={(e) => updateTraveler(idx, "lastNameTh", e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block flex items-center gap-1"><FileText className="w-3.5 h-3.5" /> Passport No.</label>
                <input
                  type="text" placeholder="AB1234567"
                  value={traveler.passportNumber || ""}
                  onChange={(e) => updateTraveler(idx, "passportNumber", e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                />
              </div>
            </div>
          </div>
        ))}

        <button onClick={addTraveler} className="w-full border-2 border-dashed border-slate-200 rounded-2xl py-4 text-slate-500 hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2 font-medium">
          <Plus className="w-5 h-5" /> เพิ่มผู้เดินทาง
        </button>

        {/* Contact Info */}
        <div className="g-card p-6">
          <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-4">
            <Mail className="w-5 h-5 text-primary" /> ข้อมูลผู้ติดต่อ
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> อีเมล *</label>
              <input
                type="email" placeholder="email@example.com"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> เบอร์โทร</label>
              <input
                type="tel" placeholder="08x-xxx-xxxx"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center pt-4">
          <Link href={`/book/tour/${tourInfo.tourCode}`} className="btn-outline">← ย้อนกลับ</Link>
          <button onClick={handleNext} className="btn-primary">ตรวจสอบข้อมูล →</button>
        </div>
      </div>
    </div>
  );
}
