"use client";

import React from "react";
import Link from "next/link";
import { QrCode, Clock, Upload, Copy, CheckCircle } from "lucide-react";

export default function PaymentDetailPage({ params }: { params: { booking_no: string } }) {
  return (
    <div className="bg-white">
      <div className="bg-amber-50 border-b border-amber-200">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-2 text-sm text-amber-800">
          <Clock className="w-4 h-4" />
          <span className="font-medium">กรุณาชำระเงินภายใน 24 ชั่วโมง</span>
          <span className="ml-auto font-bold text-amber-900">เหลือเวลา 23:59:45</span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900">ชำระเงิน</h1>
          <p className="text-slate-500 mt-1">Booking #{params.booking_no}</p>
        </div>

        {/* QR Code */}
        <div className="g-card p-8 text-center">
          <div className="w-48 h-48 bg-slate-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
            <QrCode className="w-24 h-24 text-slate-300" />
          </div>
          <p className="text-sm text-slate-500 mb-2">สแกน QR Code ด้วยแอปธนาคาร</p>
          <div className="text-3xl font-bold text-primary mb-1">฿29,900.00</div>
          <p className="text-sm text-slate-400">PromptPay: Jongtour Co., Ltd.</p>
        </div>

        {/* Bank Transfer */}
        <div className="g-card p-6">
          <h3 className="font-bold text-slate-900 mb-4">หรือโอนเงินผ่านบัญชีธนาคาร</h3>
          <div className="space-y-3">
            {[
              { bank: "กสิกรไทย (KBANK)", account: "xxx-x-xxxxx-x", name: "บจก. จองทัวร์" },
              { bank: "กรุงเทพ (BBL)", account: "xxx-x-xxxxx-x", name: "บจก. จองทัวร์" },
            ].map((b) => (
              <div key={b.bank} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <div>
                  <div className="font-medium text-sm text-slate-900">{b.bank}</div>
                  <div className="text-xs text-slate-500">{b.account} • {b.name}</div>
                </div>
                <button className="text-primary hover:bg-primary-50 p-2 rounded-lg transition-colors"><Copy className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
        </div>

        {/* Upload Slip */}
        <div className="g-card p-6">
          <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Upload className="w-5 h-5 text-primary" /> แนบหลักฐานการชำระเงิน
          </h3>
          <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center hover:border-primary transition-colors cursor-pointer">
            <Upload className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-500">คลิกหรือลากไฟล์สลิปมาวางที่นี่</p>
            <p className="text-xs text-slate-400 mt-1">รองรับ JPG, PNG, PDF (ไม่เกิน 5MB)</p>
          </div>
        </div>

        <div className="flex justify-center pt-4">
          <Link href={`/book/confirmation/${params.booking_no}`} className="btn-primary flex items-center gap-2">
            <CheckCircle className="w-5 h-5" /> ยืนยันการชำระเงิน
          </Link>
        </div>
      </div>
    </div>
  );
}
