export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';

export default async function DiagnosticsPage() {
  const [failedSyncs, brokenLinks, supplierHealth] = await Promise.all([
    prisma.supplierSyncLog.findMany({
      where: { status: 'FAILED' },
      orderBy: { startedAt: 'desc' },
      take: 20,
      include: { supplier: { select: { displayName: true } } },
    }),
    prisma.tour.findMany({
      where: { linkHealthStatus: { in: ['BROKEN', 'MISSING'] } },
      select: { id: true, tourCode: true, tourName: true, linkHealthStatus: true, wholesaleTourUrl: true },
      take: 30,
    }),
    prisma.supplier.findMany({
      select: {
        id: true, displayName: true, status: true,
        _count: { select: { tours: true } },
        syncLogs: { orderBy: { startedAt: 'desc' }, take: 1, select: { status: true, startedAt: true } },
      },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Wholesale Diagnostics</h1>
        <p className="text-sm text-slate-500 mt-1">ตรวจสอบปัญหาข้อมูลและ Sync</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-red-50 text-red-700 rounded-2xl p-5">
          <p className="text-xs font-bold opacity-70">Failed Syncs</p>
          <p className="text-3xl font-black mt-1">{failedSyncs.length}</p>
        </div>
        <div className="bg-amber-50 text-amber-700 rounded-2xl p-5">
          <p className="text-xs font-bold opacity-70">Broken Links</p>
          <p className="text-3xl font-black mt-1">{brokenLinks.length}</p>
        </div>
        <div className="bg-emerald-50 text-emerald-700 rounded-2xl p-5">
          <p className="text-xs font-bold opacity-70">Suppliers Active</p>
          <p className="text-3xl font-black mt-1">{supplierHealth.filter(s => s.status === 'ACTIVE').length}/{supplierHealth.length}</p>
        </div>
      </div>

      {/* Supplier Health */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="font-bold text-slate-800 mb-4">🏢 Supplier Health</h2>
        <div className="space-y-2">
          {supplierHealth.map((s) => {
            const lastSync = s.syncLogs[0];
            return (
              <div key={s.id} className="flex items-center justify-between p-3 border border-slate-100 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${s.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                  <span className="font-medium text-slate-800">{s.displayName}</span>
                  <span className="text-xs text-slate-400">{s._count.tours} tours</span>
                </div>
                <div className="flex items-center gap-2">
                  {lastSync && (
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${lastSync.status === 'SUCCESS' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{lastSync.status}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Broken Links */}
      {brokenLinks.length > 0 && (
        <div className="bg-white rounded-2xl border border-amber-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-amber-200 bg-amber-50">
            <h2 className="font-bold text-amber-800">🔗 Broken Tour Links ({brokenLinks.length})</h2>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-slate-50"><tr>
              <th className="text-left px-4 py-3 font-bold text-slate-600">Tour Code</th>
              <th className="text-left px-4 py-3 font-bold text-slate-600">ชื่อ</th>
              <th className="text-left px-4 py-3 font-bold text-slate-600">สถานะ</th>
              <th className="text-left px-4 py-3 font-bold text-slate-600">URL</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-100">
              {brokenLinks.map((t) => (
                <tr key={t.id}>
                  <td className="px-4 py-3 font-mono font-bold">{t.tourCode}</td>
                  <td className="px-4 py-3 max-w-[200px] truncate">{t.tourName}</td>
                  <td className="px-4 py-3"><span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-bold">{t.linkHealthStatus}</span></td>
                  <td className="px-4 py-3 text-xs text-slate-400 truncate max-w-[200px]">{t.wholesaleTourUrl || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Failed Syncs */}
      {failedSyncs.length > 0 && (
        <div className="bg-white rounded-2xl border border-red-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-red-200 bg-red-50">
            <h2 className="font-bold text-red-800">❌ Failed Syncs ({failedSyncs.length})</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {failedSyncs.map((log) => (
              <div key={log.id} className="px-6 py-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-800">{log.supplier?.displayName} — {log.syncType}</span>
                  <span className="text-xs text-slate-400">{new Date(log.startedAt).toLocaleString('th-TH')}</span>
                </div>
                {log.errorMessage && <p className="text-xs text-red-600 mt-1 truncate">{log.errorMessage}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
