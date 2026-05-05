'use client';

import React, { useState } from 'react';

interface ResendButtonProps {
  documentType: string;
  documentId: string;
  documentNo: string;
  pdfUrl: string;
  customerEmail: string;
  customerName: string;
}

export default function DocumentResendButton({
  documentType, documentId, documentNo, pdfUrl, customerEmail, customerName,
}: ResendButtonProps) {
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleResend = async () => {
    setSending(true);
    setResult(null);

    try {
      const res = await fetch('/api/documents/deliver', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentType,
          documentId,
          documentNo,
          pdfUrl,
          channels: ['EMAIL'],
          recipientEmail: customerEmail,
          customerName,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setResult({ type: 'success', text: 'ส่งเอกสารไปที่อีเมลแล้ว ✅' });
      } else {
        setResult({ type: 'error', text: data.error || 'ส่งไม่สำเร็จ' });
      }
    } catch (err: any) {
      setResult({ type: 'error', text: err.message || 'เกิดข้อผิดพลาด' });
    }

    setSending(false);

    // Auto-clear message after 5s
    setTimeout(() => setResult(null), 5000);
  };

  return (
    <div className="inline-flex items-center gap-2">
      <button
        onClick={handleResend}
        disabled={sending}
        className="px-3 py-1.5 bg-amber-500 text-white rounded-lg text-xs font-semibold hover:bg-amber-600 transition disabled:opacity-50"
      >
        {sending ? '⏳ กำลังส่ง...' : '📧 ส่งซ้ำ'}
      </button>
      {result && (
        <span className={`text-xs ${result.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
          {result.text}
        </span>
      )}
    </div>
  );
}
