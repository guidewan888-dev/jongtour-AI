import React from "react";
import Link from "next/link";
import { XCircle, RefreshCw, MessageCircle, Phone } from "lucide-react";

export default function BookingFailedPage() {
  return (
    <div className="bg-white">
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-10 h-10 text-red-500" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-3">การจองไม่สำเร็จ</h1>
        <p className="text-slate-500 mb-2 max-w-md mx-auto">เกิดข้อผิดพลาดระหว่างดำเนินการจอง กรุณาลองใหม่อีกครั้ง หรือติดต่อทีมงาน</p>

        <div className="g-card p-6 mt-8 text-left max-w-md mx-auto">
          <h3 className="font-bold text-slate-900 mb-3">อาจเกิดจากสาเหตุดังนี้</h3>
          <ul className="space-y-2 text-sm text-slate-600">
            <li className="flex items-start gap-2"><span className="text-red-400 mt-1">•</span>ที่นั่งเต็มหรือหมดแล้ว</li>
            <li className="flex items-start gap-2"><span className="text-red-400 mt-1">•</span>การชำระเงินไม่สำเร็จ</li>
            <li className="flex items-start gap-2"><span className="text-red-400 mt-1">•</span>ข้อมูลไม่ครบถ้วน</li>
            <li className="flex items-start gap-2"><span className="text-red-400 mt-1">•</span>ระบบขัดข้องชั่วคราว</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
          <Link href="/book" className="btn-primary flex items-center justify-center gap-2"><RefreshCw className="w-4 h-4" /> ลองจองใหม่</Link>
          <Link href="/contact" className="btn-outline flex items-center justify-center gap-2"><MessageCircle className="w-4 h-4" /> ติดต่อทีมขาย</Link>
          <a href="tel:021234567" className="btn-outline flex items-center justify-center gap-2"><Phone className="w-4 h-4" /> โทรหาเรา</a>
        </div>
      </div>
    </div>
  );
}
