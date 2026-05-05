export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';

export default async function SearchLogsPage() {
  const logs = await prisma.aiSearchLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  return (
    <div className="space-y-6">
      <div>
        <a href="/ai-center" className="text-xs font-bold text-blue-600 hover:underline">← AI Center</a>
        <h1 className="text-2xl font-black text-slate-900 mt-1">AI Search Logs</h1>
        <p className="text-sm text-slate-500 mt-1">{logs.length} คำค้นหาล่าสุด</p>
      </div>

      {logs.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
          <p className="text-4xl mb-3">🔍</p>
          <p className="text-lg font-bold text-slate-700">ยังไม่มี Search Log</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200"><tr>
              <th className="text-left px-4 py-3 font-bold text-slate-600">Query</th>
              <th className="text-left px-4 py-3 font-bold text-slate-600">Session</th>
              <th className="text-right px-4 py-3 font-bold text-slate-600">ผลลัพธ์</th>
              <th className="text-left px-4 py-3 font-bold text-slate-600">เวลา</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium max-w-[300px] truncate">{log.queryText}</td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-400 max-w-[120px] truncate">{log.sessionId}</td>
                  <td className="px-4 py-3 text-right"><span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-bold">{log.resultCount}</span></td>
                  <td className="px-4 py-3 text-xs text-slate-500">{new Date(log.createdAt).toLocaleString('th-TH')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
