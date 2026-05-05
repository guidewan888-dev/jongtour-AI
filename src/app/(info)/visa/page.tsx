import type { Metadata } from "next";
import Link from "next/link";
import { Search, Shield, Clock, CheckCircle, Star, Globe, FileText, Plane, Hotel, MessageCircle, ArrowRight, Phone } from "lucide-react";

export const metadata: Metadata = {
  title: "บริการรับยื่นวีซ่า ครบวงจรทุกประเทศ | Jongtour",
  description: "Jongtour รับทำวีซ่าต่างประเทศ ครอบคลุมกว่า 50 ประเทศ ทั้งวีซ่าท่องเที่ยว เยี่ยมเยียน ธุรกิจ ด้วยทีมมืออาชีพ ปรึกษาฟรี!",
};

const popular = [
  { flag: "🇺🇸", name: "อเมริกา", slug: "america", price: "5,500", days: "Interview" },
  { flag: "🇬🇧", name: "อังกฤษ", slug: "england", price: "4,000", days: "15-20" },
  { flag: "🇦🇺", name: "ออสเตรเลีย", slug: "australia", price: "3,500", days: "10-15" },
  { flag: "🇨🇦", name: "แคนาดา", slug: "canada", price: "4,500", days: "15-30" },
  { flag: "🇯🇵", name: "ญี่ปุ่น", slug: "japan", price: "1,500", days: "5-7" },
  { flag: "🇨🇳", name: "จีน", slug: "china", price: "2,000", days: "7-10" },
];
const schengen = [
  { flag: "🇫🇷", name: "ฝรั่งเศส", slug: "france" }, { flag: "🇩🇪", name: "เยอรมนี", slug: "germany" },
  { flag: "🇮🇹", name: "อิตาลี", slug: "italy" }, { flag: "🇪🇸", name: "สเปน", slug: "spain" },
  { flag: "🇨🇭", name: "สวิตเซอร์แลนด์", slug: "switzerland" }, { flag: "🇳🇱", name: "เนเธอร์แลนด์", slug: "netherlands" },
  { flag: "🇦🇹", name: "ออสเตรีย", slug: "austria" }, { flag: "🇬🇷", name: "กรีซ", slug: "greece" },
  { flag: "🇵🇹", name: "โปรตุเกส", slug: "portugal" }, { flag: "🇧🇪", name: "เบลเยียม", slug: "belgium" },
  { flag: "🇸🇪", name: "สวีเดน", slug: "sweden" }, { flag: "🇳🇴", name: "นอร์เวย์", slug: "norway" },
  { flag: "🇫🇮", name: "ฟินแลนด์", slug: "finland" }, { flag: "🇩🇰", name: "เดนมาร์ก", slug: "denmark" },
  { flag: "🇨🇿", name: "เช็ก", slug: "czech" }, { flag: "🇭🇺", name: "ฮังการี", slug: "hungary" },
  { flag: "🇵🇱", name: "โปแลนด์", slug: "poland" }, { flag: "🇮🇸", name: "ไอซ์แลนด์", slug: "iceland" },
  { flag: "🇮🇪", name: "ไอร์แลนด์", slug: "ireland" }, { flag: "🇭🇷", name: "โครเอเชีย", slug: "croatia" },
];
const asia = [
  { flag: "🇰🇷", name: "เกาหลีใต้", slug: "korea" }, { flag: "🇮🇳", name: "อินเดีย", slug: "india" },
  { flag: "🇹🇼", name: "ไต้หวัน", slug: "taiwan" }, { flag: "🇳🇿", name: "นิวซีแลนด์", slug: "newzealand" },
  { flag: "🇲🇳", name: "มองโกเลีย", slug: "mongolia" }, { flag: "🇳🇵", name: "เนปาล", slug: "nepal" },
  { flag: "🇰🇭", name: "กัมพูชา", slug: "cambodia" }, { flag: "🇲🇲", name: "พม่า", slug: "myanmar" },
  { flag: "🇧🇳", name: "บรูไน", slug: "brunei" }, { flag: "🇧🇩", name: "บังกลาเทศ", slug: "bangladesh" },
];
const middleEast = [
  { flag: "🇹🇷", name: "ตุรกี", slug: "turkey" }, { flag: "🇦🇪", name: "UAE", slug: "uae" },
  { flag: "🇮🇷", name: "อิหร่าน", slug: "iran" }, { flag: "🇰🇪", name: "เคนยา", slug: "kenya" },
  { flag: "🇲🇦", name: "โมร็อกโก", slug: "morocco" }, { flag: "🌍", name: "แอฟริกาตะวันออก", slug: "east-africa" },
];
const americas = [
  { flag: "🇺🇸", name: "อเมริกา", slug: "america" }, { flag: "🇨🇦", name: "แคนาดา", slug: "canada" },
  { flag: "🇲🇽", name: "เม็กซิโก", slug: "mexico" },
];

