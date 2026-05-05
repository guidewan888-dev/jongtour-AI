export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export default async function SuppliersListPage() {
  const suppliers = await prisma.supplier.findMany({
    include: {
      _count: { select: { tours: true, syncLogs: true } },
      syncLogs: { orderBy: { startedAt: 'desc' }, take: 1 },
    },
    orderBy: { displayName: 'asc' },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Wholesale Suppliers</h1>
        <p className="text-sm text-slate-500 mt-1">{suppliers.length} suppliers ในระบบ</p>
      </div>

      {suppliers.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
          <p className="text-4xl mb-3">🏢</p>
          <p className="text-lg font-bold text-slate-700">ยังไม่มี Supplier</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {suppliers.map((s) => {
            const lastSync = s.syncLogs[0];
            return (
              <Link key={s.id} href={`/wholesale/suppliers/${s.id}`} className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-slate-800">{s.displayName}</h3>
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${s.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{s.status}</span>
                </div>
                <p className="text-xs font-mono text-slate-400 mb-3">{s.canonicalName}</p>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>🌍 {s._count.tours} tours</span>
                  <span>🔄 {s.syncFrequency}</span>
                  <span>📦 {s.bookingMethod}</span>
                </div>
                {lastSync && (
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${lastSync.status === 'SUCCESS' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                    <span className="text-xs text-slate-400">Last sync: {new Date(lastSync.startedAt).toLocaleDateString('th-TH')}</span>
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
