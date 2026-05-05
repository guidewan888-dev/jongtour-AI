import React from "react";
import Link from "next/link";
import { CheckCircle, Clock, FileText, MessageCircle, DollarSign, User, Send, AlertTriangle } from "lucide-react";

const timeline = [
  { time: "01/05 10:30", action: "ส่งคำขอ", by: "ลูกค้า", done: true },
  { time: "01/05 14:00", action: "รับเคส — แอน", by: "Staff", done: true },
  { time: "02/05 09:00", action: "ตรวจเอกสาร: ขาด Statement", by: "แอน", done: true },
  { time: "02/05 11:30", action: "แจ้งลูกค้าส่งเอกสารเพิ่ม", by: "แอน", done: true },
  { time: "03/05 15:00", action: "ลูกค้าส่ง Statement", by: "ลูกค้า", done: true },
  { time: "กำลังดำเนินการ", action: "ตรวจสอบเอกสารรอบ 2", by: "แอน", done: false },
];

export default function VisaRequestDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><div className="text-sm text-slate-400 mb-1"><Link href="/visa-center/requests" className="hover:text-primary">← คำขอวีซ่า</Link></div><h1 className="text-xl font-bold text-slate-900">{params.id} — 🇺🇸 อเมริกา B1/B2</h1></div>
        <div className="flex gap-2"><button className="btn-primary text-sm">อนุมัติ</button><button className="bg-red-50 text-red-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-red-100">ปฏิเสธ</button></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left: Info */}
        <div className="lg:col-span-2 space-y-4">
          <div className="g-card p-5 grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-slate-500">Tier:</span> <span className="font-bold text-orange-600">EXCLUSIVE</span></div>
            <div><span className="text-slate-500">Status:</span> <span className="font-bold text-purple-600">UNDER_REVIEW</span></div>
            <div><span className="text-slate-500">ผู้สมัคร:</span> <span className="font-bold">2 ท่าน</span></div>
            <div><span className="text-slate-500">เดินทาง:</span> <span className="font-bold">15 ก.ค. 2569</span></div>
            <div><span className="text-slate-500">Staff:</span> <span className="font-bold">แอน</span></div>
            <div><span className="text-slate-500">ยอดรวม:</span> <span className="font-bold text-primary">฿30,121</span></div>
          </div>

          <div className="g-card p-5"><h3 className="font-bold text-sm mb-3"><User className="w-4 h-4 inline text-blue-500 mr-1" />ผู้สมัคร</h3>
            <div className="space-y-2">{[{name:"นายสมชาย ใจดี",pp:"AA1234567",dob:"01/01/1990"},{name:"นางสมศรี ใจดี",pp:"AA7654321",dob:"15/06/1992"}].map(a=>(<div key={a.pp} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl text-sm"><div className="flex-1"><div className="font-medium">{a.name}</div><div className="text-xs text-slate-400">PP: {a.pp} · DOB: {a.dob}</div></div></div>))}</div>
          </div>

          <div className="g-card p-5"><h3 className="font-bold text-sm mb-3"><FileText className="w-4 h-4 inline text-primary mr-1" />เอกสาร</h3>
            <div className="space-y-1.5">{[{n:"พาสปอร์ต (สมชาย)",s:"ok"},{n:"พาสปอร์ต (สมศรี)",s:"ok"},{n:"Statement (สมชาย)",s:"review"},{n:"Statement (สมศรี)",s:"pending"},{n:"หนังสือรับรองงาน",s:"ok"},{n:"DS-160",s:"ok"}].map(d=>(<div key={d.n} className="flex items-center gap-2 text-sm">{d.s==="ok"?<CheckCircle className="w-4 h-4 text-emerald-500"/>:d.s==="review"?<Clock className="w-4 h-4 text-blue-500"/>:<AlertTriangle className="w-4 h-4 text-amber-500"/>}<span className="flex-1">{d.n}</span><span className={`text-xs px-2 py-0.5 rounded-full ${d.s==="ok"?"bg-emerald-50 text-emerald-600":d.s==="review"?"bg-blue-50 text-blue-600":"bg-amber-50 text-amber-600"}`}>{d.s==="ok"?"ผ่าน":d.s==="review"?"กำลังตรวจ":"รอส่ง"}</span></div>))}</div>
          </div>

          <div className="g-card p-5"><h3 className="font-bold text-sm mb-3"><DollarSign className="w-4 h-4 inline text-primary mr-1" />การเงิน</h3>
            <div className="space-y-1.5 text-sm"><div className="flex justify-between"><span>EXCLUSIVE × 2</span><span>฿15,000</span></div><div className="flex justify-between"><span>ตั๋ว Dummy × 2</span><span>฿1,000</span></div><div className="flex justify-between"><span>ประกัน × 2</span><span>฿2,400</span></div><div className="flex justify-between"><span>แปล × 4</span><span>฿3,200</span></div><div className="flex justify-between border-t pt-2 font-bold"><span>รวม</span><span className="text-primary">฿30,121</span></div><div className="flex justify-between text-emerald-600"><span>สถานะ</span><span>✓ ชำระแล้ว (เต็มจำนวน)</span></div></div>
          </div>
        </div>

        {/* Right: Timeline + Notes */}
        <div className="space-y-4">
          <div className="g-card p-5"><h3 className="font-bold text-sm mb-3">📋 Timeline</h3>
            <div className="space-y-0">{timeline.map((t,i)=>(<div key={i} className="flex gap-3 pb-3"><div className="flex flex-col items-center"><div className={`w-3 h-3 rounded-full ${t.done?'bg-primary':'bg-slate-300 ring-4 ring-slate-100'}`}/>{i<timeline.length-1&&<div className={`w-0.5 flex-1 ${t.done?'bg-primary/30':'bg-slate-200'}`}/>}</div><div><div className="text-xs text-slate-400">{t.time}</div><div className="text-sm font-medium">{t.action}</div><div className="text-[10px] text-slate-400">{t.by}</div></div></div>))}</div>
          </div>

          <div className="g-card p-5"><h3 className="font-bold text-sm mb-3">📝 Internal Notes</h3>
            <textarea className="g-input w-full h-20 text-sm" placeholder="บันทึกภายใน..." defaultValue="ลูกค้าเคยถูกปฏิเสธ 1 ครั้ง เมื่อ 2024 — ต้องเตรียม Cover Letter เพิ่ม" />
            <button className="mt-2 text-sm text-primary font-bold">บันทึก</button>
          </div>

          <div className="g-card p-5"><h3 className="font-bold text-sm mb-3">💬 ส่งข้อความถึงลูกค้า</h3><textarea className="g-input w-full h-16 text-sm" placeholder="พิมพ์ข้อความ..." /><button className="mt-2 btn-primary text-sm w-full flex items-center justify-center gap-2"><Send className="w-4 h-4" />ส่ง</button></div>
        </div>
      </div>
    </div>
  );
}
