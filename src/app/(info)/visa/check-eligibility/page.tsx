"use client";
import React, { useState } from "react";
import Link from "next/link";
import { CheckCircle, XCircle, ArrowRight, MessageCircle } from "lucide-react";

const questions = [
  { q: "คุณถือหนังสือเดินทาง (Passport) ไทยที่ยังไม่หมดอายุใช่ไหม?", key: "passport" },
  { q: "คุณต้องการไปประเทศอะไร?", key: "country", type: "select", options: ["ญี่ปุ่น", "อเมริกา", "อังกฤษ", "เชงเก้น (ยุโรป)", "จีน", "ออสเตรเลีย", "แคนาดา", "อื่นๆ"] },
  { q: "จุดประสงค์การเดินทาง?", key: "purpose", type: "select", options: ["ท่องเที่ยว", "เยี่ยมเยียน", "ธุรกิจ", "เรียน", "ทำงาน"] },
  { q: "คุณเคยถูกปฏิเสธวีซ่าประเทศนี้มาก่อนหรือไม่?", key: "rejected" },
  { q: "คุณมีหลักฐานการเงิน (Statement) ย้อนหลัง 6 เดือนหรือไม่?", key: "finance" },
];

export default function CheckEligibilityPage() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const done = step >= questions.length;

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12">
      <div className="max-w-lg w-full px-4">
        <h1 className="text-2xl font-bold text-slate-900 text-center mb-2">🤖 AI ตรวจสิทธิ์วีซ่า</h1>
        <p className="text-slate-500 text-center text-sm mb-8">ตอบ 5 คำถาม รู้ผลทันที</p>
        {!done ? (
          <div className="g-card p-6 space-y-4">
            <div className="text-xs text-slate-400">คำถาม {step + 1}/{questions.length}</div>
            <div className="w-full bg-slate-100 rounded-full h-2"><div className="bg-primary h-full rounded-full transition-all" style={{ width: `${((step + 1) / questions.length) * 100}%` }} /></div>
            <h2 className="font-bold text-slate-900">{questions[step].q}</h2>
            {questions[step].type === "select" ? (
              <div className="space-y-2">{questions[step].options?.map(o => (<button key={o} onClick={() => { setAnswers({ ...answers, [questions[step].key]: o }); setStep(step + 1); }} className="w-full text-left p-3 bg-slate-50 hover:bg-primary-50 hover:border-primary border border-slate-200 rounded-xl text-sm transition-colors">{o}</button>))}</div>
            ) : (
              <div className="flex gap-3">
                <button onClick={() => { setAnswers({ ...answers, [questions[step].key]: "yes" }); setStep(step + 1); }} className="flex-1 p-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-sm font-bold text-emerald-700">✓ ใช่</button>
                <button onClick={() => { setAnswers({ ...answers, [questions[step].key]: "no" }); setStep(step + 1); }} className="flex-1 p-3 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl text-sm font-bold text-red-700">✗ ไม่</button>
              </div>
            )}
          </div>
        ) : (
          <div className="g-card p-6 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto"><CheckCircle className="w-8 h-8 text-emerald-600" /></div>
            <h2 className="font-bold text-xl text-slate-900">คุณมีสิทธิ์สมัครวีซ่าได้!</h2>
            <p className="text-sm text-slate-500">จากข้อมูลเบื้องต้น คุณสามารถสมัครวีซ่า <span className="font-bold text-slate-900">{answers.country || "ประเทศที่เลือก"}</span> ประเภท <span className="font-bold">{answers.purpose}</span> ได้</p>
            {answers.rejected === "yes" && <div className="p-3 bg-amber-50 rounded-xl text-sm text-amber-700">⚠️ เคยถูกปฏิเสธ — แนะนำเลือก tier EXCLUSIVE/VIP เพื่อเพิ่มโอกาส</div>}
            <div className="flex gap-3 justify-center pt-2">
              <Link href="/visa/apply" className="btn-primary">เริ่มสมัคร →</Link>
              <Link href="/contact" className="btn-outline flex items-center gap-2"><MessageCircle className="w-4 h-4" /> ปรึกษาเพิ่ม</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
