export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';

export default async function WholesaleSyncPage() {
  const syncLogs = await prisma.supplierSyncLog.findMany({
    include: {
      supplier: { select: { displayName: true, canonicalName: true } },
    },
    orderBy: { startedAt: 'desc' },
    take: 50,
  });

  const suppliers = await prisma.supplier.findMany({
    select: { id: true, displayName: true, canonicalName: true, status: true, syncFrequency: true },
    orderBy: { displayName: 'asc' },
  });

  const stats = {
    total: syncLogs.length,
    success: syncLogs.filter(l => l.status === 'SUCCESS').length,
    failed: syncLogs.filter(l => l.status === 'FAILED').length,
    running: syncLogs.filter(l => l.status === 'RUNNING').length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Data Sync Pipeline</h1>
        <p className="text-sm text-slate-500 mt-1">ระบบซิงค์ข้อมูลทัวร์จาก Wholesale Suppliers</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Sync ทั้งหมด', value: stats.total, color: 'bg-slate-100 text-slate-700' },
          { label: 'สำเร็จ', value: stats.success, color: 'bg-emerald-50 text-emerald-700' },
          { label: 'ล้มเหลว', value: stats.failed, color: 'bg-red-50 text-red-700' },
          { label: 'กำลังทำงาน', value: stats.running, color: 'bg-amber-50 text-amber-700' },
        ].map((s) => (
          <div key={s.label} className={`${s.color} rounded-xl p-4`}>
            <p className="text-xs font-bold opacity-70">{s.label}</p>
            <p className="text-2xl font-black mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Supplier Status */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="font-bold text-slate-800 mb-3">🔗 Suppliers</h2>
        <div className="grid grid-cols-3 gap-3">
          {suppliers.map((s) => {
            const lastLog = syncLogs.find(l => l.supplier.canonicalName === s.canonicalName);
            return (
              <div key={s.id} className="border border-slate-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm text-slate-800">{s.displayName}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    s.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                  }`}>{s.status}</span>
                </div>
                <p className="text-xs text-slate-500">Frequency: {s.syncFrequency}</p>
                {lastLog && (
                  <p className="text-xs text-slate-400 mt-1">Last: {new Date(lastLog.startedAt).toLocaleString('th-TH')}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Sync Logs Table */}
      {syncLogs.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
          <p className="text-4xl mb-3">🔄</p>
          <p className="text-lg font-bold text-slate-700">ยังไม่มี Sync Log</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 font-bold text-slate-600">Supplier</th>
                <th className="text-left px-4 py-3 font-bold text-slate-600">ประเภท</th>
                <th className="text-left px-4 py-3 font-bold text-slate-600">สถานะ</th>
                <th className="text-right px-4 py-3 font-bold text-slate-600">สำเร็จ/ทั้งหมด</th>
                <th className="text-left px-4 py-3 font-bold text-slate-600">เริ่ม</th>
                <th className="text-left px-4 py-3 font-bold text-slate-600">จบ</th>
                <th className="text-left px-4 py-3 font-bold text-slate-600">Error</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {syncLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-medium">{log.supplier.displayName}</td>
                  <td className="px-4 py-3 font-mono text-xs">{log.syncType}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      log.status === 'SUCCESS' ? 'bg-emerald-100 text-emerald-700' :
                      log.status === 'FAILED' ? 'bg-red-100 text-red-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>{log.status}</span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono">{log.successRecords}/{log.totalRecords}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{new Date(log.startedAt).toLocaleString('th-TH')}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{log.finishedAt ? new Date(log.finishedAt).toLocaleString('th-TH') : '-'}</td>
                  <td className="px-4 py-3 text-red-500 text-xs max-w-[200px] truncate">{log.errorMessage || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
