'use client';

import React, { useState, useEffect, useCallback } from 'react';

type DocLog = {
  id: string; documentType: string; documentId: string; documentNo: string | null;
  channel: string; recipient: string; status: string; errorMessage: string | null;
  retryCount: number; sentAt: string | null; createdAt: string;
};

const DOC_TYPE_LABELS: Record<string, { label: string; emoji: string }> = {
  INVOICE: { label: 'ใบแจ้งหนี้', emoji: '📄' },
  RECEIPT: { label: 'ใบเสร็จ', emoji: '🧾' },
  VOUCHER: { label: 'Voucher', emoji: '🎫' },
  BOOKING_CONFIRMATION: { label: 'ยืนยันจอง', emoji: '✅' },
  TRAVEL_APPOINTMENT: { label: 'ใบนัดหมาย', emoji: '🗓️' },
  PAYMENT_REMINDER: { label: 'แจ้งเตือนชำระ', emoji: '⏰' },
  QUOTATION: { label: 'ใบเสนอราคา', emoji: '💰' },
  TRAVELER_LIST: { label: 'รายชื่อผู้เดินทาง', emoji: '👥' },
  SUPPLIER_CONFIRMATION: { label: 'ยืนยันซัพพลายเออร์', emoji: '🤝' },
  PRIVATE_GROUP_PROPOSAL: { label: 'ข้อเสนอกรุ๊ป', emoji: '🏝️' },
  TAX_INVOICE: { label: 'ใบกำกับภาษี', emoji: '🏢' },
  WITHHOLDING_CERT: { label: 'หัก ณ ที่จ่าย', emoji: '📋' },
};

export default function DocumentCenterPage() {
  const [logs, setLogs] = useState<DocLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('');
  const [generating, setGenerating] = useState(false);
  const [genForm, setGenForm] = useState({ type: 'INVOICE', bookingId: '', paymentId: '', quotationId: '', invoiceType: 'DEPOSIT' });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const url = filter ? `/api/documents/deliver?status=${filter}` : '/api/documents/deliver';
      const res = await fetch(url);
      const data = await res.json();
      setLogs(data.data || []);
    } catch { setLogs([]); }
    setLoading(false);
  }, [filter]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const handleRetry = async (logId: string) => {
    try {
      const res = await fetch('/api/documents/retry', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logId }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Retry initiated' });
        fetchLogs();
      } else {
        setMessage({ type: 'error', text: data.error });
      }
    } catch (e: any) { setMessage({ type: 'error', text: e.message }); }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setMessage(null);
    try {
      const body: any = { type: genForm.type };
      if (genForm.bookingId) body.bookingId = genForm.bookingId;
      if (genForm.paymentId) body.paymentId = genForm.paymentId;
      if (genForm.quotationId) body.quotationId = genForm.quotationId;
      if (genForm.type === 'INVOICE') body.invoiceType = genForm.invoiceType;

      const res = await fetch('/api/documents/generate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: `สร้างเอกสารสำเร็จ: ${data.document?.documentNo || data.document?.invoiceNo || data.document?.receiptNo || data.document?.voucherNo || ''}` });
        fetchLogs();
      } else {
        setMessage({ type: 'error', text: data.error });
      }
    } catch (e: any) { setMessage({ type: 'error', text: e.message }); }
    setGenerating(false);
  };

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      SENT: 'background: #dcfce7; color: #16a34a;',
      FAILED: 'background: #fee2e2; color: #dc2626;',
      PENDING: 'background: #fef3c7; color: #d97706;',
      BOUNCED: 'background: #fce4ec; color: #e91e63;',
    };
    return `display:inline-block;padding:2px 10px;border-radius:12px;font-size:12px;font-weight:600;${colors[status] || 'background:#f1f5f9;color:#64748b;'}`;
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1e3a5f' }}>📄 Document Center</h1>
      </div>

      {/* Message */}
      {message && (
        <div style={{ padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', background: message.type === 'success' ? '#dcfce7' : '#fee2e2', color: message.type === 'success' ? '#16a34a' : '#dc2626' }}>
          {message.text}
        </div>
      )}

      {/* Generate Form */}
      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>➕ สร้างเอกสาร</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          <select value={genForm.type} onChange={e => setGenForm(f => ({ ...f, type: e.target.value }))}
            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #d1d5db' }}>
            {Object.entries(DOC_TYPE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v.emoji} {v.label}</option>
            ))}
          </select>
          <input placeholder="Booking ID" value={genForm.bookingId}
            onChange={e => setGenForm(f => ({ ...f, bookingId: e.target.value }))}
            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #d1d5db' }} />
          <input placeholder="Payment ID (for Receipt)" value={genForm.paymentId}
            onChange={e => setGenForm(f => ({ ...f, paymentId: e.target.value }))}
            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #d1d5db' }} />
          {genForm.type === 'INVOICE' && (
            <select value={genForm.invoiceType} onChange={e => setGenForm(f => ({ ...f, invoiceType: e.target.value }))}
              style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #d1d5db' }}>
              <option value="DEPOSIT">มัดจำ (Deposit)</option>
              <option value="BALANCE">ยอดคงเหลือ (Balance)</option>
              <option value="FULL">เต็มจำนวน (Full)</option>
            </select>
          )}
          <button onClick={handleGenerate} disabled={generating}
            style={{ padding: '8px 20px', borderRadius: '8px', background: '#1e3a5f', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600, opacity: generating ? 0.5 : 1 }}>
            {generating ? 'กำลังสร้าง...' : '📄 สร้าง'}
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        {['', 'SENT', 'PENDING', 'FAILED'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ padding: '6px 16px', borderRadius: '20px', border: '1px solid #d1d5db', background: filter === f ? '#1e3a5f' : 'white', color: filter === f ? 'white' : '#333', cursor: 'pointer', fontSize: '13px' }}>
            {f || 'ทั้งหมด'}
          </button>
        ))}
      </div>

      {/* Delivery Logs Table */}
      <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>ประเภท</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>เลขที่</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>ช่องทาง</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>ผู้รับ</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>สถานะ</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>ส่งเมื่อ</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>กำลังโหลด...</td></tr>
            ) : logs.length === 0 ? (
              <tr><td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>ยังไม่มีประวัติการส่งเอกสาร</td></tr>
            ) : logs.map(log => {
              const t = DOC_TYPE_LABELS[log.documentType] || { label: log.documentType, emoji: '📄' };
              return (
                <tr key={log.id} style={{ borderTop: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '10px 16px' }}>{t.emoji} {t.label}</td>
                  <td style={{ padding: '10px 16px', fontFamily: 'monospace' }}>{log.documentNo || '-'}</td>
                  <td style={{ padding: '10px 16px' }}>{log.channel === 'EMAIL' ? '📧' : '💚'} {log.channel}</td>
                  <td style={{ padding: '10px 16px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{log.recipient}</td>
                  <td style={{ padding: '10px 16px' }}><span style={statusBadge(log.status) as any}>{log.status}</span></td>
                  <td style={{ padding: '10px 16px', color: '#9ca3af' }}>{log.sentAt ? new Date(log.sentAt).toLocaleString('th-TH') : '-'}</td>
                  <td style={{ padding: '10px 16px' }}>
                    {log.status === 'FAILED' && (
                      <button onClick={() => handleRetry(log.id)}
                        style={{ padding: '4px 12px', borderRadius: '6px', background: '#f59e0b', color: 'white', border: 'none', cursor: 'pointer', fontSize: '12px' }}>
                        🔄 Retry
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
