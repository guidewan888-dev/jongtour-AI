"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AlertTriangle, ChevronDown, XCircle } from "lucide-react";

const reasons = [
  "เปลี่ยนแผนการเดินทาง",
  "ราคาสูงเกินไป",
  "พบทัวร์ที่ดีกว่า",
  "ปัญหาสุขภาพ",
  "วีซ่าไม่ผ่าน",
  "อื่น ๆ",
];

export default function CancelBookingPage({ params }: { params: { booking_no: string } }) {
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  return (
    <div className="bg-white">
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">ยกเลิกการจอง</h1>
          <p className="text-slate-500 mt-1">Booking #{params.booking_no}</p>
        </div>

        <div className="p-4 bg-red-50 rounded-2xl border border-red-100 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
          <div className="text-sm text-red-800">
            <p className="font-bold">คำเตือน: การยกเลิกไม่สามารถย้อนกลับได้</p>
            <p className="text-red-600 mt-1">การคืนเงินจะเป็นไปตามนโยบายการยกเลิก</p>
          </div>
        </div>

        {/* Refund Summary */}
        <div className="g-card p-6">
          <h3 className="font-bold text-slate-900 mb-4">สรุปการคืนเงิน</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-slate-500">ยอดชำระทั้งหมด</span><span className="font-medium">฿29,900</span></div>
            <div className="flex justify-between"><span className="text-slate-500">ค่าธรรมเนียมยกเลิก (30%)</span><span className="font-medium text-red-600">-฿8,970</span></div>
            <hr className="border-slate-100 my-2" />
            <div className="flex justify-between font-bold text-lg"><span>ยอดคืนเงิน</span><span className="text-emerald-600">฿20,930</span></div>
          </div>
          <p className="text-xs text-slate-400 mt-3">* คืนเงินภายใน 7-14 วันทำการ ผ่านช่องทางเดียวกับที่ชำระ</p>
        </div>

        {/* Reason */}
        <div className="g-card p-6 space-y-4">
          <h3 className="font-bold text-slate-900">เหตุผลในการยกเลิก</h3>
          <select value={reason} onChange={(e) => setReason(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm bg-white">
            <option value="">— เลือกเหตุผล —</option>
            {reasons.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm" rows={3} placeholder="รายละเอียดเพิ่มเติม (ไม่บังคับ)" />
        </div>

        {/* Confirm */}
        <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-2xl">
          <input type="checkbox" id="confirm" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} className="mt-1 w-4 h-4 accent-red-600" />
          <label htmlFor="confirm" className="text-sm text-slate-700">ข้าพเจ้ายืนยันว่าต้องการยกเลิกการจอง และรับทราบนโยบายการคืนเงินแล้ว</label>
        </div>

        <div className="flex justify-between pt-4">
          <Link href={`/book/status/${params.booking_no}`} className="btn-outline">← กลับ</Link>
          <button disabled={!reason || !confirmed} className="bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-6 py-2.5 rounded-full text-sm transition-colors flex items-center gap-2">
            <XCircle className="w-4 h-4" /> ยืนยันยกเลิก
          </button>
        </div>
      </div>
    </div>
  );
}
