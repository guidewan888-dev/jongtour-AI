import React from "react";
import Link from "next/link";
import { CheckCircle, Clock } from "lucide-react";

export default function TalentRequestSuccessPage() {
  return (
    <div className="g-container py-12 max-w-xl mx-auto text-center space-y-6">
      <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto"><CheckCircle className="w-8 h-8 text-emerald-500"/></div>
      <h1 className="text-2xl font-bold text-slate-900">Request ส่งเรียบร้อย!</h1>
      <p className="text-slate-500">หมายเลข Request: <b className="text-primary">TR-20260506-001</b></p>
      <div className="g-card p-5 text-left space-y-3">
        <h3 className="font-bold text-sm">📋 สถานะปัจจุบัน</h3>
        <div className="space-y-2">{[{s:"ส่ง Request",done:true},{s:"Admin ตรวจสอบ (ภายใน 24 ชม.)",done:false,active:true},{s:"แจ้งไกด์",done:false},{s:"ยืนยันไกด์",done:false},{s:"เดินทาง",done:false}].map((t,i)=>(<div key={i} className="flex items-center gap-3"><div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${t.done?"bg-primary text-white":t.active?"bg-primary/20 text-primary ring-2 ring-primary/30":"bg-slate-100 text-slate-400"}`}>{t.done?"✓":i+1}</div><span className={`text-sm ${t.done?"font-bold":t.active?"text-primary font-medium":"text-slate-400"}`}>{t.s}</span></div>))}</div>
      </div>
      <div className="bg-amber-50 p-3 rounded-xl text-xs text-amber-800">⚠️ ไม่รับประกันว่าจะได้ไกด์ที่เลือก — admin จะแจ้งผลภายใน 24 ชม.</div>
      <div className="flex gap-3 justify-center"><Link href="/account/talent-requests" className="btn-primary">ดูสถานะ Request</Link><Link href="/talents" className="btn-outline">กลับหน้าไกด์</Link></div>
    </div>
  );
}
