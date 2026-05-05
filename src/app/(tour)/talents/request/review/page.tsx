"use client";
import React, { useState } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export default function TalentRequestReviewPage() {
  const [agreed, setAgreed] = useState(false);
  return (
    <div className="g-container py-8 max-w-2xl mx-auto space-y-6">
      <h1 className="text-xl font-bold text-slate-900">📋 ตรวจสอบ & ชำระเงิน</h1>
      <div className="g-card p-5 space-y-3">
        <h3 className="font-bold text-sm">👤 ไกด์ที่ Request</h3>
        <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-xl"><span className="text-3xl">👩‍🦰</span><div><div className="font-bold">พี่ก้อย <span className="text-xs text-amber-600">(Premium)</span></div><div className="text-xs text-slate-500">กรุงเทพ · ไทย/อังกฤษ/จีน</div></div></div>
      </div>
      <div className="g-card p-5 space-y-2 text-sm">
        <h3 className="font-bold">📦 สรุป Booking</h3>
        <div className="flex justify-between"><span className="text-slate-500">Tour</span><span>Tokyo Explorer 5D</span></div>
        <div className="flex justify-between"><span className="text-slate-500">วันเดินทาง</span><span>15-19 ก.ค. 2569</span></div>
        <div className="flex justify-between"><span className="text-slate-500">ผู้เดินทาง</span><span>2 ท่าน</span></div>
        <div className="flex justify-between"><span className="text-slate-500">ภาษา</span><span>ไทย</span></div>
        <div className="flex justify-between border-t pt-2"><span className="text-slate-500">ค่าทัวร์</span><span>฿45,000</span></div>
        <div className="flex justify-between text-primary"><span>Guide Premium (admin กำหนด)</span><span>รอ admin ยืนยัน</span></div>
        <div className="flex justify-between font-bold text-lg border-t pt-2"><span>ยอดชำระ (ทัวร์)</span><span className="text-primary">฿45,000</span></div>
        <div className="text-xs text-slate-400">* ค่า premium ไกด์ (ถ้ามี) จะแจ้งภายหลังโดย admin</div>
      </div>
      <div className="bg-red-50 border border-red-200 p-4 rounded-xl space-y-2">
        <h3 className="font-bold text-sm text-red-800 flex items-center gap-2"><AlertTriangle className="w-4 h-4"/>ข้อตกลงสำคัญ</h3>
        <ul className="text-xs text-red-700 space-y-1 list-disc pl-4">
          <li>การ request ไกด์เป็นแบบ <b>best-effort</b> ไม่รับประกันว่าจะได้ไกด์ท่านที่เลือก</li>
          <li>ขึ้นอยู่กับตารางและความพร้อมของไกด์</li>
          <li>ถ้าไกด์ที่เลือกไม่ว่าง admin จะเสนอทางเลือกให้</li>
          <li>ถ้าไม่สามารถจัดหาได้ จะคืนเงินส่วน premium (ทัวร์ยังยืนยัน)</li>
          <li>ค่า premium ขึ้นกับดุลยพินิจของ admin</li>
        </ul>
        <label className="flex items-center gap-2 pt-2 text-sm"><input type="checkbox" className="rounded" checked={agreed} onChange={e=>setAgreed(e.target.checked)}/><span className="text-red-800 font-bold">ฉันเข้าใจและยอมรับข้อตกลง</span></label>
      </div>
      <Link href="/talents/request/success" className={`btn-primary w-full text-center block ${!agreed?"opacity-50 pointer-events-none":""}`}>💳 ชำระเงิน & ส่ง Request</Link>
    </div>
  );
}
