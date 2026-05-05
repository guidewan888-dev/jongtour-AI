"use client";

import React from "react";
import Link from "next/link";
import { MapPin, Calendar, Users, Plane, Shield, ChevronRight } from "lucide-react";

export default function ReviewPage() {
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
            <div className="flex justify-between"><span className="text-slate-500">โปรแกรม</span><span className="font-medium">ทัวร์ญี่ปุ่น ไฮไลท์สุดคุ้ม พัก 4 ดาว</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Wholesale</span><span className="font-medium">LETGO</span></div>
            <div className="flex justify-between items-center"><span className="text-slate-500 flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> วันเดินทาง</span><span className="font-medium">15 มิ.ย. 2026</span></div>
            <div className="flex justify-between items-center"><span className="text-slate-500 flex items-center gap-1"><Plane className="w-3.5 h-3.5" /> สายการบิน</span><span className="font-medium">Thai Airways (TG)</span></div>
          </div>
        </div>

        {/* Traveler Summary */}
        <div className="g-card p-6">
          <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><Users className="w-5 h-5 text-primary" /> ผู้เดินทาง</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
              <div>
                <div className="font-medium text-slate-900">นาย JOHN DOE</div>
                <div className="text-xs text-slate-500">Passport: AB1234567 • 08x-xxx-xxxx</div>
              </div>
              <Link href="/book/checkout/travelers" className="text-xs text-primary font-medium hover:underline">แก้ไข</Link>
            </div>
          </div>
        </div>

        {/* Price Summary */}
        <div className="g-card p-6">
          <h3 className="font-bold text-slate-900 mb-4">สรุปราคา</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-slate-500">ผู้ใหญ่ x 1</span><span>฿29,900</span></div>
            <div className="flex justify-between text-emerald-600"><span>ส่วนลด Agent</span><span>-฿0</span></div>
            <hr className="border-slate-100" />
            <div className="flex justify-between text-lg font-bold"><span>ยอดรวมทั้งหมด</span><span className="text-primary">฿29,900</span></div>
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
