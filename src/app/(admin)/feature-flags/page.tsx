"use client";

import React from "react";
import { ToggleLeft, ToggleRight, Shield, Zap, Eye, Search } from "lucide-react";

const flags = [
  { key: "ai_chat_enabled", label: "AI Chat (Public)", desc: "เปิดใช้ AI Chat สำหรับลูกค้า", enabled: true },
  { key: "flash_sale_banner", label: "Flash Sale Banner", desc: "แสดง banner Flash Sale หน้าแรก", enabled: true },
  { key: "agent_registration", label: "Agent Self-Registration", desc: "ให้ตัวแทนสมัครเองผ่านเว็บ", enabled: false },
  { key: "payment_omise", label: "Omise Payment", desc: "รับชำระผ่านบัตรเครดิต (Omise)", enabled: false },
  { key: "visa_apply_online", label: "Online Visa Application", desc: "สมัครวีซ่าออนไลน์", enabled: true },
  { key: "private_group_ai", label: "Private Group AI Estimate", desc: "AI คำนวณราคากรุ๊ปส่วนตัว", enabled: true },
];

export default function FeatureFlagsPage() {
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-slate-900">Feature Flags</h1><p className="text-slate-500 text-sm mt-1">เปิด/ปิดฟีเจอร์ต่าง ๆ ของระบบ</p></div>
      <div className="space-y-2">
        {flags.map(f => (
          <div key={f.key} className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center gap-4">
            <button className="shrink-0">{f.enabled ? <ToggleRight className="w-8 h-8 text-emerald-500" /> : <ToggleLeft className="w-8 h-8 text-slate-300" />}</button>
            <div className="flex-1">
              <div className="font-medium text-sm text-slate-900">{f.label}</div>
              <div className="text-xs text-slate-400">{f.desc}</div>
            </div>
            <code className="text-xs bg-slate-50 px-2 py-1 rounded font-mono text-slate-500">{f.key}</code>
          </div>
        ))}
      </div>
    </div>
  );
}
