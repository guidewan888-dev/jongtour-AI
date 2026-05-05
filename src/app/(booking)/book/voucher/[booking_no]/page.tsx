import React from "react";
import Link from "next/link";
import { Ticket, Calendar, MapPin, Users, Plane, Phone, Download } from "lucide-react";

export default function VoucherPage({ params }: { params: { booking_no: string } }) {
  return (
    <div className="bg-white">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex justify-between items-start mb-6">
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Ticket className="w-6 h-6 text-primary" /> Travel Voucher
          </h1>
          <button className="btn-primary text-sm flex items-center gap-1"><Download className="w-4 h-4" /> ดาวน์โหลด PDF</button>
        </div>

        <div className="g-card overflow-hidden">
          {/* Voucher Header */}
          <div className="bg-gradient-to-r from-primary to-orange-500 text-white p-6">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-2xl font-black">Jongtour</div>
                <div className="text-sm opacity-80 mt-1">Travel Voucher</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium opacity-80">Booking No.</div>
                <div className="text-xl font-bold">{params.booking_no}</div>
              </div>
            </div>
          </div>

          {/* Voucher Body */}
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">โปรแกรมทัวร์</div>
                  <div className="font-semibold text-slate-900">ทัวร์ญี่ปุ่น ไฮไลท์สุดคุ้ม พัก 4 ดาว</div>
                  <div className="text-sm text-slate-500">รหัส: JP-0101 • Wholesale: LETGO</div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span className="text-slate-600">15 - 20 มิ.ย. 2026 (6 วัน 4 คืน)</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Plane className="w-4 h-4 text-primary" />
                  <span className="text-slate-600">Thai Airways TG660 / TG661</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span className="text-slate-600">โตเกียว - ฟูจิ - ฮาโกเน่ - โอซาก้า</span>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">ผู้เดินทาง</div>
                  <div className="flex items-center gap-2 text-sm"><Users className="w-4 h-4 text-primary" /><span>นาย JOHN DOE</span></div>
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">ติดต่อฉุกเฉิน</div>
                  <div className="flex items-center gap-2 text-sm"><Phone className="w-4 h-4 text-primary" /><span>02-xxx-xxxx (24 ชม.)</span></div>
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">หัวหน้าทัวร์</div>
                  <div className="text-sm text-slate-600">จะแจ้งให้ทราบก่อนเดินทาง 1 วัน</div>
                </div>
              </div>
            </div>

            <hr className="border-dashed border-slate-200" />

            <div className="text-center text-xs text-slate-400">
              <p>กรุณาแสดง Voucher นี้ ณ จุดนัดพบ วันเดินทาง</p>
              <p>Jongtour Co., Ltd. • TAT License: xx/xxxxx</p>
            </div>
          </div>
        </div>

        <div className="text-center mt-6">
          <Link href={`/book/status/${params.booking_no}`} className="text-sm text-primary hover:underline">← กลับไปดูสถานะการจอง</Link>
        </div>
      </div>
    </div>
  );
}
