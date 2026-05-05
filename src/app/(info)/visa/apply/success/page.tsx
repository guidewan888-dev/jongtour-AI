import Link from "next/link";
import { CheckCircle, Copy, Mail, ArrowRight } from "lucide-react";

export default function ApplySuccessPage() {
  const requestNo = `V-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, "0")}${String(new Date().getDate()).padStart(2, "0")}-${String(Math.floor(Math.random() * 99999)).padStart(5, "0")}`;

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12">
      <div className="max-w-lg w-full px-4 text-center space-y-6">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto"><CheckCircle className="w-10 h-10 text-emerald-600" /></div>
        <h1 className="text-3xl font-bold text-slate-900">ส่งคำขอสำเร็จ! 🎉</h1>
        <div className="g-card p-5">
          <p className="text-sm text-slate-500 mb-2">เลขที่คำขอ</p>
          <div className="text-2xl font-black text-primary tracking-wide">{requestNo}</div>
          <p className="text-xs text-slate-400 mt-2">📧 อีเมลยืนยันส่งไปแล้ว</p>
        </div>

        <div className="g-card p-5 text-left">
          <h3 className="font-bold text-sm text-slate-900 mb-3">📋 ขั้นตอนถัดไป</h3>
          <div className="space-y-3">
            {["ทีมงานตรวจสอบเอกสาร (1-2 วัน)", "แจ้งผลเอกสาร + ขอเอกสารเพิ่ม (ถ้ามี)", "นัดหมายยื่นสถานทูต", "ยื่นเอกสารให้สถานทูต", "แจ้งผลวีซ่าทันที"].map((s, i) => (
              <div key={s} className="flex items-center gap-3"><div className="w-7 h-7 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</div><span className="text-sm text-slate-700">{s}</span></div>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/account/visa" className="btn-primary flex items-center justify-center gap-2">ดูสถานะวีซ่า <ArrowRight className="w-4 h-4" /></Link>
          <Link href="/visa" className="btn-outline">กลับหน้าวีซ่า</Link>
        </div>
      </div>
    </div>
  );
}
