"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, CreditCard, Building2, QrCode, ShieldCheck, Clock, CheckCircle2 } from "lucide-react";

const paymentMethods = [
  {
    icon: <Building2 className="w-7 h-7" />,
    title: "โอนเงินผ่านธนาคาร",
    description: "โอนเงินผ่านบัญชีธนาคารของบริษัทโดยตรง รองรับทุกธนาคารชั้นนำ",
    banks: ["กสิกรไทย", "กรุงเทพ", "ไทยพาณิชย์", "กรุงไทย"],
    color: "#3b82f6",
  },
  {
    icon: <QrCode className="w-7 h-7" />,
    title: "PromptPay / QR Code",
    description: "สแกน QR Code ชำระเงินผ่าน Mobile Banking ได้ทุกธนาคาร ง่าย สะดวก รวดเร็ว",
    banks: ["พร้อมเพย์", "Mobile Banking"],
    color: "#8b5cf6",
  },
  {
    icon: <CreditCard className="w-7 h-7" />,
    title: "บัตรเครดิต / เดบิต",
    description: "รองรับบัตร Visa, Mastercard, JCB ผ่านระบบ Payment Gateway ที่ได้มาตรฐาน PCI-DSS",
    banks: ["Visa", "Mastercard", "JCB"],
    color: "#f97316",
  },
];

const steps = [
  {
    step: 1,
    title: "ค้นหาและเลือกทัวร์",
    description: "ใช้ AI Search หรือเลือกจากรายการทัวร์ที่ต้องการ เปรียบเทียบราคาและรายละเอียด",
    icon: "🔍",
  },
  {
    step: 2,
    title: "กรอกข้อมูลผู้เดินทาง",
    description: "กรอกข้อมูลผู้เดินทาง ชื่อ-นามสกุล ตามหนังสือเดินทาง พร้อมแนบเอกสาร",
    icon: "📝",
  },
  {
    step: 3,
    title: "ชำระมัดจำ",
    description: "ชำระเงินมัดจำ 50% ของราคาทัวร์ เพื่อยืนยันการจอง ภายใน 24 ชั่วโมง",
    icon: "💰",
  },
  {
    step: 4,
    title: "รับการยืนยัน",
    description: "ทีมงานตรวจสอบและยืนยันการจองภายใน 1-2 ชั่วโมง พร้อมส่ง E-Voucher",
    icon: "✅",
  },
  {
    step: 5,
    title: "ชำระส่วนที่เหลือ",
    description: "ชำระเงินส่วนที่เหลืออีก 50% ก่อนวันเดินทาง 15-20 วัน ตามเงื่อนไขแต่ละโปรแกรม",
    icon: "🏦",
  },
  {
    step: 6,
    title: "รับเอกสารเดินทาง",
    description: "รับ E-Voucher, ตั๋วเครื่องบิน และเอกสารการเดินทางทั้งหมดก่อนวันเดินทาง 3-5 วัน",
    icon: "✈️",
  },
];

const policies = [
  { icon: <ShieldCheck className="w-5 h-5 text-green-600" />, text: "ทุกการชำระเงินผ่านช่องทางที่ได้รับการรับรอง" },
  { icon: <Clock className="w-5 h-5 text-blue-600" />, text: "ยืนยันการจองภายใน 1-2 ชั่วโมงทำการ" },
  { icon: <CheckCircle2 className="w-5 h-5 text-orange-600" />, text: "รับใบเสร็จรับเงินและ E-Voucher ทุกครั้ง" },
];

export default function PaymentGuidePage() {
  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(180deg,#fdf8f3 0%,#fff 25%,#f8fafc 100%)" }}>
      <div className="max-w-5xl mx-auto px-4 pt-10 pb-16">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-orange-600 transition-colors no-underline mb-8">
          <ArrowLeft className="w-4 h-4" />
          กลับหน้าหลัก
        </Link>

        {/* Hero */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl text-white mb-5" style={{ background: "linear-gradient(135deg,#f97316,#ea580c)", boxShadow: "0 8px 32px rgba(249,115,22,0.3)" }}>
            <CreditCard className="w-8 h-8" />
          </div>
          <p className="text-[0.65rem] font-bold tracking-[0.25em] uppercase text-orange-500 mb-3">PAYMENT GUIDE</p>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">ขั้นตอนการชำระเงิน</h1>
          <p className="text-base text-slate-500 max-w-xl mx-auto">ชำระเงินง่าย สะดวก ปลอดภัย ด้วยช่องทางที่หลากหลาย</p>
        </div>

        {/* Payment Methods */}
        <div className="mb-20">
          <h2 className="text-xl font-bold text-slate-900 text-center mb-8">ช่องทางการชำระเงิน</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {paymentMethods.map((m) => (
              <div key={m.title} className="bg-white p-6 rounded-2xl border border-slate-200/80 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 text-center">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white mx-auto mb-4" style={{ background: m.color }}>
                  {m.icon}
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">{m.title}</h3>
                <p className="text-sm text-slate-500 mb-4 leading-relaxed">{m.description}</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {m.banks.map((b) => (
                    <span key={b} className="text-[0.7rem] px-2.5 py-1 bg-slate-50 text-slate-600 rounded-full font-medium border border-slate-100">{b}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Steps */}
        <div className="mb-20">
          <h2 className="text-xl font-bold text-slate-900 text-center mb-3">ขั้นตอนการจองและชำระเงิน</h2>
          <p className="text-sm text-slate-500 text-center mb-10">6 ขั้นตอนง่ายๆ สู่การเดินทางในฝัน</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {steps.map((s) => (
              <div key={s.step} className="relative bg-white p-5 rounded-2xl border border-slate-200/80 hover:border-orange-200 hover:shadow-md transition-all group">
                <div className="absolute -top-3 -left-2 w-8 h-8 rounded-full bg-orange-500 text-white text-sm font-bold flex items-center justify-center shadow-md">{s.step}</div>
                <div className="text-3xl mb-3 mt-1">{s.icon}</div>
                <h3 className="text-sm font-bold text-slate-900 mb-1.5 group-hover:text-orange-600 transition-colors">{s.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{s.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Policies */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 text-center mb-12">
          <h2 className="text-lg font-bold text-slate-900 mb-6">นโยบายความปลอดภัย</h2>
          <div className="flex flex-col md:flex-row justify-center gap-6">
            {policies.map((p, i) => (
              <div key={i} className="flex items-center gap-3">
                {p.icon}
                <span className="text-sm text-slate-600">{p.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <p className="text-sm text-slate-500 mb-4">มีคำถามเกี่ยวกับการชำระเงิน?</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/contact" className="px-8 py-3 rounded-full text-sm font-bold text-white no-underline hover:scale-105 transition-transform" style={{ background: "linear-gradient(135deg,#f97316,#ea580c)", boxShadow: "0 4px 16px rgba(249,115,22,0.3)" }}>
              ติดต่อเจ้าหน้าที่
            </Link>
            <Link href="/" className="px-8 py-3 rounded-full text-sm font-bold text-slate-700 bg-white border border-slate-200 no-underline hover:border-orange-300 hover:shadow-md transition-all">
              กลับหน้าหลัก
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
