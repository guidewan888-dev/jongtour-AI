"use client";

import React from "react";
import Link from "next/link";
import { Clock, Upload, CheckCircle, MessageCircle } from "lucide-react";

export default function PaymentPendingPage({ params }: { params: { booking_no: string } }) {
  return (
    <div className="bg-white">
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-amber-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">รอตรวจสอบการชำระเงิน</h1>
          <p className="text-slate-500 mt-1">Booking #{params.booking_no}</p>
        </div>

        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 text-center">
          <p className="text-sm text-amber-800 font-medium">ทีมงานจะตรวจสอบภายใน 1-2 ชั่วโมง (เวลาทำการ)</p>
          <p className="text-xs text-amber-600 mt-1">จันทร์-ศุกร์ 09:00-18:00 / เสาร์ 09:00-15:00</p>
        </div>

        {/* Timeline */}
        <div className="g-card p-6">
          <h3 className="font-bold text-slate-900 mb-4">สถานะ</h3>
          <div className="space-y-4">
            {[
              { label: "สร้างการจอง", done: true },
              { label: "ชำระเงิน / อัพโหลดสลิป", done: true },
              { label: "ทีมงานตรวจสอบ", current: true },
              { label: "ยืนยันการจอง", done: false },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${s.done ? "bg-emerald-100" : s.current ? "bg-amber-100 ring-2 ring-amber-400" : "bg-slate-100"}`}>
                  {s.done ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : s.current ? <Clock className="w-4 h-4 text-amber-600 animate-pulse" /> : <span className="w-2 h-2 bg-slate-300 rounded-full" />}
                </div>
                <span className={`text-sm ${s.current ? "font-bold text-amber-700" : s.done ? "text-slate-700" : "text-slate-400"}`}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Upload Slip */}
        <div className="g-card p-6">
          <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
            <Upload className="w-5 h-5 text-primary" /> ยังไม่ได้แนบสลิป?
          </h3>
          <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:border-primary transition-colors cursor-pointer">
            <Upload className="w-6 h-6 text-slate-300 mx-auto mb-1" />
            <p className="text-sm text-slate-500">คลิกเพื่ออัพโหลดสลิป</p>
            <p className="text-xs text-slate-400">JPG, PNG, PDF (ไม่เกิน 5MB)</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Link href={`/book/status/${params.booking_no}`} className="btn-primary">ดูสถานะการจอง</Link>
          <Link href="/contact" className="btn-outline flex items-center justify-center gap-2"><MessageCircle className="w-4 h-4" /> ติดต่อทีมงาน</Link>
        </div>
      </div>
    </div>
  );
}
