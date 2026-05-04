import { Activity, Server, Database, AlertTriangle, ArrowRight } from 'lucide-react';

export default function B2BAdminDashboard() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-end mb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 mb-1">API & Integration Dashboard</h1>
          <p className="text-slate-500 text-xs">ภาพรวมการเชื่อมต่อระบบ Wholesale และสถานะของ Cron Jobs</p>
        </div>
        <button className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded flex items-center gap-2 transition-colors">
          <Activity size={14} /> Force Global Sync
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KpiCard title="Active Suppliers (API)" value="8" trend="100% Uptime" color="emerald" />
        <KpiCard title="Total Tours Synced" value="12,450" trend="+142 today" color="blue" />
        <KpiCard title="Total Departures" value="85,320" trend="+850 today" color="indigo" />
        <KpiCard title="Sync Errors (24h)" value="12" trend="Needs attention" color="rose" alert />
      </div>

      {/* Sync Status Board */}
      <div className="bg-slate-950 border border-slate-800 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-black">
          <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Server size={16} className="text-emerald-500" />
            Wholesale Connection Status
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-slate-500 border-b border-slate-800">
              <tr>
                <th className="px-4 py-3 font-medium">SUPPLIER_ID / ALIAS</th>
                <th className="px-4 py-3 font-medium">METHOD</th>
                <th className="px-4 py-3 font-medium">LAST SYNC</th>
                <th className="px-4 py-3 font-medium">STATUS</th>
                <th className="px-4 py-3 font-medium text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              <tr className="hover:bg-slate-900/50">
                <td className="px-4 py-3">
                  <div className="font-bold text-slate-200">letgo_group</div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">SUP-5f8a9b21</div>
                </td>
                <td className="px-4 py-3"><span className="bg-blue-500/10 text-blue-400 px-2 py-1 rounded text-[10px] font-bold">REST API</span></td>
                <td className="px-4 py-3">2 mins ago</td>
                <td className="px-4 py-3 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> SUCCESS</td>
                <td className="px-4 py-3 text-right"><button className="text-emerald-500 hover:text-emerald-400">View Logs</button></td>
              </tr>
              <tr className="hover:bg-slate-900/50">
                <td className="px-4 py-3">
                  <div className="font-bold text-slate-200">go365_tours</div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">SUP-8a1c4d92</div>
                </td>
                <td className="px-4 py-3"><span className="bg-blue-500/10 text-blue-400 px-2 py-1 rounded text-[10px] font-bold">REST API</span></td>
                <td className="px-4 py-3">1 hour ago</td>
                <td className="px-4 py-3 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-amber-500"></div> RETRYING (2/3)</td>
                <td className="px-4 py-3 text-right"><button className="text-emerald-500 hover:text-emerald-400">View Logs</button></td>
              </tr>
              <tr className="hover:bg-slate-900/50">
                <td className="px-4 py-3">
                  <div className="font-bold text-slate-200">tour_factory</div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">SUP-3b7e9f14</div>
                </td>
                <td className="px-4 py-3"><span className="bg-purple-500/10 text-purple-400 px-2 py-1 rounded text-[10px] font-bold">XML SOAP</span></td>
                <td className="px-4 py-3">3 hours ago</td>
                <td className="px-4 py-3 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-rose-500"></div> FAILED</td>
                <td className="px-4 py-3 text-right"><button className="text-emerald-500 hover:text-emerald-400">View Logs</button></td>
              </tr>
              <tr className="hover:bg-slate-900/50">
                <td className="px-4 py-3">
                  <div className="font-bold text-slate-200">siam_orchard</div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">SUP-1c5d8a22</div>
                </td>
                <td className="px-4 py-3"><span className="bg-orange-500/10 text-orange-400 px-2 py-1 rounded text-[10px] font-bold">PDF OCR</span></td>
                <td className="px-4 py-3">12 hours ago</td>
                <td className="px-4 py-3 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> SUCCESS</td>
                <td className="px-4 py-3 text-right"><a href="/b2badmin/human-review" className="text-amber-500 hover:text-amber-400 flex items-center justify-end gap-1">Review Required <ArrowRight size={10}/></a></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ title, value, trend, color, alert }: { title: string, value: string, trend: string, color: 'emerald'|'blue'|'indigo'|'rose', alert?: boolean }) {
  const colorStyles = {
    emerald: 'text-emerald-400',
    blue: 'text-blue-400',
    indigo: 'text-indigo-400',
    rose: 'text-rose-400',
  };
  
  return (
    <div className={`bg-slate-950 p-5 rounded-lg border ${alert ? 'border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.1)]' : 'border-slate-800'}`}>
      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
        {alert && <AlertTriangle size={12} className="text-rose-500" />} {title}
      </p>
      <p className="text-3xl font-black text-white mb-2 font-mono">{value}</p>
      <p className={`text-xs ${colorStyles[color]} flex items-center gap-1`}>
        {trend}
      </p>
    </div>
  );
}
