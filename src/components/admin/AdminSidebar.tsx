"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Ticket, Users, FileText, Settings, LogOut, RefreshCcw, Activity } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const menuGroups = [
    {
      title: "OVERVIEW",
      items: [
        { name: "แดชบอร์ดรวม (Dashboard)", href: "/admin", icon: LayoutDashboard },
        { name: "รายงานวิเคราะห์ (Reports)", href: "/admin/reports", icon: Activity },
      ]
    },
    {
      title: "MANAGEMENT",
      items: [
        { name: "ผู้ใช้งาน & สิทธิ์ (Users)", href: "/admin/users", icon: Users },
        { name: "ตัวแทนจำหน่าย (Agents)", href: "/admin/agents", icon: Users },
      ]
    },
    {
      title: "OPERATIONS",
      items: [
        { name: "การจองทั้งหมด (Bookings)", href: "/admin/bookings", icon: Ticket },
        { name: "การเงิน & เอกสาร (Finance)", href: "/admin/finance", icon: FileText },
      ]
    },
    {
      title: "CONTENT & AI",
      items: [
        { name: "จัดการเนื้อหา (CMS)", href: "/admin/cms", icon: FileText },
        { name: "ศูนย์ควบคุม AI (AI Center)", href: "/admin/ai", icon: Activity },
      ]
    },
    {
      title: "SYSTEM",
      items: [
        { name: "Audit Logs", href: "/admin/audit-logs", icon: FileText },
        { name: "Link Monitor", href: "/admin/link-monitor", icon: Activity },
        { name: "ตั้งค่าระบบ (Settings)", href: "/admin/settings", icon: Settings },
      ]
    }
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col fixed h-full z-20">
      <div className="p-6 border-b border-slate-800 shrink-0">
        <Link href="/admin" className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <span className="bg-orange-500 text-white px-2 py-1 rounded-md text-sm">ADMIN</span>
          Jongtour
        </Link>
      </div>

      <nav className="flex-1 py-4 px-4 overflow-y-auto space-y-6">
        {menuGroups.map((group) => (
          <div key={group.title}>
            <p className="text-[10px] font-bold text-slate-500 mb-2 px-2 uppercase tracking-widest">{group.title}</p>
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-colors ${
                      isActive ? "bg-orange-500 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="font-medium text-sm">{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
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
