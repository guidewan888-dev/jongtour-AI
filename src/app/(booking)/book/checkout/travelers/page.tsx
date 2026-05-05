"use client";

import React, { useState } from "react";
import Link from "next/link";
import { User, Phone, Mail, FileText, ChevronRight, Plus, Trash2 } from "lucide-react";

interface Traveler {
  id: number;
  prefix: string;
  firstName: string;
  lastName: string;
  passportNo: string;
  phone: string;
  email: string;
}

const emptyTraveler = (id: number): Traveler => ({
  id, prefix: "นาย", firstName: "", lastName: "", passportNo: "", phone: "", email: "",
});

export default function TravelersPage() {
  const [travelers, setTravelers] = useState<Traveler[]>([emptyTraveler(1)]);

  const addTraveler = () => setTravelers((prev) => [...prev, emptyTraveler(prev.length + 1)]);
  const removeTraveler = (id: number) => setTravelers((prev) => prev.filter((t) => t.id !== id));

  return (
    <div className="bg-white">
      {/* Stepper */}
      <div className="bg-slate-50 border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-center gap-2 text-sm">
            {["เลือกทัวร์", "ข้อมูลผู้เดินทาง", "ตรวจสอบ", "ชำระเงิน", "ยืนยัน"].map((s, i) => (
              <React.Fragment key={s}>
                <div className={`flex items-center gap-1.5 ${i === 1 ? "text-primary font-bold" : i < 1 ? "text-emerald-600" : "text-slate-400"}`}>
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === 1 ? "bg-primary text-white" : i < 1 ? "bg-emerald-100 text-emerald-600" : "bg-slate-200 text-slate-500"}`}>{i < 1 ? "✓" : i + 1}</span>
                  <span className="hidden sm:inline">{s}</span>
                </div>
                {i < 4 && <div className={`w-6 h-0.5 ${i < 1 ? "bg-emerald-300" : "bg-slate-200"}`} />}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">ข้อมูลผู้เดินทาง</h1>
          <p className="text-slate-500 mt-1">กรอกข้อมูลตามหนังสือเดินทาง (Passport) ภาษาอังกฤษ</p>
        </div>

        {travelers.map((traveler, idx) => (
          <div key={traveler.id} className="g-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                ผู้เดินทางคนที่ {idx + 1}
              </h3>
              {travelers.length > 1 && (
                <button onClick={() => removeTraveler(traveler.id)} className="text-red-400 hover:text-red-600 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">คำนำหน้า</label>
                <select className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none">
                  <option>นาย</option><option>นาง</option><option>นางสาว</option><option>เด็กชาย</option><option>เด็กหญิง</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">ชื่อ (EN)</label>
                <input type="text" placeholder="First Name" className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">นามสกุล (EN)</label>
                <input type="text" placeholder="Last Name" className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block flex items-center gap-1"><FileText className="w-3.5 h-3.5" /> Passport No.</label>
                <input type="text" placeholder="AB1234567" className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> เบอร์โทร</label>
                <input type="tel" placeholder="08x-xxx-xxxx" className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> อีเมล</label>
                <input type="email" placeholder="email@example.com" className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
              </div>
            </div>
          </div>
        ))}

        <button onClick={addTraveler} className="w-full border-2 border-dashed border-slate-200 rounded-2xl py-4 text-slate-500 hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2 font-medium">
          <Plus className="w-5 h-5" /> เพิ่มผู้เดินทาง
        </button>

        <div className="flex justify-between items-center pt-4">
          <Link href="/search" className="btn-outline">← ย้อนกลับ</Link>
          <Link href="/book/checkout/review" className="btn-primary">ตรวจสอบข้อมูล →</Link>
        </div>
      </div>
    </div>
  );
}
