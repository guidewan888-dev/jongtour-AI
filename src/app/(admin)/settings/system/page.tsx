"use client";
import React, { useState, useEffect } from "react";
import { Activity, Database, Globe, Cpu, HardDrive, RefreshCw, CheckCircle, AlertTriangle, XCircle, Clock, Zap, Server } from "lucide-react";

type HealthStatus = {
  status: string;
  timestamp: string;
  version: string;
  uptime: number;
  latency: number;
  checks: {
    database: { status: string; latency?: number; error?: string };
    envVars: { required: Record<string, string>; optional: Record<string, string> };
    data: { tours?: number; activeDepartures?: number; status: string };
    memory: { heapUsedMB: number; heapTotalMB: number; rssMB: number };
  };
};

const StatusIcon = ({ status }: { status: string }) => {
  if (status === 'OK' || status === 'HEALTHY' || status === 'SET') return <CheckCircle className="w-4 h-4 text-emerald-500" />;
  if (status === 'DEGRADED' || status === 'NOT_SET') return <AlertTriangle className="w-4 h-4 text-amber-500" />;
  return <XCircle className="w-4 h-4 text-red-500" />;
};

function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return d > 0 ? `${d}d ${h}h ${m}m` : h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export default function SystemMonitorPage() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchHealth = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      setHealth(data);
      setLastRefresh(new Date());
    } catch { setHealth(null); }
    setLoading(false);
  };

  useEffect(() => { fetchHealth(); }, []);

  // Auto-refresh every 30s
  useEffect(() => {
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">🖥️ System Monitor</h1>
          <p className="text-sm text-slate-500 mt-1">Real-time platform health & infrastructure status</p>
        </div>
        <button onClick={fetchHealth} disabled={loading} className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-200 transition-colors disabled:opacity-50">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {!health && !loading && (
        <div className="g-card p-10 text-center">
          <XCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
          <p className="text-sm text-red-500">Unable to reach health endpoint</p>
        </div>
      )}

      {health && (
        <>
          {/* Overall Status */}
          <div className={`rounded-2xl p-5 flex items-center gap-4 ${health.status === 'HEALTHY' ? 'bg-emerald-50 border border-emerald-200' : 'bg-red-50 border border-red-200'}`}>
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${health.status === 'HEALTHY' ? 'bg-emerald-500' : 'bg-red-500'}`}>
              <Activity className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <div className={`text-lg font-black ${health.status === 'HEALTHY' ? 'text-emerald-800' : 'text-red-800'}`}>
                {health.status === 'HEALTHY' ? '✅ All Systems Operational' : '⚠️ System Degraded'}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Last check: {lastRefresh.toLocaleTimeString('th-TH')} · Response: {health.latency}ms · v{health.version}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-slate-700">{formatUptime(health.uptime)}</div>
              <div className="text-[10px] text-slate-400">Uptime</div>
            </div>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="g-card p-4">
              <Database className="w-5 h-5 text-emerald-500 mb-2" />
              <div className="text-lg font-black">{health.checks.database?.latency || '—'}ms</div>
              <div className="text-[10px] text-slate-400">DB Latency</div>
            </div>
            <div className="g-card p-4">
              <Cpu className="w-5 h-5 text-blue-500 mb-2" />
              <div className="text-lg font-black">{health.checks.memory?.heapUsedMB}MB</div>
              <div className="text-[10px] text-slate-400">Heap Used</div>
            </div>
            <div className="g-card p-4">
              <Globe className="w-5 h-5 text-primary mb-2" />
              <div className="text-lg font-black">{health.checks.data?.tours || 0}</div>
              <div className="text-[10px] text-slate-400">Published Tours</div>
            </div>
            <div className="g-card p-4">
              <Zap className="w-5 h-5 text-amber-500 mb-2" />
              <div className="text-lg font-black">{health.checks.data?.activeDepartures || 0}</div>
              <div className="text-[10px] text-slate-400">Active Departures</div>
            </div>
          </div>

          {/* Service Checks */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Infrastructure */}
            <div className="g-card overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-100">
                <h3 className="font-bold text-sm">🏗️ Infrastructure</h3>
              </div>
              <div className="divide-y divide-slate-50">
                <div className="px-5 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2"><Database className="w-4 h-4 text-slate-400" /> <span className="text-sm">PostgreSQL</span></div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">{health.checks.database?.latency}ms</span>
                    <StatusIcon status={health.checks.database?.status} />
                  </div>
                </div>
                <div className="px-5 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2"><Server className="w-4 h-4 text-slate-400" /> <span className="text-sm">Next.js Runtime</span></div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">v14</span>
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                  </div>
                </div>
                <div className="px-5 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2"><HardDrive className="w-4 h-4 text-slate-400" /> <span className="text-sm">Memory</span></div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">{health.checks.memory?.heapUsedMB}/{health.checks.memory?.heapTotalMB}MB</span>
                    <StatusIcon status={health.checks.memory?.heapUsedMB < 200 ? 'OK' : 'DEGRADED'} />
                  </div>
                </div>
                <div className="px-5 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-slate-400" /> <span className="text-sm">Response Time</span></div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">{health.latency}ms</span>
                    <StatusIcon status={health.latency < 500 ? 'OK' : 'DEGRADED'} />
                  </div>
                </div>
              </div>
            </div>

            {/* Environment */}
            <div className="g-card overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-100">
                <h3 className="font-bold text-sm">🔑 Environment Variables</h3>
              </div>
              <div className="divide-y divide-slate-50">
                {health.checks.envVars && Object.entries({ ...health.checks.envVars.required, ...health.checks.envVars.optional }).map(([key, val]) => (
                  <div key={key} className="px-5 py-2.5 flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-500 truncate mr-2">{key}</span>
                    <StatusIcon status={val} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Cron Jobs */}
          <div className="g-card overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-100">
              <h3 className="font-bold text-sm">⏰ Scheduled Jobs</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[10px] text-slate-400 uppercase border-b border-slate-50">
                    <th className="px-5 py-2 text-left">Job</th>
                    <th className="px-3 py-2 text-left">Schedule</th>
                    <th className="px-3 py-2 text-left">Endpoint</th>
                    <th className="px-3 py-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: 'Link Health Audit', schedule: 'Daily 3AM UTC', path: '/api/cron/link-monitor' },
                    { name: 'SEO Monitor', schedule: 'Daily 6AM UTC', path: '/api/cron/seo-monitor' },
                    { name: 'Seat Hold Cleanup', schedule: 'Every 5 min', path: '/api/cron/cleanup-holds' },
                    { name: 'Wholesale Sync', schedule: 'Manual/Daily', path: '/api/cron/sync' },
                    { name: 'Proactive Alerts', schedule: 'Daily 8AM', path: '/api/cron/proactive-alerts' },
                    { name: 'Document Scheduler', schedule: 'Daily 9AM', path: '/api/cron/document-scheduler' },
                  ].map(job => (
                    <tr key={job.name} className="border-b border-slate-50 hover:bg-slate-50/50">
                      <td className="px-5 py-2.5 font-medium">{job.name}</td>
                      <td className="px-3 py-2.5 text-slate-400">{job.schedule}</td>
                      <td className="px-3 py-2.5 font-mono text-xs text-slate-400">{job.path}</td>
                      <td className="px-3 py-2.5 text-center"><CheckCircle className="w-4 h-4 text-emerald-500 mx-auto" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
