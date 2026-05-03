import { Activity, RefreshCw, AlertTriangle, FileJson, Download } from 'lucide-react';

export default function ApiSyncCenterPage() {
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
              <RefreshCw size={14} /> SYNC LOGS (LAST 24H)
            </span>
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
                <tr className="hover:bg-slate-900">
                  <td className="px-4 py-3 text-slate-500">10:45:22</td>
                  <td className="px-4 py-3 text-emerald-400">letgo_group</td>
                  <td className="px-4 py-3">departures_avail</td>
                  <td className="px-4 py-3 text-right text-emerald-400">SUCCESS (142 rows)</td>
                </tr>
                <tr className="hover:bg-slate-900">
                  <td className="px-4 py-3 text-slate-500">10:45:10</td>
                  <td className="px-4 py-3 text-emerald-400">letgo_group</td>
                  <td className="px-4 py-3">tour_master</td>
                  <td className="px-4 py-3 text-right text-emerald-400">SUCCESS (0 new)</td>
                </tr>
                <tr className="hover:bg-slate-900">
                  <td className="px-4 py-3 text-slate-500">10:30:00</td>
                  <td className="px-4 py-3 text-emerald-400">go365_tours</td>
                  <td className="px-4 py-3">departures_avail</td>
                  <td className="px-4 py-3 text-right text-amber-400">TIMEOUT (Retry 1)</td>
                </tr>
                <tr className="hover:bg-slate-900">
                  <td className="px-4 py-3 text-slate-500">10:15:00</td>
                  <td className="px-4 py-3 text-emerald-400">tour_factory</td>
                  <td className="px-4 py-3">tour_master</td>
                  <td className="px-4 py-3 text-right text-rose-400">FAILED (Code 500)</td>
                </tr>
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
            <div className="p-4 border-b border-slate-800 hover:bg-slate-900">
              <div className="flex justify-between items-start mb-2">
                <span className="text-rose-400 font-bold">API Connection Refused (500)</span>
                <span className="text-slate-500">10:15:00</span>
              </div>
              <p className="text-slate-400 mb-2">Failed to fetch data from tour_factory endpoint. Target: /api/v1/tours</p>
              <div className="flex gap-2">
                <button className="bg-slate-800 text-slate-300 px-2 py-1 rounded hover:bg-slate-700 flex items-center gap-1">
                  <FileJson size={12}/> View Payload
                </button>
                <button className="bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded hover:bg-emerald-500/20 flex items-center gap-1">
                  <RefreshCw size={12}/> Retry
                </button>
              </div>
            </div>
            
            <div className="p-4 border-b border-slate-800 hover:bg-slate-900">
              <div className="flex justify-between items-start mb-2">
                <span className="text-amber-400 font-bold">Schema Mapping Warning</span>
                <span className="text-slate-500">09:12:30</span>
              </div>
              <p className="text-slate-400 mb-2">letgo_group API returned null for 'price_infant' in 15 departure rows.</p>
              <div className="flex gap-2">
                <button className="bg-slate-800 text-slate-300 px-2 py-1 rounded hover:bg-slate-700 flex items-center gap-1">
                  <FileJson size={12}/> View Payload
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
