'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FileText, Clock, Eye, Filter } from 'lucide-react';

const STATUS_LABELS: Record<string, { label: string; color: string; emoji: string }> = {
  DRAFT: { label: 'ร่าง', color: '#94a3b8', emoji: '📝' },
  SUBMITTED: { label: 'ส่งแล้ว', color: '#3b82f6', emoji: '📨' },
  DOCUMENTS_REQUIRED: { label: 'รอเอกสาร', color: '#f59e0b', emoji: '📄' },
  UNDER_REVIEW: { label: 'กำลังตรวจ', color: '#8b5cf6', emoji: '🔍' },
  EMBASSY_SUBMITTED: { label: 'ยื่นสถานทูต', color: '#6366f1', emoji: '🏛️' },
  APPROVED: { label: 'อนุมัติ', color: '#16a34a', emoji: '✅' },
  REJECTED: { label: 'ไม่อนุมัติ', color: '#dc2626', emoji: '❌' },
  COMPLETED: { label: 'เสร็จสิ้น', color: '#059669', emoji: '🎉' },
  CANCELLED: { label: 'ยกเลิก', color: '#6b7280', emoji: '🚫' },
};

const TIER_BADGE: Record<string, string> = { PLUS: 'bg-slate-100 text-slate-600', ADVANCE: 'bg-blue-100 text-blue-700', EXCLUSIVE: 'bg-orange-100 text-orange-700', VIP: 'bg-amber-100 text-amber-700' };

// Mock data for UI
const mockVisas = [
  { id: '1', requestNo: 'V-20260501-00042', country: 'อเมริกา', countryEmoji: '🇺🇸', visaType: 'B1/B2', tier: 'EXCLUSIVE', status: 'DOCUMENTS_REQUIRED', applicantCount: 2, travelDate: '2026-07-15', totalPrice: 30121, paidStatus: 'paid', createdAt: '2026-05-01', adminNotes: 'กรุณาส่ง Statement เพิ่มเติม' },
  { id: '2', requestNo: 'V-20260420-00035', country: 'ญี่ปุ่น', countryEmoji: '🇯🇵', visaType: 'ท่องเที่ยว', tier: 'PLUS', status: 'APPROVED', applicantCount: 1, travelDate: '2026-06-01', totalPrice: 1500, paidStatus: 'paid', createdAt: '2026-04-20' },
];

export default function CustomerVisaListPage() {
  const [visas, setVisas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');

  useEffect(() => {
    fetch('/api/visa/apply').then(r => r.json()).then(data => {
      setVisas(data.data?.length ? data.data : mockVisas);
      setLoading(false);
    }).catch(() => { setVisas(mockVisas); setLoading(false); });
  }, []);

  const tabs = [{ key: 'all', label: 'ทั้งหมด' }, { key: 'active', label: 'กำลังดำเนินการ' }, { key: 'done', label: 'สำเร็จ' }, { key: 'cancelled', label: 'ยกเลิก' }];
  const filtered = visas.filter(v => tab === 'all' || (tab === 'active' && !['APPROVED', 'REJECTED', 'COMPLETED', 'CANCELLED'].includes(v.status)) || (tab === 'done' && ['APPROVED', 'COMPLETED'].includes(v.status)) || (tab === 'cancelled' && ['REJECTED', 'CANCELLED'].includes(v.status)));

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div><h1 className="text-2xl font-black text-slate-800">🛂 คำขอวีซ่าของฉัน</h1><p className="text-slate-500 text-sm mt-1">ติดตามสถานะวีซ่าทั้งหมด</p></div>
        <Link href="/visa/apply" className="bg-primary text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-orange-600">+ สมัครวีซ่าใหม่</Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {tabs.map(t => (<button key={t.key} onClick={() => setTab(t.key)} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${tab === t.key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>{t.label}</button>))}
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-400">กำลังโหลด...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16"><div className="text-4xl mb-4">🛂</div><div className="text-slate-500 mb-4">ไม่มีคำขอวีซ่า</div><Link href="/visa/apply" className="btn-primary">ยื่นวีซ่าเลย</Link></div>
      ) : (
        <div className="space-y-3">
          {filtered.map((v: any) => {
            const s = STATUS_LABELS[v.status] || STATUS_LABELS.DRAFT;
            return (
              <Link key={v.id} href={`/account/visa/${v.requestNo || v.id}`} className="block bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{v.countryEmoji || '🌍'}</span>
                    <div>
                      <div className="font-bold text-slate-900">{v.country || 'ประเทศ'} · {v.visaType || 'ท่องเที่ยว'}</div>
                      <div className="text-xs text-slate-400 font-mono">{v.requestNo || v.id}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {v.tier && <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${TIER_BADGE[v.tier] || 'bg-slate-100'}`}>{v.tier}</span>}
                    <span style={{ background: `${s.color}15`, color: s.color }} className="px-2.5 py-1 rounded-full text-xs font-bold">{s.emoji} {s.label}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span>👤 {v.applicantCount || 1} ท่าน</span>
                  {v.travelDate && <span>✈️ เดินทาง {new Date(v.travelDate).toLocaleDateString('th-TH')}</span>}
                  <span className="font-bold text-primary">฿{(v.totalPrice || 0).toLocaleString()}</span>
                  {v.paidStatus === 'paid' && <span className="text-emerald-600">✓ ชำระแล้ว</span>}
                </div>
                {v.adminNotes && <div className="mt-3 bg-blue-50 border border-blue-100 rounded-lg p-2.5 text-xs text-blue-800">💬 {v.adminNotes}</div>}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
