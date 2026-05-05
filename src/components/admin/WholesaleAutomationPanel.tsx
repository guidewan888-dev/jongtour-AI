'use client';

import React, { useState, useEffect, useCallback } from 'react';

// ============================================================
// TYPES
// ============================================================

type AutomationData = {
  bookingId: string; bookingRef: string; bookingStatus: string;
  supplier: any; supplierId: string; tour: any; departure: any;
  wholesaleBookingMethod: string; wholesaleStatus: string;
  wholesaleRef: any; wholesaleTourUrl: string | null;
  wholesaleBookingUrl: string | null; externalBookingRef: string | null;
  automationSupported: boolean; automationConfig: any;
  credentialStatus: string; credentialCount: number;
  botStatus: string; lastBotRunAt: string | null;
  lastErrorMessage: string | null; currentSessionId: string | null;
  adminApprovalRequired: boolean; adminApprovedBy: string | null;
  screenshotBeforeUrl: string | null; screenshotAfterUrl: string | null;
  screenshots: any[]; travelers: any[]; customer: any;
};

// ============================================================
// STATUS CONFIG
// ============================================================

const STATUS_CONFIG: Record<string, { label: string; color: string; emoji: string }> = {
  NOT_STARTED:              { label: 'ยังไม่เริ่ม',           color: 'bg-slate-100 text-slate-600',     emoji: '⏸️' },
  CHECKING_DATA:            { label: 'กำลังตรวจข้อมูล',       color: 'bg-blue-100 text-blue-700',       emoji: '🔍' },
  LOGGING_IN:               { label: 'กำลัง Login',           color: 'bg-indigo-100 text-indigo-700',   emoji: '🔑' },
  LOGIN_FAILED:             { label: 'Login ไม่สำเร็จ',       color: 'bg-red-100 text-red-700',         emoji: '❌' },
  OPENING_WHOLESALE_PAGE:   { label: 'กำลังเปิดหน้าเว็บ',     color: 'bg-sky-100 text-sky-700',         emoji: '🌐' },
  FILLING_FORM:             { label: 'กำลังกรอกข้อมูล',       color: 'bg-amber-100 text-amber-700',     emoji: '✍️' },
  WAITING_ADMIN_APPROVAL:   { label: 'รอ Admin อนุมัติ',       color: 'bg-yellow-100 text-yellow-800',   emoji: '⏳' },
  SUBMITTED:                { label: 'จองแล้ว',              color: 'bg-purple-100 text-purple-700',   emoji: '📨' },
  CONFIRMED:                { label: 'Wholesale ยืนยัน',      color: 'bg-emerald-100 text-emerald-700', emoji: '✅' },
  WAITING_SUPPLIER_CONFIRM: { label: 'รอ Supplier ยืนยัน',    color: 'bg-orange-100 text-orange-700',   emoji: '⏰' },
  FAILED:                   { label: 'ล้มเหลว',              color: 'bg-red-100 text-red-700',         emoji: '💥' },
  CAPTCHA_DETECTED:         { label: 'พบ CAPTCHA',            color: 'bg-rose-100 text-rose-700',       emoji: '🛡️' },
  OTP_REQUIRED:             { label: 'ต้องใส่ OTP',           color: 'bg-pink-100 text-pink-700',       emoji: '📱' },
  MANUAL_FOLLOW_UP_REQUIRED:{ label: 'ต้อง Manual',           color: 'bg-gray-200 text-gray-800',       emoji: '👤' },
};

// ============================================================
// COMPONENT
// ============================================================