const steps = [
  { icon: "🔍", title: "1. เลือกประเทศ", desc: "เลือกประเทศและประเภทวีซ่าที่ต้องการ" },
  { icon: "📋", title: "2. เตรียมเอกสาร", desc: "เราช่วยเช็คลิสต์เอกสาร + แปลให้" },
  { icon: "💳", title: "3. ชำระค่าบริการ", desc: "ชำระผ่านช่องทางที่สะดวก มัดจำ 50% ได้" },
  { icon: "✅", title: "4. รับผลวีซ่า", desc: "เราดำเนินการยื่นให้ แจ้งผลทันที" },
];

const addons = [
  { icon: "📝", title: "แปลเอกสาร", desc: "รับรองคำแปล ใช้ยื่นสถานทูต", price: "฿800/ฉบับ", href: "/visa/translation" },
  { icon: "✈️", title: "ตั๋ว Dummy", desc: "จองตั๋วยื่นวีซ่า ยกเลิกได้", price: "฿500/คน", href: "/visa/booking-ticket" },
  { icon: "🛡️", title: "ประกันเดินทาง", desc: "คุ้มครองตามเงื่อนไขสถานทูต", price: "฿1,200+", href: "/visa/insurance" },
  { icon: "🏨", title: "จองโรงแรม", desc: "ใบจองโชว์วีซ่า ยกเลิกฟรี", price: "฿300/คืน", href: "/visa/hotel-booking" },
];

