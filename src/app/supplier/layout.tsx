import Link from 'next/link';
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { 
  LayoutDashboard, 
  Package, 
  CalendarDays, 
  Users, 
  FileText, 
  Receipt,
  Settings,
  LogOut,
  Bell,
  PlaneTakeoff,
  Wallet
} from 'lucide-react';

export default async function SupplierLayout({
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

  // Fetch user role
  const { data: dbUser } = await supabase
    .from("User")
    .select("*, supplier:Supplier(*)")
    .eq("email", user.email || "")
    .single();

  if (!dbUser || (dbUser.role !== "SUPPLIER" && dbUser.role !== "ADMIN")) {
    redirect("/auth/login?error=unauthorized");
  }

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Sidebar - Wholesale Branding (Dark Blue/Teal) */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <span className="text-xl font-bold text-white tracking-tight">Wholesale Center</span>
        </div>
        
        <div className="p-4 flex-1 overflow-y-auto">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-3">Overview</div>
          <nav className="space-y-1 mb-8">
            <NavItem href="/supplier" icon={<LayoutDashboard size={18} />} label="Dashboard" />
            <NavItem href="/supplier/bookings" icon={<Receipt size={18} />} label="Booking Requests" />
          </nav>

          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-3">Product Inventory</div>
          <nav className="space-y-1 mb-8">
            <NavItem href="/supplier/tours" icon={<Package size={18} />} label="My Tours" />
            <NavItem href="/supplier/departures" icon={<CalendarDays size={18} />} label="Allotment Control" />
          </nav>

          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-3">Operations</div>
          <nav className="space-y-1 mb-8">
            <NavItem href="/supplier/manifest" icon={<Users size={18} />} label="Passenger Manifest" />
            <NavItem href="/supplier/finance" icon={<Wallet size={18} />} label="Payouts & Finance" />
          </nav>
        </div>

        <div className="p-4 border-t border-slate-800">
          <nav className="space-y-1">
            <NavItem href="/supplier/settings" icon={<Settings size={18} />} label="Settings" />
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
            <h1 className="text-xl font-semibold text-slate-800 hidden md:block">Supplier Portal</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="p-2 rounded-full hover:bg-slate-100 relative text-slate-500">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-white font-bold text-sm">
                {dbUser.supplier?.[0]?.companyName?.charAt(0) || dbUser.name?.charAt(0) || 'S'}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-slate-700 leading-none">{dbUser.supplier?.[0]?.companyName || "Supplier"}</p>
                <p className="text-xs text-slate-500 mt-1">{dbUser.email}</p>
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
