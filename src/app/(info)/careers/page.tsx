import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "ร่วมงานกับเรา",
  description: "สมัครเป็นไกด์ หัวหน้าทัวร์ หรือทีมงาน Jongtour — ร่วมสร้างประสบการณ์การท่องเที่ยว",
};

const positions = [
  {
    title: "ไกด์นำเที่ยวต่างประเทศ",
    type: "Freelance",
    location: "ต่างประเทศ",
    desc: "นำเที่ยวลูกค้าในประเทศต่างๆ ดูแลตลอดทริป พร้อมให้ข้อมูลสถานที่สำคัญ",
    tags: ["ญี่ปุ่น", "เกาหลี", "ยุโรป", "จีน"],
  },
  {
    title: "หัวหน้าทัวร์ (Tour Leader)",
    type: "Freelance",
    location: "ต่างประเทศ",
    desc: "บริหารจัดการทริป ดูแลลูกค้าตั้งแต่สนามบินจนกลับถึงบ้าน ประสานงานกับ supplier",
    tags: ["ทุกเส้นทาง", "3-5 ปี ประสบการณ์"],
  },
  {
    title: "Sale Consultant (ที่ปรึกษาการท่องเที่ยว)",
    type: "Full-time",
    location: "กรุงเทพฯ",
    desc: "ให้คำปรึกษาลูกค้า จัดทัวร์กรุ๊ปส่วนตัว ดูแลการจองจนเสร็จสิ้น",
    tags: ["B2B", "B2C"],
  },
  {
    title: "Content Creator / Social Media",
    type: "Full-time / Part-time",
    location: "กรุงเทพฯ / Remote",
    desc: "สร้างคอนเทนต์ท่องเที่ยว เขียนรีวิว ดูแล Social Media ของ Jongtour",
    tags: ["TikTok", "IG", "Blog"],
  },
];

export default function CareersPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-white border-b border-slate-100">
        <div className="g-container py-16 md:py-20">
          <div className="max-w-2xl">
            <div className="g-badge-primary mb-4">ร่วมงานกับเรา</div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              มาเป็นส่วนหนึ่งของ <span className="text-primary-500">Jongtour</span>
            </h1>
            <p className="text-lg text-slate-500">
              ร่วมสร้างประสบการณ์การท่องเที่ยวที่ดีที่สุดให้คนไทย
            </p>
          </div>
        </div>
      </section>

      {/* Positions */}
      <section className="g-section bg-background">
        <div className="g-container-narrow">
          <h2 className="g-section-title">ตำแหน่งที่เปิดรับ</h2>
          <p className="g-section-subtitle">เลือกตำแหน่งที่สนใจแล้วสมัครได้เลย</p>

          <div className="space-y-4 stagger-children">
            {positions.map((pos) => (
              <div key={pos.title} className="g-card p-6">
                <div className="flex flex-col md:flex-row md:items-start gap-4">
                  <div className="flex-1">
                    <h3 className="text-base font-bold text-slate-900 mb-1">{pos.title}</h3>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="text-xs font-semibold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">{pos.type}</span>
                      <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">📍 {pos.location}</span>
                    </div>
                    <p className="text-sm text-slate-500 mb-3">{pos.desc}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {pos.tags.map((tag) => (
                        <span key={tag} className="text-xs text-slate-400 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-full">{tag}</span>
                      ))}
                    </div>
                  </div>
                  <Link href="/careers/apply" className="btn-primary text-sm shrink-0 self-start">สมัครตำแหน่งนี้</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Perks */}
      <section className="g-section bg-white">
        <div className="g-container">
          <h2 className="g-section-title text-center">ทำไมต้อง Jongtour?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            {[
              { icon: "🌍", title: "ได้เดินทาง", desc: "โอกาสเดินทางไปทั่วโลก พร้อมสวัสดิการค่าเดินทาง" },
              { icon: "📈", title: "เติบโตด้วยกัน", desc: "ร่วมเติบโตไปกับ Startup ท่องเที่ยวที่เร็วที่สุดในไทย" },
              { icon: "🏡", title: "Work Flexible", desc: "บางตำแหน่งรองรับ Remote / Hybrid สามารถทำงานที่ไหนก็ได้" },
            ].map(p => (
              <div key={p.title} className="g-card p-6 text-center">
                <span className="text-3xl mb-3 block">{p.icon}</span>
                <h3 className="text-sm font-bold text-slate-900 mb-1">{p.title}</h3>
                <p className="text-xs text-slate-500">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
