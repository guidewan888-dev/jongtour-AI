export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';

export default async function LandingPagesPage() {
  const pages = await prisma.landingPage.findMany({ orderBy: { updatedAt: 'desc' } });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Landing Pages</h1>
        <p className="text-sm text-slate-500 mt-1">จัดการ Landing Pages สำหรับแคมเปญ</p>
      </div>

      {pages.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
          <p className="text-4xl mb-3">🚀</p>
          <p className="text-lg font-bold text-slate-700">ยังไม่มี Landing Page</p>
          <p className="text-sm text-slate-500">สร้าง Landing Page สำหรับแคมเปญโฆษณา</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pages.map((p) => (
            <div key={p.id} className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-slate-800">{p.title}</h3>
                <span className={`px-2 py-0.5 rounded text-xs font-bold ${p.status === 'PUBLISHED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{p.status}</span>
              </div>
              <p className="text-xs font-mono text-slate-400 mb-2">/{p.slug}</p>
              {p.seoTitle && <p className="text-xs text-slate-500">SEO: {p.seoTitle}</p>}
              <p className="text-xs text-slate-400 mt-2">อัปเดต: {new Date(p.updatedAt).toLocaleDateString('th-TH')}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
