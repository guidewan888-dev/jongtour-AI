"use client";

import { useState } from "react";
import type { Metadata } from "next";

const faqCategories = [
  { id: "booking", label: "การจอง", icon: "📋" },
  { id: "payment", label: "การชำระเงิน", icon: "💳" },
  { id: "tour", label: "โปรแกรมทัวร์", icon: "✈️" },
  { id: "visa", label: "วีซ่า", icon: "🛂" },
  { id: "cancel", label: "ยกเลิก/เปลี่ยนแปลง", icon: "🔄" },
  { id: "account", label: "บัญชีผู้ใช้", icon: "👤" },
];

const faqs: { category: string; q: string; a: string }[] = [
  { category: "booking", q: "จองทัวร์ผ่าน Jongtour ต้องทำอย่างไร?", a: "เลือกโปรแกรมทัวร์ที่สนใจ → กดจอง → กรอกข้อมูลผู้เดินทาง → ชำระเงิน → รอรับ E-Voucher ทาง Email" },
  { category: "booking", q: "จองแล้วได้ที่นั่งเลยไหม?", a: "ที่นั่งจะถูก Hold ไว้ชั่วคราว 2 ชม. หลังจากชำระเงินแล้ว ทีมงานจะยืนยันที่นั่งภายใน 24 ชม." },
  { category: "booking", q: "จองให้คนอื่นได้ไหม?", a: "ได้ครับ กรอกข้อมูลผู้เดินทางตามพาสปอร์ตของบุคคลที่จะเดินทางจริง ไม่จำเป็นต้องเป็นชื่อผู้จอง" },
  { category: "payment", q: "ชำระเงินผ่านช่องทางไหนได้บ้าง?", a: "รองรับบัตรเครดิต/เดบิต, โอนผ่านธนาคาร, QR Payment, ผ่อนชำระ 0% (เฉพาะบัตรที่ร่วมรายการ)" },
  { category: "payment", q: "มีค่าธรรมเนียมเพิ่มเติมไหม?", a: "ไม่มีค่าธรรมเนียมเพิ่มเติม ราคาที่แสดงเป็นราคาสุดท้ายรวมทุกอย่างแล้ว" },
  { category: "payment", q: "ผ่อนชำระ 0% ได้ไหม?", a: "บางโปรแกรมรองรับผ่อน 0% ผ่านบัตรเครดิตที่ร่วมรายการ สูงสุด 10 เดือน (ขึ้นอยู่กับ Wholesale)" },
  { category: "tour", q: "ทัวร์ที่แสดงมาจากไหน?", a: "ทัวร์ทุกโปรแกรมมาจาก Wholesale ชั้นนำที่มีใบอนุญาตถูกต้อง เราเป็นตัวกลางรวบรวมให้คุณเปรียบเทียบ" },
  { category: "tour", q: "ราคาทัวร์รวมอะไรบ้าง?", a: "ทั่วไปรวม: ตั๋วเครื่องบิน, โรงแรม, อาหาร, รถนำเที่ยว, ค่าเข้าชม, ประกันเดินทาง (รายละเอียดระบุในแต่ละโปรแกรม)" },
  { category: "visa", q: "วีซ่ารวมอยู่ในค่าทัวร์ไหม?", a: "ขึ้นอยู่กับโปรแกรม บางโปรแกรมรวม บางโปรแกรมไม่รวม — ดูรายละเอียดในแต่ละทัวร์ หรือใช้บริการวีซ่าของเราได้" },
  { category: "visa", q: "ใช้บริการรับทำวีซ่าได้ที่ไหน?", a: "กดเข้าเมนู 'วีซ่า' บนเว็บไซต์ เลือกประเทศ กรอกข้อมูล แล้วเราจะติดต่อกลับเพื่อดำเนินการ" },
  { category: "cancel", q: "ยกเลิกทัวร์ได้ไหม?", a: "ได้ แต่มีเงื่อนไขค่าธรรมเนียมตามระยะเวลาก่อนเดินทาง (30+ วัน = คืน 100%, 15-29 วัน = คืน 50%) ดูรายละเอียดในเงื่อนไขการจอง" },
  { category: "cancel", q: "เปลี่ยนชื่อผู้เดินทางได้ไหม?", a: "ได้ภายใน 7 วันก่อนเดินทาง (ขึ้นอยู่กับเงื่อนไขของ Wholesale แต่ละเจ้า) ติดต่อทีมงานเพื่อดำเนินการ" },
  { category: "account", q: "สมัครสมาชิกฟรีไหม?", a: "ฟรี! ไม่มีค่าใช้จ่ายในการสมัคร และไม่มีค่ารายเดือน" },
  { category: "account", q: "Agent สมัครได้อย่างไร?", a: "กดสมัคร Agent บนเว็บไซต์ ส่งเอกสารใบอนุญาตประกอบธุรกิจ รอทีมงานตรวจสอบภายใน 1-3 วันทำการ" },
];

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState("booking");
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const filtered = faqs.filter((f) => f.category === activeCategory);

  return (
    <>
      {/* Hero */}
      <section className="bg-white border-b border-slate-100">
        <div className="g-container py-16 md:py-20">
          <div className="max-w-2xl">
            <div className="g-badge-primary mb-4">FAQ</div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">คำถามที่พบบ่อย</h1>
            <p className="text-lg text-slate-500">
              คำตอบสำหรับทุกข้อสงสัยเกี่ยวกับการจองทัวร์ การชำระเงิน วีซ่า และอื่นๆ
            </p>
          </div>
        </div>
      </section>

      {/* Category Tabs + Accordion */}
      <section className="g-section bg-background">
        <div className="g-container-narrow">
          {/* Category Pills */}
          <div className="flex flex-wrap gap-2 mb-8">
            {faqCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => { setActiveCategory(cat.id); setOpenIndex(0); }}
                className={`g-chip text-sm cursor-pointer transition-all ${
                  activeCategory === cat.id
                    ? "!bg-primary-500 !text-white !border-primary-500"
                    : ""
                }`}
              >
                <span>{cat.icon}</span> {cat.label}
              </button>
            ))}
          </div>

          {/* Accordion */}
          <div className="space-y-2">
            {filtered.map((faq, i) => (
              <div key={i} className="g-card overflow-hidden">
                <button
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-50 transition-colors"
                >
                  <span className="text-sm font-semibold text-slate-900 pr-4">{faq.q}</span>
                  <svg
                    className={`w-5 h-5 shrink-0 text-slate-400 transition-transform ${openIndex === i ? "rotate-180" : ""}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openIndex === i && (
                  <div className="px-5 pb-5 border-t border-slate-100">
                    <p className="text-sm text-slate-600 leading-relaxed pt-4">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Still need help */}
      <section className="py-12 bg-white border-t border-slate-100">
        <div className="g-container text-center">
          <p className="text-slate-500 mb-3">ยังไม่เจอคำตอบที่ต้องการ?</p>
          <a href="/contact" className="btn-primary">ติดต่อทีมงาน</a>
        </div>
      </section>
    </>
  );
}
