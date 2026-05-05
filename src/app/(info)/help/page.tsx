import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "ศูนย์ช่วยเหลือ",
  description: "ศูนย์ช่วยเหลือ Jongtour — คู่มือการจอง วิธีใช้งาน และเอกสารต่างๆ",
};

const helpSections = [
  {
    title: "เริ่มต้นใช้งาน",
    icon: "🚀",
    items: [
      { label: "วิธีสมัครสมาชิก", href: "/faq" },
      { label: "วิธีค้นหาทัวร์", href: "/search" },
      { label: "การใช้ AI Search", href: "/ai-search" },
      { label: "วิธีเปรียบเทียบทัวร์", href: "/compare" },
    ],
  },
  {
    title: "การจองและชำระเงิน",
    icon: "💳",
    items: [
      { label: "ขั้นตอนการจอง", href: "/faq" },
      { label: "ช่องทางชำระเงิน", href: "/faq" },
      { label: "ผ่อนชำระ 0%", href: "/faq" },
      { label: "ใบเสร็จและ Tax Invoice", href: "/faq" },
    ],
  },
  {
    title: "ก่อนเดินทาง",
    icon: "📋",
    items: [
      { label: "เตรียมเอกสารเดินทาง", href: "/faq" },
      { label: "บริการรับทำวีซ่า", href: "/visa" },
      { label: "ประกันการเดินทาง", href: "/faq" },
      { label: "ดาวน์โหลด E-Voucher", href: "/faq" },
    ],
  },
  {
    title: "ยกเลิก/เปลี่ยนแปลง",
    icon: "🔄",
    items: [
      { label: "นโยบายการยกเลิก", href: "/terms" },
      { label: "เปลี่ยนชื่อผู้เดินทาง", href: "/faq" },
      { label: "เปลี่ยนรอบเดินทาง", href: "/faq" },
      { label: "ขอเงินคืน", href: "/faq" },
    ],
  },
  {
    title: "สำหรับ Agent / B2B",
    icon: "🤝",
    items: [
      { label: "สมัครเป็น Agent", href: "/pub-auth/register" },
      { label: "ระบบ Commission", href: "/faq" },
      { label: "API Integration", href: "/faq" },
      { label: "White Label", href: "/faq" },
    ],
  },
  {
    title: "ความปลอดภัยและข้อมูล",
    icon: "🔒",
    items: [
      { label: "นโยบายความเป็นส่วนตัว", href: "/privacy" },
      { label: "PDPA", href: "/pdpa" },
      { label: "เงื่อนไขการใช้งาน", href: "/terms" },
      { label: "เงื่อนไขการจอง", href: "/terms" },
    ],
  },
];

export default function HelpPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-white border-b border-slate-100">
        <div className="g-container py-16 md:py-20 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            ศูนย์ช่วยเหลือ
          </h1>
          <p className="text-lg text-slate-500 max-w-xl mx-auto mb-8">
            ค้นหาคำตอบสำหรับทุกข้อสงสัย หรือเข้าดูคู่มือวิธีใช้งาน
          </p>
          <div className="max-w-lg mx-auto relative">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </div>
            <input type="text" className="g-search-pill pl-12" placeholder="ค้นหาในศูนย์ช่วยเหลือ..." />
          </div>
        </div>
      </section>

      {/* Help Sections Grid */}
      <section className="g-section bg-background">
        <div className="g-container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
            {helpSections.map((section) => (
              <div key={section.title} className="g-card p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">{section.icon}</span>
                  <h2 className="text-base font-bold text-slate-900">{section.title}</h2>
                </div>
                <ul className="space-y-2">
                  {section.items.map((item) => (
                    <li key={item.label}>
                      <Link href={item.href} className="flex items-center gap-2 text-sm text-slate-600 hover:text-primary-600 transition-colors py-1">
                        <svg className="w-4 h-4 shrink-0 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-12 bg-white border-t border-slate-100">
        <div className="g-container text-center">
          <span className="text-4xl mb-4 block">💬</span>
          <h3 className="text-xl font-bold text-slate-900 mb-2">ยังต้องการความช่วยเหลือ?</h3>
          <p className="text-sm text-slate-500 mb-4">ทีมงานพร้อมดูแลคุณทุกขั้นตอน</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/contact" className="btn-primary">ติดต่อเรา</Link>
            <Link href="/faq" className="btn-outline">คำถามที่พบบ่อย</Link>
          </div>
        </div>
      </section>
    </>
  );
}
