export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export default async function AiCenterPage() {
  const [searchLogCount, promptCount, recentSearches] = await Promise.all([
    prisma.aiSearchLog.count(),
    prisma.aiPromptTemplate.count(),
    prisma.aiSearchLog.findMany({ orderBy: { createdAt: 'desc' }, take: 5 }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">AI Center</h1>
        <p className="text-sm text-slate-500 mt-1">จัดการ AI Search, Prompts และ Logs</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Search Logs', value: searchLogCount, icon: '🔍', href: '/ai-center/search-logs' },
          { label: 'Prompt Templates', value: promptCount, icon: '📝', href: '/ai-center/prompts' },
          { label: 'Chat Logs', value: '-', icon: '💬', href: '/ai-center/chat-logs' },
          { label: 'Review Queue', value: '-', icon: '📋', href: '/ai-center/review-queue' },
        ].map((item) => (
          <Link key={item.label} href={item.href} className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
            <span className="text-2xl">{item.icon}</span>
            <p className="text-2xl font-black text-slate-800 mt-2">{item.value}</p>
            <p className="text-xs font-bold text-slate-500 mt-1">{item.label} →</p>
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="font-bold text-slate-800 mb-4">🔍 Recent AI Searches</h2>
        {recentSearches.length === 0 ? (
          <p className="text-sm text-slate-400">ยังไม่มี search log</p>
        ) : (
          <div className="space-y-2">
            {recentSearches.map((s) => (
              <div key={s.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <p className="font-medium text-slate-800 truncate max-w-[400px]">{s.queryText}</p>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-blue-600">{s.resultCount} results</span>
                  <span className="text-xs text-slate-400">{new Date(s.createdAt).toLocaleString('th-TH')}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
