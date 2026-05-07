"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";

/* ── App Launcher Grid Items ─────────────────────────── */
const gridItems = [
  { label: "ทัวร์ไฟไหม้", href: "/deals/flash-sale", icon: "🔥", color: "#FF6D01" },
  { label: "บริการวีซ่า", href: "/visa", icon: "🛂", color: "#0F9D58" },
  { label: "AI จัดทริป", href: "/private-group", icon: "✈️", color: "#4285F4" },
  { label: "AI Search", href: "/ai-search", icon: "✨", color: "#EA4335" },
  { label: "เกี่ยวกับเรา", href: "/about", icon: "🏢", color: "#1A73E8" },
  { label: "ชำระเงิน", href: "/payment-guide", icon: "💳", color: "#FBBC05" },
  { label: "ร่วมงานกับเรา", href: "/careers", icon: "🤝", color: "#34A853" },
  { label: "Affiliate", href: "/affiliate", icon: "🎯", color: "#E91E63" },
  { label: "Wholesale", href: "/wholesale-partners", icon: "🏭", color: "#00BCD4" },
  { label: "ติดต่อ", href: "/contact", icon: "📞", color: "#34A853" },
  { label: "เข้าสู่ระบบ", href: "/login", icon: "👤", color: "#7B1FA2" },
  { label: "B2B Agent", href: "/agent-portal/register", icon: "💼", color: "#455A64" },
];

export default function PublicHeader() {
  const [gridOpen, setGridOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    const handleClickOutside = (e: MouseEvent) => {
      if (gridRef.current && !gridRef.current.contains(e.target as Node)) setGridOpen(false);
    };
    window.addEventListener("scroll", handleScroll);
    document.addEventListener("mousedown", handleClickOutside);
    return () => { window.removeEventListener("scroll", handleScroll); document.removeEventListener("mousedown", handleClickOutside); };
  }, []);

  return (
    <>
      <header
        className={`sticky top-0 z-50 bg-white transition-shadow duration-200 ${scrolled ? "shadow-md" : "border-b border-slate-200"}`}
      >
        <div className="g-container h-16 flex items-center justify-between gap-4">
          {/* Hamburger (mobile) */}
          <button
            className="lg:hidden btn-icon text-slate-600"
            onClick={() => setMobileOpen(true)}
            aria-label="เปิดเมนู"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-1.5 shrink-0 group">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
              </svg>
            </div>
            <span className="text-xl font-bold tracking-tight">
              <span className="text-primary-600">Jong</span>
              <span className="text-slate-800">tour</span>
            </span>
          </Link>

          {/* Desktop Nav Links — 6 Region Menus */}
          <nav className="hidden lg:flex items-center gap-0.5 ml-6">
            {[
              { label: "ทัวร์เอเชีย", href: "/region/asia", icon: "🌏" },
              { label: "ทัวร์ยุโรป", href: "/region/europe", icon: "🏰" },
              { label: "ทัวร์ตะวันออกกลาง", href: "/region/middle-east", icon: "🕌" },
              { label: "ทัวร์โอเชียเนีย", href: "/region/oceania", icon: "🦘" },
              { label: "ทัวร์อเมริกา", href: "/region/americas", icon: "🗽" },
              { label: "ทัวร์อื่นๆ", href: "/region/others", icon: "🌐" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium text-slate-600 hover:text-primary-600 hover:bg-primary-50 rounded-full transition-colors whitespace-nowrap"
              >
                <span className="text-sm">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <Link href="/search" className="btn-icon text-slate-500 hidden sm:flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </Link>

            {/* Grid App Launcher */}
            <div ref={gridRef} className="relative">
              <button
                onClick={() => setGridOpen(!gridOpen)}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${gridOpen ? "bg-slate-100" : "hover:bg-slate-100"}`}
                aria-label="แอปทั้งหมด"
              >
                <svg className="w-5 h-5 text-slate-600" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="5" cy="5" r="2" />
                  <circle cx="12" cy="5" r="2" />
                  <circle cx="19" cy="5" r="2" />
                  <circle cx="5" cy="12" r="2" />
                  <circle cx="12" cy="12" r="2" />
                  <circle cx="19" cy="12" r="2" />
                  <circle cx="5" cy="19" r="2" />
                  <circle cx="12" cy="19" r="2" />
                  <circle cx="19" cy="19" r="2" />
                </svg>
              </button>

              {/* Grid Dropdown */}
              {gridOpen && (
                <div className="absolute right-0 top-full mt-2 w-[320px] bg-white rounded-2xl border border-slate-200 shadow-xl p-4 z-50" style={{ animation: "grid-in 0.2s ease-out" }}>
                  <div className="grid grid-cols-3 gap-1">
                    {gridItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="flex flex-col items-center gap-1.5 p-3 rounded-xl hover:bg-slate-50 transition-colors"
                        onClick={() => setGridOpen(false)}
                      >
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center text-xl"
                          style={{ background: `${item.color}15` }}
                        >
                          {item.icon}
                        </div>
                        <span className="text-[11px] font-medium text-slate-600 text-center leading-tight">{item.label}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Language */}
            <button className="hidden md:flex items-center gap-1 px-2 py-1.5 text-sm text-slate-500 hover:bg-slate-50 rounded-full transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
              </svg>
              <span className="text-xs font-medium">ไทย</span>
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
            </button>

            {/* Avatar / Login */}
            <Link href="/login" className="w-9 h-9 rounded-full bg-primary-500 flex items-center justify-center text-white hover:bg-primary-600 transition-colors shadow-sm" aria-label="เข้าสู่ระบบ">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 z-50 lg:hidden animate-fade-in" onClick={() => setMobileOpen(false)} />
          <div className="fixed top-0 right-0 bottom-0 w-[300px] bg-white z-50 lg:hidden animate-slide-in-right overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <span className="text-lg font-bold text-slate-800">
                <span className="text-primary-600">Jong</span>tour
              </span>
              <button onClick={() => setMobileOpen(false)} className="btn-icon text-slate-500">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <nav className="p-3">
              {gridItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 rounded-xl hover:bg-slate-50 transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  <span className="text-lg">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </>
      )}

      <style jsx>{`
        @keyframes grid-in {
          from { opacity: 0; transform: scale(0.95) translateY(-4px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes slide-in-right {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.25s ease-out;
        }
      `}</style>
    </>
  );
}
