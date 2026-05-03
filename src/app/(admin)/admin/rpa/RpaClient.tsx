"use client";

import { useState } from "react";
import { format } from "date-fns";

export default function RpaClient({ initialSessions }: { initialSessions: any[] }) {
  const [sessions, setSessions] = useState(initialSessions);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'WAITING_ADMIN_APPROVAL': return 'bg-yellow-100 text-yellow-800';
      case 'SUBMITTED': return 'bg-blue-100 text-blue-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'FAILED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleApprove = async (sessionId: string) => {
    setLoadingId(sessionId);
    try {
      const res = await fetch("http://localhost:4000/run/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId })
      });
      
      const data = await res.json();
      if (res.ok) {
        alert("Bot is proceeding to submit the booking.");
        // Optimistic update
        setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, status: 'SUBMITTED' } : s));
      } else {
        alert("Error: " + data.error);
      }
    } catch (err) {
      alert("Failed to connect to Bot Service.");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="py-3 px-4 font-semibold text-gray-600 text-sm">Booking ID</th>
            <th className="py-3 px-4 font-semibold text-gray-600 text-sm">Supplier</th>
            <th className="py-3 px-4 font-semibold text-gray-600 text-sm">Status</th>
            <th className="py-3 px-4 font-semibold text-gray-600 text-sm">Started At</th>
            <th className="py-3 px-4 font-semibold text-gray-600 text-sm">Screenshot</th>
            <th className="py-3 px-4 font-semibold text-gray-600 text-sm">Action</th>
          </tr>
        </thead>
        <tbody>
          {sessions.length === 0 ? (
            <tr>
              <td colSpan={6} className="py-8 text-center text-gray-500">
                No RPA sessions found.
              </td>
            </tr>
          ) : (
            sessions.map((session) => (
              <tr key={session.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="py-3 px-4 font-mono text-sm">{session.booking?.bookingRef || session.bookingId}</td>
                <td className="py-3 px-4 font-medium">{session.supplier?.displayName || session.supplierId}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(session.status)}`}>
                    {session.status.replace(/_/g, ' ')}
                  </span>
                </td>
                <td className="py-3 px-4 text-sm text-gray-500">
                  {format(new Date(session.createdAt), "dd MMM yyyy HH:mm")}
                </td>
                <td className="py-3 px-4">
                  {session.screenshotBeforeUrl ? (
                    <a href={session.screenshotBeforeUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-sm font-medium">
                      View Screen
                    </a>
                  ) : (
                    <span className="text-gray-400 text-sm">N/A</span>
                  )}
                </td>
                <td className="py-3 px-4">
                  {session.status === 'WAITING_ADMIN_APPROVAL' && (
                    <button
                      onClick={() => handleApprove(session.id)}
                      disabled={loadingId === session.id}
                      className="px-4 py-1.5 bg-black text-white text-sm font-medium rounded-md hover:bg-gray-800 disabled:bg-gray-400 transition-colors"
                    >
                      {loadingId === session.id ? "Approving..." : "Approve"}
                    </button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
