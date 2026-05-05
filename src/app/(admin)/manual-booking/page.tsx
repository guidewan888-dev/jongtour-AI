"use client";

import React, { useState } from "react";
import { Search, Plus, User, Calendar, MapPin, Phone, Mail, CreditCard } from "lucide-react";

export default function ManualBookingPage() {
  const [step, setStep] = useState(1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Manual Booking</h1>
        <p className="text-slate-500 text-sm mt-1">สร้างการจองด้วยตนเอง (Walk-in / โทรศัพท์)</p>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-2 text-sm bg-white p-4 rounded-2xl border border-slate-200">
        {["เลือกทัวร์", "ข้อมูลลูกค้า", "รายละเอียดจอง", "ยืนยัน"].map((s, i) => (
          <React.Fragment key={s}>
            <div className={`flex items-center gap-1.5 ${i + 1 === step ? "text-primary font-bold" : i + 1 < step ? "text-emerald-600" : "text-slate-400"}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i + 1 === step ? "bg-primary text-white" : i + 1 < step ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-500"}`}>{i + 1 < step ? "✓" : i + 1}</span>
              <span className="hidden sm:inline">{s}</span>
            </div>
            {i < 3 && <div className={`flex-1 h-0.5 ${i + 1 < step ? "bg-emerald-300" : "bg-slate-200"}`} />}
          </React.Fragment>
        ))}
      </div>

      {step === 1 && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
          <h2 className="font-bold text-slate-900 flex items-center gap-2"><Search className="w-5 h-5 text-primary" /> ค้นหาทัวร์</h2>
          <div className="relative"><Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" /><input className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" placeholder="ค้นหาด้วยชื่อทัวร์ รหัสทัวร์ หรือประเทศ..." /></div>
          <div className="p-8 text-center text-slate-400 text-sm">กรอกคำค้นหาเพื่อค้นหาทัวร์</div>
          <div className="flex justify-end"><button onClick={() => setStep(2)} className="bg-primary hover:bg-primary-600 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors">ถัดไป →</button></div>
        </div>
      )}

      {step === 2 && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
          <h2 className="font-bold text-slate-900 flex items-center gap-2"><User className="w-5 h-5 text-primary" /> ข้อมูลลูกค้า</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="text-sm font-medium text-slate-700 mb-1 block">ชื่อ</label><input className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm" placeholder="First Name" /></div>
            <div><label className="text-sm font-medium text-slate-700 mb-1 block">นามสกุล</label><input className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm" placeholder="Last Name" /></div>
            <div><label className="text-sm font-medium text-slate-700 mb-1 block flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> เบอร์โทร</label><input className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm" placeholder="08x-xxx-xxxx" /></div>
            <div><label className="text-sm font-medium text-slate-700 mb-1 block flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> อีเมล</label><input className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm" placeholder="email@example.com" /></div>
          </div>
          <div className="flex justify-between"><button onClick={() => setStep(1)} className="text-slate-500 hover:text-slate-700 font-medium text-sm">← ย้อนกลับ</button><button onClick={() => setStep(3)} className="bg-primary hover:bg-primary-600 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors">ถัดไป →</button></div>
        </div>
      )}

      {step === 3 && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
          <h2 className="font-bold text-slate-900 flex items-center gap-2"><CreditCard className="w-5 h-5 text-primary" /> รายละเอียดการจอง</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="text-sm font-medium text-slate-700 mb-1 block">จำนวนผู้เดินทาง</label><input type="number" className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm" defaultValue={1} /></div>
            <div><label className="text-sm font-medium text-slate-700 mb-1 block">ช่องทางการขาย</label><select className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm"><option>Walk-in</option><option>โทรศัพท์</option><option>LINE</option><option>Facebook</option></select></div>
            <div className="md:col-span-2"><label className="text-sm font-medium text-slate-700 mb-1 block">หมายเหตุ</label><textarea className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm" rows={3} placeholder="หมายเหตุเพิ่มเติม..." /></div>
          </div>
          <div className="flex justify-between"><button onClick={() => setStep(2)} className="text-slate-500 hover:text-slate-700 font-medium text-sm">← ย้อนกลับ</button><button onClick={() => setStep(4)} className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors">✓ สร้างการจอง</button></div>
        </div>
      )}

      {step === 4 && (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4"><span className="text-3xl">✓</span></div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">สร้างการจองสำเร็จ!</h2>
          <p className="text-slate-500 text-sm mb-6">Booking Ref: BK-MANUAL-001</p>
          <button onClick={() => setStep(1)} className="bg-primary hover:bg-primary-600 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors">สร้างการจองใหม่</button>
        </div>
      )}
    </div>
  );
}
