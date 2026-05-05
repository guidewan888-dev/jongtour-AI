import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "เกี่ยวกับ Jongtour — แพลตฟอร์มจองทัวร์ออนไลน์",
  description: "Jongtour แพลตฟอร์มจองทัวร์ต่างประเทศออนไลน์ รวบรวมโปรแกรมทัวร์จากทุก Wholesale พร้อม AI ช่วยค้นหาทัวร์ที่ใช่",
  alternates: { canonical: 'https://jongtour.com/about' },
};

const milestones = [
  { year: "2024", title: "ก่อตั้ง Jongtour", desc: "เริ่มต้นจากแนวคิดรวมทัวร์จากทุก Wholesale ไว้ในที่เดียว" },
  { year: "2025", title: "เปิดตัว AI Search", desc: "ระบบ AI ค้นหาทัวร์ตามความต้องการ ช่วยลูกค้าเจอทัวร์ที่ใช่ใน 30 วินาที" },
  { year: "2026", title: "ขยายสู่ B2B", desc: "เปิดให้ Agent จองทัวร์ผ่าน Jongtour พร้อมระบบ CRM และ Commission" },
];

const values = [
  { icon: "🎯", title: "ครบ จบ ในที่เดียว", desc: "รวมทัวร์จาก 50+ Wholesale ไว้ในแพลตฟอร์มเดียว เปรียบเทียบราคา ตาราง เส้นทาง ง่ายๆ" },
  { icon: "🤖", title: "AI-First", desc: "ระบบ AI ค้นหาทัวร์ที่ตรงใจ วิเคราะห์ข้อมูลและแนะนำโปรแกรมที่เหมาะสมที่สุด" },
  { icon: "🔒", title: "ปลอดภัย โปร่งใส", desc: "การชำระเงินปลอดภัย 100% ข้อมูลครบถ้วน ไม่มีค่าใช้จ่ายแอบแฝง" },
  { icon: "💬", title: "ดูแลตลอดทริป", desc: "ทีมงานคนไทยดูแลตั้งแต่จองจนกลับบ้าน พร้อมช่องทางติดต่อหลากหลาย" },
];

const stats = [
  { value: "50+", label: "Wholesale Partners" },
  { value: "10,000+", label: "โปรแกรมทัวร์" },
  { value: "30+", label: "ประเทศ" },
  { value: "99%", label: "ความพึงพอใจ" },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-white border-b border-slate-100">
        <div className="g-container py-16 md:py-24">
          <div className="max-w-3xl">
            <div className="g-badge-primary mb-4">เกี่ยวกับเรา</div>
            <h1 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">
              เราเชื่อว่าการ<span className="text-primary-500">จองทัวร์</span>
              <br />ควรง่ายเหมือนค้นหาใน Google
            </h1>
            <p className="text-lg text-slate-500 leading-relaxed max-w-2xl">
              Jongtour คือแพลตฟอร์มที่รวมทุกโปรแกรมทัวร์ต่างประเทศจากทุก Wholesale ไว้ในที่เดียว 
              ให้คุณค้นหา เปรียบเทียบ และจองได้ง่ายที่สุด
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-background py-12 border-b border-slate-200">
        <div className="g-container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-1">{s.value}</div>
                <div className="text-sm text-slate-500 font-medium">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="g-section bg-white">
        <div className="g-container">
          <h2 className="g-section-title text-center">สิ่งที่เราเชื่อ</h2>
          <p className="g-section-subtitle text-center">หลักการที่ทำให้ Jongtour แตกต่าง</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 stagger-children">
            {values.map((v) => (
              <div key={v.title} className="g-card p-6 flex gap-5">
                <span className="text-3xl shrink-0">{v.icon}</span>
                <div>
                  <h3 className="text-base font-bold text-slate-900 mb-1">{v.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="g-section bg-background">
        <div className="g-container-narrow">
          <h2 className="g-section-title text-center">เส้นทางของเรา</h2>
          <p className="g-section-subtitle text-center">จากไอเดียสู่แพลตฟอร์มทัวร์ระดับประเทศ</p>
          <div className="space-y-6">
            {milestones.map((m, i) => (
              <div key={m.year} className="flex gap-6 items-start">
                <div className="shrink-0 w-16 text-right">
                  <span className="text-sm font-bold text-primary-600 bg-primary-50 px-3 py-1 rounded-full">{m.year}</span>
                </div>
                <div className="flex-1 g-card p-5">
                  <h3 className="text-base font-bold text-slate-900 mb-1">{m.title}</h3>
                  <p className="text-sm text-slate-500">{m.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-white border-t border-slate-100">
        <div className="g-container text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">พร้อมออกเดินทางกับเราหรือยัง?</h2>
          <p className="text-slate-500 mb-8">ค้นหาทัวร์ที่ใช่จากทุก Wholesale ในแพลตฟอร์มเดียว</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/search" className="btn-primary btn-lg">ค้นหาทัวร์</Link>
            <Link href="/contact" className="btn-outline btn-lg">ติดต่อเรา</Link>
          </div>
        </div>
      </section>
    </>
  );
}
