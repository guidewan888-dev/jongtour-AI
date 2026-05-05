export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export default async function CmsPage() {
  const [cmsPages, blogPosts, landingPages] = await Promise.all([
    prisma.cmsPage.findMany({ orderBy: { updatedAt: 'desc' }, take: 20 }),
    prisma.blogPost.findMany({ orderBy: { updatedAt: 'desc' }, take: 20 }),
    prisma.landingPage.findMany({ orderBy: { updatedAt: 'desc' }, take: 20 }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">CMS — Content Management</h1>
        <p className="text-sm text-slate-500 mt-1">จัดการเนื้อหาเว็บไซต์</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-blue-50 text-blue-700 rounded-2xl p-5">
          <p className="text-3xl font-black">{cmsPages.length}</p>
          <p className="text-xs font-bold opacity-70 mt-1">CMS Pages</p>
        </div>
        <div className="bg-purple-50 text-purple-700 rounded-2xl p-5">
          <p className="text-3xl font-black">{blogPosts.length}</p>
          <p className="text-xs font-bold opacity-70 mt-1">Blog Posts</p>
        </div>
        <Link href="/cms/landing-pages" className="bg-emerald-50 text-emerald-700 rounded-2xl p-5 hover:shadow-md transition-shadow">
          <p className="text-3xl font-black">{landingPages.length}</p>
          <p className="text-xs font-bold opacity-70 mt-1">Landing Pages →</p>
        </Link>
      </div>

      {/* CMS Pages */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="font-bold text-slate-800">📄 CMS Pages</h2>
        </div>
        {cmsPages.length === 0 ? (
          <div className="p-8 text-center text-slate-400">ยังไม่มีหน้า CMS</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50"><tr>
              <th className="text-left px-4 py-3 font-bold text-slate-600">Title</th>
              <th className="text-left px-4 py-3 font-bold text-slate-600">Slug</th>
              <th className="text-left px-4 py-3 font-bold text-slate-600">สถานะ</th>
              <th className="text-left px-4 py-3 font-bold text-slate-600">อัปเดต</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-100">
              {cmsPages.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium">{p.title}</td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">/{p.slug}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded text-xs font-bold ${p.status === 'PUBLISHED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{p.status}</span></td>
                  <td className="px-4 py-3 text-xs text-slate-500">{new Date(p.updatedAt).toLocaleDateString('th-TH')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Blog Posts */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="font-bold text-slate-800">📝 Blog Posts</h2>
        </div>
        {blogPosts.length === 0 ? (
          <div className="p-8 text-center text-slate-400">ยังไม่มีบทความ</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50"><tr>
              <th className="text-left px-4 py-3 font-bold text-slate-600">Title</th>
              <th className="text-left px-4 py-3 font-bold text-slate-600">Slug</th>
              <th className="text-left px-4 py-3 font-bold text-slate-600">สถานะ</th>
              <th className="text-left px-4 py-3 font-bold text-slate-600">อัปเดต</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-100">
              {blogPosts.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium">{p.title}</td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">/{p.slug}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded text-xs font-bold ${p.status === 'PUBLISHED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{p.status}</span></td>
                  <td className="px-4 py-3 text-xs text-slate-500">{new Date(p.updatedAt).toLocaleDateString('th-TH')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
