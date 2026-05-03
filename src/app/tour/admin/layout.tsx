import Link from 'next/link';
import { LayoutDashboard, Plane, CalendarDays, RefreshCw, LogOut, Flame, Tags } from 'lucide-react';

export default function TourAdminLayout({
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
              TM
            </div>
            <span className="text-lg font-black text-white tracking-tight">
              Tour <span className="text-slate-500 font-medium text-sm">Manager</span>
            </span>
          </Link>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
          <Link href="/admin" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors">
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </Link>
          
          <div className="pt-4 pb-2 px-4">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Product Management</span>
          </div>
          <Link href="/admin/packages" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors">
            <Plane className="w-5 h-5" />
            แพ็กเกจทัวร์ (Tours)
          </Link>
          <Link href="/admin/departures" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors">
            <CalendarDays className="w-5 h-5" />
            รอบเดินทาง & ราคา
          </Link>
          
          <div className="pt-4 pb-2 px-4">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Deals & Automation</span>
          </div>
          <Link href="/admin/fire-sale" className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium text-rose-400 hover:text-white hover:bg-rose-500/20 bg-rose-500/5 transition-colors border border-rose-500/10">
            <div className="flex items-center gap-3">
              <Flame className="w-5 h-5" />
              ทัวร์ไฟไหม้
            </div>
            <span className="flex h-2 w-2 rounded-full bg-rose-500 animate-pulse"></span>
          </Link>
          <Link href="/admin/promotions" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-amber-400 hover:text-white hover:bg-amber-500/20 bg-amber-500/5 transition-colors border border-amber-500/10">
            <Tags className="w-5 h-5" />
            คูปอง & โปรโมชั่น
          </Link>
          <Link href="/admin/sync" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-emerald-400 hover:text-white hover:bg-emerald-500/20 bg-emerald-500/5 transition-colors border border-emerald-500/10">
            <RefreshCw className="w-5 h-5" />
            Wholesale Sync
          </Link>
          
          <div className="pt-4 pb-2 px-4">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Categories</span>
          </div>
          <Link href="/admin/tags" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors">
            <Tags className="w-5 h-5" />
            หมวดหมู่ & แท็ก
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
          <h2 className="text-xl font-bold text-white">Tour Management</h2>
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-sm font-bold text-white">Tour Admin</span>
              <span className="text-xs text-emerald-400 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> System Online</span>
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
