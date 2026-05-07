'use client';
import React, { useState, useEffect } from 'react';

import { getWholesaleDashboardData } from './actions';

export default function AdminWholesaleDashboardPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    getWholesaleDashboardData().then(setData);
  }, []);

  const getStatusBadge = (status: string) => {
    if (status === 'ONLINE') return <span className="bg-emerald-100 text-emerald-700 border border-emerald-200 text-[10px] font-black px-2 py-0.5 rounded tracking-wider flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> ONLINE</span>;
    if (status === 'ERROR') return <span className="bg-red-100 text-red-700 border border-red-200 text-[10px] font-black px-2 py-0.5 rounded tracking-wider flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> CONNECTION ERROR</span>;
    return null;
  };

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
          <svg className="w-10 h-10 text-orange-500 animate-spin mb-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          <p className="text-slate-500 font-bold">กำลังเชื่อมต่อ Wholesale API...</p>
        </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black text-slate-900 tracking-tight">Wholesale Data Control Center</h1>

        {/* KPI Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 animate-fade-in-up">
            
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Connected Suppliers</div>
              <div className="text-3xl font-black text-slate-900">{data.metrics.supplierCount}</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Global API Status</div>
              <div className="text-xl font-black text-emerald-600 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                {data.metrics.apiStatus}
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Last Full Sync</div>
              <div className="text-lg font-black text-slate-900">{data.metrics.lastSync}</div>
            </div>

            <div className="bg-red-50 p-5 rounded-2xl border border-red-100 shadow-sm flex flex-col justify-center">
              <div className="text-[10px] font-bold text-red-600 uppercase tracking-wider mb-2">Sync Errors (Last 24h)</div>
              <div className="text-3xl font-black text-red-600">{data.metrics.syncErrors}</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                Missing Booking Links
                <svg className="w-3.5 h-3.5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              </div>
              <div className="text-3xl font-black text-slate-900">{data.metrics.missingLinks}</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Needs Content Review</div>
              <div className="text-3xl font-black text-slate-900">{data.metrics.needReview}</div>
            </div>

          </div>

          {/* Integration Status Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-fade-in-up">
            <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex justify-between items-center">
              <h2 className="font-bold text-slate-800 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                Active Integrations
              </h2>
              <button className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors">
                + Add New Provider
              </button>
            </div>
            
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-sm text-left">
                <thead className="bg-white text-slate-500 font-bold border-b border-slate-200 text-[10px] uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Wholesaler</th>
                    <th className="px-6 py-4">Connection Type</th>
                    <th className="px-6 py-4 text-center">Status</th>
                    <th className="px-6 py-4 text-right">Tours Synced</th>
                    <th className="px-6 py-4 text-center">Error Rate</th>
                    <th className="px-6 py-4">Last Synced</th>
                    <th className="px-6 py-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.suppliers.map((sup: any) => (
                    <tr key={sup.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-white bg-${sup.color}-500 shadow-sm`}>
                            {sup.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{sup.name}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{sup.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-slate-100 text-slate-600 font-bold text-[10px] px-2 py-1 rounded">
                          {sup.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {getStatusBadge(sup.status)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-black text-slate-900 text-base">{sup.toursCount}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`font-bold ${parseFloat(sup.errorRate) > 5 ? 'text-red-600' : 'text-slate-500'}`}>
                          {sup.errorRate}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500 font-medium">
                        {sup.lastPulled}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button className="bg-white border border-slate-200 text-slate-600 hover:text-orange-600 hover:border-orange-200 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm">
                            Configure
                          </button>
                          <button className="bg-white border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-200 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm">
                            View Logs
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Failed Jobs + Real-time Logs */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in-up">
            {/* Failed Jobs Queue — REAL DATA */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center justify-between">
                Failed Jobs Queue
                {data.failedLogs.length > 0 && (
                  <span className="text-[10px] bg-red-50 text-red-600 px-2 py-1 rounded font-bold">{data.failedLogs.length} Failed</span>
                )}
              </h3>
              <div className="space-y-3">
                {data.failedLogs.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-3xl mb-2">✅</p>
                    <p className="text-sm font-bold text-slate-500">ไม่มี Job ที่ล้มเหลว</p>
                  </div>
                ) : (
                  data.failedLogs.map((log: any) => (
                    <div key={log.id} className="p-3 border border-red-100 bg-red-50/50 rounded-xl">
                      <div className="text-sm font-bold text-slate-900">{log.supplier}</div>
                      <div className="text-xs text-red-600 mt-0.5">{log.error}</div>
                      <div className="text-[10px] text-slate-400 mt-1">{log.time}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            {/* Real-time System Logs — REAL DATA */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-sm p-6 text-green-400 font-mono text-xs overflow-hidden flex flex-col">
              <h3 className="font-bold text-white mb-4 flex items-center justify-between font-sans">
                Real-time System Logs
                <span className="flex items-center gap-1.5 text-[10px] text-slate-400"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Live</span>
              </h3>
              <div className="flex-1 overflow-y-auto space-y-1 opacity-80 max-h-[200px]">
                {data.recentLogs.length === 0 ? (
                  <div className="text-slate-500">ยังไม่มี Sync Log...</div>
                ) : (
                  data.recentLogs.map((log: any, i: number) => (
                    <div key={i} className={log.status === 'ERROR' ? 'text-red-400' : log.status === 'OK' ? 'text-green-400' : 'text-yellow-400'}>
                      {log.time} {log.msg}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

    </div>
  );
}
