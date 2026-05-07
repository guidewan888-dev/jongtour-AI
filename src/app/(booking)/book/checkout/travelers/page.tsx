"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Phone, Mail, FileText, Plus, Trash2, AlertCircle } from "lucide-react";
import { getBookingSession, setBookingSession, type BookingTraveler, type BookingSession } from "@/lib/bookingSession";

const emptyTraveler = (): BookingTraveler => ({
  titleTh: "Mr.",
  firstNameTh: "",
  lastNameTh: "",
  firstNameEn: "",
  lastNameEn: "",
  passportNumber: "",
  phone: "",
  email: "",
});

const fmt = (n: number) => n > 0 ? `฿${n.toLocaleString()}` : '-';

export default function TravelersPage() {
  const router = useRouter();
  const [travelers, setTravelers] = useState<BookingTraveler[]>([emptyTraveler()]);
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [session, setSession] = useState<BookingSession | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    const s = getBookingSession();
    if (!s?.tourId) { router.replace("/search"); return; }
    setSession(s);
    if (s.travelers?.length > 0) setTravelers(s.travelers);
    if (s.contactEmail) setContactEmail(s.contactEmail);
    if (s.contactPhone) setContactPhone(s.contactPhone);
  }, [router]);

  const addTraveler = () => setTravelers((prev) => [...prev, emptyTraveler()]);
  const removeTraveler = (idx: number) => setTravelers((prev) => prev.filter((_, i) => i !== idx));
  const updateTraveler = (idx: number, field: keyof BookingTraveler, value: string) => {
    setTravelers((prev) => { const next = [...prev]; next[idx] = { ...next[idx], [field]: value }; return next; });
  };

  const handleNext = () => {
    const errs: string[] = [];
    travelers.forEach((t, i) => {
      if (!t.firstNameEn.trim()) errs.push(`ผู้เดินทางคนที่ ${i + 1}: กรุณากรอกชื่อ (EN)`);
      if (!t.lastNameEn.trim()) errs.push(`ผู้เดินทางคนที่ ${i + 1}: กรุณากรอกนามสกุล (EN)`);
    });
    if (!contactEmail.trim() || !contactEmail.includes("@")) errs.push("กรุณากรอกอีเมลผู้ติดต่อ");
    if (errs.length > 0) { setErrors(errs); window.scrollTo({ top: 0, behavior: "smooth" }); return; }
    setBookingSession({ travelers, contactEmail: contactEmail.trim(), contactPhone: contactPhone.trim() });
    router.push("/book/checkout/review");
  };

  if (!session) return <div className="bg-slate-50 min-h-[60vh] flex items-center justify-center"><p className="text-slate-500">กำลังโหลด...</p></div>;

  const adults = session.adults || 1;
  const children = session.children || 0;
  const singleRooms = session.singleRooms || 0;

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Stepper */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-center gap-2 text-sm">
            {["เลือกทัวร์", "ข้อมูลผู้เดินทาง", "ตรวจสอบ", "ชำระเงิน", "ยืนยัน"].map((s, i) => (
              <React.Fragment key={s}>
                <div className={`flex items-center gap-1.5 ${i === 1 ? "text-primary-600 font-bold" : i < 1 ? "text-emerald-600" : "text-slate-400"}`}>
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === 1 ? "bg-primary-600 text-white" : i < 1 ? "bg-emerald-100 text-emerald-600" : "bg-slate-200 text-slate-500"}`}>{i < 1 ? "✓" : i + 1}</span>
                  <span className="hidden sm:inline">{s}</span>
                </div>
                {i < 4 && <div className={`w-6 h-0.5 ${i < 1 ? "bg-emerald-300" : "bg-slate-200"}`} />}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ─── LEFT: Forms ─── */}
          <div className="lg:col-span-2 space-y-5">
            {/* Tour Info Bar */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 bg-gradient-to-r from-primary-50/50 to-transparent">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-xs text-slate-400 font-bold">{session.tourCode}</div>
                  <div className="text-sm font-bold text-slate-900 line-clamp-1">{session.tourName}</div>
                  <div className="text-xs text-slate-500 mt-0.5">📅 {new Date(session.departureDate).toLocaleDateString("th-TH", { day: "numeric", month: "long", year: "numeric" })}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400">ราคา/ท่าน</div>
                  <div className="text-lg font-bold text-primary-600">{fmt(session.priceAdult)}</div>
                </div>
              </div>
            </div>

            {/* Errors */}
            {errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-1">
                <div className="flex items-center gap-2 text-red-700 font-bold text-sm"><AlertCircle className="w-4 h-4" />กรุณาแก้ไขข้อมูล</div>
                {errors.map((e, i) => <p key={i} className="text-xs text-red-600">• {e}</p>)}
              </div>
            )}

            <div>
              <h1 className="text-2xl font-bold text-slate-900">ข้อมูลผู้เดินทาง</h1>
              <p className="text-slate-500 mt-1">กรอกข้อมูลตามหนังสือเดินทาง (Passport) ภาษาอังกฤษ</p>
            </div>

            {travelers.map((traveler, idx) => (
              <div key={idx} className="bg-white rounded-xl border border-slate-200 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2"><User className="w-5 h-5 text-primary-600" /> ผู้เดินทางคนที่ {idx + 1}</h3>
                  {travelers.length > 1 && <button onClick={() => removeTraveler(idx)} className="text-red-400 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>}
                </div>
                <div className="mb-4 grid grid-cols-4 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-1 block">Title</label>
                    <select value={traveler.titleTh} onChange={e => updateTraveler(idx, "titleTh", e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-200 focus:border-primary-500 outline-none">
                      <option>Mr.</option><option>Mrs.</option><option>Miss</option><option>Master</option><option>Ms.</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-1 block">ชื่อ (EN) *</label>
                    <input type="text" placeholder="First Name" value={traveler.firstNameEn} onChange={e => updateTraveler(idx, "firstNameEn", e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-200 focus:border-primary-500 outline-none" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-1 block">นามสกุล (EN) *</label>
                    <input type="text" placeholder="Last Name" value={traveler.lastNameEn} onChange={e => updateTraveler(idx, "lastNameEn", e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-200 focus:border-primary-500 outline-none" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-1 block flex items-center gap-1"><FileText className="w-3.5 h-3.5" /> Passport No.</label>
                    <input type="text" placeholder="AB1234567" value={traveler.passportNumber || ""} onChange={e => updateTraveler(idx, "passportNumber", e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-200 focus:border-primary-500 outline-none" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-1 block">คำนำหน้า (TH)</label>
                    <select value={({'Mr.':'นาย','Mrs.':'นาง','Miss':'นางสาว','Ms.':'นางสาว','Master':'เด็กชาย'}[traveler.titleTh]) || 'นาย'} onChange={e => { const map: Record<string,string> = {'นาย':'Mr.','นาง':'Mrs.','นางสาว':'Miss','เด็กชาย':'Master','เด็กหญิง':'Miss'}; updateTraveler(idx, "titleTh", map[e.target.value] || 'Mr.'); }} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-200 focus:border-primary-500 outline-none">
                      <option>นาย</option><option>นาง</option><option>นางสาว</option><option>เด็กชาย</option><option>เด็กหญิง</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-1 block">ชื่อ (TH)</label>
                    <input type="text" placeholder="ชื่อภาษาไทย" value={traveler.firstNameTh} onChange={e => updateTraveler(idx, "firstNameTh", e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-200 focus:border-primary-500 outline-none" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-1 block">นามสกุล (TH)</label>
                    <input type="text" placeholder="นามสกุลภาษาไทย" value={traveler.lastNameTh} onChange={e => updateTraveler(idx, "lastNameTh", e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-200 focus:border-primary-500 outline-none" />
                  </div>
                </div>
              </div>
            ))}

            <button onClick={addTraveler} className="w-full border-2 border-dashed border-slate-200 rounded-2xl py-4 text-slate-500 hover:border-primary-500 hover:text-primary-600 transition-colors flex items-center justify-center gap-2 font-medium">
              <Plus className="w-5 h-5" /> เพิ่มผู้เดินทาง
            </button>
            <p className="text-center text-xs text-emerald-600 bg-emerald-50 rounded-lg py-2">💡 สามารถใส่ชื่อผู้เดินทางได้ทีหลัง — กรอกแค่ข้อมูลผู้ติดต่อเพื่อจองก่อนได้เลย</p>

            {/* Contact Info */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-4"><Mail className="w-5 h-5 text-primary-600" /> ข้อมูลผู้ติดต่อ</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> อีเมล *</label>
                  <input type="email" placeholder="email@example.com" value={contactEmail} onChange={e => setContactEmail(e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-200 focus:border-primary-500 outline-none" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> เบอร์โทร</label>
                  <input type="tel" placeholder="08x-xxx-xxxx" value={contactPhone} onChange={e => setContactPhone(e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-200 focus:border-primary-500 outline-none" />
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <Link href={`/book/tour/${session.tourSlug}`} className="px-5 py-2.5 border border-slate-300 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">← ย้อนกลับ</Link>
              <button onClick={handleNext} className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-orange-500 text-white font-bold text-sm shadow-lg hover:shadow-xl transition-all">ตรวจสอบข้อมูล →</button>
            </div>
          </div>

          {/* ─── RIGHT: Price Summary ─── */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-slate-200 p-5 sticky top-20 space-y-3">
              <h3 className="font-bold text-slate-900 text-lg">🧾 สรุปการจอง</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">รหัสทัวร์</span>
                  <span className="font-bold text-primary-600">{session.tourCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">วันเดินทาง</span>
                  <span className="font-medium">{new Date(session.departureDate).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" })}</span>
                </div>
                <hr className="border-slate-100" />
                <div className="flex justify-between">
                  <span className="text-slate-500">ผู้ใหญ่ ×{adults}</span>
                  <span className="font-medium">{fmt(session.priceAdult * adults)}</span>
                </div>
                {children > 0 && <div className="flex justify-between">
                  <span className="text-slate-500">เด็ก ×{children}</span>
                  <span className="font-medium">{fmt((session.priceChild || session.priceAdult) * children)}</span>
                </div>}
                {singleRooms > 0 && session.priceSingle && <div className="flex justify-between">
                  <span className="text-slate-500">พักเดี่ยว ×{singleRooms}</span>
                  <span className="font-medium">{fmt(session.priceSingle * singleRooms)}</span>
                </div>}
                {session.addOns?.includes('insurance') && <div className="flex justify-between text-xs">
                  <span className="text-slate-400">ประกันภัย ×{adults + children}</span>
                  <span className="text-slate-500">{fmt(800 * (adults + children))}</span>
                </div>}
                {session.addOns?.includes('airport') && <div className="flex justify-between text-xs">
                  <span className="text-slate-400">รถรับส่งสนามบิน</span>
                  <span className="text-slate-500">{fmt(1500)}</span>
                </div>}
                <hr className="border-slate-100" />
                <div className="flex justify-between text-base font-bold">
                  <span className="text-slate-800">ราคารวม</span>
                  <span className="text-primary-600">{fmt(session.totalPrice || (session.priceAdult * adults))}</span>
                </div>
                {(session.totalDeposit || 0) > 0 && (
                  <div className="flex justify-between bg-orange-50 rounded-lg px-3 py-2">
                    <span className="text-orange-700 font-medium text-xs">💰 ชำระมัดจำ</span>
                    <span className="text-orange-700 font-bold">{fmt(session.totalDeposit!)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
