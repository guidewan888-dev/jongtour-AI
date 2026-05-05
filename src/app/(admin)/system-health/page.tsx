export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';

export default async function SystemHealthPage() {
  const [userCount, tourCount, bookingCount, supplierCount, syncLogs, recentErrors] = await Promise.all([
    prisma.user.count(),
    prisma.tour.count(),
    prisma.booking.count(),
    prisma.supplier.count(),
    prisma.supplierSyncLog.findMany({ orderBy: { startedAt: 'desc' }, take: 5 }),
    prisma.supplierSyncLog.findMany({ where: { status: 'FAILED' }, orderBy: { startedAt: 'desc' }, take: 5 }),
  ]);

  const lastSync = syncLogs[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">System Health</h1>
        <p className="text-sm text-slate-500 mt-1">สถานะระบบและ Service ทั้งหมด</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Users', value: userCount, icon: '👥' },
          { label: 'Tours', value: tourCount, icon: '🌍' },
          { label: 'Bookings', value: bookingCount, icon: '🎫' },
          { label: 'Suppliers', value: supplierCount, icon: '🏢' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-4">
            <span className="text-2xl">{s.icon}</span>
            <p className="text-2xl font-black text-slate-800 mt-2">{s.value}</p>
            <p className="text-xs font-bold text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Service Status */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="font-bold text-slate-800 mb-4">🔌 Service Status</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { name: 'Database (Prisma)', status: 'online' },
            { name: 'Supabase Auth', status: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'online' : 'missing' },
            { name: 'Stripe', status: process.env.STRIPE_SECRET_KEY ? 'online' : 'missing' },
            { name: 'Resend Email', status: process.env.RESEND_API_KEY ? 'online' : 'missing' },
          ].map((svc) => (
            <div key={svc.name} className="flex items-center gap-2 p-3 rounded-xl border border-slate-200">
              <div className={`w-3 h-3 rounded-full ${svc.status === 'online' ? 'bg-emerald-500' : 'bg-red-500'}`} />
              <div>
                <p className="text-sm font-bold text-slate-700">{svc.name}</p>
                <p className={`text-xs font-bold ${svc.status === 'online' ? 'text-emerald-600' : 'text-red-600'}`}>{svc.status.toUpperCase()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Last Sync */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="font-bold text-slate-800 mb-4">🔄 Last Data Sync</h2>
        {lastSync ? (
          <div className="flex items-center gap-4">
            <span className={`px-3 py-1 rounded-full text-sm font-bold ${lastSync.status === 'SUCCESS' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{lastSync.status}</span>
            <span className="text-sm text-slate-600">{lastSync.syncType}</span>
            <span className="text-sm text-slate-500">{new Date(lastSync.startedAt).toLocaleString('th-TH')}</span>
            <span className="text-sm font-bold">{lastSync.successRecords}/{lastSync.totalRecords} records</span>
          </div>
        ) : (
          <p className="text-sm text-slate-400">ยังไม่เคย sync</p>
        )}
      </div>

      {/* Recent Errors */}
      {recentErrors.length > 0 && (
        <div className="bg-white rounded-2xl border border-red-200 p-6">
          <h2 className="font-bold text-red-700 mb-4">⚠️ Recent Sync Errors</h2>
          <div className="space-y-2">
            {recentErrors.map((e) => (
              <div key={e.id} className="p-3 bg-red-50 rounded-xl text-sm">
                <p className="font-bold text-red-700">{e.syncType} — {new Date(e.startedAt).toLocaleString('th-TH')}</p>
                <p className="text-red-600 text-xs mt-1 truncate">{e.errorMessage || 'No error message'}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
