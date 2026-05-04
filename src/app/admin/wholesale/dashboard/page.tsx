import { Activity, Server, Database, AlertTriangle, ArrowRight, RefreshCcw, CheckCircle2, XCircle } from 'lucide-react';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import Link from 'next/link';

export const dynamic = "force-dynamic";

export default async function B2BAdminDashboard() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Fetch real stats
  const { count: suppliersCount } = await supabase.from('suppliers').select('*', { count: 'exact', head: true }).eq('isActive', true);
  const { count: toursCount } = await supabase.from('tours').select('*', { count: 'exact', head: true });
  const { count: departuresCount } = await supabase.from('departures').select('*', { count: 'exact', head: true });
  
  // Fetch sync errors in last 24h
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const { count: errorsCount } = await supabase.from('ApiSyncLog')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'FAILED')
    .gte('createdAt', yesterday.toISOString());

  // Fetch suppliers and their latest sync status
  const { data: suppliers } = await supabase.from('suppliers').select('id, name, canonicalName, isActive').eq('isActive', true);
  const supplierRows = await Promise.all((suppliers || []).map(async (sup: any) => {
    const { data: lastSync } = await supabase.from('ApiSyncLog')
      .select('status, createdAt')
      .eq('supplierId', sup.id)
      .order('createdAt', { ascending: false })
      .limit(1)
      .maybeSingle();

    return {
      id: sup.id,
      name: sup.name,
      alias: sup.canonicalName,
      lastSyncDate: lastSync?.createdAt ? new Date(lastSync.createdAt) : null,
      status: lastSync?.status || 'UNKNOWN'
    };
  }));

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-end mb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 mb-1">API & Integration Dashboard</h1>
          <p className="text-slate-500 text-xs">ภาพรวมการเชื่อมต่อระบบ Wholesale และสถานะของ Cron Jobs</p>
        </div>
        <Link href="/admin/wholesale/sync" className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded flex items-center gap-2 transition-colors">
          <Activity size={14} /> Go to Sync Center
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KpiCard title="Active Suppliers (API)" value={(suppliersCount || 0).toString()} trend="Running" color="emerald" />
        <KpiCard title="Total Tours Synced" value={(toursCount || 0).toLocaleString()} trend="From Database" color="blue" />
        <KpiCard title="Total Departures" value={(departuresCount || 0).toLocaleString()} trend="From Database" color="indigo" />
        <KpiCard title="Sync Errors (24h)" value={(errorsCount || 0).toString()} trend={errorsCount && errorsCount > 0 ? "Needs attention" : "All clear"} color={errorsCount && errorsCount > 0 ? "rose" : "emerald"} alert={errorsCount && errorsCount > 0} />
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
              {supplierRows.length === 0 && (
                 <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-500">No active suppliers found in database.</td>
                 </tr>
              )}
              {supplierRows.map((row) => (
                <tr key={row.id} className="hover:bg-slate-900/50">
                  <td className="px-4 py-3">
                    <div className="font-bold text-slate-200">{row.name}</div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">{row.id}</div>
                  </td>
                  <td className="px-4 py-3"><span className="bg-blue-500/10 text-blue-400 px-2 py-1 rounded text-[10px] font-bold">API</span></td>
                  <td className="px-4 py-3">{row.lastSyncDate ? row.lastSyncDate.toLocaleString('th-TH') : 'Never'}</td>
                  <td className="px-4 py-3 flex items-center gap-2">
                    {row.status === 'SUCCESS' ? (
                      <><div className="w-2 h-2 rounded-full bg-emerald-500"></div> SUCCESS</>
                    ) : row.status === 'FAILED' ? (
                      <><div className="w-2 h-2 rounded-full bg-rose-500"></div> FAILED</>
                    ) : row.status === 'RUNNING' ? (
                      <><RefreshCcw className="w-3 h-3 animate-spin text-amber-500" /> RUNNING</>
                    ) : (
                      <><div className="w-2 h-2 rounded-full bg-slate-500"></div> UNKNOWN</>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href="/admin/wholesale/sync" className="text-emerald-500 hover:text-emerald-400">View Logs</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ title, value, trend, color, alert }: { title: string, value: string, trend: string, color: 'emerald'|'blue'|'indigo'|'rose', alert?: boolean | null }) {
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
