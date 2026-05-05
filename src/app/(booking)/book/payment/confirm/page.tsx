"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle, Download, MessageSquare, ArrowRight, Sparkles } from "lucide-react";

export default function PaymentConfirmPage() {
  const [show, setShow] = useState(false);
  useEffect(() => { setTimeout(() => setShow(true), 100); }, []);

  const booking = { ref: "BK-2569050001", tour: "Tokyo Explorer 5D", date: "15 ก.ค. 2569", pax: 2, total: "฿29,900", method: "PromptPay QR" };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center p-4">
      <div className={`max-w-md w-full transition-all duration-700 ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-scale-in">
            <CheckCircle className="w-10 h-10 text-emerald-500" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">ชำระเงินสำเร็จ! 🎉</h1>
          <p className="text-sm text-slate-500 mt-1">ขอบคุณที่จองทัวร์กับ Jongtour</p>
        </div>

        <div className="g-card p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="font-bold text-sm">รายละเอียดการจอง</span>
          </div>
          {[
            ["Booking Ref", booking.ref],
            ["ทัวร์", booking.tour],
            ["วันเดินทาง", booking.date],
            ["จำนวน", `${booking.pax} ท่าน`],
            ["ยอดชำระ", booking.total],
            ["ช่องทาง", booking.method],
          ].map(([l, v]) => (
            <div key={l} className="flex items-center justify-between text-sm">
              <span className="text-slate-400">{l}</span>
              <span className="font-bold text-slate-900">{v}</span>
            </div>
          ))}
          <div className="pt-3 border-t border-slate-100 flex items-center gap-2 text-xs text-emerald-600 font-bold">
            <CheckCircle className="w-4 h-4" />
            อีเมลยืนยันถูกส่งไปที่ example@email.com แล้ว
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-4">
          <button className="btn-outline text-xs flex items-center gap-1 justify-center">
            <Download className="w-3 h-3" /> ดาวน์โหลด Voucher
          </button>
          <Link href="/account/bookings" className="btn-primary text-xs flex items-center gap-1 justify-center">
            ดูการจอง <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="mt-4 text-center">
          <a href="https://line.me/ti/p/@jongtour" className="inline-flex items-center gap-1.5 text-xs text-emerald-600 hover:text-emerald-700 transition-colors">
            <MessageSquare className="w-3.5 h-3.5" /> สอบถามเพิ่มเติมผ่าน LINE @jongtour
          </a>
        </div>
      </div>
    </div>
  );
}
