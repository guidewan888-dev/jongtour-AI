"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { megaMenuConfig, publicNavLinks, mobileDrawerLinks } from "@/config/megaMenu";

export default function PublicHeader() {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpenMenu(null);
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

          {/* Desktop Nav */}
          <nav ref={menuRef} className="hidden lg:flex items-center gap-1">
            {/* Mega Menu Triggers */}
            {megaMenuConfig.map((group) => (
              <div key={group.trigger} className="relative">
                <button
                  className={`px-3 py-2 text-sm font-medium rounded-full transition-all duration-200 flex items-center gap-1 ${
                    openMenu === group.trigger
                      ? "bg-primary-50 text-primary-700"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                  onMouseEnter={() => setOpenMenu(group.trigger)}
                  onClick={() => setOpenMenu(openMenu === group.trigger ? null : group.trigger)}
                >
                  {group.trigger}
                  <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${openMenu === group.trigger ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>

                {/* Mega Dropdown */}
                {openMenu === group.trigger && (
                  <div
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white rounded-2xl border border-slate-200 p-6 min-w-[600px] mega-menu-enter"
                    style={{ boxShadow: "0 8px 30px rgba(0,0,0,0.12)" }}
                    onMouseLeave={() => setOpenMenu(null)}
                  >
                    <div className={`grid gap-8 ${group.columns.length >= 3 ? "grid-cols-3" : "grid-cols-2"}`}>
                      {group.columns.map((col) => (
                        <div key={col.title}>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">{col.title}</p>
                          <ul className="space-y-1">
                            {col.items.map((item) => (
                              <li key={item.href}>
                                <Link
                                  href={item.href}
                                  className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 rounded-lg hover:bg-primary-50 hover:text-primary-700 transition-colors"
                                  onClick={() => setOpenMenu(null)}
                                >
                                  {(item.flag || item.emoji) && (
                                    <span className="text-base">{item.flag || item.emoji}</span>
                                  )}
                                  <span className="font-medium">{item.label}</span>
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                    {group.footerLink && (
                      <div className="mt-5 pt-4 border-t border-slate-100">
                        <Link
                          href={group.footerLink.href}
                          className="text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors"
                          onClick={() => setOpenMenu(null)}
                        >
                          {group.footerLink.label}
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {/* Regular Links */}
            {publicNavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-2 text-sm font-medium text-slate-600 rounded-full hover:bg-slate-100 hover:text-slate-900 transition-all"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <Link href="/search" className="btn-icon text-slate-500 hidden sm:flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </Link>

            {/* AI Search */}
            <Link
              href="/ai-search"
              className="hidden md:flex items-center gap-1.5 px-3.5 py-2 bg-primary-50 text-primary-700 text-sm font-semibold rounded-full border border-primary-200 hover:bg-primary-100 transition-all"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
              </svg>
              AI
            </Link>

            {/* LINE */}
            <a href="https://line.me/R/ti/p/@jongtour" target="_blank" rel="noopener noreferrer" className="btn-icon text-[#06C755] hidden sm:flex items-center justify-center">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22.5 10.364c0-4.398-4.237-7.973-9.455-7.973-5.216 0-9.454 3.575-9.454 7.973 0 3.963 3.42 7.333 8.01 7.893.313.064.738.197.846.678.097.432-.03.882-.03.882s-.132.793-.162.977c-.038.232-.178.913.805.498 1.154-.486 6.223-3.666 8.163-6.07 1.01-1.238 1.278-2.678 1.278-4.858z"/>
              </svg>
            </a>

            {/* Login */}
            <Link href="/login" className="btn-primary text-sm px-5 py-2">
              เข้าสู่ระบบ
            </Link>

            {/* Mobile Hamburger */}
            <button
              className="lg:hidden btn-icon text-slate-600"
              onClick={() => setMobileOpen(true)}
              aria-label="เปิดเมนู"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 z-50 lg:hidden animate-fade-in" onClick={() => setMobileOpen(false)} />
          <div className="fixed top-0 right-0 bottom-0 w-[300px] bg-white z-50 lg:hidden animate-slide-in-right overflow-y-auto">
            {/* Drawer Header */}
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

            {/* Drawer Links */}
            <nav className="p-3">
              {mobileDrawerLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 rounded-xl hover:bg-slate-50 transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  <span className="text-lg">{link.emoji}</span>
                  {link.label}
                </Link>
              ))}

              <div className="my-3 border-t border-slate-200" />

              <Link
                href="/login"
                className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-primary-600 rounded-xl hover:bg-primary-50 transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                <span className="text-lg">👤</span>
                เข้าสู่ระบบ
              </Link>
              <Link
                href="/register"
                className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-primary-600 rounded-xl hover:bg-primary-50 transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                <span className="text-lg">✨</span>
                สมัครสมาชิก
              </Link>
            </nav>
          </div>
        </>
      )}

      <style jsx>{`
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
