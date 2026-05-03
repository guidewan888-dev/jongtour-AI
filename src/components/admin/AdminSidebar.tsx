"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Ticket, Users, FileText, Settings, LogOut, RefreshCcw, Activity } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const navItems = [
    { name: "แดชบอร์ด", href: "/admin", icon: LayoutDashboard },
    { name: "จัดการการจอง (Bookings)", href: "/admin/bookings", icon: Ticket },
    { name: "ลูกค้าสมาชิก", href: "/admin/customers", icon: Users },
    { name: "การเงิน & เอกสาร", href: "/admin/finance", icon: FileText },
    { name: "สถานะ API Sync", href: "/admin/sync", icon: RefreshCcw },
    { name: "Link Health Monitor", href: "/admin/link-monitor", icon: Activity },
    { name: "ตั้งค่าระบบ", href: "/admin/settings", icon: Settings },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col fixed h-full z-20">
      <div className="p-6 border-b border-slate-800">
        <Link href="/admin" className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <span className="bg-orange-500 text-white px-2 py-1 rounded-md text-sm">ADMIN</span>
          Jongtour AI
        </Link>
      </div>

      <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
        <p className="text-xs font-semibold text-slate-500 mb-4 px-2 uppercase tracking-wider">เมนูหลัก</p>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-colors ${
                isActive ? "bg-orange-500 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium text-sm">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-3 rounded-xl w-full text-slate-400 hover:bg-slate-800 hover:text-red-400 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium text-sm">ออกจากระบบ</span>
        </button>
      </div>
    </aside>
  );
}
