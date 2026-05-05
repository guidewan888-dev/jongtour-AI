"use client";

import React, { useState } from "react";
import { Building, User, Phone, Mail, Upload, FileText, CheckCircle } from "lucide-react";

export default function AgentRegisterPage() {
  const [step, setStep] = useState(1);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-xl">
        <div className="text-center mb-8">
          <div className="text-2xl font-black tracking-tighter">JONGTOUR <span className="text-orange-500 font-normal">AGENT</span></div>
          <p className="text-slate-500 mt-2">สมัครเป็นตัวแทนจำหน่าย</p>
        </div>

        {/* Stepper */}
        <div className="flex items-center gap-2 text-sm mb-8">
          {["ข้อมูลบริษัท", "ผู้ติดต่อ", "เอกสาร"].map((s, i) => (
            <React.Fragment key={s}>
              <div className={`flex items-center gap-1.5 ${i + 1 === step ? "text-orange-600 font-bold" : i + 1 < step ? "text-emerald-600" : "text-slate-400"}`}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i + 1 === step ? "bg-orange-500 text-white" : i + 1 < step ? "bg-emerald-100 text-emerald-600" : "bg-slate-200"}`}>{i + 1 < step ? "✓" : i + 1}</span>
                <span className="hidden sm:inline">{s}</span>
              </div>
              {i < 2 && <div className={`flex-1 h-0.5 ${i + 1 < step ? "bg-emerald-300" : "bg-slate-200"}`} />}
            </React.Fragment>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          {step === 1 && <>
            <h2 className="font-bold text-slate-900 flex items-center gap-2"><Building className="w-5 h-5 text-orange-500" /> ข้อมูลบริษัท</h2>
            <input className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm" placeholder="ชื่อบริษัท / ร้านค้า" />
            <input className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm" placeholder="เลขทะเบียนนิติบุคคล / TAX ID" />
            <textarea className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm" rows={2} placeholder="ที่อยู่" />
            <input className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm" placeholder="เลขที่ใบอนุญาตนำเที่ยว (ถ้ามี)" />
            <div className="flex justify-end"><button onClick={() => setStep(2)} className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-2.5 rounded-xl text-sm">ถัดไป →</button></div>
          </>}

          {step === 2 && <>
            <h2 className="font-bold text-slate-900 flex items-center gap-2"><User className="w-5 h-5 text-orange-500" /> ผู้ติดต่อ</h2>
            <div className="grid grid-cols-2 gap-4">
              <input className="border border-slate-200 rounded-xl px-4 py-3 text-sm" placeholder="ชื่อ" />
              <input className="border border-slate-200 rounded-xl px-4 py-3 text-sm" placeholder="นามสกุล" />
            </div>
            <input className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm" placeholder="อีเมล" type="email" />
            <input className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm" placeholder="เบอร์โทร" />
            <input className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm" placeholder="ตั้งรหัสผ่าน" type="password" />
            <div className="flex justify-between"><button onClick={() => setStep(1)} className="text-slate-500 text-sm">← ย้อนกลับ</button><button onClick={() => setStep(3)} className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-2.5 rounded-xl text-sm">ถัดไป →</button></div>
          </>}

          {step === 3 && <>
            <h2 className="font-bold text-slate-900 flex items-center gap-2"><Upload className="w-5 h-5 text-orange-500" /> อัพโหลดเอกสาร</h2>
            {["ใบจดทะเบียนบริษัท", "ใบอนุญาตนำเที่ยว (TTAA)"].map((d) => (
              <div key={d} className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:border-orange-300 cursor-pointer transition-colors">
                <FileText className="w-5 h-5 text-slate-300 mx-auto mb-1" />
                <p className="text-sm text-slate-500">{d}</p>
                <p className="text-xs text-slate-400">PDF, JPG (ไม่เกิน 5MB)</p>
              </div>
            ))}
            <label className="flex items-start gap-2 text-sm text-slate-700"><input type="checkbox" className="mt-1 accent-orange-500" /> ยอมรับเงื่อนไขการเป็นตัวแทน</label>
            <div className="flex justify-between"><button onClick={() => setStep(2)} className="text-slate-500 text-sm">← ย้อนกลับ</button><button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm flex items-center gap-2"><CheckCircle className="w-4 h-4" /> ส่งใบสมัคร</button></div>
          </>}
        </div>

        <p className="text-center text-sm text-slate-500 mt-6">มีบัญชีแล้ว? <a href="/agent-portal/login" className="text-orange-600 font-bold hover:underline">เข้าสู่ระบบ</a></p>
      </div>
    </div>
  );
}
