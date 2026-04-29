"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Ticket, Users, FileText, Settings, LogOut, RefreshCcw, Bell } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { name: "แดชบอร์ด", href: "/admin", icon: LayoutDashboard },
    { name: "จัดการการจอง (Bookings)", href: "/admin/bookings", icon: Ticket },
    { name: "ลูกค้าสมาชิก", href: "/admin/users", icon: Users },
    { name: "การเงิน & เอกสาร", href: "/admin/finance", icon: FileText },
    { name: "สถานะ API Sync", href: "/admin/sync", icon: RefreshCcw },
    { name: "ตั้งค่าระบบ", href: "/admin/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
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
          <button className="flex items-center gap-3 px-3 py-3 rounded-xl w-full text-slate-400 hover:bg-slate-800 hover:text-red-400 transition-colors">
            <LogOut className="w-5 h-5" />
            <span className="font-medium text-sm">ออกจากระบบ</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="bg-white h-20 border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-10">
          <h1 className="text-xl font-bold text-gray-800">ระบบจัดการ Jongtour AI</h1>
          <div className="flex items-center gap-6">
            <button className="relative text-gray-500 hover:text-orange-500 transition-colors">
              <Bell className="w-6 h-6" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                3
              </span>
            </button>
            <div className="flex items-center gap-3 pl-6 border-l border-gray-200">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
                AD
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-bold text-gray-700">ผู้ดูแลระบบ</p>
                <p className="text-xs text-gray-500">Super Admin</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
