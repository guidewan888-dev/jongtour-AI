"use client";

import { useState, useEffect } from "react";
import { Search, MapPin, Calendar, Users, DollarSign } from "lucide-react";

export default function SearchLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      const res = await fetch("/api/admin/ai/search-logs");
      const data = await res.json();
      if (data.searchLogs) {
        setLogs(data.searchLogs);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  if (isLoading) return <div className="p-8 text-gray-500 animate-pulse">Loading Search Logs...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto h-full flex flex-col">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
          <Search className="w-6 h-6 text-blue-500" />
          AI Search Logs
        </h1>
        <p className="text-sm text-gray-500 mt-1">Audit trail of all tour searches executed by the AI.</p>
      </div>

      <div className="flex-1 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Time</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Search Query (Parameters)</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Results Found</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Latency</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-sm text-gray-500">
                    No search logs found in the database.
                  </td>
                </tr>
              ) : (
                logs.map(log => {
                  const params = log.searchParams as any || {};
                  return (
                    <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="p-4 text-sm text-gray-500 whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-2">
                          {params.destination && <span className="flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded-md border border-blue-100"><MapPin className="w-3 h-3"/> {params.destination}</span>}
                          {params.date_from && <span className="flex items-center gap-1 text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-1 rounded-md border border-purple-100"><Calendar className="w-3 h-3"/> {params.date_from}</span>}
                          {params.pax && <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100"><Users className="w-3 h-3"/> {params.pax} Pax</span>}
                          {params.budget_max && <span className="flex items-center gap-1 text-[10px] font-bold text-orange-700 bg-orange-50 px-2 py-1 rounded-md border border-orange-100"><DollarSign className="w-3 h-3"/> &lt; {params.budget_max}</span>}
                          {params.supplier_id && <span className="flex items-center gap-1 text-[10px] font-bold text-gray-700 bg-gray-100 px-2 py-1 rounded-md border border-gray-200">Supplier: {params.supplier_id}</span>}
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <span className={`text-sm font-bold ${log.resultsCount > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                          {log.resultsCount} tours
                        </span>
                      </td>
                      <td className="p-4 text-right text-sm text-gray-500 font-mono">
                        {log.latencyMs ? `${log.latencyMs}ms` : '-'}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
