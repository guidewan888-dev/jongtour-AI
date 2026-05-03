import Link from 'next/link';
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { 
  LayoutDashboard, 
  Package, 
  FileText, 
  Users, 
  Receipt,
  Wallet,
  Settings,
  LogOut,
  Bell
} from 'lucide-react';

export default async function B2BLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Fetch user role using email instead of ID because Prisma uses CUID while Supabase uses UUID
  const { data: dbUser } = await supabase
    .from("User")
    .select("*, company:Company(*)")
    .eq("email", user.email || "")
    .single();

  if (!dbUser || (dbUser.role !== "AGENT" && dbUser.role !== "SUPPLIER" && dbUser.role !== "ADMIN")) {
    redirect("/auth/login?error=unauthorized");
  }

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans print:h-auto print:bg-white">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col hidden md:flex print:hidden">
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <span className="text-xl font-bold text-white tracking-tight">Jongtour B2B</span>
          <span className="ml-2 px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">PRO</span>
        </div>
        
        <div className="p-4 flex-1 overflow-y-auto">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-3">Overview</div>
          <nav className="space-y-1 mb-8">
            <NavItem href="/b2b" icon={<LayoutDashboard size={18} />} label="Agent Dashboard" />
            <NavItem href="/b2b/bookings" icon={<Receipt size={18} />} label="Booking History" />
          </nav>

          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-3">Sales & Products</div>
          <nav className="space-y-1 mb-8">
            <NavItem href="/b2b/tours" icon={<Package size={18} />} label="Search Tours (B2B)" />
            <NavItem href="/b2b/quotations" icon={<FileText size={18} />} label="My Quotations" />
          </nav>

          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-3">Management</div>
          <nav className="space-y-1 mb-8">
            <NavItem href="/b2b/finance" icon={<Wallet size={18} />} label="Finance & Credit" />
            <NavItem href="/b2b/agents" icon={<Users size={18} />} label="Sub-agents" />
          </nav>
        </div>

        <div className="p-4 border-t border-slate-800">
          <nav className="space-y-1">
            <NavItem href="/b2b/settings" icon={<Settings size={18} />} label="Settings" />
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium hover:bg-slate-800 hover:text-white transition-colors text-slate-400">
              <LogOut size={18} />
              Sign Out
            </button>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden print:overflow-visible">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-10 shrink-0 print:hidden">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold text-slate-800 hidden md:block">B2B Management Platform</h1>
            {/* Mobile menu button could go here */}
          </div>
          
          <div className="flex items-center gap-4">
            <button className="p-2 rounded-full hover:bg-slate-100 relative text-slate-500">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                {dbUser.name ? dbUser.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-slate-700 leading-none">{dbUser.name || "B2B User"}</p>
                <p className="text-xs text-slate-500 mt-1">{dbUser.company?.name || dbUser.role}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 print:p-0 print:overflow-visible">
          <div className="max-w-7xl mx-auto print:max-w-none print:w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

function NavItem({ href, icon, label }: { href: string, icon: React.ReactNode, label: string }) {
  // Simple NavItem for MVP without active state logic
  return (
    <Link href={href} className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium hover:bg-slate-800 hover:text-white transition-colors">
      <span className="text-slate-400">{icon}</span>
      {label}
    </Link>
  );
}
