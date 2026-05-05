export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function SupplierDetailPage({ params }: { params: { id: string } }) {
  const supplier = await prisma.supplier.findUnique({
    where: { id: params.id },
    include: {
      aliases: true,
      apiCredentials: true,
      syncLogs: { orderBy: { startedAt: 'desc' }, take: 20 },
      _count: { select: { tours: true } },
    },
  });

  if (!supplier) return notFound();

  const lastSync = supplier.syncLogs[0];

  return (
    <div className="space-y-6">
      <div>
        <Link href="/wholesale/suppliers" className="text-xs font-bold text-blue-600 hover:underline">← กลับไปรายการ Supplier</Link>
        <h1 className="text-2xl font-black text-slate-900 mt-1">{supplier.displayName}</h1>
        <div className="flex items-center gap-2 mt-1">
          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-bold">{supplier.canonicalName}</span>
          <span className={`px-2 py-0.5 rounded text-xs font-bold ${
            supplier.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
          }`}>{supplier.status}</span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'ทัวร์ทั้งหมด', value: supplier._count.tours },
          { label: 'Booking Method', value: supplier.bookingMethod },
          { label: 'Sync Frequency', value: supplier.syncFrequency },
          { label: 'Last Sync', value: lastSync ? new Date(lastSync.startedAt).toLocaleDateString('th-TH') : 'ยังไม่เคย' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-xs font-bold text-slate-500">{s.label}</p>
            <p className="text-lg font-black text-slate-800 mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Aliases */}
      {supplier.aliases.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="font-bold text-slate-800 mb-3">🏷️ Aliases</h2>
          <div className="flex flex-wrap gap-2">
            {supplier.aliases.map((a) => (
              <span key={a.id} className="px-3 py-1 bg-slate-100 rounded-full text-sm font-mono">{a.alias}</span>
            ))}
          </div>
        </div>
      )}

      {/* API Credential Status */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="font-bold text-slate-800 mb-3">🔑 API Credentials</h2>
        {supplier.apiCredentials ? (
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-bold">✅ กำหนดแล้ว</span>
            <span className="text-sm text-slate-500">Base URL: {supplier.apiCredentials.baseUrl || 'ไม่ระบุ'}</span>
          </div>
        ) : (
          <p className="text-sm text-slate-500">❌ ยังไม่ได้กำหนด API Credentials</p>
        )}
      </div>

      {/* Sync History */}
      {supplier.syncLogs.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="font-bold text-slate-800">📊 ประวัติ Sync ({supplier.syncLogs.length} ครั้งล่าสุด)</h2>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left px-4 py-3 font-bold text-slate-600">ประเภท</th>
                <th className="text-left px-4 py-3 font-bold text-slate-600">สถานะ</th>
                <th className="text-right px-4 py-3 font-bold text-slate-600">สำเร็จ/ทั้งหมด</th>
                <th className="text-left px-4 py-3 font-bold text-slate-600">เริ่ม</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {supplier.syncLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium">{log.syncType}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      log.status === 'SUCCESS' ? 'bg-emerald-100 text-emerald-700' :
                      log.status === 'FAILED' ? 'bg-red-100 text-red-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>{log.status}</span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono">{log.successRecords}/{log.totalRecords}</td>
                  <td className="px-4 py-3 text-slate-500">{new Date(log.startedAt).toLocaleString('th-TH')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
