import React from "react";
import Link from "next/link";
import { MapPin, Globe, Award, Users, Clock, CheckCircle, ArrowRight } from "lucide-react";

export default function CareerGuidesPage() {
  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-emerald-600 to-teal-500 rounded-3xl p-8 text-white">
        <div className="text-4xl mb-3">🧭</div>
        <h1 className="text-3xl font-bold">ร่วมเป็นไกด์กับ Jongtour</h1>
        <p className="text-emerald-100 mt-2 max-w-xl">เปิดรับไกด์มืออาชีพ ที่รักการเดินทางและอยากส่งมอบประสบการณ์ดี ๆ ให้กับลูกทัวร์</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="g-card p-6">
          <h3 className="font-bold text-slate-900 mb-3">คุณสมบัติที่ต้องการ</h3>
          <ul className="space-y-2 text-sm text-slate-600">
            {["มีใบอนุญาตไกด์ (TAT License)", "มีประสบการณ์นำเที่ยวต่างประเทศ", "สื่อสารภาษาอังกฤษได้ (หรือภาษาอื่น)", "สุขภาพแข็งแรง เดินทางได้", "มีใจรักงานบริการ"].map(q => (
              <li key={q} className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" /> {q}</li>
            ))}
          </ul>
        </div>
        <div className="g-card p-6">
          <h3 className="font-bold text-slate-900 mb-3">เอกสารที่ต้องใช้</h3>
          <ul className="space-y-2 text-sm text-slate-600">
            {["ใบอนุญาตไกด์", "สำเนาบัตรประชาชน", "สำเนาพาสปอร์ต", "Resume/CV", "รูปถ่ายไม่เกิน 6 เดือน"].map(d => (
              <li key={d} className="flex items-start gap-2"><span className="text-emerald-400 mt-1">📄</span> {d}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="g-card p-6">
        <h3 className="font-bold text-slate-900 mb-4">ขั้นตอนการสมัคร</h3>
        <div className="flex flex-col md:flex-row gap-4">
          {["กรอกใบสมัคร", "ส่งเอกสาร", "สัมภาษณ์", "ทดลองงาน", "เริ่มงาน"].map((s, i) => (
            <div key={s} className="flex-1 flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-sm font-bold shrink-0">{i + 1}</div>
              <span className="text-sm">{s}</span>
              {i < 4 && <ArrowRight className="w-4 h-4 text-slate-300 hidden md:block" />}
            </div>
          ))}
        </div>
      </div>

      <div className="text-center">
        <Link href="/careers/apply?position=guide" className="btn-primary btn-lg">สมัครไกด์เลย →</Link>
      </div>
    </div>
  );
}
