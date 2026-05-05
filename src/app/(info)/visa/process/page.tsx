import Link from "next/link";
import { Search, FileText, CreditCard, CheckCircle, Clock, Shield, Phone } from "lucide-react";

const steps = [
  { icon: <Search className="w-6 h-6 text-primary" />, title: "1. เลือกประเทศ & แพ็กเกจ", desc: "เลือกประเทศปลายทาง ประเภทวีซ่า และแพ็กเกจที่เหมาะกับคุณ (Plus/Advance/Exclusive/VIP)", time: "5 นาที" },
  { icon: <FileText className="w-6 h-6 text-blue-500" />, title: "2. กรอกข้อมูล & อัพโหลดเอกสาร", desc: "กรอกข้อมูลผู้สมัคร อัพโหลดเอกสาร AI ช่วยตรวจสอบความถูกต้องให้ทันที", time: "15-30 นาที" },
  { icon: <CreditCard className="w-6 h-6 text-purple-500" />, title: "3. ชำระค่าบริการ", desc: "ชำระผ่านบัตรเครดิต โอนเงิน หรือ PromptPay มัดจำ 50% ได้", time: "5 นาที" },
  { icon: <Shield className="w-6 h-6 text-emerald-500" />, title: "4. ทีมงานตรวจสอบเอกสาร", desc: "ผู้เชี่ยวชาญตรวจเอกสารครบ แปลเอกสาร เตรียมฟอร์ม กรอกแบบฟอร์มให้", time: "1-3 วัน" },
  { icon: <Clock className="w-6 h-6 text-amber-500" />, title: "5. นัดหมาย & ยื่นวีซ่า", desc: "นัดหมายสถานทูต/VFS ยื่นเอกสารให้ (หรือแนะนำลูกค้ายื่นเอง)", time: "1-2 วัน" },
  { icon: <CheckCircle className="w-6 h-6 text-emerald-600" />, title: "6. รับผลวีซ่า", desc: "แจ้งผลวีซ่าทันทีผ่านแอป/LINE/อีเมล ส่งพาสปอร์ตคืนทาง EMS", time: "5-30 วัน" },
];

export default function VisaProcessPage() {
  return (
    <>
      <section className="bg-white border-b py-8"><div className="g-container"><h1 className="text-2xl font-bold text-slate-900">📋 ขั้นตอนการทำวีซ่ากับ Jongtour</h1><p className="text-slate-500 text-sm mt-1">ง่าย สะดวก ดูแลทุกขั้นตอน</p></div></section>
      <section className="g-section bg-white"><div className="g-container-narrow space-y-0">
        {steps.map((s, i) => (
          <div key={s.title} className="flex gap-4 pb-8">
            <div className="flex flex-col items-center"><div className="w-12 h-12 bg-white border-2 border-slate-200 rounded-2xl flex items-center justify-center shrink-0">{s.icon}</div>{i < steps.length - 1 && <div className="w-0.5 flex-1 bg-slate-200 mt-2" />}</div>
            <div className="pt-2"><h3 className="font-bold text-slate-900">{s.title}</h3><p className="text-sm text-slate-500 mt-1">{s.desc}</p><span className="inline-block mt-2 text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">⏱️ {s.time}</span></div>
          </div>
        ))}
      </div></section>
      <section className="py-10 bg-slate-50"><div className="g-container text-center"><Link href="/visa/apply" className="btn-primary btn-lg">เริ่มสมัครเลย →</Link><p className="text-sm text-slate-500 mt-3">หรือ <a href="tel:021234567" className="text-primary font-medium">โทรปรึกษาฟรี</a></p></div></section>
    </>
  );
}
