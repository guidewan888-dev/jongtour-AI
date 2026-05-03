import Link from 'next/link';
import { 
  Database, 
  Building2, 
  RefreshCw, 
  GitMerge, 
  Eye, 
  AlertCircle,
  FileSearch,
  Settings,
  Bell
} from 'lucide-react';

export const metadata = {
  title: 'API & Data Control | Jongtour B2BAdmin',
};

export default function B2BAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-slate-950 font-mono text-slate-300">
      
      {/* Sidebar - Data Engineering Style (Dark Mode) */}
      <aside className="w-64 bg-black border-r border-slate-800 flex flex-col shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-slate-800 bg-black">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 border-2 border-emerald-500 rounded bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <Database size={16} />
            </div>
            <span className="text-sm font-bold text-emerald-400 tracking-wider">DATA.CONTROL</span>
          </div>
        </div>
        
        <div className="p-4 flex-1 overflow-y-auto">
          <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-3 px-3">System Health</div>
          <nav className="space-y-1 mb-8">
            <NavItem href="/b2badmin" icon={<Database size={16} />} label="API Dashboard" active />
            <NavItem href="/b2badmin/errors" icon={<AlertCircle size={16} />} label="Error Logs" badge="12" />
          </nav>

          <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-3 px-3">Wholesale Master</div>
          <nav className="space-y-1 mb-8">
            <NavItem href="/b2badmin/suppliers" icon={<Building2 size={16} />} label="Supplier Config" />
          </nav>

          <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-3 px-3">ETL & Integration</div>
          <nav className="space-y-1 mb-8">
            <NavItem href="/b2badmin/sync" icon={<RefreshCw size={16} />} label="Sync Center" />
            <NavItem href="/b2badmin/mapping" icon={<GitMerge size={16} />} label="Schema Mapping" />
            <NavItem href="/b2badmin/import" icon={<FileSearch size={16} />} label="Manual Import" />
          </nav>

          <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-3 px-3">Quality Control</div>
          <nav className="space-y-1 mb-8">
            <NavItem href="/b2badmin/human-review" icon={<Eye size={16} />} label="Human Review" badge="5" urgent />
          </nav>
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <p className="text-xs text-slate-400">System Core: <span className="text-emerald-400 font-bold">ONLINE</span></p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-900">
        
        {/* Topbar */}
        <header className="h-16 bg-slate-950 border-b border-slate-800 flex items-center justify-between px-6 z-10 shrink-0">
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span>Terminal: <span className="text-slate-300">b2badmin.jongtour.com</span></span>
            <span className="hidden sm:inline">|</span>
            <span className="hidden sm:inline">Access Level: <span className="text-amber-400">API_MANAGER</span></span>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-400 hover:text-emerald-400 relative transition-colors">
              <Bell size={18} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <button className="p-2 text-slate-400 hover:text-emerald-400 transition-colors">
              <Settings size={18} />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

function NavItem({ href, icon, label, badge, urgent, active }: { href: string, icon: React.ReactNode, label: string, badge?: string, urgent?: boolean, active?: boolean }) {
  return (
    <Link 
      href={href} 
      className={`flex items-center justify-between px-3 py-2 rounded text-xs transition-colors
        ${active 
          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold' 
          : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}
      `}
    >
      <div className="flex items-center gap-3">
        {icon}
        {label}
      </div>
      {badge && (
        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${urgent ? 'bg-rose-500 text-white' : 'bg-slate-700 text-slate-300'}`}>
          {badge}
        </span>
      )}
    </Link>
  );
}
