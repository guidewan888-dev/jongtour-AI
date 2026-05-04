"use client";

import { Activity, RefreshCw, AlertTriangle, FileJson, Download } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function ApiSyncCenterPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/sync');
      const data = await res.json();
      if (data.success) {
        setLogs(data.logs || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 30000); // Auto refresh every 30s
    return () => clearInterval(interval);
  }, []);
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 font-mono text-xs">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 mb-1 font-sans">API Sync Center & Logs</h1>
          <p className="text-slate-500 font-sans">ดูประวัติการซิงก์ข้อมูล และตรวจสอบ Error Logs จาก Wholesale API</p>
        </div>
        <button className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-4 py-2 rounded flex items-center gap-2 transition-colors border border-slate-700">
          <Download size={14} /> Export Logs (CSV)
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Sync Logs */}
        <div className="bg-slate-950 border border-slate-800 rounded-lg flex flex-col">
          <div className="p-3 border-b border-slate-800 bg-black flex justify-between items-center">
            <span className="font-bold text-emerald-400 flex items-center gap-2">
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> SYNC LOGS (DATABASE)
            </span>
            <button onClick={fetchLogs} className="text-xs text-slate-400 hover:text-white flex items-center gap-1">
               <RefreshCw size={12} /> Refresh
            </button>
          </div>
          <div className="p-0 overflow-y-auto max-h-[500px]">
            <table className="w-full text-left">
              <thead className="bg-slate-900 text-slate-500 border-b border-slate-800 sticky top-0">
                <tr>
                  <th className="px-4 py-2">TIMESTAMP</th>
                  <th className="px-4 py-2">SUPPLIER</th>
                  <th className="px-4 py-2">TARGET</th>
                  <th className="px-4 py-2 text-right">RESULT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {logs.length === 0 && !loading && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-slate-500">No sync logs found in database.</td>
                  </tr>
                )}
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-900">
                    <td className="px-4 py-3 text-slate-500">{new Date(log.createdAt).toLocaleTimeString('th-TH')}</td>
                    <td className="px-4 py-3 text-emerald-400">{log.supplierId}</td>
                    <td className="px-4 py-3">{log.type}</td>
                    <td className={`px-4 py-3 text-right font-bold ${log.status === 'SUCCESS' ? 'text-emerald-400' : log.status === 'FAILED' ? 'text-rose-400' : 'text-amber-400'}`}>
                      {log.status} {log.recordsAdded !== null ? `(${log.recordsAdded} rows)` : ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Error Logs */}
        <div className="bg-slate-950 border border-slate-800 rounded-lg flex flex-col">
          <div className="p-3 border-b border-slate-800 bg-black flex justify-between items-center">
            <span className="font-bold text-rose-400 flex items-center gap-2">
              <AlertTriangle size={14} /> ERROR LOGS (ACTION REQUIRED)
            </span>
          </div>
          <div className="p-0 overflow-y-auto max-h-[500px]">
            {logs.filter(l => l.status === 'FAILED').length === 0 ? (
               <div className="p-8 text-center text-slate-500">No recent errors. System is healthy.</div>
            ) : (
               logs.filter(l => l.status === 'FAILED').map(errLog => (
                <div key={`err-${errLog.id}`} className="p-4 border-b border-slate-800 hover:bg-slate-900">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-rose-400 font-bold">Sync Failed: {errLog.type}</span>
                    <span className="text-slate-500">{new Date(errLog.createdAt).toLocaleTimeString('th-TH')}</span>
                  </div>
                  <p className="text-slate-400 mb-2">Supplier: {errLog.supplierId} | Error: {errLog.errorMessage || 'Unknown Error'}</p>
                  <div className="flex gap-2">
                    <button onClick={async () => {
                       window.alert(`Retrying sync for ${errLog.supplierId}...`);
                       await fetch('/api/admin/sync', { method: 'POST', body: JSON.stringify({ supplierId: errLog.supplierId }) });
                       window.alert("Sync triggered!");
                       fetchLogs();
                    }} className="bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded hover:bg-emerald-500/20 flex items-center gap-1">
                      <RefreshCw size={12}/> Retry Now
                    </button>
                  </div>
                </div>
               ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
