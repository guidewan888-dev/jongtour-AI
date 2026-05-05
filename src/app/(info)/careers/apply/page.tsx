'use client';
import React, { useState } from 'react';

export default function CareersApplyPage() {
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', lineId: '', position: 'TOUR_LEADER', languages: ['Thai'], experience: '', destinations: '', licenseNo: '' });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setResult(null);
    try {
      const res = await fetch('/api/careers/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          languages: form.languages,
          destinations: form.destinations ? form.destinations.split(',').map(d => d.trim()) : [],
        }),
      });
      const data = await res.json();
      if (data.success) {
        setResult({ type: 'success', text: '🎉 ส่งใบสมัครสำเร็จ! เราจะตรวจสอบและติดต่อกลับภายใน 3-5 วันทำการ' });
        setForm({ fullName: '', email: '', phone: '', lineId: '', position: 'TOUR_LEADER', languages: ['Thai'], experience: '', destinations: '', licenseNo: '' });
      } else {
        setResult({ type: 'error', text: data.error || 'เกิดข้อผิดพลาด' });
      }
    } catch (err: any) {
      setResult({ type: 'error', text: err.message });
    }
    setSubmitting(false);
  };

  const inputStyle = { width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #d1d5db', fontSize: 14 };
  const langOptions = ['Thai', 'English', 'Japanese', 'Korean', 'Chinese', 'French', 'German', 'Spanish', 'Russian', 'Arabic'];

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '40px 20px' }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, color: '#059669', marginBottom: 8 }}>📝 สมัครงาน Tour Guide / Tour Leader</h1>
      <p style={{ color: '#64748b', marginBottom: 24 }}>กรอกข้อมูลด้านล่าง เราจะตรวจสอบและติดต่อกลับ</p>

      {result && (
        <div style={{ padding: '12px 16px', borderRadius: 10, marginBottom: 16, background: result.type === 'success' ? '#dcfce7' : '#fee2e2', color: result.type === 'success' ? '#16a34a' : '#dc2626' }}>
          {result.text}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={{ fontWeight: 600, fontSize: 14, display: 'block', marginBottom: 4 }}>ชื่อ-นามสกุล *</label>
          <input value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} style={inputStyle} required />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={{ fontWeight: 600, fontSize: 14, display: 'block', marginBottom: 4 }}>Email *</label>
            <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} style={inputStyle} required />
          </div>
          <div>
            <label style={{ fontWeight: 600, fontSize: 14, display: 'block', marginBottom: 4 }}>เบอร์โทร *</label>
            <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} style={inputStyle} required />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={{ fontWeight: 600, fontSize: 14, display: 'block', marginBottom: 4 }}>LINE ID</label>
            <input value={form.lineId} onChange={e => setForm(f => ({ ...f, lineId: e.target.value }))} style={inputStyle} />
          </div>
          <div>
            <label style={{ fontWeight: 600, fontSize: 14, display: 'block', marginBottom: 4 }}>ตำแหน่ง *</label>
            <select value={form.position} onChange={e => setForm(f => ({ ...f, position: e.target.value }))} style={inputStyle}>
              <option value="TOUR_LEADER">หัวหน้าทัวร์ (Tour Leader)</option>
              <option value="TOUR_GUIDE">ไกด์ (Tour Guide)</option>
              <option value="LOCAL_GUIDE">ไกด์ท้องถิ่น (Local Guide)</option>
            </select>
          </div>
        </div>

        <div>
          <label style={{ fontWeight: 600, fontSize: 14, display: 'block', marginBottom: 4 }}>ภาษาที่ใช้ได้</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {langOptions.map(l => (
              <label key={l} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, cursor: 'pointer' }}>
                <input type="checkbox" checked={form.languages.includes(l)} onChange={e => {
                  setForm(f => ({ ...f, languages: e.target.checked ? [...f.languages, l] : f.languages.filter(x => x !== l) }));
                }} />
                {l}
              </label>
            ))}
          </div>
        </div>

        <div>
          <label style={{ fontWeight: 600, fontSize: 14, display: 'block', marginBottom: 4 }}>จุดหมายที่ถนัด (คั่นด้วย comma)</label>
          <input value={form.destinations} onChange={e => setForm(f => ({ ...f, destinations: e.target.value }))} style={inputStyle} placeholder="Japan, Europe, Korea, Australia" />
        </div>

        <div>
          <label style={{ fontWeight: 600, fontSize: 14, display: 'block', marginBottom: 4 }}>เลขใบอนุญาตมัคคุเทศก์ (TAT)</label>
          <input value={form.licenseNo} onChange={e => setForm(f => ({ ...f, licenseNo: e.target.value }))} style={inputStyle} placeholder="ถ้ามี" />
        </div>

        <div>
          <label style={{ fontWeight: 600, fontSize: 14, display: 'block', marginBottom: 4 }}>ประสบการณ์</label>
          <textarea value={form.experience} onChange={e => setForm(f => ({ ...f, experience: e.target.value }))} style={{ ...inputStyle, minHeight: 100 }} placeholder="อธิบายประสบการณ์ทำงาน เส้นทางที่เคยนำ จำนวนปีที่ทำงาน" />
        </div>

        <button type="submit" disabled={submitting} style={{ padding: '12px 24px', background: '#059669', color: 'white', borderRadius: 12, fontWeight: 700, border: 'none', cursor: 'pointer', fontSize: 16, opacity: submitting ? 0.5 : 1 }}>
          {submitting ? '⏳ กำลังส่ง...' : '🚀 ส่งใบสมัคร'}
        </button>
      </form>
    </div>
  );
}
