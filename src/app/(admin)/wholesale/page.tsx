import React from "react";
import Link from "next/link";
import { Package, RefreshCw, AlertTriangle, Settings, ArrowRight, Database } from "lucide-react";

const cards = [
  { title: "Wholesale Dashboard", desc: "ภาพรวมข้อมูล Wholesale ทั้งหมด", icon: Package, href: "/wholesale/dashboard", color: "bg-blue-50 text-blue-600" },
  { title: "Central System", desc: "Raw/Normalize/Mapping และ Review ในระบบกลาง", icon: Database, href: "/wholesale/central", color: "bg-emerald-50 text-emerald-600" },
  { title: "Suppliers", desc: "จัดการ Wholesale Partners", icon: Settings, href: "/wholesale/suppliers", color: "bg-purple-50 text-purple-600" },
  { title: "Sync Center", desc: "ซิงค์ข้อมูลทัวร์จาก API", icon: RefreshCw, href: "/wholesale/sync", color: "bg-emerald-50 text-emerald-600" },
  { title: "Credentials", desc: "จัดการ API Keys & Tokens", icon: Settings, href: "/wholesale/credentials", color: "bg-amber-50 text-amber-600" },
  { title: "Diagnostics", desc: "ตรวจสอบสถานะระบบ", icon: AlertTriangle, href: "/wholesale/diagnostics", color: "bg-red-50 text-red-600" },
  { title: "Sync Logs", desc: "ประวัติการซิงค์ข้อมูล", icon: RefreshCw, href: "/wholesale/sync-logs", color: "bg-slate-50 text-slate-600" },
];

export default function WholesalePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Wholesale Management</h1>
        <p className="text-slate-500 text-sm mt-1">จัดการระบบ Wholesale Partners, API Sync, และข้อมูลทัวร์</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((c) => (
          <Link key={c.title} href={c.href} className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-primary/30 hover:shadow-md transition-all group">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${c.color}`}>
              <c.icon className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 mb-1">{c.title}</h3>
            <p className="text-sm text-slate-500 mb-3">{c.desc}</p>
            <span className="text-xs font-semibold text-primary flex items-center gap-1 group-hover:gap-2 transition-all">
              จัดการ <ArrowRight className="w-3 h-3" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
