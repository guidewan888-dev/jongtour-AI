"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Ticket, Users, FileText, Settings, LogOut, BarChart, Bot, FileEdit, PlaneTakeoff, ShieldCheck, HelpCircle, UserCircle, Briefcase, Globe2, ChevronRight } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface AdminSidebarProps {
  role?: string;
  userName?: string;
  userEmail?: string;
}

export default function AdminSidebar({ role = "CUSTOMER", userName = "Admin User", userEmail = "admin@jongtour.com" }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const menuGroups = [
    {
      title: "Overview",
      items: [
        { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
        { name: "Bookings", href: "/admin/bookings", icon: Ticket },
        { name: "Operations", href: "/admin/operations", icon: PlaneTakeoff },
      ]
    },
    {
      title: "Finance & CRM",
      items: [
        { name: "Finance", href: "/admin/finance", icon: FileText },
        { name: "Customers", href: "/admin/customers", icon: Users },
      ]
    },
    {
      title: "AI & Content",
      items: [
        { name: "AI Center", href: "/admin/ai", icon: Bot },
        { name: "CMS Content", href: "/admin/cms", icon: FileEdit },
        { name: "Reports Hub", href: "/admin/reports", icon: BarChart },
      ]
    },
    {
      title: "System",
      items: [
        { name: "Users & Roles", href: "/admin/users", icon: ShieldCheck },
        { name: "Settings", href: "/admin/settings", icon: Settings },
      ]
    },
    {
      title: "Wholesale / Supplier Center",
      items: [
        { name: "Dashboard", href: "/admin/wholesale/dashboard", icon: LayoutDashboard },
        { name: "Supplier Master", href: "/admin/wholesale/suppliers", icon: Briefcase },
        { name: "Data Sync", href: "/admin/wholesale/sync", icon: Globe2 },
        { name: "Tour Import", href: "/admin/wholesale/import", icon: FileText },
        { name: "Mapping", href: "/admin/wholesale/mapping", icon: BarChart },
        { name: "Human Review", href: "/admin/wholesale/human-review", icon: Users },
      ]
    }
  ];

  // Access Matrix for Sidebar
  const filterMenusByRole = (role: string) => {
    // SUPER_ADMIN and ADMIN see everything
    if (role === 'SUPER_ADMIN' || role === 'ADMIN') return menuGroups;

    return menuGroups.map(group => {
      let filteredItems = [...group.items];
      
      if (role === 'OPERATION') {
        // Operations shouldn't see System Settings, Content, or Finance
        if (group.title === 'Finance & CRM') {
           filteredItems = filteredItems.filter(i => i.name !== 'Finance');
        }
        if (group.title === 'System') filteredItems = [];
        if (group.title === 'AI & Content') filteredItems = [];
      } 
      else if (role === 'FINANCE') {
        // Finance sees only Finance & CRM, and basic Overview
        if (group.title === 'Wholesale / Supplier Center') filteredItems = [];
        if (group.title === 'System') filteredItems = [];
        if (group.title === 'AI & Content') filteredItems = [];
      }
      else if (role === 'CONTENT_MANAGER') {
        // Content Manager sees CMS, AI, and basic overview
        if (group.title === 'Wholesale / Supplier Center') filteredItems = [];
        if (group.title === 'Finance & CRM') filteredItems = [];
        if (group.title === 'System') filteredItems = [];
      }
      else if (role === 'SALE_MANAGER') {
        // Sale Manager sees Customers, Bookings, Reports
        if (group.title === 'Wholesale / Supplier Center') filteredItems = [];
        if (group.title === 'System') filteredItems = [];
        if (group.title === 'Finance & CRM') filteredItems = filteredItems.filter(i => i.name === 'Customers');
      }
      else {
         // Default fallback: just show dashboard
         if (group.title !== 'Overview') filteredItems = [];
      }

      return { ...group, items: filteredItems };
    }).filter(group => group.items.length > 0);
  };

  const filteredMenuGroups = filterMenusByRole(role);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <aside className="w-[260px] bg-trust-900 border-r border-trust-800 text-white flex flex-col fixed h-full z-20 shadow-xl">
      {/* Brand Header */}
      <div className="h-20 px-6 border-b border-trust-800 flex items-center shrink-0">
        <Link href="/admin" className="flex items-center gap-2 group w-full">
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
