import React from "react";
import { AlertTriangle, XCircle, Search, ExternalLink } from "lucide-react";

const errors = [
  { id: 1, supplier: "ZEGO", error: "API Timeout: Connection refused after 30s", severity: "critical", time: "2026-05-04 14:30", tour: "N/A" },
  { id: 2, supplier: "PANORAMA", error: "Invalid departure date format: '2026/13/45'", severity: "warning", time: "2026-05-05 14:32", tour: "EU-EAST-8D6N" },
  { id: 3, supplier: "LETGO", error: "Duplicate tour_code detected: JP-OSA-5D3N-V2", severity: "info", time: "2026-05-05 14:31", tour: "JP-OSA-5D3N" },
];

export default function ErrorLogsPage() {
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-slate-900">Error Logs</h1><p className="text-slate-500 text-sm mt-1">ข้อผิดพลาดจากการซิงค์ Wholesale</p></div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-red-50 p-4 rounded-2xl border border-red-100"><div className="text-sm text-red-600 font-medium">Critical</div><div className="text-2xl font-bold text-red-700">1</div></div>
        <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100"><div className="text-sm text-amber-600 font-medium">Warning</div><div className="text-2xl font-bold text-amber-700">1</div></div>
        <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100"><div className="text-sm text-blue-600 font-medium">Info</div><div className="text-2xl font-bold text-blue-700">1</div></div>
      </div>

      <div className="space-y-3">
        {errors.map((e) => (
          <div key={e.id} className={`bg-white p-4 rounded-2xl border ${e.severity === "critical" ? "border-red-200" : e.severity === "warning" ? "border-amber-200" : "border-slate-200"} flex items-start gap-3`}>
            {e.severity === "critical" ? <XCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" /> : <AlertTriangle className={`w-5 h-5 ${e.severity === "warning" ? "text-amber-500" : "text-blue-500"} mt-0.5 shrink-0`} />}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-sm text-slate-900">{e.supplier}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${e.severity === "critical" ? "bg-red-100 text-red-700" : e.severity === "warning" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"}`}>{e.severity}</span>
              </div>
              <p className="text-sm text-slate-600 font-mono">{e.error}</p>
              <p className="text-xs text-slate-400 mt-1">Tour: {e.tour} • {e.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