const ChipGrid = ({ items, region }: { items: { flag: string; name: string; slug: string }[]; region?: string }) => (
  <div className="flex flex-wrap gap-2">
    {items.map(c => (
      <Link key={c.slug} href={`/visa/${c.slug}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-full text-sm hover:border-primary hover:shadow-sm transition-all">
        <span>{c.flag}</span><span className="font-medium text-slate-700">{c.name}</span>
      </Link>
    ))}
  </div>
);

export default function VisaHubPage() {
  return (
    <>
      {/* 1. Hero */}
      <section className="bg-gradient-to-br from-primary to-orange-600 text-white py-16 md:py-24">
        <div className="g-container">
          <div className="max-w-2xl">
            <div className="inline-block bg-white/20 backdrop-blur px-3 py-1 rounded-full text-sm font-medium mb-4">🛂 Visa Service by Jongtour</div>
            <h1 className="text-3xl md:text-5xl font-black mb-4 leading-tight">บริการรับยื่น<br/>วีซ่าครบวงจร</h1>
            <p className="text-orange-100 text-lg mb-6">ครอบคลุม 50+ ประเทศทั่วโลก ทั้งวีซ่าท่องเที่ยว เยี่ยมเยียน ธุรกิจ<br/>ด้วยทีมมืออาชีพประสบการณ์กว่า 15 ปี</p>
            <div className="flex flex-wrap gap-3">
              <Link href="/visa/apply" className="bg-white text-primary font-bold px-6 py-3 rounded-full hover:bg-orange-50 transition-colors">เริ่มสมัครวีซ่า →</Link>
              <Link href="/visa/check-eligibility" className="border border-white/50 text-white font-medium px-6 py-3 rounded-full hover:bg-white/10 transition-colors">🤖 AI ตรวจสิทธิ์ฟรี</Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Trust Badges */}
      <section className="bg-white border-b border-slate-100 py-6">
        <div className="g-container flex flex-wrap justify-center gap-6 md:gap-10 text-center">
          {[
            { icon: <Shield className="w-5 h-5 text-primary" />, text: "ใบอนุญาตถูกต้อง" },
            { icon: <Star className="w-5 h-5 text-amber-500" />, text: "อัตราผ่าน 95%+" },
            { icon: <Clock className="w-5 h-5 text-blue-500" />, text: "ประสบการณ์ 15 ปี" },
            { icon: <CheckCircle className="w-5 h-5 text-emerald-500" />, text: "ปรึกษาฟรี" },
          ].map(b => (
            <div key={b.text} className="flex items-center gap-2 text-sm font-medium text-slate-700">{b.icon}{b.text}</div>
          ))}
        </div>
      </section>

      {/* 4. Search */}
      <section className="bg-white py-8 border-b border-slate-100">
        <div className="g-container-narrow">
          <div className="relative"><Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" /><input className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="ค้นหาประเทศที่ต้องการทำวีซ่า..." /></div>
        </div>
      </section>

      {/* 5. Popular */}
      <section className="g-section bg-white">
        <div className="g-container">
          <h2 className="g-section-title">🔥 วีซ่ายอดนิยม</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {popular.map(c => (
              <Link key={c.slug} href={`/visa/${c.slug}`} className="g-card p-5 flex items-center gap-4 hover:shadow-lg hover:-translate-y-0.5 transition-all">
                <span className="text-4xl">{c.flag}</span>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-900">{c.name}</h3>
                  <p className="text-xs text-slate-500">ระยะเวลา {c.days} วัน</p>
                </div>
                <div className="text-right shrink-0"><div className="text-sm font-bold text-primary">฿{c.price}</div><div className="text-[10px] text-slate-400">เริ่มต้น</div></div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 6-9. Region Grids */}
      <section className="g-section bg-slate-50">
        <div className="g-container space-y-8">
          <div><div className="flex items-center justify-between mb-3"><h3 className="font-bold text-slate-900">🇪🇺 เชงเก้น & ยุโรป</h3><Link href="/visa/schengen" className="text-sm text-primary font-medium">ดูทั้งหมด →</Link></div><ChipGrid items={schengen} /></div>
          <div><div className="flex items-center justify-between mb-3"><h3 className="font-bold text-slate-900">🌏 เอเชีย & โอเชียเนีย</h3><Link href="/visa/asia-oceania" className="text-sm text-primary font-medium">ดูทั้งหมด →</Link></div><ChipGrid items={asia} /></div>
          <div><div className="flex items-center justify-between mb-3"><h3 className="font-bold text-slate-900">🌍 ตะวันออกกลาง & แอฟริกา</h3><Link href="/visa/middle-east-africa" className="text-sm text-primary font-medium">ดูทั้งหมด →</Link></div><ChipGrid items={middleEast} /></div>
          <div><div className="flex items-center justify-between mb-3"><h3 className="font-bold text-slate-900">🌎 อเมริกา</h3><Link href="/visa/americas" className="text-sm text-primary font-medium">ดูทั้งหมด →</Link></div><ChipGrid items={americas} /></div>
        </div>
      </section>

      {/* 10. Process */}
      <section className="g-section bg-white">
        <div className="g-container"><h2 className="g-section-title">ขั้นตอนการทำวีซ่ากับ Jongtour</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {steps.map(s => (<div key={s.title} className="text-center p-5"><div className="text-3xl mb-3">{s.icon}</div><h3 className="font-bold text-sm text-slate-900 mb-1">{s.title}</h3><p className="text-xs text-slate-500">{s.desc}</p></div>))}
          </div>
        </div>
      </section>

      {/* 11. Add-ons */}
      <section className="g-section bg-slate-50">
        <div className="g-container"><h2 className="g-section-title">✨ บริการเสริม</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {addons.map(a => (<Link key={a.title} href={a.href} className="g-card p-5 hover:shadow-lg transition-all"><div className="text-2xl mb-2">{a.icon}</div><h3 className="font-bold text-sm text-slate-900 mb-1">{a.title}</h3><p className="text-xs text-slate-500 mb-2">{a.desc}</p><div className="text-sm font-bold text-primary">{a.price}</div></Link>))}
          </div>
        </div>
      </section>

      {/* 12. Pricing Preview */}
      <section className="g-section bg-white">
        <div className="g-container-narrow"><h2 className="g-section-title">💰 ตารางราคาเบื้องต้น</h2>
          <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto">
            <table className="w-full text-sm"><thead className="bg-slate-50 border-b"><tr><th className="text-left px-4 py-3">ประเทศ</th><th className="text-center px-3 py-3">ค่าบริการ</th><th className="text-center px-3 py-3">ค่าสถานทูต</th><th className="text-center px-3 py-3">ระยะเวลา</th></tr></thead>
              <tbody className="divide-y divide-slate-50">
                {[
                  { f: "🇯🇵", n: "ญี่ปุ่น", s: "฿1,500", e: "ฟรี", d: "5-7 วัน" },
                  { f: "🇨🇳", n: "จีน", s: "฿2,000", e: "฿1,500", d: "7-10 วัน" },
                  { f: "🇪🇺", n: "เชงเก้น", s: "฿3,500", e: "€80", d: "10-15 วัน" },
                  { f: "🇬🇧", n: "อังกฤษ", s: "฿4,000", e: "£100", d: "15-20 วัน" },
                  { f: "🇺🇸", n: "อเมริกา", s: "฿5,500", e: "$185", d: "สัมภาษณ์" },
                  { f: "🇦🇺", n: "ออสเตรเลีย", s: "฿3,500", e: "AUD150", d: "10-15 วัน" },
                ].map(r => (<tr key={r.n} className="hover:bg-slate-50"><td className="px-4 py-3 font-medium">{r.f} {r.n}</td><td className="px-3 py-3 text-center font-bold text-primary">{r.s}</td><td className="px-3 py-3 text-center text-slate-500">{r.e}</td><td className="px-3 py-3 text-center text-slate-500">{r.d}</td></tr>))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-slate-400 mt-3 text-center">* ราคาเริ่มต้น tier PLUS ยังไม่รวมค่าธรรมเนียมสถานทูต <Link href="/visa/pricing" className="text-primary underline">ดูราคาทั้งหมด →</Link></p>
        </div>
      </section>

      {/* 15. FAQ */}
      <section className="g-section bg-slate-50">
        <div className="g-container-narrow"><h2 className="g-section-title">❓ คำถามที่พบบ่อย</h2>
          <div className="space-y-2">
            {[
              { q: "ต้องเตรียมเอกสารอะไรบ้าง?", a: "ขึ้นอยู่กับประเทศปลายทาง โดยทั่วไปต้องมีพาสปอร์ต รูปถ่าย Statement ย้อนหลัง 6 เดือน และหนังสือรับรองการทำงาน" },
              { q: "ใช้เวลานานแค่ไหน?", a: "ตั้งแต่ 5 วันทำการ (ญี่ปุ่น) ถึง 30 วัน (แคนาดา) ขึ้นอยู่กับประเทศ" },
              { q: "ถ้าวีซ่าไม่ผ่านจะได้เงินคืนไหม?", a: "ค่าบริการ Jongtour ไม่คืน แต่ค่าธรรมเนียมสถานทูตจะคืนเฉพาะบางประเทศ tier VIP จะได้ยื่นรอบ 2 ฟรี" },
              { q: "รับประกันผลวีซ่าไหม?", a: "ไม่สามารถรับประกันผลได้ เพราะขึ้นอยู่กับดุลยพินิจของสถานทูต แต่เราให้คำปรึกษาเพื่อเพิ่มโอกาสสูงสุด" },
            ].map(f => (<details key={f.q} className="bg-white rounded-2xl border border-slate-200 p-4 group"><summary className="font-medium text-sm text-slate-900 cursor-pointer list-none flex items-center justify-between"><span>{f.q}</span><span className="text-slate-400 group-open:rotate-180 transition-transform">▼</span></summary><p className="text-sm text-slate-500 mt-3 pt-3 border-t border-slate-100">{f.a}</p></details>))}
          </div>
        </div>
      </section>

      {/* 17. Final CTA */}
      <section className="bg-gradient-to-r from-primary to-orange-600 py-12">
        <div className="g-container text-center text-white">
          <h2 className="text-2xl font-bold mb-2">พร้อมเริ่มทำวีซ่าแล้วหรือยัง?</h2>
          <p className="text-orange-100 mb-6">ปรึกษาฟรี! ทีมงานพร้อมช่วยคุณ</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/visa/apply" className="bg-white text-primary font-bold px-8 py-3 rounded-full hover:bg-orange-50 transition-colors">เริ่มสมัครเลย →</Link>
            <a href="tel:021234567" className="border border-white/50 text-white font-medium px-6 py-3 rounded-full hover:bg-white/10 transition-colors flex items-center gap-2"><Phone className="w-4 h-4" /> โทรปรึกษา</a>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-8 bg-white"><div className="g-container-narrow"><div className="g-card p-5 bg-amber-50 border-amber-100"><div className="flex gap-3"><span className="text-xl shrink-0">⚠️</span><p className="text-xs text-amber-700 leading-relaxed">ราคาค่าบริการยังไม่รวมค่าธรรมเนียมวีซ่าที่ต้องชำระให้สถานทูต ระยะเวลาดำเนินการเป็นเพียงค่าประมาณ ผลการพิจารณาวีซ่าขึ้นอยู่กับดุลยพินิจของสถานทูต/สถานกงสุลเท่านั้น</p></div></div></div></section>
    </>
  );
}