export default function WholesaleAutomationPanel({ bookingId }: { bookingId: string }) {
  const [data, setData] = useState<AutomationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showScreenshots, setShowScreenshots] = useState(false);
  const [showExtRefForm, setShowExtRefForm] = useState(false);
  const [extRef, setExtRef] = useState('');
  const [copySummary, setCopySummary] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}/wholesale-automation`);
      const json = await res.json();
      if (json.success) setData(json.data);
    } catch { }
    setLoading(false);
  }, [bookingId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Auto-refresh every 5s when bot is running
  useEffect(() => {
    if (!data) return;
    const activeStatuses = ['CHECKING_DATA', 'LOGGING_IN', 'OPENING_WHOLESALE_PAGE', 'FILLING_FORM'];
    if (activeStatuses.includes(data.botStatus)) {
      const timer = setInterval(fetchData, 5000);
      return () => clearInterval(timer);
    }
  }, [data, fetchData]);

  const showMsg = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  // ---- ACTIONS ----

  const handleAction = async (action: string, body?: any) => {
    setActionLoading(action);
    try {
      let url = `/api/admin/bookings/${bookingId}/wholesale-automation/${action}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: data?.currentSessionId, ...body }),
      });
      const json = await res.json();
      if (json.success) {
        showMsg('success', json.message || `${action} สำเร็จ`);
        await fetchData();
      } else {
        showMsg('error', json.error || `${action} ล้มเหลว`);
      }
    } catch (e: any) { showMsg('error', e.message); }
    setActionLoading(null);
  };

  const handleCopySummary = async () => {
    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}/copy-helper`);
      const json = await res.json();
      if (json.success) {
        await navigator.clipboard.writeText(json.data);
        setCopySummary(json.data);
        showMsg('success', 'คัดลอกข้อมูลแล้ว!');
      }
    } catch (e: any) { showMsg('error', e.message); }
  };

  const handleSaveExtRef = async () => {
    if (!extRef.trim()) return;
    setActionLoading('ext-ref');
    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}/external-booking-ref`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ externalBookingRef: extRef, createdBy: 'ADMIN' }),
      });
      const json = await res.json();
      if (json.success) {
        showMsg('success', 'บันทึกเลขจอง Wholesale สำเร็จ');
        setShowExtRefForm(false);
        setExtRef('');
        await fetchData();
      } else {
        showMsg('error', json.error);
      }
    } catch (e: any) { showMsg('error', e.message); }
    setActionLoading(null);
  };

  // ---- RENDER ----

  if (loading) return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 animate-pulse">
      <div className="h-6 bg-slate-200 rounded w-48 mb-4" />
      <div className="grid grid-cols-3 gap-4">
        <div className="h-16 bg-slate-100 rounded-xl" />
        <div className="h-16 bg-slate-100 rounded-xl" />
        <div className="h-16 bg-slate-100 rounded-xl" />
      </div>
    </div>
  );

  if (!data) return null;

  const botCfg = STATUS_CONFIG[data.botStatus] || STATUS_CONFIG.NOT_STARTED;
  const isRunning = ['CHECKING_DATA', 'LOGGING_IN', 'OPENING_WHOLESALE_PAGE', 'FILLING_FORM'].includes(data.botStatus);
  const isWaiting = data.botStatus === 'WAITING_ADMIN_APPROVAL';
  const isDone = ['SUBMITTED', 'CONFIRMED', 'WAITING_SUPPLIER_CONFIRM'].includes(data.botStatus);
  const isFailed = ['FAILED', 'LOGIN_FAILED', 'CAPTCHA_DETECTED', 'OTP_REQUIRED', 'MANUAL_FOLLOW_UP_REQUIRED'].includes(data.botStatus);

  return (
    <div className="bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-2xl border border-blue-200/60 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 bg-gradient-to-r from-[#1e3a5f] to-[#2563eb] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🤖</span>
          <div>
            <h2 className="font-bold text-white text-lg">Wholesale Automation</h2>
            <p className="text-blue-200 text-xs">{data.supplier?.displayName || 'Unknown Supplier'}</p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${botCfg.color}`}>
          {botCfg.emoji} {botCfg.label}
        </span>
      </div>

      {/* Message */}
      {message && (
        <div className={`mx-6 mt-4 px-4 py-3 rounded-lg text-sm font-medium ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {message.text}
        </div>
      )}

      <div className="p-6 space-y-5">

        {/* Info Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <InfoCard label="Supplier" value={data.supplier?.displayName || '-'} />
          <InfoCard label="Booking Method" value={data.wholesaleBookingMethod} />
          <InfoCard label="Credential" value={data.credentialStatus === 'CONFIGURED' ? `✅ ${data.credentialCount} key` : '❌ ไม่มี'} />
          <InfoCard label="Automation" value={data.automationSupported ? '✅ รองรับ' : '❌ ไม่รองรับ'} />
          <InfoCard label="External Ref" value={data.externalBookingRef || '-'} highlight={!!data.externalBookingRef} />
          <InfoCard label="Wholesale Status" value={data.wholesaleStatus} />
          <InfoCard label="Last Bot Run" value={data.lastBotRunAt ? new Date(data.lastBotRunAt).toLocaleString('th-TH') : '-'} />
          <InfoCard label="Session ID" value={data.currentSessionId?.slice(-8) || '-'} mono />
        </div>

        {/* Error Message */}
        {data.lastErrorMessage && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
            <span className="font-bold">⚠️ Error:</span> {data.lastErrorMessage}
          </div>
        )}

        {/* Wholesale URL */}
        {(data.wholesaleTourUrl || data.wholesaleBookingUrl) && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex flex-wrap gap-3">
            {data.wholesaleTourUrl && (
              <a href={data.wholesaleTourUrl} target="_blank" rel="noopener noreferrer"
                className="text-sm text-blue-700 hover:underline font-medium">🔗 Tour URL</a>
            )}
            {data.wholesaleBookingUrl && (
              <a href={data.wholesaleBookingUrl} target="_blank" rel="noopener noreferrer"
                className="text-sm text-blue-700 hover:underline font-medium">🔗 Booking URL</a>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {/* Open Wholesale Page */}
          {data.wholesaleTourUrl && (
            <ActionBtn label="🌐 Open Wholesale" color="bg-sky-600"
              onClick={() => window.open(data.wholesaleTourUrl!, '_blank')} />
          )}

          {/* Copy Booking Summary */}
          <ActionBtn label="📋 Copy Summary" color="bg-slate-600"
            onClick={handleCopySummary} />

          {/* Start Bot */}
          {(!isRunning && !isWaiting && !isDone) && (
            <ActionBtn label="🤖 Start Bot" color="bg-blue-600"
              loading={actionLoading === 'start'}
              disabled={!data.automationSupported || data.credentialStatus !== 'CONFIGURED'}
              onClick={() => handleAction('start', { startedBy: 'ADMIN' })} />
          )}

          {/* Approve & Submit */}
          {isWaiting && (
            <ActionBtn label="✅ Approve & Submit" color="bg-emerald-600"
              loading={actionLoading === 'approve'}
              onClick={async () => {
                setActionLoading('approve');
                try {
                  // Step 1: Approve
                  const approveRes = await fetch(`/api/admin/bookings/${bookingId}/wholesale-automation/approve`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ sessionId: data.currentSessionId, approvedBy: 'ADMIN' }),
                  });
                  const approveJson = await approveRes.json();
                  if (!approveJson.success) { showMsg('error', approveJson.error); return; }

                  // Step 2: Submit with token
                  const submitRes = await fetch(`/api/admin/bookings/${bookingId}/wholesale-automation/submit`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ sessionId: data.currentSessionId, approvalToken: approveJson.approvalToken }),
                  });
                  const submitJson = await submitRes.json();
                  if (submitJson.success) {
                    showMsg('success', submitJson.message || 'จองสำเร็จ!');
                  } else {
                    showMsg('error', submitJson.error);
                  }
                  await fetchData();
                } catch (e: any) { showMsg('error', e.message); }
                setActionLoading(null);
              }} />
          )}

          {/* Stop Bot */}
          {isRunning && (
            <ActionBtn label="⏹️ Stop Bot" color="bg-red-600"
              loading={actionLoading === 'stop'}
              onClick={() => handleAction('stop', { reason: 'Stopped by admin', stoppedBy: 'ADMIN' })} />
          )}

          {/* Manual Follow-up */}
          {!isDone && (
            <ActionBtn label="👤 Manual" color="bg-gray-600"
              loading={actionLoading === 'manual-follow-up'}
              onClick={() => handleAction('manual-follow-up', { reason: 'Admin chose manual', markedBy: 'ADMIN' })} />
          )}

          {/* Add External Ref */}
          <ActionBtn label="🔖 Add Ext. Ref" color="bg-amber-600"
            onClick={() => setShowExtRefForm(!showExtRefForm)} />

          {/* View Screenshots */}
          {data.screenshots.length > 0 && (
            <ActionBtn label={`📸 Screenshots (${data.screenshots.length})`} color="bg-purple-600"
              onClick={() => setShowScreenshots(!showScreenshots)} />
          )}
        </div>

        {/* External Ref Form */}
        {showExtRefForm && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
            <h4 className="font-bold text-amber-800 text-sm">🔖 เพิ่มเลขจอง Wholesale</h4>
            <div className="flex gap-2">
              <input
                value={extRef}
                onChange={e => setExtRef(e.target.value)}
                placeholder="เช่น WB-2026-12345"
                className="flex-1 px-3 py-2 rounded-lg border border-amber-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
              <button onClick={handleSaveExtRef}
                disabled={actionLoading === 'ext-ref' || !extRef.trim()}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-bold hover:bg-amber-700 disabled:opacity-50">
                {actionLoading === 'ext-ref' ? '...' : 'บันทึก'}
              </button>
            </div>
          </div>
        )}

        {/* Copy Summary Display */}
        {copySummary && (
          <div className="bg-slate-50 border border-slate-300 rounded-xl p-4">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-bold text-slate-700 text-sm">📋 Booking Summary (Copied!)</h4>
              <button onClick={() => setCopySummary('')} className="text-xs text-slate-400 hover:text-slate-600">ปิด</button>
            </div>
            <pre className="text-xs text-slate-600 whitespace-pre-wrap font-mono bg-white p-3 rounded-lg border border-slate-200 max-h-48 overflow-y-auto">{copySummary}</pre>
          </div>
        )}

        {/* Screenshots Gallery */}
        {showScreenshots && data.screenshots.length > 0 && (
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
            <h4 className="font-bold text-purple-800 text-sm mb-3">📸 Bot Screenshots</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {data.screenshots.map((s: any, i: number) => (
                <a key={i} href={s.url} target="_blank" rel="noopener noreferrer"
                  className="block bg-white rounded-lg border border-purple-200 overflow-hidden hover:shadow-md transition-shadow">
                  <img src={s.url} alt={s.label} className="w-full h-32 object-cover" />
                  <div className="px-2 py-1.5">
                    <p className="text-xs font-medium text-purple-700 truncate">{s.label}</p>
                    <p className="text-[10px] text-slate-400">{new Date(s.timestamp).toLocaleString('th-TH')}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Session Before/After */}
        {(data.screenshotBeforeUrl || data.screenshotAfterUrl) && (
          <div className="grid grid-cols-2 gap-3">
            {data.screenshotBeforeUrl && (
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="px-3 py-1.5 bg-slate-50 border-b text-xs font-bold text-slate-500">Before</div>
                <a href={data.screenshotBeforeUrl} target="_blank" rel="noopener noreferrer">
                  <img src={data.screenshotBeforeUrl} alt="Before" className="w-full h-40 object-cover" />
                </a>
              </div>
            )}
            {data.screenshotAfterUrl && (
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="px-3 py-1.5 bg-slate-50 border-b text-xs font-bold text-slate-500">After</div>
                <a href={data.screenshotAfterUrl} target="_blank" rel="noopener noreferrer">
                  <img src={data.screenshotAfterUrl} alt="After" className="w-full h-40 object-cover" />
                </a>
              </div>
            )}
          </div>
        )}

        {/* Admin Approval Info */}
        {data.adminApprovedBy && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-sm text-emerald-700">
            ✅ อนุมัติโดย <strong>{data.adminApprovedBy}</strong>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// SUB-COMPONENTS
// ============================================================

function InfoCard({ label, value, highlight, mono }: { label: string; value: string; highlight?: boolean; mono?: boolean }) {
  return (
    <div className={`rounded-xl p-3 border ${highlight ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-200'}`}>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{label}</p>
      <p className={`text-sm font-bold ${highlight ? 'text-emerald-700' : 'text-slate-800'} ${mono ? 'font-mono' : ''} truncate`}>{value}</p>
    </div>
  );
}

function ActionBtn({ label, color, onClick, loading, disabled }: {
  label: string; color: string; onClick: () => void; loading?: boolean; disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading || disabled}
      className={`${color} text-white text-xs font-bold py-2.5 px-3 rounded-xl hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed ${loading ? 'animate-pulse' : ''}`}
    >
      {loading ? '⏳...' : label}
    </button>
  );
}
