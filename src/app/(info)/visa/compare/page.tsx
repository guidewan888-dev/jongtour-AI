import Link from "next/link";
import { ArrowLeftRight } from "lucide-react";

const countries = [
  { flag: "🇯🇵", name: "ญี่ปุ่น", service: "฿1,500", embassy: "ฟรี", days: "5-7", approval: "95%", freeVisa: "15 วัน" },
  { flag: "🇨🇳", name: "จีน", service: "฿2,000", embassy: "฿1,500", days: "7-10", approval: "92%", freeVisa: "—" },
  { flag: "🇪🇺", name: "เชงเก้น", service: "฿3,500", embassy: "€80", days: "10-15", approval: "88%", freeVisa: "—" },
  { flag: "🇬🇧", name: "อังกฤษ", service: "฿4,000", embassy: "£100", days: "15-20", approval: "85%", freeVisa: "—" },
  { flag: "🇺🇸", name: "อเมริกา", service: "฿5,500", embassy: "$185", days: "สัมภาษณ์", approval: "75%", freeVisa: "—" },
  { flag: "🇦🇺", name: "ออสเตรเลีย", service: "฿3,500", embassy: "AUD150", days: "10-15", approval: "90%", freeVisa: "—" },
  { flag: "🇨🇦", name: "แคนาดา", service: "฿4,500", embassy: "CAD100", days: "15-30", approval: "80%", freeVisa: "—" },
  { flag: "🇰🇷", name: "เกาหลี", service: "฿1,200", embassy: "฿1,200", days: "5-7", approval: "93%", freeVisa: "K-ETA" },
];

export default function VisaComparePage() {
  return (
    <>
      <section className="bg-white border-b py-8"><div className="g-container"><h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><ArrowLeftRight className="w-6 h-6 text-primary" /> เปรียบเทียบวีซ่า</h1><p className="text-slate-500 text-sm mt-1">เทียบราคา ระยะเวลา อัตราผ่าน ทุกประเทศ</p></div></section>
      <section className="g-section"><div className="g-container">
        <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto">
          <table className="w-full text-sm"><thead className="bg-slate-50 border-b"><tr><th className="text-left px-4 py-3">ประเทศ</th><th className="px-3 py-3 text-center">ค่าบริการ (เริ่ม)</th><th className="px-3 py-3 text-center">ค่าสถานทูต</th><th className="px-3 py-3 text-center">ระยะเวลา</th><th className="px-3 py-3 text-center">อัตราผ่าน</th><th className="px-3 py-3 text-center">Free Visa</th><th className="px-3 py-3"></th></tr></thead>
            <tbody className="divide-y divide-slate-50">{countries.map(c => (
              <tr key={c.name} className="hover:bg-slate-50"><td className="px-4 py-3 font-medium">{c.flag} {c.name}</td><td className="px-3 py-3 text-center font-bold text-primary">{c.service}</td><td className="px-3 py-3 text-center text-slate-500">{c.embassy}</td><td className="px-3 py-3 text-center">{c.days}</td><td className="px-3 py-3 text-center"><span className={`font-bold ${parseInt(c.approval) >= 90 ? "text-emerald-600" : parseInt(c.approval) >= 80 ? "text-amber-600" : "text-red-600"}`}>{c.approval}</span></td><td className="px-3 py-3 text-center text-slate-400">{c.freeVisa}</td><td className="px-3 py-3"><Link href={`/visa/apply`} className="text-primary text-xs font-bold hover:underline">สมัคร</Link></td></tr>
            ))}</tbody>
          </table>
        </div>
      </div></section>
    </>
  );
}
