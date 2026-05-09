"use client";
import React, { useState } from "react";

export default function ScraperSyncButton() {
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleSync = async () => {
    if (syncing) return;
    setSyncing(true);
    setResult(null);
    try {
      const res = await fetch("/api/scraper/sync", { method: "POST" });
      const data = await res.json();
      if (data.ok) {
        setResult(`✅ Sync triggered! ${data.message || ''}`);
      } else {
        setResult(`❌ ${data.error || 'Sync failed'}`);
      }
    } catch {
      setResult("❌ Network error");
    } finally {
      setSyncing(false);
      // Auto-hide after 5s
      setTimeout(() => setResult(null), 5000);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleSync}
        disabled={syncing}
        className={`px-5 py-2 text-sm font-bold rounded-lg transition-all shadow-sm flex items-center gap-2 ${
          syncing
            ? "bg-slate-200 text-slate-500 cursor-not-allowed"
            : "bg-gradient-to-r from-primary-600 to-orange-500 text-white hover:shadow-lg hover:scale-[1.02]"
        }`}
      >
        {syncing ? (
          <>
            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
            Syncing...
          </>
        ) : (
          <>🔄 Sync Now</>
        )}
      </button>
      {result && (
        <div className="absolute top-full right-0 mt-2 px-4 py-2 bg-white border border-slate-200 rounded-lg shadow-lg text-sm whitespace-nowrap z-50">
          {result}
        </div>
      )}
    </div>
  );
}
