"use client";

import { useState, useEffect } from "react";
import { ShieldAlert, CheckCircle2, Clock, Eye } from "lucide-react";

export default function HumanReviewPage() {
  const [queue, setQueue] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchQueue = async () => {
    try {
      const res = await fetch("/api/admin/ai/review-queue?status=pending");
      const data = await res.json();
      if (data.queue) {
        setQueue(data.queue);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleResolve = async (id: string) => {
    try {
      await fetch("/api/admin/ai/review-queue", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "resolved", resolvedById: "Admin_123" })
      });
      fetchQueue();
    } catch (err) {
      console.error(err);
      alert("Failed to resolve item.");
    }
  };

  if (isLoading) return <div className="p-8 text-gray-500 animate-pulse">Loading Review Queue...</div>;

  return (
    <div className="p-8 max-w-5xl mx-auto h-full flex flex-col">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-red-500" />
          Human Review Queue
        </h1>
        <p className="text-sm text-gray-500 mt-1">AI actions flagged for manual review due to low confidence or strict guardrails.</p>
      </div>

      <div className="flex-1 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Time</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Type</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Description</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {queue.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-sm text-gray-500">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-50" />
                    All clear! No items pending human review.
                  </td>
                </tr>
              ) : (
                queue.map(item => (
                  <tr key={item.id} className="border-b border-gray-100 hover:bg-red-50/30 transition-colors">
                    <td className="p-4 text-sm text-gray-500 whitespace-nowrap flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {new Date(item.createdAt).toLocaleTimeString()}
                    </td>
                    <td className="p-4">
                      <span className="text-[10px] font-bold text-red-700 bg-red-100 px-2 py-1 rounded-full uppercase">
                        {item.type}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-800 font-medium max-w-md truncate">
                      {item.description}
                    </td>
                    <td className="p-4">
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-1 rounded-full uppercase">
                        {item.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="View Details">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleResolve(item.id)}
                          className="px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
                        >
                          Mark Resolved
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
