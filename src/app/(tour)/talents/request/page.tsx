"use client";
import React from "react";
import Link from "next/link";
import { Suspense } from "react";

function RequestFormInner() {
  return (
    <div className="g-container py-8 max-w-2xl mx-auto space-y-6">
      <div><div className="text-sm text-slate-400 mb-1"><Link href="/talents" className="hover:text-primary">← ไกด์ทั้งหมด</Link></div><h1 className="text-xl font-bold text-slate-900">📩 Request ไกด์</h1></div>
      <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-sm text-amber-800">⚠️ การ request เป็นแบบ <b>best-effort</b> — ไม่รับประกัน ขึ้นอยู่กับตารางไกด์</div>
      <div className="g-card p-6 space-y-4">
        <div className="p-3 bg-primary/5 rounded-xl flex items-center gap-3"><span className="text-3xl">👩‍🦰</span><div><div className="font-bold">พี่ก้อย</div><div className="text-xs text-slate-500">Premium · กรุงเทพ</div></div></div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-xs text-slate-500 font-bold">ประเภท Booking *</label><select className="g-input mt-1 w-full"><option>Tour Booking (ทัวร์กรุ๊ป)</option><option>Private Group Tour</option></select></div>
          <div><label className="text-xs text-slate-500 font-bold">Booking / Tour *</label><select className="g-input mt-1 w-full"><option>B-1234 Tokyo Explorer (15 ก.ค.)</option><option>B-1240 Hokkaido Premium (20 ก.ค.)</option><option>ยังไม่มี booking — สร้างใหม่</option></select></div>
          <div><label className="text-xs text-slate-500 font-bold">วันเดินทาง *</label><input type="date" className="g-input mt-1 w-full"/></div>
          <div><label className="text-xs text-slate-500 font-bold">จำนวนวัน</label><input type="number" className="g-input mt-1 w-full" defaultValue={5}/></div>
          <div><label className="text-xs text-slate-500 font-bold">จำนวนผู้เดินทาง</label><input type="number" className="g-input mt-1 w-full" defaultValue={2}/></div>
          <div><label className="text-xs text-slate-500 font-bold">ภาษาที่ต้องการ</label><select className="g-input mt-1 w-full"><option>ไทย</option><option>อังกฤษ</option><option>จีน</option></select></div>
        </div>
        <div><label className="text-xs text-slate-500 font-bold">ข้อความถึงไกด์ / ความต้องการพิเศษ</label><textarea className="g-input mt-1 w-full h-20" placeholder="เช่น อยากไปร้านอาหาร local, มีผู้สูงอายุร่วมทริป..."/></div>
        <div><label className="text-xs text-slate-500 font-bold">ไกด์สำรอง (ถ้าไม่ว่าง)</label><select className="g-input mt-1 w-full"><option>ให้ admin เลือกให้</option><option>พี่เจมส์ (Elite)</option><option>พี่มิ้นท์ (Premium)</option></select></div>
        <Link href="/talents/request/review" className="btn-primary w-full text-center block">ถัดไป → ตรวจสอบ & ชำระเงิน</Link>
      </div>
    </div>
  );
}

export default function TalentRequestPage() {
  return <Suspense fallback={<div className="p-8 text-center">Loading...</div>}><RequestFormInner/></Suspense>;
}
