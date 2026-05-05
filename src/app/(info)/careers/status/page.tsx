'use client';
import React, { useState } from 'react';

const STATUS_LABELS: Record<string, { label: string; color: string; emoji: string }> = {
  NEW: { label: 'ใหม่', color: '#3b82f6', emoji: '📩' },
  SCREENING: { label: 'กำลังตรวจสอบ', color: '#8b5cf6', emoji: '🔍' },
  INTERVIEW_SCHEDULED: { label: 'นัดสัมภาษณ์', color: '#f59e0b', emoji: '📅' },
  INTERVIEWED: { label: 'สัมภาษณ์แล้ว', color: '#6366f1', emoji: '🎤' },
  ACCEPTED: { label: 'ผ่านการคัดเลือก', color: '#16a34a', emoji: '🎉' },
  REJECTED: { label: 'ไม่ผ่าน', color: '#dc2626', emoji: '❌' },
};

export default function CareersStatusPage() {
  const [email, setEmail] = useState('');
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`/api/careers/apply?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      setApps(data.data || []);
    } catch { setApps([]); }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '40px 20px' }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, color: '#059669', marginBottom: 8 }}>📋 ตรวจสอบสถานะใบสมัคร</h1>
      <p style={{ color: '#64748b', marginBottom: 24 }}>กรอก Email ที่ใช้สมัครเพื่อดูสถานะ</p>

      <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" required
          style={{ flex: 1, padding: '10px 14px', borderRadius: 10, border: '1px solid #d1d5db', fontSize: 14 }} />
        <button type="submit" disabled={loading}
          style={{ padding: '10px 20px', background: '#059669', color: 'white', borderRadius: 10, fontWeight: 700, border: 'none', cursor: 'pointer' }}>
          {loading ? '...' : '🔍 ค้นหา'}
        </button>
      </form>

      {searched && (
        apps.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>ไม่พบใบสมัครที่ใช้ Email นี้</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {apps.map((a: any) => {
              const s = STATUS_LABELS[a.status] || STATUS_LABELS.NEW;
              return (
                <div key={a.id} style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 16, padding: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 16 }}>{a.fullName}</div>
                      <div style={{ fontSize: 13, color: '#64748b' }}>{a.position}</div>
                    </div>
                    <span style={{ padding: '4px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600, background: `${s.color}20`, color: s.color }}>
                      {s.emoji} {s.label}
                    </span>
                  </div>
                  {a.interviewDate && (
                    <div style={{ marginTop: 10, background: '#fef3c7', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: '#92400e' }}>
                      📅 สัมภาษณ์: {new Date(a.interviewDate).toLocaleDateString('th-TH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                  )}
                  <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 8 }}>สมัครเมื่อ: {new Date(a.createdAt).toLocaleDateString('th-TH')}</div>
                </div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
}
