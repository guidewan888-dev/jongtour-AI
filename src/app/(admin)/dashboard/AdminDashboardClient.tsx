'use client';
import React, { useState, useEffect } from 'react';

export default function AdminDashboardClient({ initialData }: { initialData: any }) {
  const data = initialData;
  const recentBookings = Array.isArray(data?.recentBookings) ? data.recentBookings : [];
  const aiAlerts = Array.isArray(data?.aiAlerts) ? data.aiAlerts : [];
  const tasksToday = Array.isArray(data?.tasksToday) ? data.tasksToday : [];
  const syncStatus = Array.isArray(data?.syncStatus) ? data.syncStatus : [];

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <svg className="w-10 h-10 text-orange-500 animate-spin mb-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        <p className="text-slate-500 font-bold">กำลังโหลดระบบส่วนกลาง...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">System Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">ภาพรวมระบบ Jongtour — รายการจอง, โฮลเซล, AI Agent</p>
      </div>

      {/* Section 1: Quick Actions */}
      <div className="flex flex-wrap gap-4">
        <a 
          href="/manual-booking"
          className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Create Manual Booking
        </a>
        <a 
          href="/wholesale/sync"
          className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          Force Sync Wholesale
        </a>
        <a 
          href="/ai-center/review-queue"
          className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
          View AI Review Queue <span className="bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded text-[10px] ml-1">{data.kpi.aiReview}</span>
        </a>
        <a 
          href="/sales/leads"
          className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-colors flex items-center gap-2 ml-auto"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
          Create Lead (To Sales)
        </a>
      </div>

      {/* Section 2: KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <a href="/bookings" className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
          <div className="text-slate-500 text-xs font-bold mb-1">Bookings Today</div>
          <div className="text-3xl font-black text-slate-900">{data.kpi.bookingsToday}</div>
        </a>
        <a href="/bookings" className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm border-l-4 border-l-amber-500 hover:shadow-md transition-shadow">
          <div className="text-slate-500 text-xs font-bold mb-1">Pending Bookings</div>
          <div className="text-3xl font-black text-slate-900">{data.kpi.pendingBookings}</div>
        </a>
        <a href="/bookings" className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm border-l-4 border-l-purple-500 hover:shadow-md transition-shadow">
          <div className="text-slate-500 text-xs font-bold mb-1 flex items-center gap-1">
            Waiting Wholesale
            {data.kpi.waitingWholesale > 0 && <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>}
          </div>
          <div className="text-3xl font-black text-slate-900">{data.kpi.waitingWholesale}</div>
        </a>
        <a href="/payments" className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm border-l-4 border-l-orange-500 hover:shadow-md transition-shadow">
          <div className="text-slate-500 text-xs font-bold mb-1">Payment Pending</div>
          <div className="text-3xl font-black text-slate-900">{data.kpi.paymentPending}</div>
        </a>
        <a href="/ai-center/review-queue" className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm border-l-4 border-l-indigo-500 hover:shadow-md transition-shadow">
          <div className="text-slate-500 text-xs font-bold mb-1">AI Review Needed</div>
          <div className="text-3xl font-black text-slate-900">{data.kpi.aiReview}</div>
        </a>
        <a href="/wholesale/error-logs" className={`bg-white rounded-2xl p-5 border shadow-sm border-l-4 hover:shadow-md transition-shadow ${data.kpi.syncErrors > 0 ? 'border-red-500 border-red-200 bg-red-50' : 'border-emerald-500 border-slate-200'}`}>
          <div className={`${data.kpi.syncErrors > 0 ? 'text-red-600' : 'text-slate-500'} text-xs font-bold mb-1`}>Sync Errors</div>
          <div className="text-3xl font-black text-slate-900">{data.kpi.syncErrors}</div>
        </a>
      </div>

      {/* Section 2.5: World Connection Sync Widget */}
      <WorldConnectionWidget />

      {/* Section 3: Grids Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (Span 2) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Recent Bookings Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-900">Recent Bookings (Real-time)</h3>
              <a href="/bookings" className="text-xs font-bold text-orange-600 hover:text-orange-700">View All</a>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-white text-slate-500 font-bold border-b border-slate-100 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3">ID / Time</th>
                    <th className="px-6 py-3">Customer / Agent</th>
                    <th className="px-6 py-3">Tour / Pax</th>
                    <th className="px-6 py-3 text-right">Total (THB)</th>
                    <th className="px-6 py-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentBookings.map((b: any) => (
                    <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-3">
                        <a href={`/bookings/${b.id}`} className="font-bold text-slate-900 hover:text-blue-600">{b.id}</a>
                        <div className="text-[10px] text-slate-500">{b.time}</div>
                      </td>
                      <td className="px-6 py-3 font-medium text-slate-700">{b.customer}</td>
                      <td className="px-6 py-3">
                        <div className="text-slate-900 font-medium truncate max-w-[180px]">{b.tour}</div>
                        <div className="text-[10px] text-slate-500">{b.pax} Pax</div>
                      </td>
                      <td className="px-6 py-3 text-right font-black text-slate-900">
                        {Number(b?.total ?? 0).toLocaleString('th-TH')}
                      </td>
                      <td className="px-6 py-3 text-center">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${
                          b.status === 'WAITING_WHOLESALE' ? 'bg-purple-100 text-purple-700' :
                          b.status === 'PAYMENT_PENDING' ? 'bg-orange-100 text-orange-700' :
                          'bg-emerald-100 text-emerald-700'
                        }`}>
                          {String(b?.status ?? 'UNKNOWN').replaceAll('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {recentBookings.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-slate-400 text-sm">ยังไม่มีรายการจองในระบบ</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* AI Alerts & Warnings */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-red-50/50">
              <h3 className="font-bold text-red-900 flex items-center gap-2">
                <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                AI System Alerts
              </h3>
            </div>
            <div className="p-4 space-y-3">
              {aiAlerts.length === 0 && (
                <div className="text-center py-6 text-slate-400 text-sm">✅ ไม่มีการแจ้งเตือนจาก AI</div>
              )}
              {aiAlerts.map((alertItem: any) => (
                <div key={alertItem.id} className="p-4 rounded-xl border border-red-100 bg-red-50/30 flex items-start gap-3">
                  <div className="mt-0.5 text-red-500">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-slate-900 text-sm mb-1">{String(alertItem?.type ?? 'ALERT').replaceAll('_', ' ')}</div>
                    <div className="text-xs text-slate-600 leading-relaxed">{alertItem.message}</div>
                  </div>
                  <a 
                    href="/ai-center/review-queue"
                    className="text-xs font-bold text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Investigate
                  </a>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column (Span 1) */}
        <div className="space-y-8">
          
          {/* Tasks Today */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <h3 className="font-bold text-slate-900 mb-4">Admin Tasks</h3>
            <div className="space-y-3">
              {tasksToday.length === 0 && (
                <div className="text-center py-4 text-slate-400 text-sm">ยังไม่มีงานวันนี้</div>
              )}
              {tasksToday.map((task: any) => (
                <div key={task.id} className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer group">
                  <div className={`w-5 h-5 mt-0.5 rounded border flex items-center justify-center ${task.status === 'COMPLETED' ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300'}`}>
                    {task.status === 'COMPLETED' && <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                  </div>
                  <div>
                    <div className={`text-sm font-medium ${task.status === 'COMPLETED' ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                      {task.title}
                    </div>
                    {task.priority === 'HIGH' && task.status !== 'COMPLETED' && (
                      <span className="text-[9px] font-bold text-red-500 uppercase tracking-wider mt-1 block">Priority: High</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Wholesale Sync Status */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
              <h3 className="font-bold text-slate-900">Wholesale Sync Status</h3>
              <a href="/wholesale/sync-logs" className="text-xs font-bold text-orange-600 hover:text-orange-700">View Logs</a>
            </div>
            <div className="divide-y divide-slate-100">
              {syncStatus.length === 0 && (
                <div className="p-4 text-center text-slate-400 text-sm">ยังไม่มีข้อมูล Sync</div>
              )}
              {syncStatus.map((sync: any, idx: number) => (
                <div key={idx} className="p-4">
                  <div className="flex justify-between items-center mb-1">
                    <a href={`/wholesale/suppliers`} className="font-bold text-sm text-slate-800 hover:text-blue-600">{sync.supplier}</a>
                    <span className={`w-2 h-2 rounded-full ${
                      sync.status === 'SUCCESS' ? 'bg-emerald-500' :
                      sync.status === 'WARNING' ? 'bg-amber-500 animate-pulse' :
                      'bg-red-500 animate-pulse'
                    }`}></span>
                  </div>
                  <div className="text-xs text-slate-500 mb-2">Last sync: {sync.lastSync}</div>
                  
                  {sync.status === 'SUCCESS' ? (
                    <div className="flex gap-4 mt-2">
                      <div className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded text-[10px] font-bold">+{sync.added} New</div>
                      <div className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-[10px] font-bold">~{sync.updated} Updated</div>
                    </div>
                  ) : (
                    <div className={`mt-2 text-[10px] font-bold p-2 rounded ${sync.status === 'WARNING' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'}`}>
                      {sync.message}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

// ─── World Connection Sync Widget ────────────────────────────────────
function WorldConnectionWidget() {
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [stats, setStats] = useState<{ tours: number; lastSync: string | null; status: string } | null>(null);

  useEffect(() => {
    // Fetch WC stats on mount
    fetch('/api/scraper/sync')
      .then(r => r.json())
      .then(d => {
        if (d.ok && d.runs) {
          const wcRun = d.runs.find((r: any) => r.site_name === 'worldconnection');
          if (wcRun) {
            setStats({
              tours: wcRun.tours_scraped || 0,
              lastSync: wcRun.started_at,
              status: wcRun.status || 'unknown',
            });
          }
        }
      })
      .catch(() => {});

    // Also fetch tour count
    fetch('/api/tours/scraper-list?site=worldconnection&limit=1')
      .then(r => r.json())
      .then(d => {
        if (d.total !== undefined) {
          setStats(prev => prev ? { ...prev, tours: d.total } : { tours: d.total, lastSync: null, status: 'unknown' });
        }
      })
      .catch(() => {});
  }, []);

  const handleSync = async () => {
    if (syncing) return;
    setSyncing(true);
    setResult(null);
    try {
      const res = await fetch('/api/scraper/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ site: 'worldconnection' }),
      });
      const data = await res.json();
      setResult(data.ok ? `✅ ${data.message}` : `❌ ${data.error}`);
    } catch {
      setResult('❌ Network error');
    } finally {
      setSyncing(false);
      setTimeout(() => setResult(null), 6000);
    }
  };

  const formatTime = (iso: string | null) => {
    if (!iso) return '-';
    try { return new Date(iso).toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' }); } catch { return iso; }
  };

  return (
    <div className="bg-gradient-to-r from-orange-50 via-amber-50 to-yellow-50 rounded-2xl border border-orange-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Left: Info */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white rounded-xl border border-orange-200 flex items-center justify-center p-2 shadow-sm">
            <img src="/images/logos/worldconnection.png" alt="World Connection" className="w-full h-full object-contain" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-slate-900 text-base">World Connection</h3>
              <span className="text-[10px] font-bold bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">Auto-Sync</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                📊 <b className="text-slate-700">{stats?.tours ?? '...'}</b> โปรแกรมทัวร์
              </span>
              <span className="flex items-center gap-1">
                🕐 Last sync: <b className="text-slate-700">{formatTime(stats?.lastSync ?? null)}</b>
              </span>
            </div>
          </div>
        </div>

        {/* Center: Schedule Info */}
        <div className="hidden lg:block bg-white/60 backdrop-blur-sm rounded-xl border border-orange-100 px-4 py-2.5 text-center">
          <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mb-0.5">ซิ้งอัตโนมัติ</p>
          <p className="text-sm font-bold text-orange-700">วันละ 1 ครั้ง</p>
          <p className="text-[10px] text-slate-400">ทุกวัน 06:15 น.</p>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          <a
            href="/scraper?site=worldconnection"
            className="px-4 py-2 text-sm font-medium text-orange-700 bg-white border border-orange-200 rounded-lg hover:bg-orange-50 transition-colors"
          >
            📋 ดูข้อมูลทัวร์
          </a>
          <button
            onClick={handleSync}
            disabled={syncing}
            className={`px-5 py-2 text-sm font-bold rounded-lg transition-all shadow-sm flex items-center gap-2 ${
              syncing
                ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:shadow-lg hover:scale-[1.02]'
            }`}
          >
            {syncing ? (
              <>
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Syncing...
              </>
            ) : (
              <>🔄 Sync WC Now</>
            )}
          </button>
        </div>
      </div>

      {/* Result toast */}
      {result && (
        <div className="px-6 pb-3">
          <div className={`px-4 py-2 rounded-lg text-sm font-medium ${result.startsWith('✅') ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {result}
          </div>
        </div>
      )}
    </div>
  );
}
