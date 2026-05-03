import Link from 'next/link';
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { 
  LayoutDashboard, 
  Percent, 
  Tags,
  Users,
  Settings,
  LogOut,
  Bell
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function B2BAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/admin-login");
  }

  // Fetch user role
  const { data: dbUser } = await supabase
    .from("User")
    .select("*")
    .eq("email", user.email || "")
    .single();

  if (!dbUser || (dbUser.role !== "ADMIN" && dbUser.role !== "MANAGER")) {
    redirect("/auth/admin-login?error=unauthorized");
  }

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <span className="text-xl font-bold text-white tracking-tight">Pricing Center</span>
          <span className="ml-2 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">ADMIN</span>
        </div>
        
        <div className="p-4 flex-1 overflow-y-auto">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-3">Overview</div>
          <nav className="space-y-1 mb-8">
            <NavItem href="/b2badmin" icon={<LayoutDashboard size={18} />} label="Dashboard" />
          </nav>

          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-3">Pricing Engine</div>
          <nav className="space-y-1 mb-8">
            <NavItem href="/b2badmin/markups" icon={<Percent size={18} />} label="Global Markups" />
            <NavItem href="/b2badmin/promotions" icon={<Tags size={18} />} label="Promotions & Coupons" />
          </nav>

          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-3">Network</div>
          <nav className="space-y-1 mb-8">
            <NavItem href="/b2badmin/tiers" icon={<Users size={18} />} label="Agent Tiers" />
          </nav>
        </div>

        <div className="p-4 border-t border-slate-800">
          <nav className="space-y-1">
            <NavItem href="/b2badmin/settings" icon={<Settings size={18} />} label="System Settings" />
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium hover:bg-slate-800 hover:text-white transition-colors text-slate-400">
              <LogOut size={18} />
              Sign Out
            </button>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-10 shrink-0">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold text-slate-800 hidden md:block">B2B Pricing & Control Center</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="p-2 rounded-full hover:bg-slate-100 relative text-slate-500">
              <Bell size={20} />
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-amber-600 flex items-center justify-center text-white font-bold text-sm">
                {dbUser.name ? dbUser.name.charAt(0).toUpperCase() : 'A'}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-slate-700 leading-none">{dbUser.name || "Administrator"}</p>
                <p className="text-xs text-slate-500 mt-1">{dbUser.role}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

function NavItem({ href, icon, label }: { href: string, icon: React.ReactNode, label: string }) {
  return (
    <Link href={href} className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium hover:bg-slate-800 hover:text-white transition-colors text-slate-400">
      <span>{icon}</span>
      {label}
    </Link>
  );
}
