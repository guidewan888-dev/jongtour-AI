"use client";

import Link from "next/link";
import { Settings, Globe, CreditCard, Bell, Users, Shield, Database, Webhook, ChevronRight } from "lucide-react";

export default function AdminSettingsHubPage() {
  const settingCategories = [
    {
      title: "การตั้งค่าทั่วไป (General)",
      icon: Globe,
      color: "bg-blue-100 text-blue-600",
      description: "ข้อมูลบริษัท, โลโก้, สกุลเงินเริ่มต้น, ภาษี",
      href: "/admin/settings/general"
    },
    {
      title: "ช่องทางชำระเงิน (Payment Methods)",
      icon: CreditCard,
      color: "bg-emerald-100 text-emerald-600",
      description: "ตั้งค่าบัญชีธนาคาร, PromptPay QR, API บัตรเครดิต",
      href: "/admin/settings/payment"
    },
    {
      title: "เชื่อมต่อ Wholesale API (Integrations)",
      icon: Webhook,
      color: "bg-purple-100 text-purple-600",
      description: "ตั้งค่า API Key สำหรับเชื่อมต่อระบบ Go365, Zego",
      href: "/admin/settings/api"
    },
    {
      title: "การแจ้งเตือน (Notifications)",
      icon: Bell,
      color: "bg-amber-100 text-amber-600",
      description: "ตั้งค่าเทมเพลตอีเมล, SMS, Line OA",
      href: "/admin/settings/notifications"
    },
    {
      title: "สิทธิ์การเข้าถึง (Roles & Permissions)",
      icon: Shield,
      color: "bg-red-100 text-red-600",
      description: "จัดการแอดมิน, พนักงานเซลล์, สิทธิ์ดูยอดเงิน",
      href: "/admin/settings/roles"
    },
    {
      title: "ระบบสมาชิก VIP & Coins",
      icon: Users,
      color: "bg-indigo-100 text-indigo-600",
      description: "ตั้งค่ากฎการเลื่อนขั้น VIP, เรทการแลกพอยท์",
      href: "/admin/settings/loyalty"
    },
    {
      title: "จัดการฐานข้อมูลทัวร์ (Master Data)",
      icon: Database,
      color: "bg-slate-100 text-slate-600",
      description: "หมวดหมู่ประเทศ, สายการบิน, แท็กยอดฮิต",
      href: "/admin/settings/master"
    }
  ];

  return (
    <div className="max-w-5xl">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Settings className="w-6 h-6" /> ศูนย์รวมการตั้งค่า (Settings Hub)
        </h2>
        <p className="text-gray-500 mt-1">เลือกหมวดหมู่ที่ต้องการตั้งค่าสำหรับระบบ Jongtour</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {settingCategories.map((cat, index) => {
          const Icon = cat.icon;
          return (
            <Link key={index} href={cat.href} className="group">
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all h-full flex flex-col relative overflow-hidden">
                <div className="flex items-start justify-between mb-4 relative z-10">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${cat.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </div>
                <div className="relative z-10 flex-1">
                  <h3 className="font-bold text-lg text-gray-900 group-hover:text-indigo-700 transition-colors">{cat.title}</h3>
                  <p className="text-sm text-gray-500 mt-2 leading-relaxed">{cat.description}</p>
                </div>
                
                {/* Decorative background element on hover */}
                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-indigo-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity blur-2xl pointer-events-none"></div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
