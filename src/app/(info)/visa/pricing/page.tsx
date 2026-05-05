import Link from "next/link";
import { DollarSign, Star, Shield, Crown } from "lucide-react";

const tiers = [
  { name: "PLUS", color: "border-slate-300", icon: <DollarSign className="w-5 h-5" />, tag: "", features: ["รายการเอกสารมาตรฐาน", "กรอกฟอร์ม+เตรียมเอกสาร", "นัดหมายยื่นวีซ่า", "แปลเอกสาร 4 รายการ", "ให้คำปรึกษาพื้นฐาน"] },
  { name: "ADVANCE", color: "border-blue-400", icon: <Star className="w-5 h-5 text-blue-500" />, tag: "", features: ["ทุกอย่างใน PLUS", "วิเคราะห์เคสเบื้องต้น", "แปลเอกสาร 6 รายการ", "ตั๋ว+โรงแรม Dummy", "ให้คำปรึกษาเชิงลึก"] },
  { name: "EXCLUSIVE", color: "border-primary", icon: <Shield className="w-5 h-5 text-primary" />, tag: "🔥 BEST SELLER", features: ["ทุกอย่างใน ADVANCE", "วิเคราะห์เคส Exclusive", "แปลเอกสาร 8 รายการ", "Itinerary + Cover Letter", "ประสานงานเร่งด่วน"] },
  { name: "VIP", color: "border-amber-400", icon: <Crown className="w-5 h-5 text-amber-500" />, tag: "👑 GUARANTEE", features: ["ทุกอย่างใน EXCLUSIVE", "แปลเอกสารทุกฉบับ", "ซ้อมสัมภาษณ์", "ค่าธรรมเนียมสถานทูตรวม", "ยื่นรอบ 2 ฟรี ถ้าไม่ผ่าน"] },
];

const prices = [
  { country: "🇯🇵 ญี่ปุ่น", plus: "1,500", adv: "3,000", excl: "5,500", vip: "10,000", emb: "ฟรี" },
  { country: "🇨🇳 จีน", plus: "2,000", adv: "4,000", excl: "6,500", vip: "12,000", emb: "1,500" },
  { country: "🇪🇺 เชงเก้น", plus: "3,500", adv: "5,500", excl: "8,500", vip: "15,000", emb: "€80" },
  { country: "🇬🇧 อังกฤษ", plus: "4,000", adv: "6,000", excl: "9,000", vip: "16,000", emb: "£100" },
  { country: "🇺🇸 อเมริกา", plus: "5,500", adv: "8,000", excl: "12,000", vip: "20,000", emb: "$185" },
  { country: "🇦🇺 ออสเตรเลีย", plus: "3,500", adv: "5,500", excl: "8,500", vip: "15,000", emb: "AUD150" },
  { country: "🇨🇦 แคนาดา", plus: "4,500", adv: "7,000", excl: "10,000", vip: "18,000", emb: "CAD100" },
  { country: "🇰🇷 เกาหลี", plus: "1,200", adv: "2,500", excl: "4,500", vip: "8,000", emb: "1,200" },
];

export default function VisaPricingPage() {
  return (
    <>
      <section className="bg-white border-b py-8"><div className="g-container"><h1 className="text-2xl font-bold text-slate-900">💰 ตารางราคาวีซ่าทุกประเทศ</h1><p className="text-slate-500 text-sm mt-1">เปรียบเทียบ 4 แพ็กเกจ (Plus / Advance / Exclusive / VIP)</p></div></section>
      {/* Tier Overview */}
      <section className="g-section bg-slate-50"><div className="g-container"><div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {tiers.map(t => (<div key={t.name} className={`bg-white rounded-2xl border-2 ${t.color} p-5`}>{t.tag && <div className="text-xs font-bold text-primary mb-2">{t.tag}</div>}<h3 className="font-black text-slate-900 flex items-center gap-2">{t.icon} {t.name}</h3><ul className="mt-3 space-y-1">{t.features.map(f => <li key={f} className="text-xs text-slate-600 flex items-start gap-1.5">✓ {f}</li>)}</ul></div>))}
      </div></div></section>
      {/* Price Matrix */}
      <section className="g-section bg-white"><div className="g-container"><div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto">
        <table className="w-full text-sm"><thead className="bg-slate-50 border-b"><tr><th className="text-left px-4 py-3">ประเทศ</th><th className="px-3 py-3 text-center text-slate-500">PLUS</th><th className="px-3 py-3 text-center text-blue-600">ADVANCE</th><th className="px-3 py-3 text-center text-primary font-bold">EXCLUSIVE</th><th className="px-3 py-3 text-center text-amber-600">VIP</th><th className="px-3 py-3 text-center">ค่าสถานทูต</th></tr></thead>
          <tbody className="divide-y divide-slate-50">{prices.map(p => (
            <tr key={p.country} className="hover:bg-slate-50"><td className="px-4 py-3 font-medium">{p.country}</td><td className="px-3 py-3 text-center">฿{p.plus}</td><td className="px-3 py-3 text-center">฿{p.adv}</td><td className="px-3 py-3 text-center font-bold text-primary">฿{p.excl}</td><td className="px-3 py-3 text-center">฿{p.vip}</td><td className="px-3 py-3 text-center text-slate-400">{p.emb}</td></tr>
          ))}</tbody>
        </table>
      </div><p className="text-xs text-slate-400 mt-3">* ราคาต่อท่าน ยังไม่รวมค่าธรรมเนียมสถานทูต ราคาอาจเปลี่ยนแปลงได้</p></div></section>
      <section className="py-8 bg-slate-50"><div className="g-container text-center"><Link href="/visa/apply" className="btn-primary btn-lg">เริ่มสมัครวีซ่า →</Link></div></section>
    </>
  );
}
