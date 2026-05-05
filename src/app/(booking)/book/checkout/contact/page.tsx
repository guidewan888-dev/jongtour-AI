"use client";

import React from "react";
import { User, Phone, Mail, MessageCircle, Shield } from "lucide-react";

export default function CheckoutContactPage() {
  return (
    <div className="bg-white">
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Stepper */}
        <div className="flex items-center gap-2 text-sm">
          {["รายละเอียด", "ผู้เดินทาง", "ผู้ติดต่อ", "ตรวจสอบ", "ชำระเงิน"].map((s, i) => (
            <React.Fragment key={s}>
              <div className={`flex items-center gap-1.5 ${i === 2 ? "text-primary font-bold" : i < 2 ? "text-emerald-600" : "text-slate-400"}`}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === 2 ? "bg-primary text-white" : i < 2 ? "bg-emerald-100 text-emerald-600" : "bg-slate-100"}`}>{i < 2 ? "✓" : i + 1}</span>
                <span className="hidden sm:inline">{s}</span>
              </div>
              {i < 4 && <div className={`flex-1 h-0.5 ${i < 2 ? "bg-emerald-300" : "bg-slate-200"}`} />}
            </React.Fragment>
          ))}
        </div>

        <h1 className="text-2xl font-bold text-slate-900">ข้อมูลผู้ติดต่อ</h1>

        {/* Main Contact */}
        <div className="g-card p-6 space-y-4">
          <h3 className="font-bold text-slate-900 flex items-center gap-2"><User className="w-5 h-5 text-primary" /> ผู้ติดต่อหลัก</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="text-sm font-medium text-slate-700 mb-1 block">ชื่อ-นามสกุล</label><input className="g-input" placeholder="ชื่อ นามสกุล" /></div>
            <div><label className="text-sm font-medium text-slate-700 mb-1 block flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> เบอร์โทร</label><input className="g-input" placeholder="+66 8x-xxx-xxxx" /></div>
            <div><label className="text-sm font-medium text-slate-700 mb-1 block flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> อีเมล</label><input type="email" className="g-input" placeholder="email@example.com" /></div>
            <div><label className="text-sm font-medium text-slate-700 mb-1 block flex items-center gap-1"><MessageCircle className="w-3.5 h-3.5" /> LINE ID (ไม่บังคับ)</label><input className="g-input" placeholder="@line_id" /></div>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="g-card p-6 space-y-4">
          <h3 className="font-bold text-slate-900 flex items-center gap-2"><Shield className="w-5 h-5 text-red-500" /> ผู้ติดต่อฉุกเฉิน</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><label className="text-sm font-medium text-slate-700 mb-1 block">ชื่อ-นามสกุล</label><input className="g-input" placeholder="ชื่อ นามสกุล" /></div>
            <div><label className="text-sm font-medium text-slate-700 mb-1 block">เบอร์โทร</label><input className="g-input" placeholder="08x-xxx-xxxx" /></div>
            <div><label className="text-sm font-medium text-slate-700 mb-1 block">ความสัมพันธ์</label><select className="g-input"><option>ครอบครัว</option><option>เพื่อน</option><option>คู่สมรส</option><option>อื่นๆ</option></select></div>
          </div>
        </div>

        {/* Consents */}
        <div className="space-y-3">
          <label className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer">
            <input type="checkbox" required className="mt-1 w-4 h-4 accent-primary" />
            <span className="text-sm text-slate-700">ข้าพเจ้ายอมรับ <a href="/pdpa" className="text-primary underline">นโยบาย PDPA</a> และยินยอมให้จัดเก็บข้อมูลเพื่อดำเนินการจอง <span className="text-red-500">*</span></span>
          </label>
          <label className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer">
            <input type="checkbox" className="mt-1 w-4 h-4 accent-primary" />
            <span className="text-sm text-slate-700">ต้องการรับข่าวโปรโมชั่นและทัวร์แนะนำผ่านอีเมล</span>
          </label>
        </div>

        <div className="flex justify-between pt-4">
          <a href="/book/checkout/travelers" className="btn-outline">← ย้อนกลับ</a>
          <a href="/book/checkout/review" className="btn-primary">ตรวจสอบข้อมูล →</a>
        </div>
      </div>
    </div>
  );
}
