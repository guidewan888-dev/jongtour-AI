import Link from "next/link";
import { CheckCircle, Clock, DollarSign, Globe, FileText, MapPin, Shield, Star, AlertCircle, Phone, MessageCircle } from "lucide-react";

/* ── Region data (popular/schengen/asia-oceania/europe/middle-east-africa/americas) ── */
const regions: Record<string, { title: string; emoji: string; desc: string; countries: { flag: string; name: string; slug: string; price: string; days: string }[] }> = {
  popular: { title: "วีซ่ายอดนิยม", emoji: "🔥", desc: "ประเทศที่คนไทยนิยมทำวีซ่ามากที่สุด", countries: [
    { flag: "🇺🇸", name: "อเมริกา", slug: "america", price: "5,500", days: "Interview" },
    { flag: "🇬🇧", name: "อังกฤษ", slug: "england", price: "4,000", days: "15-20" },
    { flag: "🇦🇺", name: "ออสเตรเลีย", slug: "australia", price: "3,500", days: "10-15" },
    { flag: "🇨🇦", name: "แคนาดา", slug: "canada", price: "4,500", days: "15-30" },
    { flag: "🇯🇵", name: "ญี่ปุ่น", slug: "japan", price: "1,500", days: "5-7" },
    { flag: "🇨🇳", name: "จีน", slug: "china", price: "2,000", days: "7-10" },
  ]},
  schengen: { title: "เชงเก้น & ยุโรป", emoji: "🇪🇺", desc: "วีซ่าเชงเก้นใบเดียว เที่ยวได้ 27 ประเทศ สูงสุด 90 วัน", countries: [
    { flag: "🇫🇷", name: "ฝรั่งเศส", slug: "france", price: "3,500", days: "10-15" },
    { flag: "🇩🇪", name: "เยอรมนี", slug: "germany", price: "3,500", days: "10-15" },
    { flag: "🇮🇹", name: "อิตาลี", slug: "italy", price: "3,500", days: "10-15" },
    { flag: "🇪🇸", name: "สเปน", slug: "spain", price: "3,500", days: "10-15" },
    { flag: "🇨🇭", name: "สวิตเซอร์แลนด์", slug: "switzerland", price: "3,500", days: "10-15" },
    { flag: "🇳🇱", name: "เนเธอร์แลนด์", slug: "netherlands", price: "3,500", days: "10-15" },
    { flag: "🇦🇹", name: "ออสเตรีย", slug: "austria", price: "3,500", days: "10-15" },
    { flag: "🇬🇷", name: "กรีซ", slug: "greece", price: "3,500", days: "10-15" },
  ]},
  "asia-oceania": { title: "เอเชีย & โอเชียเนีย", emoji: "🌏", desc: "วีซ่าประเทศในเอเชียและโอเชียเนีย", countries: [
    { flag: "🇰🇷", name: "เกาหลีใต้", slug: "korea", price: "1,200", days: "5-7" },
    { flag: "🇮🇳", name: "อินเดีย", slug: "india", price: "1,800", days: "5-7" },
    { flag: "🇹🇼", name: "ไต้หวัน", slug: "taiwan", price: "1,500", days: "5-7" },
    { flag: "🇳🇿", name: "นิวซีแลนด์", slug: "newzealand", price: "3,500", days: "10-15" },
  ]},
  europe: { title: "ยุโรปทั้งหมด", emoji: "🏰", desc: "รวมทุกประเทศในยุโรป ทั้ง Schengen และ non-Schengen", countries: [
    { flag: "🇬🇧", name: "อังกฤษ", slug: "england", price: "4,000", days: "15-20" },
    { flag: "🇷🇺", name: "รัสเซีย", slug: "russia", price: "2,500", days: "7-10" },
    { flag: "🇧🇬", name: "บัลแกเรีย", slug: "bulgaria", price: "3,000", days: "10-15" },
  ]},
  "middle-east-africa": { title: "ตะวันออกกลาง & แอฟริกา", emoji: "🌍", desc: "วีซ่าตะวันออกกลางและแอฟริกา", countries: [
    { flag: "🇹🇷", name: "ตุรกี", slug: "turkey", price: "2,000", days: "5-7" },
    { flag: "🇦🇪", name: "UAE", slug: "uae", price: "2,500", days: "5-7" },
    { flag: "🇰🇪", name: "เคนยา", slug: "kenya", price: "2,500", days: "7-10" },
  ]},
  americas: { title: "อเมริกาเหนือ & ใต้", emoji: "🌎", desc: "วีซ่าทวีปอเมริกา", countries: [
    { flag: "🇺🇸", name: "อเมริกา", slug: "america", price: "5,500", days: "Interview" },
    { flag: "🇨🇦", name: "แคนาดา", slug: "canada", price: "4,500", days: "15-30" },
    { flag: "🇲🇽", name: "เม็กซิโก", slug: "mexico", price: "2,500", days: "7-10" },
  ]},
};

