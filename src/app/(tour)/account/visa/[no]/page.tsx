'use client';
import React from 'react';
import Link from 'next/link';
import { CheckCircle, Clock, FileText, Download, MessageCircle, Phone, AlertCircle, XCircle } from 'lucide-react';

const statusSteps = [
  { key: 'SUBMITTED', label: 'ส่งคำขอ', emoji: '📨' },
  { key: 'UNDER_REVIEW', label: 'ตรวจเอกสาร', emoji: '🔍' },
  { key: 'DOCUMENTS_REQUIRED', label: 'รอเอกสารเพิ่ม', emoji: '📄' },
  { key: 'READY_TO_SUBMIT', label: 'พร้อมยื่น', emoji: '📋' },
  { key: 'EMBASSY_SUBMITTED', label: 'ยื่นสถานทูต', emoji: '🏛️' },
  { key: 'APPOINTMENT', label: 'นัดสัมภาษณ์', emoji: '📅' },
  { key: 'RESULT_RECEIVED', label: 'ได้ผล', emoji: '📬' },
  { key: 'APPROVED', label: 'อนุมัติ', emoji: '✅' },
  { key: 'COMPLETED', label: 'เสร็จสิ้น', emoji: '🎉' },
];

const TIER_BADGE: Record<string, string> = { PLUS: 'bg-slate-100 text-slate-600', ADVANCE: 'bg-blue-100 text-blue-700', EXCLUSIVE: 'bg-orange-100 text-orange-700', VIP: 'bg-amber-100 text-amber-700' };

// Mock
const mock = {
  requestNo: 'V-20260501-00042', country: '🇺🇸 อเมริกา', visaType: 'B1/B2 (ท่องเที่ยว+ธุรกิจ)', tier: 'EXCLUSIVE',
  status: 'UNDER_REVIEW', applicants: [{ name: 'นายสมชาย ใจดี', passport: 'AA1234567' }, { name: 'นางสมศรี ใจดี', passport: 'AA7654321' }],
  travelDate: '15 ก.ค. 2569', totalPrice: 30121, paidAmount: 30121,
  docs: [{ name: 'พาสปอร์ต (สมชาย)', status: 'ok' }, { name: 'พาสปอร์ต (สมศรี)', status: 'ok' }, { name: 'Statement (สมชาย)', status: 'pending' }, { name: 'หนังสือรับรองงาน', status: 'ok' }],
  messages: [{ from: 'staff', text: 'กรุณาส่ง Statement ย้อนหลัง 6 เดือน ของคุณสมชาย', time: '2 ชม. ที่แล้ว' }, { from: 'customer', text: 'ส่งให้แล้วค่ะ', time: '30 นาทีที่แล้ว' }],
  createdAt: '1 พ.ค. 2569',
};

export default function VisaDetailPage({ params }: { params: { no: string } }) {
  const currentIdx = statusSteps.findIndex(s => s.key === mock.status);

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-start justify-between pb-4 border-b border-slate-200">
        <div>
          <div className="text-xs text-slate-400 mb-1"><Link href="/account/visa" className="hover:text-primary">← คำขอวีซ่า</Link></div>
          <h1 className="text-xl font-black text-slate-800">{mock.country} · {mock.visaType}</h1>
          <div className="flex items-center gap-2 mt-1"><span className="font-mono text-sm text-slate-500">{params.no}</span><span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${TIER_BADGE[mock.tier]}`}>{mock.tier}</span></div>
        </div>
        <div className="text-right"><div className="text-lg font-bold text-primary">฿{mock.totalPrice.toLocaleString()}</div><div className="text-xs text-emerald-600">✓ ชำระแล้ว</div></div>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <h3 className="font-bold text-sm mb-4">📋 สถานะการดำเนินการ</h3>
        <div className="flex items-center gap-0 overflow-x-auto pb-2">
          {statusSteps.map((s, i) => {
            const done = i <= currentIdx;
            const active = i === currentIdx;
            return (
              <React.Fragment key={s.key}>
                <div className={`flex flex-col items-center shrink-0 ${active ? 'scale-110' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${done ? 'bg-primary text-white' : 'bg-slate-100 text-slate-400'} ${active ? 'ring-4 ring-primary/20' : ''}`}>{done ? '✓' : i + 1}</div>
                  <span className={`text-[10px] mt-1 text-center w-16 ${done ? 'text-primary font-bold' : 'text-slate-400'}`}>{s.label}</span>
                </div>
                {i < statusSteps.length - 1 && <div className={`h-0.5 w-6 shrink-0 mt-[-14px] ${i < currentIdx ? 'bg-primary' : 'bg-slate-200'}`} />}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Applicants */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h3 className="font-bold text-sm mb-3">👤 ผู้สมัคร ({mock.applicants.length} ท่าน)</h3>
          <div className="space-y-2">{mock.applicants.map(a => (<div key={a.passport} className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-xl text-sm"><span className="font-medium">{a.name}</span><span className="text-xs text-slate-400 font-mono">{a.passport}</span></div>))}</div>
          <div className="mt-2 text-xs text-slate-500">✈️ เดินทาง {mock.travelDate}</div>
        </div>

        {/* Documents */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h3 className="font-bold text-sm mb-3">📁 เอกสาร</h3>
          <div className="space-y-1.5">{mock.docs.map(d => (<div key={d.name} className="flex items-center gap-2 text-sm"><span className={d.status === 'ok' ? 'text-emerald-500' : 'text-amber-500'}>{d.status === 'ok' ? '✓' : '⏳'}</span><span className="flex-1">{d.name}</span>{d.status === 'pending' && <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">รอส่ง</span>}</div>))}</div>
        </div>
      </div>

      {/* Messages */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <h3 className="font-bold text-sm mb-3">💬 ข้อความ</h3>
        <div className="space-y-3">{mock.messages.map((m, i) => (<div key={i} className={`flex ${m.from === 'customer' ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[70%] p-3 rounded-2xl text-sm ${m.from === 'customer' ? 'bg-primary text-white rounded-br-md' : 'bg-slate-100 text-slate-800 rounded-bl-md'}`}><div>{m.text}</div><div className={`text-[10px] mt-1 ${m.from === 'customer' ? 'text-orange-200' : 'text-slate-400'}`}>{m.time}</div></div></div>))}</div>
        <div className="mt-3 flex gap-2"><input className="g-input flex-1" placeholder="พิมพ์ข้อความ..." /><button className="bg-primary text-white px-4 py-2 rounded-xl text-sm font-bold">ส่ง</button></div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <button className="btn-outline flex items-center gap-2 text-sm"><Download className="w-4 h-4" /> ดาวน์โหลดใบเสร็จ</button>
        <button className="btn-outline flex items-center gap-2 text-sm"><Phone className="w-4 h-4" /> ติดต่อเจ้าหน้าที่</button>
      </div>
    </div>
  );
}
