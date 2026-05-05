'use client';

import React, { useState, useEffect, useCallback } from 'react';

type Credential = {
  id: string; supplierId: string; credentialName: string;
  username: string; hasPassword: boolean; authType: string;
  status: string; lastUsedAt: string | null;
  failedLoginCount: number; createdAt: string;
};

type SupplierInfo = { id: string; displayName: string; canonicalName: string };

export default function CredentialManagerPage() {
  const [suppliers, setSuppliers] = useState<SupplierInfo[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<string>('');
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ credentialName: '', username: '', password: '', authType: 'LOGIN_FORM' });
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);

  // Automation Config
  const [showConfig, setShowConfig] = useState(false);
  const [config, setConfig] = useState<any>(null);
  const [configForm, setConfigForm] = useState<any>({});

  // Load suppliers
  useEffect(() => {
    fetch('/api/admin/suppliers')
      .then(r => r.json())
      .then(d => { if (d.data) setSuppliers(d.data); })
      .catch(() => {});
  }, []);

  // Load credentials
  const loadCreds = useCallback(async (supplierId: string) => {
    if (!supplierId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/suppliers/${supplierId}/credentials`);
      const data = await res.json();
      if (data.success) setCredentials(data.data);
    } catch { }
    setLoading(false);
  }, []);

  useEffect(() => { if (selectedSupplier) loadCreds(selectedSupplier); }, [selectedSupplier, loadCreds]);

  // Load automation config
  const loadConfig = useCallback(async (supplierId: string) => {
    try {
      const res = await fetch(`/api/admin/suppliers/${supplierId}/automation-config`);
      const data = await res.json();
      if (data.success) {
        setConfig(data.data);
        if (data.data) setConfigForm(data.data);
      }
    } catch { }
  }, []);

  useEffect(() => { if (selectedSupplier && showConfig) loadConfig(selectedSupplier); }, [selectedSupplier, showConfig, loadConfig]);

  const showMsg = (type: 'success' | 'error', text: string) => {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 4000);
  };

  const handleCreate = async () => {
    if (!form.credentialName || !form.username || !form.password) {
      showMsg('error', 'กรุณากรอกข้อมูลให้ครบ');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/suppliers/${selectedSupplier}/credentials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        showMsg('success', 'สร้าง Credential สำเร็จ');
        setShowForm(false);
        setForm({ credentialName: '', username: '', password: '', authType: 'LOGIN_FORM' });
        loadCreds(selectedSupplier);
      } else {
        showMsg('error', data.error);
      }
    } catch (e: any) { showMsg('error', e.message); }
    setSaving(false);
  };

  const handleDelete = async (credId: string) => {
    if (!confirm('ลบ Credential นี้?')) return;
    try {
      const res = await fetch(`/api/admin/suppliers/${selectedSupplier}/credentials/${credId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) { showMsg('success', 'ลบสำเร็จ'); loadCreds(selectedSupplier); }
      else showMsg('error', data.error);
    } catch (e: any) { showMsg('error', e.message); }
  };

  const handleTestLogin = async (credId: string) => {
    setTesting(credId);
    try {
      const res = await fetch(`/api/admin/suppliers/${selectedSupplier}/credentials/test-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credentialId: credId }),
      });
      const data = await res.json();
      if (data.success) showMsg('success', `Login test: ${data.testResult.status}`);
      else showMsg('error', `Login test failed: ${data.testResult?.message || data.error}`);
      loadCreds(selectedSupplier);
    } catch (e: any) { showMsg('error', e.message); }
    setTesting(null);
  };

  const handleSaveConfig = async () => {
    try {
      const res = await fetch(`/api/admin/suppliers/${selectedSupplier}/automation-config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(configForm),
      });
      const data = await res.json();
      if (data.success) { showMsg('success', 'บันทึก Config สำเร็จ'); setConfig(data.data); }
      else showMsg('error', data.error);
    } catch (e: any) { showMsg('error', e.message); }
  };

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      ACTIVE: 'bg-emerald-100 text-emerald-700',
      LOGIN_FAILED: 'bg-red-100 text-red-700',
      DECRYPTION_FAILED: 'bg-red-100 text-red-700',
      DISABLED: 'bg-slate-200 text-slate-500',
    };
    return colors[status] || 'bg-slate-100 text-slate-600';
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1e3a5f' }}>🔐 Credential Vault</h1>
        <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
          จัดการ Username/Password สำหรับ Login เข้าเว็บ Wholesale — ข้อมูลถูก Encrypt (AES-256)
        </p>
      </div>

      {/* Message */}
      {msg && (
        <div style={{ padding: '12px 16px', borderRadius: '10px', marginBottom: '16px', background: msg.type === 'success' ? '#dcfce7' : '#fee2e2', color: msg.type === 'success' ? '#16a34a' : '#dc2626', fontWeight: 600, fontSize: '14px' }}>
          {msg.text}
        </div>
      )}

      {/* Supplier Selector */}
      <div style={{ marginBottom: '20px' }}>
        <select
          value={selectedSupplier}
          onChange={e => setSelectedSupplier(e.target.value)}
          style={{ padding: '10px 16px', borderRadius: '10px', border: '2px solid #cbd5e1', fontSize: '14px', fontWeight: 600, minWidth: '300px' }}
        >
          <option value="">— เลือก Supplier —</option>
          {suppliers.map(s => (
            <option key={s.id} value={s.id}>{s.displayName} ({s.canonicalName})</option>
          ))}
        </select>
      </div>

      {selectedSupplier && (
        <>
          {/* Actions Bar */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
            <button onClick={() => setShowForm(!showForm)}
              style={{ padding: '8px 20px', borderRadius: '10px', background: '#1e3a5f', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '13px' }}>
              ➕ เพิ่ม Credential
            </button>
            <button onClick={() => setShowConfig(!showConfig)}
              style={{ padding: '8px 20px', borderRadius: '10px', background: '#7c3aed', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '13px' }}>
              ⚙️ Automation Config
            </button>
          </div>

          {/* Create Form */}
          {showForm && (
            <div style={{ background: '#f0f9ff', border: '2px solid #bae6fd', borderRadius: '14px', padding: '20px', marginBottom: '20px' }}>
              <h3 style={{ fontWeight: 700, marginBottom: '12px', fontSize: '15px', color: '#1e3a5f' }}>🔒 เพิ่ม Credential ใหม่</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <input placeholder="ชื่อ Credential (เช่น Main Account)" value={form.credentialName}
                  onChange={e => setForm(f => ({ ...f, credentialName: e.target.value }))}
                  style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #94a3b8', fontSize: '13px' }} />
                <select value={form.authType} onChange={e => setForm(f => ({ ...f, authType: e.target.value }))}
                  style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #94a3b8', fontSize: '13px' }}>
                  <option value="LOGIN_FORM">Login Form</option>
                  <option value="API_KEY">API Key</option>
                  <option value="BASIC_AUTH">Basic Auth</option>
                </select>
                <input placeholder="Username / Email" value={form.username}
                  onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                  style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #94a3b8', fontSize: '13px' }} />
                <input placeholder="Password" type="password" value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #94a3b8', fontSize: '13px' }} />
              </div>
              <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
                <button onClick={handleCreate} disabled={saving}
                  style={{ padding: '8px 20px', borderRadius: '8px', background: '#059669', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '13px', opacity: saving ? 0.5 : 1 }}>
                  {saving ? '⏳...' : '🔐 Encrypt & Save'}
                </button>
                <button onClick={() => setShowForm(false)}
                  style={{ padding: '8px 20px', borderRadius: '8px', background: '#e2e8f0', color: '#475569', border: 'none', cursor: 'pointer', fontSize: '13px' }}>
                  ยกเลิก
                </button>
              </div>
              <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '8px' }}>
                ⚠️ Password จะถูก Encrypt ด้วย AES-256-CBC ทันที — ไม่มีใครเห็น password ใน database
              </p>
            </div>
          )}

          {/* Automation Config */}
          {showConfig && (
            <div style={{ background: '#faf5ff', border: '2px solid #c4b5fd', borderRadius: '14px', padding: '20px', marginBottom: '20px' }}>
              <h3 style={{ fontWeight: 700, marginBottom: '12px', fontSize: '15px', color: '#5b21b6' }}>⚙️ Automation Config</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '13px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <input type="checkbox" checked={configForm.automationEnabled || false}
                    onChange={e => setConfigForm((f: any) => ({ ...f, automationEnabled: e.target.checked }))} />
                  <span style={{ fontWeight: 600 }}>เปิดใช้ Automation</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <input type="checkbox" checked={configForm.requiresAdminApproval ?? true}
                    onChange={e => setConfigForm((f: any) => ({ ...f, requiresAdminApproval: e.target.checked }))} />
                  <span style={{ fontWeight: 600 }}>ต้อง Admin Approve</span>
                </label>
                <input placeholder="Login URL" value={configForm.loginUrl || ''}
                  onChange={e => setConfigForm((f: any) => ({ ...f, loginUrl: e.target.value }))}
                  style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #a78bfa', gridColumn: 'span 2' }} />
                <input placeholder="Booking URL Pattern (ใช้ {tourId} เป็น placeholder)" value={configForm.bookingUrlPattern || ''}
                  onChange={e => setConfigForm((f: any) => ({ ...f, bookingUrlPattern: e.target.value }))}
                  style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #a78bfa', gridColumn: 'span 2' }} />
                <select value={configForm.bookingMethod || 'MANUAL'}
                  onChange={e => setConfigForm((f: any) => ({ ...f, bookingMethod: e.target.value }))}
                  style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #a78bfa' }}>
                  <option value="MANUAL">Manual</option>
                  <option value="BOT_ASSISTED">Bot Assisted</option>
                  <option value="FULL_AUTO">Full Auto</option>
                </select>
                <select value={configForm.status || 'DRAFT'}
                  onChange={e => setConfigForm((f: any) => ({ ...f, status: e.target.value }))}
                  style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #a78bfa' }}>
                  <option value="DRAFT">Draft</option>
                  <option value="ACTIVE">Active</option>
                  <option value="TESTING">Testing</option>
                  <option value="DISABLED">Disabled</option>
                </select>
                <input placeholder="CAPTCHA Detection Rule (optional)" value={configForm.captchaDetectionRule || ''}
                  onChange={e => setConfigForm((f: any) => ({ ...f, captchaDetectionRule: e.target.value }))}
                  style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #a78bfa' }} />
                <input placeholder="OTP Detection Rule (optional)" value={configForm.otpDetectionRule || ''}
                  onChange={e => setConfigForm((f: any) => ({ ...f, otpDetectionRule: e.target.value }))}
                  style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #a78bfa' }} />
              </div>
              <button onClick={handleSaveConfig}
                style={{ marginTop: '12px', padding: '8px 20px', borderRadius: '8px', background: '#7c3aed', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '13px' }}>
                💾 บันทึก Config
              </button>
            </div>
          )}

          {/* Credentials Table */}
          <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700, color: '#475569' }}>ชื่อ</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700, color: '#475569' }}>Username</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700, color: '#475569' }}>Password</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700, color: '#475569' }}>Auth</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700, color: '#475569' }}>สถานะ</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700, color: '#475569' }}>ใช้ล่าสุด</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700, color: '#475569' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>กำลังโหลด...</td></tr>
                ) : credentials.length === 0 ? (
                  <tr><td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>ยังไม่มี Credential — กด "เพิ่ม Credential" เพื่อเริ่ม</td></tr>
                ) : credentials.map(c => (
                  <tr key={c.id} style={{ borderTop: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px 16px', fontWeight: 600 }}>{c.credentialName}</td>
                    <td style={{ padding: '10px 16px', fontFamily: 'monospace', color: '#64748b' }}>{c.username}</td>
                    <td style={{ padding: '10px 16px' }}>
                      <span style={{ background: '#1e293b', color: '#1e293b', padding: '2px 12px', borderRadius: '4px', fontSize: '11px' }}>
                        {c.hasPassword ? '●●●●●●●●' : 'N/A'}
                      </span>
                    </td>
                    <td style={{ padding: '10px 16px', fontSize: '12px' }}>{c.authType}</td>
                    <td style={{ padding: '10px 16px' }}>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${statusBadge(c.status)}`}>{c.status}</span>
                      {c.failedLoginCount > 0 && (
                        <span style={{ fontSize: '10px', color: '#dc2626', marginLeft: '6px' }}>⚠️ {c.failedLoginCount} fails</span>
                      )}
                    </td>
                    <td style={{ padding: '10px 16px', color: '#9ca3af', fontSize: '12px' }}>
                      {c.lastUsedAt ? new Date(c.lastUsedAt).toLocaleString('th-TH') : '-'}
                    </td>
                    <td style={{ padding: '10px 16px', display: 'flex', gap: '6px' }}>
                      <button onClick={() => handleTestLogin(c.id)}
                        disabled={testing === c.id}
                        style={{ padding: '4px 10px', borderRadius: '6px', background: '#3b82f6', color: 'white', border: 'none', cursor: 'pointer', fontSize: '11px', fontWeight: 600, opacity: testing === c.id ? 0.5 : 1 }}>
                        {testing === c.id ? '⏳' : '🔑 Test'}
                      </button>
                      <button onClick={() => handleDelete(c.id)}
                        style={{ padding: '4px 10px', borderRadius: '6px', background: '#ef4444', color: 'white', border: 'none', cursor: 'pointer', fontSize: '11px', fontWeight: 600 }}>
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
