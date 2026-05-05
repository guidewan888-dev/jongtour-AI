import React from "react";
import Link from "next/link";
import { CheckCircle, Clock, FileText, MapPin, Users, Calendar, DollarSign } from "lucide-react";

const timeline = [
  { label: "ส่งคำขอ", status: "done", time: "3 พ.ค. 2026" },
  { label: "AI สร้าง Estimate", status: "done", time: "3 พ.ค. 2026" },
  { label: "ทีมขายตรวจสอบ", status: "current", time: "กำลังดำเนินการ" },
  { label: "ใบเสนอราคาพร้อม", status: "pending", time: "" },
  { label: "ลูกค้ายืนยัน", status: "pending", time: "" },
];

export default function PrivateGroupStatusPage({ params }: { params: { no: string } }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">สถานะกรุ๊ปส่วนตัว</h1>
        <p className="text-slate-500 mt-1">Request #{params.no}</p>
      </div>

      {/* Summary */}
      <div className="g-card p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div><MapPin className="w-5 h-5 text-primary mx-auto mb-1" /><div className="text-xs text-slate-500">ปลายทาง</div><div className="font-bold text-sm">ญี่ปุ่น</div></div>
          <div><Calendar className="w-5 h-5 text-primary mx-auto mb-1" /><div className="text-xs text-slate-500">วันเดินทาง</div><div className="font-bold text-sm">15-20 ก.ค. 2026</div></div>
          <div><Users className="w-5 h-5 text-primary mx-auto mb-1" /><div className="text-xs text-slate-500">จำนวนคน</div><div className="font-bold text-sm">8 ท่าน</div></div>
          <div><DollarSign className="w-5 h-5 text-primary mx-auto mb-1" /><div className="text-xs text-slate-500">งบประมาณ/คน</div><div className="font-bold text-sm">~฿45,000</div></div>
        </div>
      </div>

      {/* Timeline */}
      <div className="g-card p-6">
        <h3 className="font-bold text-slate-900 mb-4">ขั้นตอน</h3>
        <div className="space-y-0">
          {timeline.map((t, i) => (
            <div key={t.label} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${t.status === "done" ? "bg-emerald-100" : t.status === "current" ? "bg-amber-100 ring-2 ring-amber-400" : "bg-slate-100"}`}>
                  {t.status === "done" ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : t.status === "current" ? <Clock className="w-4 h-4 text-amber-600" /> : <span className="w-2 h-2 bg-slate-300 rounded-full" />}
                </div>
                {i < timeline.length - 1 && <div className={`w-0.5 h-8 ${t.status === "done" ? "bg-emerald-200" : "bg-slate-200"}`} />}
              </div>
              <div className="pb-6">
                <div className={`text-sm font-medium ${t.status === "current" ? "text-amber-700 font-bold" : t.status === "done" ? "text-slate-700" : "text-slate-400"}`}>{t.label}</div>
                {t.time && <div className="text-xs text-slate-400">{t.time}</div>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Estimate */}
      <div className="g-card p-6 bg-blue-50 border-blue-100">
        <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2"><FileText className="w-5 h-5" /> AI Estimate</h3>
        <p className="text-sm text-blue-800 mb-2">ราคาประมาณการเบื้องต้น: <span className="font-bold">฿42,000 - ฿48,000 / คน</span></p>
        <p className="text-xs text-blue-600">* ราคาจริงจะยืนยันเมื่อทีมขายทำใบเสนอราคาเสร็จ</p>
      </div>

      <div className="flex gap-3">
        <Link href="/contact" className="btn-outline">ติดต่อทีมขาย</Link>
        <Link href="/private-group" className="btn-outline">สร้างคำขอใหม่</Link>
      </div>
    </div>
  );
}
