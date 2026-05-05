import React from "react";
import Link from "next/link";
import { CheckCircle, Clock, CreditCard, FileText, Plane, Package } from "lucide-react";

const timeline = [
  { icon: CreditCard, label: "ชำระเงินแล้ว", time: "15 พ.ค. 2026, 14:30", status: "done" },
  { icon: CheckCircle, label: "ทีมงานตรวจสอบแล้ว", time: "15 พ.ค. 2026, 16:00", status: "done" },
  { icon: FileText, label: "รอเอกสารพาสปอร์ต", time: "กรุณาอัพโหลดก่อน 1 มิ.ย.", status: "current" },
  { icon: Package, label: "ออก Voucher", time: "จะได้รับก่อนเดินทาง 3 วัน", status: "pending" },
  { icon: Plane, label: "วันเดินทาง", time: "15 มิ.ย. 2026", status: "pending" },
];

export default function BookingStatusPage({ params }: { params: { booking_no: string } }) {
  return (
    <div className="bg-white">
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">สถานะการจอง</h1>
          <p className="text-slate-500 mt-1">Booking #{params.booking_no}</p>
        </div>

        <div className="g-card p-6">
          <div className="flex items-center gap-3 mb-6 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
            <CheckCircle className="w-6 h-6 text-emerald-600 shrink-0" />
            <div>
              <div className="font-bold text-emerald-800">ยืนยันการจองแล้ว</div>
              <div className="text-sm text-emerald-600">กำลังดำเนินการเตรียมเอกสาร</div>
            </div>
          </div>

          <div className="space-y-0">
            {timeline.map((item, idx) => (
              <div key={item.label} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${item.status === "done" ? "bg-emerald-100" : item.status === "current" ? "bg-primary-100 ring-2 ring-primary" : "bg-slate-100"}`}>
                    <item.icon className={`w-4 h-4 ${item.status === "done" ? "text-emerald-600" : item.status === "current" ? "text-primary" : "text-slate-400"}`} />
                  </div>
                  {idx < timeline.length - 1 && <div className={`w-0.5 h-12 ${item.status === "done" ? "bg-emerald-200" : "bg-slate-200"}`} />}
                </div>
                <div className="pb-8">
                  <div className={`font-medium ${item.status === "current" ? "text-primary" : item.status === "done" ? "text-slate-900" : "text-slate-400"}`}>{item.label}</div>
                  <div className="text-sm text-slate-500">{item.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <Link href={`/book/document-upload/${params.booking_no}`} className="btn-primary">อัพโหลดเอกสาร</Link>
          <Link href="/contact" className="btn-outline">ติดต่อเจ้าหน้าที่</Link>
        </div>
      </div>
    </div>
  );
}
