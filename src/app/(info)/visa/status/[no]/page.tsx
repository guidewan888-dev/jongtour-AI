"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Shield, CheckCircle, Clock, Phone, FileText, MessageCircle } from "lucide-react";

const statusSteps = [
  { key: 'SUBMITTED', label: 'ส่งคำขอ' }, { key: 'UNDER_REVIEW', label: 'ตรวจเอกสาร' },
  { key: 'DOCUMENTS_REQUIRED', label: 'รอเอกสารเพิ่ม' }, { key: 'READY', label: 'พร้อมยื่น' },
  { key: 'EMBASSY', label: 'ยื่นสถานทูต' }, { key: 'APPOINTMENT', label: 'นัดสัมภาษณ์' },
  { key: 'RESULT', label: 'ได้ผล' }, { key: 'APPROVED', label: 'อนุมัติ' }, { key: 'COMPLETED', label: 'เสร็จสิ้น' },
];

export default function VisaPublicTrackingPage({ params }: { params: { no: string } }) {
  const [verified, setVerified] = useState(false);
  const [email, setEmail] = useState("");
  const currentIdx = 1; // mock: UNDER_REVIEW

  if (!verified) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center py-12">
        <div className="max-w-sm w-full px-4">
          <div className="g-card p-6 space-y-4 text-center">
            <Shield className="w-12 h-12 text-primary mx-auto" />
            <h1 className="text-xl font-bold text-slate-900">ยืนยันตัวตน</h1>
            <p className="text-sm text-slate-500">กรุณากรอกอีเมลที่ใช้สมัคร เพื่อดูสถานะ</p>
            <input value={email} onChange={e => setEmail(e.target.value)} type="email" className="g-input w-full" placeholder="อีเมลของคุณ" />
            <button onClick={() => setVerified(true)} className="btn-primary w-full" disabled={!email}>ยืนยัน</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="g-container py-8 max-w-3xl mx-auto space-y-6">
      <div><div className="text-sm text-slate-400 mb-1"><Link href="/visa" className="hover:text-primary">← วีซ่า</Link></div>
        <h1 className="text-2xl font-bold text-slate-900">ติดตามสถานะ: {params.no}</h1>
        <p className="text-sm text-slate-500 mt-1">🇺🇸 อเมริกา · B1/B2 · EXCLUSIVE · 2 ท่าน</p>
      </div>

      {/* 9-step timeline */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <h3 className="font-bold text-sm mb-4">📋 สถานะ</h3>
        <div className="space-y-0">
          {statusSteps.map((s, i) => {
            const done = i <= currentIdx;
            const active = i === currentIdx;
            return (
              <div key={s.key} className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${done ? 'bg-primary text-white' : 'bg-slate-100 text-slate-400'} ${active ? 'ring-4 ring-primary/20' : ''}`}>{done ? '✓' : i + 1}</div>
                  {i < statusSteps.length - 1 && <div className={`w-0.5 h-6 ${i < currentIdx ? 'bg-primary' : 'bg-slate-200'}`} />}
                </div>
                <div className="pt-1"><span className={`text-sm ${done ? 'font-bold text-slate-900' : 'text-slate-400'}`}>{s.label}</span>{active && <span className="ml-2 text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full">ปัจจุบัน</span>}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Documents */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <h3 className="font-bold text-sm mb-3">📁 เอกสาร</h3>
        <div className="space-y-1.5">
          {[{ name: "พาสปอร์ต", ok: true }, { name: "รูปถ่าย", ok: true }, { name: "Statement", ok: false }, { name: "หนังสือรับรอง", ok: true }].map(d => (
            <div key={d.name} className="flex items-center gap-2 text-sm">{d.ok ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <Clock className="w-4 h-4 text-amber-500" />}{d.name}{!d.ok && <span className="text-xs text-amber-600">รอส่ง</span>}</div>
          ))}
        </div>
      </div>

      {/* Payment */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <h3 className="font-bold text-sm mb-2">💳 การชำระเงิน</h3>
        <div className="flex justify-between text-sm"><span>ยอดรวม</span><span className="font-bold text-primary">฿30,121</span></div>
        <div className="flex justify-between text-sm"><span>สถานะ</span><span className="text-emerald-600 font-bold">✓ ชำระแล้ว</span></div>
      </div>

      <div className="flex gap-3">
        <a href="tel:021234567" className="btn-outline flex items-center gap-2"><Phone className="w-4 h-4" /> ติดต่อเจ้าหน้าที่</a>
        <Link href="/visa" className="btn-outline">กลับหน้าวีซ่า</Link>
      </div>
    </div>
  );
}
