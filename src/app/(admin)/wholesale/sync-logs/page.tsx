'use client';
import React, { useState, useEffect } from "react";
import { RefreshCw, CheckCircle, XCircle, Clock, Search } from "lucide-react";

interface SyncLog {
  id: string;
  supplierId: string;
  type: string;
  status: string;
  recordsAdded: number;
  recordsUpdated: number;
  errorMessage: string | null;
  createdAt: string;
}

export default function SyncLogsPage() {
  const [logs, setLogs] = useState<SyncLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/sync-logs');
      const data = await res.json();
      setLogs(data.logs || []);
    } catch (e) {
      console.error('Failed to fetch sync logs:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLogs(); }, []);

  const filtered = logs.filter(l =>
    l.supplierId.toLowerCase().includes(search.toLowerCase())
  );

  const supplierLabel = (id: string) => {
    const map: Record<string, string> = {
      'SUP_LETGO': "Let's Go",
      'SUP_TOURFACTORY': 'Tour Factory',
      'SUP_CHECKIN': 'Check In Group',
      'SUP_GO365': 'Go365',
    };
    return map[id] || id;
  };

  const statusBadge = (status: string) => {
    const s = status.toUpperCase();
    if (s === 'SUCCESS') return { cls: 'bg-emerald-100 text-emerald-700', icon: <CheckCircle className="w-3 h-3" />, label: 'success' };
    if (s === 'FAILED' || s === 'ERROR') return { cls: 'bg-red-100 text-red-700', icon: <XCircle className="w-3 h-3" />, label: 'failed' };
    if (s === 'RUNNING') return { cls: 'bg-blue-100 text-blue-700', icon: <Clock className="w-3 h-3" />, label: 'running' };
    return { cls: 'bg-amber-100 text-amber-700', icon: <Clock className="w-3 h-3" />, label: status.toLowerCase() };
  };

  const timeAgo = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleString('th-TH', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Sync Logs</h1>
          <p className="text-slate-500 text-sm mt-1">ประวัติการซิงค์ข้อมูลจาก Wholesale API (ดึงจากฐานข้อมูลจริง)</p>
        </div>
        <button
          onClick={fetchLogs}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-bold hover:bg-primary-700 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          รีเฟรช
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <div className="text-2xl font-black text-slate-900">{logs.length}</div>
          <div className="text-xs text-slate-500">Total Logs</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <div className="text-2xl font-black text-emerald-600">{logs.filter(l => l.status === 'SUCCESS').length}</div>
          <div className="text-xs text-slate-500">Success</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <div className="text-2xl font-black text-red-600">{logs.filter(l => l.status === 'FAILED' || l.status === 'ERROR').length}</div>
          <div className="text-xs text-slate-500">Failed</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <div className="text-2xl font-black text-blue-600">{logs.reduce((sum, l) => sum + (l.recordsAdded || 0), 0)}</div>
          <div className="text-xs text-slate-500">Total Records</div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              placeholder="ค้นหาตาม Supplier..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
        {loading ? (
          <div className="p-8 text-center text-slate-400 animate-pulse">กำลังโหลด...</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3">Supplier</th>
                <th className="text-center px-4 py-3">Tours Synced</th>
                <th className="text-center px-4 py-3">Status</th>
                <th className="text-center px-4 py-3">Type</th>
                <th className="text-right px-4 py-3">Error</th>
                <th className="text-right px-4 py-3">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">ไม่พบ Sync Log</td></tr>
              ) : filtered.map(l => {
                const badge = statusBadge(l.status);
                return (
                  <tr key={l.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 text-slate-400" /> {supplierLabel(l.supplierId)}
                    </td>
                    <td className="px-4 py-3 text-center font-bold">{l.recordsAdded || 0}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${badge.cls}`}>
                        {badge.icon}{badge.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-xs text-slate-400">{l.type}</td>
                    <td className="px-4 py-3 text-right text-xs text-red-500 max-w-[200px] truncate">{l.errorMessage || '-'}</td>
                    <td className="px-4 py-3 text-right text-slate-400 text-xs">{timeAgo(l.createdAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
