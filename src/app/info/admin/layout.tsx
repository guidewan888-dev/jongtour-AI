import Link from 'next/link';
import { LayoutDashboard, FileText, Image as ImageIcon, HelpCircle, LogOut } from 'lucide-react';

export default function InfoAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-900 flex font-sans text-slate-100">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-800 bg-slate-950 flex flex-col shrink-0">
        <div className="h-20 flex items-center px-6 border-b border-slate-800">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black text-sm shadow-md">
              CMS
            </div>
            <span className="text-lg font-black text-white tracking-tight">
              Info <span className="text-slate-500 font-medium text-sm">Backend</span>
            </span>
          </Link>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-2">
          <Link href="/admin" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors">
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </Link>
          <div className="pt-4 pb-2 px-4">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Content Management</span>
          </div>
          <Link href="/admin/blog" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors">
            <FileText className="w-5 h-5" />
            บทความ (Blog/Guide)
          </Link>
          <Link href="/admin/banners" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors">
            <ImageIcon className="w-5 h-5" />
            ป้ายโฆษณา (Banners)
          </Link>
          <Link href="/admin/faq" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors">
            <HelpCircle className="w-5 h-5" />
            คำถามที่พบบ่อย (FAQ)
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <a href="https://admin.jongtour.com" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors w-full">
            <LogOut className="w-5 h-5" />
            กลับไป Central Admin
          </a>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-20 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-8 shrink-0">
          <h2 className="text-xl font-bold text-white">Content Manager</h2>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
              <span className="text-sm font-bold text-slate-300">CM</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
