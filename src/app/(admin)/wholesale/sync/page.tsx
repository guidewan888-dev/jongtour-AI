'use client';
import React, { useState, useEffect, useCallback } from 'react';
import {
  RefreshCw, CheckCircle, XCircle, Clock, Database, Globe,
  Wifi, WifiOff, FileText, TrendingUp, AlertTriangle, ChevronDown, ChevronUp
} from 'lucide-react';

interface Wholesaler {
  id: string;
  name: string;
  slug: string;
  type: 'api' | 'scraper';
  status: string;
  tourCount: number;
  pdfCount: number;
  pdfCoverage: number | null;
  lastSync: string | null;
  lastSyncStatus: string | null;
  lastSyncRecords: number;
  lastSyncError: string | null;
  syncEndpoint: string | null;
  syncBody: any;
}

interface LogEntry {
  id: string;
  supplier: string;
  type: string;
  status: string;
  records: number;
  error: string | null;
  time: string;
}

interface Summary {
  totalWholesalers: number;
  activeWholesalers: number;
  totalTours: number;
  apiSuppliers: number;
  scraperSites: number;
}

const TYPE_COLORS = {
  api: { bg: 'bg-violet-100', text: 'text-violet-700', label: 'API' },
  scraper: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Scraper' },
};

const SUPPLIER_COLORS: Record<string, string> = {
  "Let's Go": 'from-green-500 to-emerald-600',
  'Tour Factory': 'from-purple-500 to-violet-600',
  'Check In Group': 'from-teal-500 to-cyan-600',
  'World Connection': 'from-orange-500 to-red-500',
  'iTravels Center': 'from-sky-500 to-blue-600',
  'Best International': 'from-rose-500 to-pink-600',
  'GS25 Travel': 'from-emerald-500 to-green-600',
  'Go365 Travel': 'from-blue-500 to-indigo-600',
};

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return 'ไม่เคย sync';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'เมื่อกี้';
  if (mins < 60) return `${mins} นาทีที่แล้ว`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} ชม.ที่แล้ว`;
  const days = Math.floor(hours / 24);
  return `${days} วันที่แล้ว`;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleString('th-TH', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function StatusBadge({ status }: { status: string | null }) {
  if (!status) return <span className="text-xs text-slate-400">-</span>;
  const s = status.toUpperCase();
  if (s === 'SUCCESS' || s === 'DONE')
    return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700"><CheckCircle className="w-3 h-3" />สำเร็จ</span>;
  if (s === 'FAILED' || s === 'ERROR')
    return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700"><XCircle className="w-3 h-3" />ล้มเหลว</span>;
  if (s === 'RUNNING')
    return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700"><Clock className="w-3 h-3 animate-spin" />กำลังทำงาน</span>;
  return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600">{status}</span>;
}

export default function UnifiedSyncDashboard() {
  const [wholesalers, setWholesalers] = useState<Wholesaler[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState<Record<string, boolean>>({});
  const [syncResults, setSyncResults] = useState<Record<string, { ok: boolean; msg: string }>>({});
  const [showLogs, setShowLogs] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/wholesale-status');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setWholesalers(data.wholesalers || []);
      setLogs(data.recentLogs || []);
      setSummary(data.summary || null);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSync = async (w: Wholesaler) => {
    if (!w.syncEndpoint) return;
    setSyncing(prev => ({ ...prev, [w.id]: true }));
    setSyncResults(prev => ({ ...prev, [w.id]: { ok: true, msg: '⏳ กำลัง Sync...' } }));
    try {
      const res = await fetch(w.syncEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(w.syncBody || {}),
      });
      const data = await res.json();
      if (res.ok) {
        const count = data.synced || data.recordCount || data.totalRecords || 0;
        setSyncResults(prev => ({
          ...prev,
          [w.id]: { ok: true, msg: `✅ สำเร็จ! ${count} โปรแกรม` },
        }));
        // Refresh data after sync
        setTimeout(fetchData, 2000);
      } else {
        setSyncResults(prev => ({
          ...prev,
          [w.id]: { ok: false, msg: `❌ ${data.message || data.error || 'Error'}` },
        }));
      }
    } catch (err: any) {
      setSyncResults(prev => ({
        ...prev,
        [w.id]: { ok: false, msg: `❌ ${err.message}` },
      }));
    } finally {
      setSyncing(prev => ({ ...prev, [w.id]: false }));
    }
  };

  const handleSyncAll = async () => {
    const syncable = wholesalers.filter(w => w.syncEndpoint);
    for (const w of syncable) {
      await handleSync(w);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-slate-200 rounded-xl w-64" />
        <div className="grid grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-24 bg-slate-200 rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="h-48 bg-slate-200 rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
        <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-red-700 mb-2">ไม่สามารถโหลดข้อมูลได้</h2>
        <p className="text-sm text-red-500 mb-4">{error}</p>
        <button onClick={fetchData} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 transition-colors">ลองใหม่</button>
      </div>
    );
  }

  const apiWholesalers = wholesalers.filter(w => w.type === 'api');
  const scraperWholesalers = wholesalers.filter(w => w.type === 'scraper');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Database className="w-6 h-6 text-primary" />
            Wholesale Sync Center
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            ศูนย์รวมการจัดการข้อมูลโฮลเซลทั้งหมด — API + Scraper
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> รีเฟรช
          </button>
          <button
            onClick={handleSyncAll}
            disabled={Object.values(syncing).some(Boolean)}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary to-primary-600 text-white rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-primary/25 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${Object.values(syncing).some(Boolean) ? 'animate-spin' : ''}`} />
            Sync ทั้งหมด
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-4 text-white">
            <p className="text-xs font-medium text-white/60 mb-1">โฮลเซลทั้งหมด</p>
            <p className="text-3xl font-black">{summary.totalWholesalers}</p>
            <p className="text-xs text-white/40 mt-1">{summary.apiSuppliers} API · {summary.scraperSites} Scraper</p>
          </div>
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-4 text-white">
            <p className="text-xs font-medium text-white/70 mb-1">Active</p>
            <p className="text-3xl font-black">{summary.activeWholesalers}/{summary.totalWholesalers}</p>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-4 text-white">
            <p className="text-xs font-medium text-white/70 mb-1">ทัวร์ทั้งหมด</p>
            <p className="text-3xl font-black">{summary.totalTours.toLocaleString()}</p>
          </div>
          <div className="bg-gradient-to-br from-violet-500 to-violet-600 rounded-2xl p-4 text-white">
            <p className="text-xs font-medium text-white/70 mb-1">API Suppliers</p>
            <p className="text-3xl font-black">{summary.apiSuppliers}</p>
            <p className="text-xs text-white/40 mt-1">{summary.apiSuppliers} ราย</p>
          </div>
          <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl p-4 text-white">
            <p className="text-xs font-medium text-white/70 mb-1">Scraper Tours</p>
            <p className="text-3xl font-black">{scraperWholesalers.reduce((s, w) => s + w.tourCount, 0)}</p>
            <p className="text-xs text-white/40 mt-1">{summary.scraperSites} เว็บไซต์</p>
          </div>
        </div>
      )}

      {/* All Wholesalers Grid */}
      <div>
        <h2 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
          <Globe className="w-5 h-5 text-slate-400" />
          โฮลเซลทั้งหมด
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {wholesalers.map(w => {
            const gradient = SUPPLIER_COLORS[w.name] || 'from-slate-500 to-slate-600';
            const typeInfo = TYPE_COLORS[w.type];
            const isSyncing = syncing[w.id];
            const result = syncResults[w.id];

            return (
              <div key={w.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all">
                {/* Color header */}
                <div className={`bg-gradient-to-r ${gradient} px-4 py-3 flex items-center justify-between`}>
                  <div>
                    <h3 className="text-white font-bold text-sm">{w.name}</h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${typeInfo.bg} ${typeInfo.text}`}>
                        {typeInfo.label}
                      </span>
                      {w.status === 'active' ? (
                        <span className="flex items-center gap-1 text-[10px] text-white/80"><Wifi className="w-2.5 h-2.5" />Active</span>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] text-white/60"><WifiOff className="w-2.5 h-2.5" />Inactive</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-white">{w.tourCount}</p>
                    <p className="text-[10px] text-white/60">โปรแกรม</p>
                  </div>
                </div>

                {/* Body */}
                <div className="p-4 space-y-3">
                  {/* PDF Coverage (scraper only) */}
                  {w.pdfCoverage !== null && (
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-slate-500 flex items-center gap-1"><FileText className="w-3 h-3" />PDF</span>
                        <span className="font-bold text-slate-700">{w.pdfCount}/{w.tourCount} ({w.pdfCoverage}%)</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${w.pdfCoverage >= 90 ? 'bg-emerald-500' : w.pdfCoverage >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                          style={{ width: `${w.pdfCoverage}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Last Sync */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">Last sync</span>
                    <div className="text-right">
                      <StatusBadge status={w.lastSyncStatus} />
                      <p className="text-[10px] text-slate-400 mt-0.5">{timeAgo(w.lastSync)}</p>
                    </div>
                  </div>

                  {/* Sync Result */}
                  {result && (
                    <div className={`text-xs font-medium px-3 py-2 rounded-lg ${result.ok ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                      {result.msg}
                    </div>
                  )}

                  {/* Sync Button */}
                  {w.syncEndpoint && (
                    <button
                      onClick={() => handleSync(w)}
                      disabled={isSyncing}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 disabled:opacity-50 transition-colors"
                    >
                      <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                      {isSyncing ? 'กำลัง Sync...' : 'Sync ตอนนี้'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Sync Logs */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <button
          onClick={() => setShowLogs(!showLogs)}
          className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-slate-400" />
            <h2 className="font-bold text-slate-800">Sync Logs ล่าสุด</h2>
            <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{logs.length} รายการ</span>
          </div>
          {showLogs ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
        </button>

        {showLogs && (
          <div className="border-t border-slate-100">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold">Supplier</th>
                  <th className="text-center px-4 py-3 font-semibold">ประเภท</th>
                  <th className="text-center px-4 py-3 font-semibold">สถานะ</th>
                  <th className="text-center px-4 py-3 font-semibold">จำนวน</th>
                  <th className="text-right px-4 py-3 font-semibold">Error</th>
                  <th className="text-right px-4 py-3 font-semibold">เวลา</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {logs.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">ไม่พบ Sync Log</td></tr>
                ) : logs.map(l => {
                  const typeInfo = TYPE_COLORS[l.type as keyof typeof TYPE_COLORS] || TYPE_COLORS.api;
                  return (
                    <tr key={l.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-800">{l.supplier}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${typeInfo.bg} ${typeInfo.text}`}>{typeInfo.label}</span>
                      </td>
                      <td className="px-4 py-3 text-center"><StatusBadge status={l.status} /></td>
                      <td className="px-4 py-3 text-center font-bold text-slate-700">{l.records || 0}</td>
                      <td className="px-4 py-3 text-right text-xs text-red-500 max-w-[200px] truncate">{l.error || '-'}</td>
                      <td className="px-4 py-3 text-right text-xs text-slate-400">{formatDate(l.time)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
