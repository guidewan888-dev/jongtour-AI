"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, UserCircle, Globe2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { filterAdminMenusByRole } from "@/config/adminRoutes";

interface AdminSidebarProps {
  role?: string;
  userName?: string;
  userEmail?: string;
}

export default function AdminSidebar({ role = "CUSTOMER", userName = "Admin User", userEmail = "admin@jongtour.com" }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const filteredMenuGroups = filterAdminMenusByRole(role);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <aside className="w-[260px] bg-trust-900 border-r border-trust-800 text-white flex flex-col fixed h-full z-20 shadow-xl">
      {/* Brand Header */}
      <div className="h-20 px-6 border-b border-trust-800 flex items-center shrink-0">
        <Link href="/dashboard" className="flex items-center gap-2 group w-full">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-orange-600 rounded-lg flex items-center justify-center shadow-sm">
             <Globe2 className="w-5 h-5 text-white" />
          </div>
          <div>
             <span className="text-xl font-black tracking-tight text-white group-hover:text-primary-100 transition-colors">Jong<span className="text-primary">tour</span></span>
             <span className="block text-[10px] text-trust-400 font-medium tracking-widest uppercase -mt-1">Control Panel</span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-4 overflow-y-auto custom-scrollbar space-y-8">
        {filteredMenuGroups.map((group) => (
          <div key={group.title}>
            <p className="text-[11px] font-bold text-trust-500 mb-3 px-3 uppercase tracking-wider">{group.title}</p>
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/admin" && pathname?.startsWith(item.href));
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-all group relative ${
                      isActive 
                        ? "bg-primary text-white shadow-md shadow-primary/20" 
                        : "text-trust-300 hover:bg-trust-800/50 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                       <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-trust-400 group-hover:text-white transition-colors"}`} strokeWidth={isActive ? 2.5 : 2} />
                       <span className={`text-sm ${isActive ? "font-bold" : "font-medium"}`}>{item.name}</span>
                    </div>
                    {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-r-md"></div>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer / User Area */}
      <div className="p-4 border-t border-trust-800 shrink-0 bg-trust-900/50">
         <div className="flex items-center gap-3 px-3 py-2 mb-2 rounded-lg bg-trust-800/50 border border-trust-700/50">
            <div className="w-8 h-8 rounded-full bg-trust-700 flex items-center justify-center shrink-0">
               <UserCircle className="w-5 h-5 text-trust-300" />
            </div>
            <div className="flex-1 min-w-0">
               <p className="text-sm font-bold text-white truncate">{userName}</p>
               <p className="text-[10px] text-trust-400 truncate">{userEmail}</p>
            </div>
         </div>
        <button 
          onClick={handleLogout}
          className="flex items-center justify-between px-4 py-2.5 rounded-lg w-full text-trust-400 hover:bg-destructive/10 hover:text-destructive-400 transition-colors border border-transparent hover:border-destructive/20 group"
        >
          <div className="flex items-center gap-3">
             <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform" />
             <span className="font-medium text-sm">ออกจากระบบ</span>
          </div>
        </button>
      </div>
    </aside>
  );
}
