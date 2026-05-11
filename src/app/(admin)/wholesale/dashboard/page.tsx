export const dynamic = 'force-dynamic';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getUnifiedErrorLogs, getWholesaleStatusData } from '@/lib/wholesale-sync';

function formatDateTime(value: string | null) {
  if (!value) return '-';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '-';
  return parsed.toLocaleString('th-TH');
}

export default async function AdminWholesaleDashboardPage() {
  const [{ wholesalers, recentLogs, summary }, missingLinks, pendingReviewCount, errorLogs] = await Promise.all([
    getWholesaleStatusData(),
    prisma.tour.count({ where: { bookingUrl: null } }),
    prisma.aiReviewQueue.count({ where: { status: 'pending' } }),
    getUnifiedErrorLogs(10),
  ]);

  const latestSync = wholesalers
    .map((wholesaler) => wholesaler.lastSync)
    .filter(Boolean)
    .sort((a, b) => new Date(b as string).getTime() - new Date(a as string).getTime())[0] || null;

  const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
  const syncErrors24h = recentLogs.filter((log) => {
    const time = new Date(log.time as string).getTime();
    return time >= dayAgo && ['FAILED', 'ERROR'].includes(String(log.status).toUpperCase());
  }).length;

  const failedLogs = errorLogs.slice(0, 5);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black text-slate-900 tracking-tight">Wholesale Data Control Center</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Connected Suppliers</div>
          <div className="text-3xl font-black text-slate-900">{summary.totalWholesalers}</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Active</div>
          <div className="text-3xl font-black text-emerald-600">{summary.activeWholesalers}</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Last Full Sync</div>
          <div className="text-sm font-bold text-slate-900">{formatDateTime(latestSync)}</div>
        </div>
        <div className="bg-red-50 p-5 rounded-2xl border border-red-100 shadow-sm">
          <div className="text-[10px] font-bold text-red-600 uppercase tracking-wider mb-2">Sync Errors (24h)</div>
          <div className="text-3xl font-black text-red-600">{syncErrors24h}</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Missing Booking Links</div>
          <div className="text-3xl font-black text-slate-900">{missingLinks}</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Needs Human Review</div>
          <div className="text-3xl font-black text-slate-900">{pendingReviewCount}</div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex justify-between items-center">
          <h2 className="font-bold text-slate-800">Active Integrations</h2>
          <Link href="/wholesale/sync" className="text-sm font-bold text-blue-600 hover:text-blue-700">
            เปิด Sync Center
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-white text-slate-500 font-bold border-b border-slate-200 text-[10px] uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Wholesaler</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Tours Synced</th>
                <th className="px-6 py-4">Last Synced</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {wholesalers.map((supplier) => (
                <tr key={supplier.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900">{supplier.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{supplier.supplierId}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-slate-100 text-slate-600 font-bold text-[10px] px-2 py-1 rounded">
                      {supplier.type === 'api' ? 'API' : 'SCRAPER'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${supplier.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                      {supplier.status === 'active' ? 'ONLINE' : 'OFFLINE'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-black text-slate-900">{supplier.tourCount}</td>
                  <td className="px-6 py-4 text-xs text-slate-500">{formatDateTime(supplier.lastSync)}</td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Link href="/wholesale/sync-logs" className="bg-white border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-200 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm">
                        View Logs
                      </Link>
                      <Link href="/wholesale/credentials" className="bg-white border border-slate-200 text-slate-600 hover:text-orange-600 hover:border-orange-200 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm">
                        Configure
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
              {wholesalers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400">ยังไม่มีข้อมูล supplier/scraper</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h3 className="font-bold text-slate-800 mb-4">Failed Jobs Queue</h3>
          <div className="space-y-3">
            {failedLogs.length === 0 ? (
              <div className="text-center py-8 text-slate-500">ไม่มี Job ที่ล้มเหลว</div>
            ) : (
              failedLogs.map((log) => (
                <div key={log.id} className="p-3 border border-red-100 bg-red-50/50 rounded-xl">
                  <div className="text-sm font-bold text-slate-900">{log.supplier}</div>
                  <div className="text-xs text-red-600 mt-0.5">{log.message}</div>
                  <div className="text-[10px] text-slate-400 mt-1">{formatDateTime(log.createdAt)}</div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-sm p-6 text-green-400 font-mono text-xs overflow-hidden flex flex-col">
          <h3 className="font-bold text-white mb-4 flex items-center justify-between font-sans">
            Real-time System Logs
            <span className="flex items-center gap-1.5 text-[10px] text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live
            </span>
          </h3>
          <div className="flex-1 overflow-y-auto space-y-1 opacity-90 max-h-[220px]">
            {recentLogs.length === 0 ? (
              <div className="text-slate-500">ยังไม่มี Sync Log...</div>
            ) : (
              recentLogs.slice(0, 20).map((log) => {
                const state = String(log.status).toUpperCase();
                return (
                  <div key={log.id} className={state === 'FAILED' || state === 'ERROR' ? 'text-red-400' : state === 'SUCCESS' ? 'text-green-400' : 'text-yellow-400'}>
                    [{new Date(log.time as string).toLocaleTimeString('th-TH')}] {log.supplier}: {state} ({log.records})
                    {log.error ? ` — ${log.error}` : ''}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
