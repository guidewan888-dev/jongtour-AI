import Link from "next/link";
import { FileText, CheckCircle, Clock, Shield } from "lucide-react";

export default function TranslationPage() {
  return (<>
    <section className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-12"><div className="g-container"><div className="text-3xl mb-2">📝</div><h1 className="text-3xl font-bold">บริการแปลเอกสาร</h1><p className="text-blue-100 mt-2">รับแปลเอกสารราชการ ไทย-อังกฤษ พร้อมรับรองคำแปล ใช้ยื่นวีซ่าทุกสถานทูต</p></div></section>
    <section className="g-section bg-white"><div className="g-container grid md:grid-cols-2 gap-8">
      <div><h2 className="text-xl font-bold mb-4">เอกสารที่รับแปล</h2><div className="space-y-2">{["สูติบัตร", "ทะเบียนบ้าน", "บัตรประชาชน", "ทะเบียนสมรส / หย่า", "หนังสือรับรองการทำงาน", "ใบเปลี่ยนชื่อ-สกุล", "Statement (ต้นฉบับอังกฤษ)", "ใบรับรองการศึกษา", "หนังสือจดทะเบียนบริษัท"].map(d => <div key={d} className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl text-sm"><CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />{d}</div>)}</div></div>
      <div className="space-y-4"><div className="g-card p-6"><h3 className="font-bold mb-3">💰 ราคา</h3><div className="text-3xl font-black text-primary">฿800<span className="text-sm text-slate-400 font-normal">/ฉบับ</span></div><p className="text-sm text-slate-500 mt-1">พร้อมรับรองคำแปลโดยนักแปลสาบาน</p></div><div className="g-card p-6"><h3 className="font-bold mb-3">⏱️ ระยะเวลา</h3><div className="text-xl font-bold">1-2 วันทำการ</div><p className="text-sm text-slate-500 mt-1">เร่งด่วน (ภายในวัน) +฿300/ฉบับ</p></div>
        <Link href="/visa/apply" className="btn-primary block text-center">สั่งแปลเอกสาร →</Link></div>
    </div></section>
  </>);
}
