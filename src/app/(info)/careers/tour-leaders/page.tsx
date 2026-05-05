import React from "react";
import Link from "next/link";
import { MapPin, Shield, Award, Users, CheckCircle, ArrowRight } from "lucide-react";

export default function CareerTourLeadersPage() {
  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-500 rounded-3xl p-8 text-white">
        <div className="text-4xl mb-3">👨‍💼</div>
        <h1 className="text-3xl font-bold">ร่วมเป็นหัวหน้าทัวร์กับ Jongtour</h1>
        <p className="text-blue-100 mt-2 max-w-xl">เปิดรับหัวหน้าทัวร์ที่มีประสบการณ์ในการบริหารทริปและดูแลทีมไกด์</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="g-card p-6">
          <h3 className="font-bold text-slate-900 mb-3">คุณสมบัติที่ต้องการ</h3>
          <ul className="space-y-2 text-sm text-slate-600">
            {["ประสบการณ์นำทัวร์ 3 ปีขึ้นไป", "สามารถบริหารจัดการทริปได้ดี", "แก้ปัญหาเฉพาะหน้าได้", "มีทักษะ leadership", "ภาษาอังกฤษดี (ภาษาอื่นจะพิจารณาเป็นพิเศษ)"].map(q => (
              <li key={q} className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" /> {q}</li>
            ))}
          </ul>
        </div>
        <div className="g-card p-6">
          <h3 className="font-bold text-slate-900 mb-3">สวัสดิการ</h3>
          <ul className="space-y-2 text-sm text-slate-600">
            {["ค่าตอบแทนสูงกว่าเฉลี่ย", "ค่าเบี้ยเลี้ยงรายวัน", "ประกันสุขภาพ", "โบนัสตามผลงาน", "ทริปฟรีปีละ 2 ครั้ง"].map(b => (
              <li key={b} className="flex items-start gap-2"><span className="text-blue-400 mt-1">✦</span> {b}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="g-card p-6">
        <h3 className="font-bold text-slate-900 mb-4">ขั้นตอนการสมัคร</h3>
        <div className="flex flex-col md:flex-row gap-4">
          {["กรอกใบสมัคร", "ส่งเอกสาร", "สัมภาษณ์", "ทดลองนำทัวร์", "เริ่มงาน"].map((s, i) => (
            <div key={s} className="flex-1 flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-bold shrink-0">{i + 1}</div>
              <span className="text-sm">{s}</span>
              {i < 4 && <ArrowRight className="w-4 h-4 text-slate-300 hidden md:block" />}
            </div>
          ))}
        </div>
      </div>

      <div className="text-center">
        <Link href="/careers/apply?position=tour-leader" className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3 rounded-full text-sm transition-colors">สมัครหัวหน้าทัวร์เลย →</Link>
      </div>
    </div>
  );
}
