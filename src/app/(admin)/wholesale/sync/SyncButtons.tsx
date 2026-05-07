'use client';
import React, { useState } from 'react';

const SUPPLIERS = [
  { id: 'SUP_LETGO', name: "Let's Go" },
  { id: 'SUP_CHECKIN', name: 'Checkin Group' },
  { id: 'SUP_TOURFACTORY', name: 'Tour Factory' },
];

export default function SyncButtons() {
  const [syncing, setSyncing] = useState<Record<string, boolean>>({});
  const [results, setResults] = useState<Record<string, { ok: boolean; msg: string }>>({});

  const handleSync = async (supplierId: string) => {
    setSyncing(prev => ({ ...prev, [supplierId]: true }));
    setResults(prev => ({ ...prev, [supplierId]: { ok: true, msg: '⏳ กำลัง Sync...' } }));
    try {
      const res = await fetch('/api/admin/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ supplierId }),
      });
      const data = await res.json();
      if (res.ok) {
        setResults(prev => ({
          ...prev,
          [supplierId]: {
            ok: true,
            msg: `✅ สำเร็จ! ${data.recordCount || 0} โปรแกรม (${data.duration || 0}s)`,
          },
        }));
      } else {
        setResults(prev => ({
          ...prev,
          [supplierId]: { ok: false, msg: `❌ ${data.message || 'Error'}` },
        }));
      }
    } catch (err: any) {
      setResults(prev => ({
        ...prev,
        [supplierId]: { ok: false, msg: `❌ ${err.message}` },
      }));
    } finally {
      setSyncing(prev => ({ ...prev, [supplierId]: false }));
    }
  };

  const handleSyncAll = async () => {
    for (const s of SUPPLIERS) {
      await handleSync(s.id);
    }
    // Hard reload to update server-rendered stats
    window.location.reload();
  };

  const handleSyncOne = async (supplierId: string) => {
    await handleSync(supplierId);
    window.location.reload();
  };

  const isAnySyncing = Object.values(syncing).some(Boolean);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-slate-800">⚡ Manual Sync</h2>
        <button
          onClick={handleSyncAll}
          disabled={isAnySyncing}
          className="bg-primary hover:bg-primary-600 text-white font-bold text-sm px-5 py-2.5 rounded-xl disabled:opacity-50 transition-colors flex items-center gap-2"
        >
          {isAnySyncing ? (
            <><span className="animate-spin">⏳</span> กำลัง Sync...</>
          ) : (
            <>🔄 Sync ทั้งหมด</>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {SUPPLIERS.map(s => (
          <div key={s.id} className="border border-slate-200 rounded-xl p-4 bg-white hover:shadow-sm transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-bold text-sm text-slate-800">{s.name}</p>
                <p className="text-xs text-slate-400 font-mono">{s.id}</p>
              </div>
              <button
                onClick={() => handleSyncOne(s.id)}
                disabled={syncing[s.id]}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-4 py-2 rounded-lg disabled:opacity-50 transition-colors"
              >
                {syncing[s.id] ? (
                  <span className="flex items-center gap-1"><span className="animate-spin">⏳</span> Syncing...</span>
                ) : (
                  '🔄 Sync'
                )}
              </button>
            </div>
            {results[s.id] && (
              <div className={`text-xs font-medium px-3 py-2 rounded-lg ${
                results[s.id].ok ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
              }`}>
                {results[s.id].msg}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
