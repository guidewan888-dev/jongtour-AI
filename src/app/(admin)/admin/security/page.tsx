"use client";
import React, { useState } from "react";
import { Shield, CheckCircle, AlertTriangle, XCircle, Lock, Eye } from "lucide-react";

const checks = [
  { cat: "Authentication", items: [
    { name: "Supabase Auth (JWT)", status: "pass", detail: "Session-based, httpOnly cookies" },
    { name: "Password hashing (bcrypt)", status: "pass", detail: "Cost factor 12" },
    { name: "Session timeout", status: "pass", detail: "24h max, sliding window" },
    { name: "MFA / 2FA", status: "warn", detail: "ยังไม่เปิดใช้งาน — แนะนำเปิดสำหรับ admin" },
  ]},
  { cat: "Authorization", items: [
    { name: "RBAC (Role-Based Access)", status: "pass", detail: "7 roles, hierarchical" },
    { name: "Subdomain guards", status: "pass", detail: "Middleware enforced" },
    { name: "Path-based guards", status: "pass", detail: "/admin, /account, /talent-portal, /affiliate" },
    { name: "API route guards (withAuth)", status: "pass", detail: "Role + permission checks" },
    { name: "Data-level filtering", status: "pass", detail: "getDataFilter() by role" },
  ]},
  { cat: "Input Security", items: [
    { name: "SQL Injection", status: "pass", detail: "Prisma ORM parameterized queries" },
    { name: "XSS Prevention", status: "pass", detail: "React auto-escape + sanitize()" },
    { name: "CSRF Protection", status: "pass", detail: "SameSite cookies + token validation" },
    { name: "File Upload Validation", status: "warn", detail: "Client-side only — เพิ่ม server-side MIME check" },
  ]},
  { cat: "Transport Security", items: [
    { name: "HTTPS / HSTS", status: "pass", detail: "Strict-Transport-Security: max-age=31536000" },
    { name: "X-Frame-Options", status: "pass", detail: "SAMEORIGIN — ป้องกัน clickjacking" },
    { name: "X-Content-Type-Options", status: "pass", detail: "nosniff" },
    { name: "Referrer-Policy", status: "pass", detail: "strict-origin-when-cross-origin" },
  ]},
  { cat: "Rate Limiting", items: [
    { name: "Middleware rate limit", status: "pass", detail: "100 req/min per IP" },
    { name: "API rate limit", status: "pass", detail: "60 req/min per key" },
    { name: "Login brute-force", status: "warn", detail: "แนะนำเพิ่ม lockout หลังลอง 5 ครั้ง" },
  ]},
  { cat: "Data Protection", items: [
    { name: "Sensitive data encryption", status: "pass", detail: "API keys encrypted in DB" },
    { name: "Talent privacy (real name)", status: "pass", detail: "ซ่อนจนกว่า request confirmed" },
    { name: "Audit logging", status: "pass", detail: "AuditLog table + AUTH events" },
    { name: "PDPA compliance", status: "pass", detail: "Consent model + opt-out" },
    { name: "Backup strategy", status: "warn", detail: "Supabase auto — แนะนำเพิ่ม cross-region" },
  ]},
  { cat: "Payment Security", items: [
    { name: "PCI compliance (via Omise)", status: "pass", detail: "ไม่เก็บ card data ใน server" },
    { name: "PromptPay QR (EMVCo)", status: "pass", detail: "Dynamic QR + CRC16 checksum" },
    { name: "WHT 3% calculation", status: "pass", detail: "Automated in CommissionLedger" },
    { name: "Slip verification", status: "pass", detail: "Admin manual verify + status tracking" },
  ]},
];

const statusIcon = (s: string) => s === "pass" ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : s === "warn" ? <AlertTriangle className="w-4 h-4 text-amber-500" /> : <XCircle className="w-4 h-4 text-red-500" />;

export default function SecurityAuditPage() {
  const total = checks.reduce((a, c) => a + c.items.length, 0);
  const passed = checks.reduce((a, c) => a + c.items.filter(i => i.status === "pass").length, 0);
  const warnings = total - passed;
  const score = Math.round((passed / total) * 100);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold text-slate-900">Security Audit</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">ตรวจสอบความปลอดภัยของระบบ</p>
        </div>
        <div className={`px-5 py-2.5 rounded-2xl text-center ${score >= 90 ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
          <div className="text-3xl font-black">{score}%</div>
          <div className="text-xs font-bold">Security Score</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-emerald-50 p-4 rounded-2xl text-center">
          <div className="text-2xl font-black text-emerald-700">{passed}</div>
          <div className="text-xs text-emerald-600">Passed</div>
        </div>
        <div className="bg-amber-50 p-4 rounded-2xl text-center">
          <div className="text-2xl font-black text-amber-700">{warnings}</div>
          <div className="text-xs text-amber-600">Warnings</div>
        </div>
        <div className="bg-slate-50 p-4 rounded-2xl text-center">
          <div className="text-2xl font-black text-slate-700">{total}</div>
          <div className="text-xs text-slate-600">Total Checks</div>
        </div>
      </div>

      <div className="space-y-4 stagger-children">
        {checks.map(cat => (
          <div key={cat.cat} className="g-card p-5">
            <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
              <Lock className="w-4 h-4 text-primary" /> {cat.cat}
              <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full text-slate-500">
                {cat.items.filter(i => i.status === "pass").length}/{cat.items.length}
              </span>
            </h3>
            <div className="space-y-2">
              {cat.items.map(item => (
                <div key={item.name} className={`flex items-center gap-3 p-2.5 rounded-xl text-sm ${item.status === "warn" ? "bg-amber-50" : "bg-slate-50"}`}>
                  {statusIcon(item.status)}
                  <span className="font-medium flex-1">{item.name}</span>
                  <span className="text-xs text-slate-400 max-w-[200px] truncate">{item.detail}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
