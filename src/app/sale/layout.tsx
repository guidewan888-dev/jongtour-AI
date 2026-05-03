import Link from 'next/link';
import { 
  LayoutDashboard, 
  Users, 
  Target, 
  CalendarCheck, 
  FileText,
  Search,
  Bell,
  MessageCircle,
  PhoneCall
} from 'lucide-react';

export const metadata = {
  title: 'Sales CRM | Jongtour Platform',
};

export default function SaleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-800">
      
      {/* Sidebar - CRM Style */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col hidden md:flex shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-black text-sm">
              CRM
            </div>
            <span className="text-lg font-bold text-white tracking-tight">Jongtour Sale</span>
          </div>
        </div>
        
        <div className="p-4 flex-1 overflow-y-auto">
          {/* Create Button */}
          <button className="w-full mb-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm">
            + New Lead
          </button>

          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-3">Overview</div>
          <nav className="space-y-1 mb-8">
            <NavItem href="/sale" icon={<LayoutDashboard size={18} />} label="Dashboard" />
            <NavItem href="/sale/tasks" icon={<CalendarCheck size={18} />} label="My Tasks" badge="3" />
          </nav>

          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-3">Pipeline</div>
          <nav className="space-y-1 mb-8">
            <NavItem href="/sale/leads" icon={<Target size={18} />} label="Leads Pipeline" active />
            <NavItem href="/sale/customers" icon={<Users size={18} />} label="Customers" />
          </nav>

          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-3">Sales Tools</div>
          <nav className="space-y-1 mb-8">
            <NavItem href="/sale/tours" icon={<Search size={18} />} label="Find Tours" />
            <NavItem href="/sale/quotations" icon={<FileText size={18} />} label="Quotations" />
          </nav>
        </div>

        <div className="p-4 border-t border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold">
            SK
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate">Sale Khun</p>
            <p className="text-xs text-slate-400 truncate">Senior Telesale</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-10 shrink-0">
          <div className="flex-1 relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search leads, phones, or booking IDs..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-100 border-transparent focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg text-sm outline-none transition-all"
            />
          </div>
          
          <div className="flex items-center gap-4 ml-4">
            <button className="p-2 text-slate-400 hover:text-indigo-600 relative">
              <PhoneCall size={20} />
            </button>
            <button className="p-2 text-slate-400 hover:text-indigo-600 relative">
              <MessageCircle size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-indigo-500 rounded-full"></span>
            </button>
            <button className="p-2 text-slate-400 hover:text-red-600 relative">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
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

function NavItem({ href, icon, label, badge, active }: { href: string, icon: React.ReactNode, label: string, badge?: string, active?: boolean }) {
  return (
    <Link 
      href={href} 
      className={`flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors
        ${active 
          ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' 
          : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
      `}
    >
      <div className="flex items-center gap-3">
        {icon}
        {label}
      </div>
      {badge && (
        <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
          {badge}
        </span>
      )}
    </Link>
  );
}