/* ── Country detail data ── */
const db: Record<string, any> = {
  japan: { name: "ญี่ปุ่น", emoji: "🇯🇵", freeVisa: true, freeDays: 15, types: ["ท่องเที่ยว (Single)", "ธุรกิจ", "Transit", "เยี่ยมเยียน"], tiers: [{ t: "PLUS", p: "฿1,500", d: "5 วัน", f: 5 }, { t: "ADVANCE", p: "฿3,000", d: "7 วัน", f: 7 }, { t: "EXCLUSIVE", p: "฿5,500", d: "10 วัน", f: 9, best: true }, { t: "VIP", p: "฿10,000", d: "14 วัน", f: 11, guarantee: true }], embassy: "฿0 (ฟรี)", docs: ["พาสปอร์ตเหลืออายุ 6 เดือน", "รูปถ่าย 2x2 นิ้ว (2 ใบ)", "หนังสือรับรองการทำงาน/เรียน", "Statement ย้อนหลัง 6 เดือน", "สำเนาทะเบียนบ้าน", "แผนการเดินทาง + ตั๋วเครื่องบิน"], approval: "95%" },
  china: { name: "จีน", emoji: "🇨🇳", freeVisa: false, types: ["ท่องเที่ยว (L)", "ธุรกิจ (M)", "Transit (G)"], tiers: [{ t: "PLUS", p: "฿2,000", d: "5 วัน", f: 5 }, { t: "ADVANCE", p: "฿4,000", d: "7 วัน", f: 7 }, { t: "EXCLUSIVE", p: "฿6,500", d: "10 วัน", f: 9, best: true }, { t: "VIP", p: "฿12,000", d: "14 วัน", f: 11, guarantee: true }], embassy: "฿1,500", docs: ["พาสปอร์ตตัวจริง", "รูปถ่าย 2x2 นิ้ว", "ใบจองโรงแรม", "ตั๋วเครื่องบิน", "หนังสือเชิญ (ธุรกิจ)"], approval: "92%" },
  america: { name: "อเมริกา", emoji: "🇺🇸", freeVisa: false, types: ["B1/B2 (ท่องเที่ยว+ธุรกิจ)", "F1 (นักเรียน)", "J1 (แลกเปลี่ยน)"], tiers: [{ t: "PLUS", p: "฿5,500", d: "สัมภาษณ์", f: 5 }, { t: "ADVANCE", p: "฿8,000", d: "สัมภาษณ์", f: 7 }, { t: "EXCLUSIVE", p: "฿12,000", d: "สัมภาษณ์", f: 9, best: true }, { t: "VIP", p: "฿20,000", d: "สัมภาษณ์", f: 11, guarantee: true }], embassy: "$185 (~฿6,000)", docs: ["พาสปอร์ตตัวจริง", "DS-160 (กรอกให้)", "รูปถ่ายดิจิทัล", "หนังสือรับรองการทำงาน", "Statement ย้อนหลัง 6 เดือน", "ทะเบียนบ้าน", "โฉนดที่ดิน (ถ้ามี)"], approval: "75%" },
};

