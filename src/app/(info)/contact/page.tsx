import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "ติดต่อเรา",
  description: "ติดต่อ Jongtour ผ่านช่องทางต่างๆ โทร, LINE, Email หรือฟอร์มสอบถาม",
};

const channels = [
  {
    icon: "📞",
    title: "โทรศัพท์",
    desc: "พูดคุยกับทีมงาน จันทร์-เสาร์ 9:00-18:00",
    action: "02-xxx-xxxx",
    href: "tel:02xxxxxxxx",
  },
  {
    icon: "💬",
    title: "LINE Official",
    desc: "แชทกับเราได้ตลอด 24 ชม.",
    action: "@jongtour",
    href: "https://line.me/R/ti/p/@jongtour",
  },
  {
    icon: "📧",
    title: "Email",
    desc: "ตอบกลับภายใน 24 ชม.",
    action: "info@jongtour.com",
    href: "mailto:info@jongtour.com",
  },
  {
    icon: "🏢",
    title: "ที่อยู่สำนักงาน",
    desc: "กรุงเทพมหานคร ประเทศไทย",
    action: "ดูแผนที่",
    href: "#map",
  },
];

export default function ContactPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-white border-b border-slate-100">
        <div className="g-container py-16 md:py-20">
          <div className="max-w-2xl">
            <div className="g-badge-primary mb-4">ติดต่อเรา</div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              มีคำถาม? <span className="text-primary-500">เราพร้อมช่วย</span>
            </h1>
            <p className="text-lg text-slate-500">
              ไม่ว่าจะสอบถามเรื่องทัวร์ การจอง หรือความร่วมมือทางธุรกิจ ทีมงาน Jongtour พร้อมดูแลคุณ
            </p>
          </div>
        </div>
      </section>

      {/* Contact Channels */}
      <section className="g-section bg-background">
        <div className="g-container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
            {channels.map((ch) => (
              <a key={ch.title} href={ch.href} className="g-card-interactive p-6 text-center block">
                <span className="text-3xl mb-3 block">{ch.icon}</span>
                <h3 className="text-base font-bold text-slate-900 mb-1">{ch.title}</h3>
                <p className="text-sm text-slate-500 mb-3">{ch.desc}</p>
                <span className="text-sm font-semibold text-primary-600">{ch.action}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="g-section bg-white">
        <div className="g-container-narrow">
          <div className="g-card p-8 md:p-10">
            <h2 className="text-xl font-bold text-slate-900 mb-2">ส่งข้อความถึงเรา</h2>
            <p className="text-sm text-slate-500 mb-8">กรอกรายละเอียด แล้วทีมงานจะติดต่อกลับภายใน 24 ชม.</p>

            <form className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">ชื่อ-นามสกุล</label>
                  <input type="text" className="g-input" placeholder="กรอกชื่อ-นามสกุล" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">โทรศัพท์</label>
                  <input type="tel" className="g-input" placeholder="0xx-xxx-xxxx" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email</label>
                <input type="email" className="g-input" placeholder="email@example.com" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">หัวข้อ</label>
                <select className="g-input">
                  <option value="">เลือกหัวข้อ</option>
                  <option value="tour">สอบถามเรื่องทัวร์</option>
                  <option value="booking">สอบถามเรื่องการจอง</option>
                  <option value="payment">สอบถามเรื่องการชำระเงิน</option>
                  <option value="agent">สมัครเป็น Agent</option>
                  <option value="business">ความร่วมมือทางธุรกิจ</option>
                  <option value="other">อื่นๆ</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">ข้อความ</label>
                <textarea className="g-input min-h-[120px] resize-y" placeholder="พิมพ์ข้อความ..." />
              </div>
              <button type="submit" className="btn-primary btn-lg w-full md:w-auto">ส่งข้อความ</button>
            </form>
          </div>
        </div>
      </section>

      {/* FAQ CTA */}
      <section className="py-12 bg-background border-t border-slate-200">
        <div className="g-container text-center">
          <p className="text-sm text-slate-500 mb-3">หาคำตอบได้เลยโดยไม่ต้องรอ</p>
          <Link href="/help" className="btn-outline">ดูคำถามที่พบบ่อย (FAQ)</Link>
        </div>
      </section>
    </>
  );
}
