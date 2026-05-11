export const dynamic = 'force-dynamic';
import { AlertTriangle, XCircle } from 'lucide-react';
import { getUnifiedErrorLogs } from '@/lib/wholesale-sync';

const SEVERITY_STYLE = {
  critical: {
    card: 'border-red-200',
    chip: 'bg-red-100 text-red-700',
    stat: 'bg-red-50 border-red-100 text-red-700',
  },
  warning: {
    card: 'border-amber-200',
    chip: 'bg-amber-100 text-amber-700',
    stat: 'bg-amber-50 border-amber-100 text-amber-700',
  },
  info: {
    card: 'border-blue-200',
    chip: 'bg-blue-100 text-blue-700',
    stat: 'bg-blue-50 border-blue-100 text-blue-700',
  },
} as const;

export default async function ErrorLogsPage() {
  const logs = await getUnifiedErrorLogs(200);
  const criticalCount = logs.filter((log) => log.severity === 'critical').length;
  const warningCount = logs.filter((log) => log.severity === 'warning').length;
  const infoCount = logs.filter((log) => log.severity === 'info').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Error Logs</h1>
        <p className="text-slate-500 text-sm mt-1">ข้อผิดพลาดจริงจาก API Sync, Supplier Sync และ Scraper</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`p-4 rounded-2xl border ${SEVERITY_STYLE.critical.stat}`}>
          <div className="text-sm font-medium">Critical</div>
          <div className="text-2xl font-bold">{criticalCount}</div>
        </div>
        <div className={`p-4 rounded-2xl border ${SEVERITY_STYLE.warning.stat}`}>
          <div className="text-sm font-medium">Warning</div>
          <div className="text-2xl font-bold">{warningCount}</div>
        </div>
        <div className={`p-4 rounded-2xl border ${SEVERITY_STYLE.info.stat}`}>
          <div className="text-sm font-medium">Info</div>
          <div className="text-2xl font-bold">{infoCount}</div>
        </div>
      </div>

      <div className="space-y-3">
        {logs.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-500">
            ยังไม่พบ error logs
          </div>
        ) : (
          logs.map((log) => {
            const style = SEVERITY_STYLE[log.severity];
            const timestamp = new Date(log.createdAt).toLocaleString('th-TH');
            return (
              <div key={log.id} className={`bg-white p-4 rounded-2xl border ${style.card} flex items-start gap-3`}>
                {log.severity === 'critical' ? (
                  <XCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
                ) : (
                  <AlertTriangle className={`w-5 h-5 mt-0.5 shrink-0 ${log.severity === 'warning' ? 'text-amber-500' : 'text-blue-500'}`} />
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-sm text-slate-900">{log.supplier}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${style.chip}`}>{log.severity}</span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">{log.source}</span>
                  </div>
                  <p className="text-sm text-slate-700 font-mono break-words">{log.message}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {log.tourCode ? `Tour: ${log.tourCode} • ` : ''}
                    {timestamp}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