const tierColors: Record<string, string> = { PLUS: "border-slate-300", ADVANCE: "border-blue-400", EXCLUSIVE: "border-primary ring-2 ring-primary/20 -translate-y-1 shadow-xl", VIP: "border-amber-400" };

export default function VisaCountryDetailPage({ params }: { params: { country: string } }) {
  // Region page mode
  const region = regions[params.country];
  if (region) {
    return (
      <>
        <section className="bg-gradient-to-r from-primary to-orange-500 text-white py-12"><div className="g-container"><div className="text-sm text-orange-200 mb-2"><Link href="/visa" className="hover:text-white">วีซ่า</Link> → {region.title}</div><div className="text-4xl mb-2">{region.emoji}</div><h1 className="text-3xl font-bold">{region.title}</h1><p className="text-orange-100 mt-2">{region.desc}</p></div></section>
        <section className="g-section bg-white"><div className="g-container"><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{region.countries.map(c => (<Link key={c.slug} href={`/visa/${c.slug}`} className="g-card p-5 flex items-center gap-4 hover:shadow-lg hover:-translate-y-0.5 transition-all"><span className="text-4xl">{c.flag}</span><div className="flex-1"><h3 className="font-bold text-slate-900">{c.name}</h3><p className="text-xs text-slate-500">ระยะเวลา {c.days} วัน</p></div><div className="text-right"><div className="font-bold text-primary">฿{c.price}</div><div className="text-[10px] text-slate-400">เริ่มต้น</div></div></Link>))}</div></div></section>
        <section className="py-10 bg-slate-50"><div className="g-container text-center"><Link href="/visa/apply" className="btn-primary btn-lg">เริ่มสมัครวีซ่า →</Link></div></section>
      </>
    );
  }

  // Country detail mode
  const data = db[params.country] || { name: params.country, emoji: "🌍", freeVisa: false, types: ["ท่องเที่ยว"], tiers: [{ t: "PLUS", p: "฿2,500", d: "5-7 วัน", f: 5 }, { t: "ADVANCE", p: "฿4,500", d: "7-10 วัน", f: 7 }, { t: "EXCLUSIVE", p: "฿7,500", d: "10-14 วัน", f: 9, best: true }, { t: "VIP", p: "฿15,000", d: "14-21 วัน", f: 11, guarantee: true }], embassy: "สอบถาม", docs: ["พาสปอร์ต", "รูปถ่าย", "เอกสารการเงิน", "หนังสือรับรอง"], approval: "N/A" };

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-r from-slate-900 to-slate-700 text-white py-12">
        <div className="g-container"><div className="text-sm text-slate-400 mb-2"><Link href="/visa" className="hover:text-white">วีซ่า</Link> → {data.name}</div>
          <div className="flex items-center gap-4"><span className="text-5xl">{data.emoji}</span><div><h1 className="text-3xl font-bold">วีซ่า{data.name}</h1><p className="text-slate-400 mt-1">บริการรับยื่นวีซ่า{data.name} ครบวงจร ดูแลตั้งแต่เตรียมเอกสารจนรับผล</p></div></div>
          {data.freeVisa && <div className="mt-4 inline-block bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 px-4 py-2 rounded-full text-sm font-medium">💚 คนไทยเข้าได้ฟรี {data.freeDays} วัน ไม่ต้องมีวีซ่า</div>}
        </div>
      </section>

      {/* Quick Stats */}
      <section className="bg-white border-b border-slate-100 py-4">
        <div className="g-container flex flex-wrap gap-6 text-sm">
          <span className="flex items-center gap-1.5"><DollarSign className="w-4 h-4 text-primary" /> เริ่มต้น {data.tiers[0].p}</span>
          <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-blue-500" /> {data.tiers[0].d}</span>
          <span className="flex items-center gap-1.5"><Shield className="w-4 h-4 text-emerald-500" /> อัตราผ่าน {data.approval}</span>
          <span className="flex items-center gap-1.5"><Globe className="w-4 h-4 text-purple-500" /> ค่าสถานทูต {data.embassy}</span>
        </div>
      </section>

      <div className="g-container py-8 space-y-10">
        {/* Tier Cards */}
        <div>
          <h2 className="text-xl font-bold text-slate-900 mb-4">🎯 เลือกแพ็กเกจ</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {data.tiers.map((t: any) => (
              <div key={t.t} className={`bg-white rounded-2xl border-2 p-5 transition-all ${tierColors[t.t] || "border-slate-200"}`}>
                {t.best && <div className="text-xs font-bold text-white bg-primary px-2 py-0.5 rounded-full w-fit mb-2">🔥 BEST SELLER</div>}
                {t.guarantee && <div className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full w-fit mb-2">👑 GUARANTEE</div>}
                <h3 className="font-black text-slate-900">{t.t}</h3>
                <div className="text-2xl font-black text-primary mt-2">{t.p}<span className="text-xs text-slate-400 font-normal">/ท่าน</span></div>
                <div className="text-xs text-slate-500 mt-1">⏱️ {t.d} · แปล {t.f} ฉบับ</div>
                <Link href={`/visa/apply?country=${params.country}&tier=${t.t.toLowerCase()}`} className={`block text-center mt-4 py-2 rounded-xl text-sm font-bold transition-colors ${t.best ? "bg-primary text-white hover:bg-orange-600" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}>{t.best ? "เลือกเลย" : "เลือก"}</Link>
              </div>
            ))}
          </div>
        </div>

        {/* Visa Types */}
        <div>
          <h2 className="text-xl font-bold text-slate-900 mb-3">📋 ประเภทวีซ่า</h2>
          <div className="flex flex-wrap gap-2">{data.types.map((t: string) => <span key={t} className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">{t}</span>)}</div>
        </div>

        {/* Documents */}
        <div>
          <h2 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2"><FileText className="w-5 h-5 text-primary" /> เอกสารที่ต้องเตรียม</h2>
          <div className="space-y-2">{data.docs.map((d: string, i: number) => <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl text-sm"><CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" /> {d}</div>)}</div>
        </div>

        {/* Add-on Recommendation */}
        <div className="g-card p-6 bg-blue-50 border-blue-100">
          <h3 className="font-bold text-blue-900 mb-3">💡 บริการเสริมแนะนำ</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[{ icon: "🛡️", title: "ประกันเดินทาง", price: "฿1,200+" }, { icon: "✈️", title: "ตั๋ว Dummy", price: "฿500" }, { icon: "📝", title: "แปลเอกสาร", price: "฿800/ฉบับ" }].map(a => (
              <div key={a.title} className="bg-white p-3 rounded-xl text-sm flex items-center gap-3"><span className="text-xl">{a.icon}</span><div><div className="font-medium">{a.title}</div><div className="text-primary font-bold">{a.price}</div></div></div>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-3"><AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" /><p className="text-sm text-amber-800">ผลการพิจารณาวีซ่าขึ้นอยู่กับดุลยพินิจของสถานทูต บริษัทไม่สามารถรับประกันผลอนุมัติ</p></div>

        {/* CTA */}
        <div className="flex flex-wrap gap-3"><Link href={`/visa/apply?country=${params.country}`} className="btn-primary btn-lg">สมัครวีซ่า{data.name} →</Link><a href="tel:021234567" className="btn-outline flex items-center gap-2"><Phone className="w-4 h-4" /> โทรปรึกษา</a></div>
      </div>
    </>
  );
}
