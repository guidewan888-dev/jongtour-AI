import Link from "next/link";
import { Shield, CheckCircle, AlertTriangle } from "lucide-react";

export default function InsurancePage() {
  return (<>
    <section className="bg-gradient-to-r from-emerald-600 to-teal-500 text-white py-12"><div className="g-container"><div className="text-3xl mb-2">🛡️</div><h1 className="text-3xl font-bold">ประกันเดินทางยื่นวีซ่า</h1><p className="text-emerald-100 mt-2">ประกันเดินทางครอบคลุมตามเงื่อนไขสถานทูต พร้อมใบเสร็จยื่นวีซ่าทันที</p></div></section>
    <section className="g-section bg-white"><div className="g-container">
      <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-3 mb-6"><AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" /><p className="text-sm text-amber-800"><span className="font-bold">บังคับสำหรับ Schengen:</span> ต้องมีประกันวงเงินไม่ต่ำกว่า 30,000 EUR ครอบคลุมตลอดการเดินทาง</p></div>
      <div className="grid md:grid-cols-3 gap-4">
        {[{ name: "Basic", price: "฿1,200", cover: "1 ล้านบาท", days: "1-15 วัน" }, { name: "Standard", price: "฿1,800", cover: "2 ล้านบาท", days: "1-30 วัน" }, { name: "Premium", price: "฿3,000", cover: "5 ล้านบาท", days: "1-90 วัน" }].map(p => (
          <div key={p.name} className="g-card p-6 text-center"><h3 className="font-bold text-lg">{p.name}</h3><div className="text-2xl font-black text-primary mt-2">{p.price}</div><div className="text-sm text-slate-500 mt-1">วงเงิน {p.cover}</div><div className="text-xs text-slate-400">{p.days}</div><Link href="/visa/apply" className="btn-primary mt-4 block">เลือก</Link></div>
        ))}
      </div>
    </div></section>
  </>);
}
