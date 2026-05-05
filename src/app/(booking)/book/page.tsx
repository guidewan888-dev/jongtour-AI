"use client";

import React from "react";
import Link from "next/link";
import { Search, Shield, CreditCard, CheckCircle } from "lucide-react";

const steps = [
  { icon: Search, label: "เลือกทัวร์", desc: "ค้นหาและเลือกโปรแกรมที่ใช่" },
  { icon: Shield, label: "กรอกข้อมูล", desc: "ข้อมูลผู้เดินทางและเอกสาร" },
  { icon: CreditCard, label: "ชำระเงิน", desc: "เลือกช่องทางชำระที่สะดวก" },
  { icon: CheckCircle, label: "ยืนยัน", desc: "รับ Voucher และเอกสารทันที" },
];

export default function BookingLandingPage() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-50 to-orange-50 border-b border-primary-100">
        <div className="g-container py-16 text-center">
          <span className="text-5xl mb-4 block">✈️</span>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
            จองทัวร์ง่ายๆ ใน 4 ขั้นตอน
          </h1>
          <p className="text-slate-500 max-w-lg mx-auto">
            ระบบจองอัตโนมัติ ปลอดภัย รวดเร็ว ได้ Voucher ทันที
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="g-container py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {steps.map((step, idx) => (
            <div key={step.label} className="g-card p-6 text-center relative">
              {idx < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-0.5 bg-slate-200 z-10" />
              )}
              <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <step.icon className="w-7 h-7 text-primary" />
              </div>
              <div className="text-xs font-bold text-primary mb-1">ขั้นตอนที่ {idx + 1}</div>
              <h3 className="font-bold text-slate-900 mb-1">{step.label}</h3>
              <p className="text-sm text-slate-500">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="g-container pb-16">
        <div className="g-card p-8 md:p-12 text-center bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl">
          <h2 className="text-2xl font-bold mb-3">พร้อมจองแล้วหรือยัง?</h2>
          <p className="text-slate-300 mb-6 max-w-md mx-auto">
            ค้นหาทัวร์ที่ต้องการ แล้วกดจองได้เลย ระบบจะพาคุณผ่านทุกขั้นตอนอัตโนมัติ
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/search" className="btn-primary">
              ค้นหาทัวร์
            </Link>
            <Link href="/ai-search" className="bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3 rounded-xl transition-colors border border-white/20">
              🤖 ให้ AI ช่วยหา
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
