import React from "react";
import { RefreshCw, CheckCircle, XCircle, Clock, Search } from "lucide-react";

const logs = [
  { id: 1, supplier: "LETGO", tours: 45, status: "success", duration: "12s", time: "2026-05-05 14:30" },
  { id: 2, supplier: "ZEGO", tours: 38, status: "success", duration: "8s", time: "2026-05-05 14:30" },
  { id: 3, supplier: "PANORAMA", tours: 22, status: "partial", duration: "15s", time: "2026-05-05 14:30" },
  { id: 4, supplier: "LETGO", tours: 45, status: "success", duration: "11s", time: "2026-05-05 08:00" },
  { id: 5, supplier: "ZEGO", tours: 0, status: "failed", duration: "3s", time: "2026-05-04 14:30" },
];

export default function SyncLogsPage() {
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-slate-900">Sync Logs</h1><p className="text-slate-500 text-sm mt-1">ประวัติการซิงค์ข้อมูลจาก Wholesale API</p></div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100"><div className="relative"><Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" /><input className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm" placeholder="ค้นหาตาม Supplier..." /></div></div>
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 border-b border-slate-200"><tr><th className="text-left px-4 py-3">Supplier</th><th className="text-center px-4 py-3">Tours Synced</th><th className="text-center px-4 py-3">Status</th><th className="text-right px-4 py-3">Duration</th><th className="text-right px-4 py-3">Time</th></tr></thead>
          <tbody className="divide-y divide-slate-50">
            {logs.map((l) => (
              <tr key={l.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 font-medium flex items-center gap-2"><RefreshCw className="w-4 h-4 text-slate-400" /> {l.supplier}</td>
                <td className="px-4 py-3 text-center">{l.tours}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${l.status === "success" ? "bg-emerald-100 text-emerald-700" : l.status === "partial" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>
                    {l.status === "success" ? <CheckCircle className="w-3 h-3" /> : l.status === "failed" ? <XCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}{l.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-slate-500">{l.duration}</td>
                <td className="px-4 py-3 text-right text-slate-400 text-xs">{l.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
