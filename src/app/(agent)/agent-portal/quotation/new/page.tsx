"use client";

import React, { useState } from "react";
import { Search, User, MapPin, DollarSign, Send, FileText } from "lucide-react";

export default function AgentQuotationNewPage() {
  const [step, setStep] = useState(1);

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <header className="bg-slate-900 text-white py-4 px-6"><div className="max-w-7xl mx-auto text-xl font-black tracking-tighter">JONGTOUR <span className="text-orange-500 font-normal text-lg">AGENT</span></div></header>
      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">สร้างใบเสนอราคา</h1>

        <div className="flex items-center gap-2 text-sm">
          {["เลือกทัวร์", "ข้อมูลลูกค้า", "กำหนดราคา", "สรุป"].map((s, i) => (
            <React.Fragment key={s}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i + 1 === step ? "bg-orange-500 text-white" : i + 1 < step ? "bg-emerald-100 text-emerald-600" : "bg-slate-200 text-slate-500"}`}>{i + 1 < step ? "✓" : i + 1}</span>
              {i < 3 && <div className={`flex-1 h-0.5 ${i + 1 < step ? "bg-emerald-300" : "bg-slate-200"}`} />}
            </React.Fragment>
          ))}
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
          {step === 1 && <>
            <h2 className="font-bold flex items-center gap-2"><Search className="w-5 h-5 text-orange-500" /> เลือกทัวร์</h2>
            <input className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm" placeholder="ค้นหาทัวร์ด้วยชื่อ หรือรหัส..." />
            <div className="p-3 bg-slate-50 rounded-xl hover:bg-slate-100 cursor-pointer">
              <div className="font-medium text-sm">ทัวร์ญี่ปุ่น โตเกียว โอซาก้า 6D4N</div>
              <div className="text-xs text-slate-500">LET&apos;GO · ฿35,900/ท่าน · วันเดินทาง 15 มิ.ย.</div>
            </div>
            <select className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm"><option>เลือกวันเดินทาง</option><option>15 มิ.ย. 2026</option><option>22 มิ.ย. 2026</option></select>
            <input type="number" className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm" placeholder="จำนวนผู้เดินทาง" defaultValue={2} />
            <div className="flex justify-end"><button onClick={() => setStep(2)} className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-2.5 rounded-xl text-sm">ถัดไป →</button></div>
          </>}
          {step === 2 && <>
            <h2 className="font-bold flex items-center gap-2"><User className="w-5 h-5 text-orange-500" /> ข้อมูลลูกค้า</h2>
            <input className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm" placeholder="ชื่อลูกค้า" />
            <input className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm" placeholder="อีเมล" type="email" />
            <input className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm" placeholder="เบอร์โทร" />
            <div className="flex justify-between"><button onClick={() => setStep(1)} className="text-slate-500 text-sm">← ย้อนกลับ</button><button onClick={() => setStep(3)} className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-2.5 rounded-xl text-sm">ถัดไป →</button></div>
          </>}
          {step === 3 && <>
            <h2 className="font-bold flex items-center gap-2"><DollarSign className="w-5 h-5 text-orange-500" /> กำหนดราคาขาย</h2>
            <div className="p-3 bg-emerald-50 rounded-xl text-sm"><span className="text-emerald-600">Agent Net:</span> <span className="font-bold text-emerald-700">฿32,310/ท่าน</span></div>
            <input type="number" className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm" placeholder="ราคาขาย/ท่าน (กำหนดเอง)" defaultValue={36900} />
            <div className="p-3 bg-orange-50 rounded-xl text-sm text-orange-700">Markup: <span className="font-bold">฿4,590/ท่าน</span></div>
            <textarea className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm" rows={2} placeholder="หมายเหตุ (ถึงลูกค้า)" />
            <div className="flex justify-between"><button onClick={() => setStep(2)} className="text-slate-500 text-sm">← ย้อนกลับ</button><button onClick={() => setStep(4)} className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-2.5 rounded-xl text-sm">ถัดไป →</button></div>
          </>}
          {step === 4 && <>
            <h2 className="font-bold flex items-center gap-2"><FileText className="w-5 h-5 text-orange-500" /> สรุปใบเสนอราคา</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between p-2 bg-slate-50 rounded-lg"><span className="text-slate-500">ทัวร์</span><span>ญี่ปุ่น โตเกียว โอซาก้า 6D4N</span></div>
              <div className="flex justify-between p-2 bg-slate-50 rounded-lg"><span className="text-slate-500">วันเดินทาง</span><span>15 มิ.ย. 2026</span></div>
              <div className="flex justify-between p-2 bg-slate-50 rounded-lg"><span className="text-slate-500">จำนวน</span><span>2 ท่าน</span></div>
              <div className="flex justify-between p-2 bg-orange-50 rounded-lg font-bold"><span>ราคารวม</span><span className="text-orange-700">฿73,800</span></div>
            </div>
            <div className="flex gap-3"><button onClick={() => setStep(3)} className="text-slate-500 text-sm">← ย้อนกลับ</button><button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-sm flex items-center justify-center gap-2"><Send className="w-4 h-4" /> สร้างและส่ง Quotation</button></div>
          </>}
        </div>
      </main>
    </div>
  );
}
