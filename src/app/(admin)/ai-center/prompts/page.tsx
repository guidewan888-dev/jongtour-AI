export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';

export default async function PromptsPage() {
  const templates = await prisma.aiPromptTemplate.findMany({
    orderBy: { updatedAt: 'desc' },
    include: { versions: { orderBy: { version: 'desc' }, take: 1 } },
  });

  return (
    <div className="space-y-6">
      <div>
        <a href="/ai-center" className="text-xs font-bold text-blue-600 hover:underline">← AI Center</a>
        <h1 className="text-2xl font-black text-slate-900 mt-1">AI Prompt Templates</h1>
        <p className="text-sm text-slate-500 mt-1">จัดการ prompt ทั้งหมด ({templates.length})</p>
      </div>

      {templates.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
          <p className="text-4xl mb-3">📝</p>
          <p className="text-lg font-bold text-slate-700">ยังไม่มี Prompt Template</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map((t) => {
            const latestVersion = t.versions[0];
            return (
              <div key={t.id} className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-slate-800">{t.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs font-bold">v{t.currentVersion}</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${t.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{t.status}</span>
                  </div>
                </div>
                {latestVersion && (
                  <p className="text-xs text-slate-500 line-clamp-2 mt-2">{latestVersion.content?.substring(0, 150)}...</p>
                )}
                <p className="text-xs text-slate-400 mt-2">อัปเดต: {new Date(t.updatedAt).toLocaleDateString('th-TH')}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
