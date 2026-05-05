export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';

export default async function AuditLogsPage() {
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: { user: { select: { email: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Audit Logs</h1>
        <p className="text-sm text-slate-500 mt-1">บันทึกการเปลี่ยนแปลงทั้งหมดในระบบ ({logs.length} รายการล่าสุด)</p>
      </div>

      {logs.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
          <p className="text-4xl mb-3">📋</p>
          <p className="text-lg font-bold text-slate-700">ยังไม่มี Audit Log</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 font-bold text-slate-600">เวลา</th>
                <th className="text-left px-4 py-3 font-bold text-slate-600">ผู้ใช้</th>
                <th className="text-left px-4 py-3 font-bold text-slate-600">Action</th>
                <th className="text-left px-4 py-3 font-bold text-slate-600">Resource</th>
                <th className="text-left px-4 py-3 font-bold text-slate-600">Resource ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">{new Date(log.createdAt).toLocaleString('th-TH')}</td>
                  <td className="px-4 py-3 font-medium">{log.user?.email || log.userId || 'System'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                      log.action === 'CREATE' ? 'bg-emerald-100 text-emerald-700' :
                      log.action === 'DELETE' ? 'bg-red-100 text-red-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>{log.action}</span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{log.resource}</td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-400 max-w-[150px] truncate">{log.resourceId}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
