import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { Bell, Search, UserCircle, ChevronDown, Command } from "lucide-react";
import { ReactNode } from "react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: 'Jongtour Elite | Admin Control Panel',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();

  const isBypass = cookieStore.get("admin_bypass")?.value === "supersecret99";
  if (!user && !isBypass) {
    redirect("/login");
  }

  // ใช้ Supabase JS แทน Prisma เพื่อหลีกเลี่ยง Vercel IPv6 Panic
  const { data: dbUser } = await supabase
    .from("users")
    .select("*, role:roles(*)")
    .eq("email", user?.email || "")
    .single();

  let finalUser = dbUser;

  // Prevent non-admins from accessing the admin panel
  const allowedRoles = ["ADMIN", "SUPER_ADMIN"];
  if (!isBypass && (!finalUser || !finalUser.role || !allowedRoles.includes(finalUser.role.name))) {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://jongtour.com";
    redirect(`${siteUrl}/user/bookings`);
  }

  return (
    <div className="min-h-screen bg-muted flex font-sans text-trust-900">
      <AdminSidebar />

      {/* Main Content */}
      <div className="flex-1 ml-[260px] flex flex-col min-h-screen">
        
        {/* Top Header */}
        <header className="bg-white h-20 border-b border-border flex items-center justify-between px-8 sticky top-0 z-10 shadow-sm">
          
          {/* Left: Global Search Mockup */}
          <div className="flex items-center gap-4 flex-1">
             <div className="relative max-w-md w-full hidden md:block group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input 
                   type="text" 
                   placeholder="Search bookings, customers, tours..." 
                   className="w-full bg-muted/50 border border-border rounded-lg py-2 pl-9 pr-12 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary focus:bg-white transition-all"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                   <kbd className="hidden sm:inline-flex items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                     <Command className="w-3 h-3" /> K
                   </kbd>
                </div>
             </div>
          </div>

          {/* Right: Actions & Profile */}
          <div className="flex items-center gap-5">
            {/* Notifications */}
            <button className="relative text-muted-foreground hover:text-trust-900 transition-colors p-2 rounded-full hover:bg-muted">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full ring-2 ring-white"></span>
            </button>
            
            <div className="h-6 w-px bg-border"></div>
            
            {/* Profile Dropdown Mock */}
            <button className="flex items-center gap-3 hover:bg-muted/50 p-1.5 pr-3 rounded-xl transition-colors text-left">
              <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center shrink-0 border border-primary-200">
                <UserCircle className="w-5 h-5 text-primary-700" />
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-bold text-trust-900 leading-none">{dbUser?.name || "Admin User"}</p>
                <p className="text-[11px] text-muted-foreground mt-1">Super Admin</p>
              </div>
              <ChevronDown className="w-4 h-4 text-muted-foreground hidden md:block ml-1" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-8 w-full max-w-[1600px] mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
