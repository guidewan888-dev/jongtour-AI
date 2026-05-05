'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logout } from '@/lib/auth.actions'

export default function CustomerAccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Primary navigation for Mobile Bottom Nav (Max 4-5 items)
  const coreLinks = [
    { name: 'Dashboard', path: '/account/dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { name: 'My Bookings', path: '/account/bookings', icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z' },
    { name: 'AI Chat', path: '/account/ai-chats', icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z' },
    { name: 'Profile', path: '/account/profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
  ]

  // Full 19-item navigation grouped logically
  const navGroups = [
    {
      title: 'ข้อมูลส่วนตัว',
      links: [
        coreLinks[0], // Dashboard
        coreLinks[3], // Profile
        { name: 'Travel Preferences', path: '/account/preferences', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
      ]
    },
    {
      title: 'การเดินทางและเอกสาร',
      links: [
        coreLinks[1], // My Bookings
        { name: 'ใบนัดหมายการเดินทาง', path: '/account/appointments', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
        { name: 'Vouchers', path: '/account/vouchers', icon: 'M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z' },
        { name: 'Documents', path: '/account/documents', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
      ]
    },
    {
      title: 'การเงินและใบเสร็จ',
      links: [
        { name: 'Payments', path: '/account/payments', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
        { name: 'Invoices / Receipts', path: '/account/invoices', icon: 'M9 14h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
      ]
    },
    {
      title: 'วางแผนเที่ยว',
      links: [
        coreLinks[2], // AI Chat
        { name: 'Favorite Tours', path: '/account/favorites', icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
        { name: 'Quotations', path: '/account/quotations', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
        { name: 'Private Group Requests', path: '/account/private-groups', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
      ]
    },
    {
      title: 'การแจ้งเตือนและความช่วยเหลือ',
      links: [
        { name: 'Notifications', path: '/account/notifications', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' },
        { name: 'Support', path: '/account/support', icon: 'M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z' },
      ]
    },
    {
      title: 'ความปลอดภัยและการตั้งค่า',
      links: [
        { name: 'Social Connections', path: '/account/social-connections', icon: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1' },
        { name: 'Security', path: '/account/security', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' },
        { name: 'PDPA / Privacy', path: '/account/pdpa', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20 md:pb-0 pt-16 md:pt-20">
      
      {/* Top Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-40 flex items-center justify-between px-4">
        <span className="font-black text-slate-800 text-lg tracking-tight">Jong<span className="text-orange-500">tour</span></span>
        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-xs">
          ME
        </div>
      </div>

      <div className="max-w-[1200px] w-full mx-auto px-4 md:px-8 py-6 md:py-10 flex-1 flex flex-col md:flex-row gap-8">
        
        {/* Desktop Sidebar (Hidden on mobile) */}
        <aside className="hidden md:block w-72 shrink-0">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden sticky top-28">
            
            <div className="p-6 text-center border-b border-slate-100">
              <div className="w-16 h-16 mx-auto bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-black text-2xl mb-3 shadow-inner">
                JT
              </div>
              <h3 className="font-bold text-slate-800">บัญชีของฉัน</h3>
              <p className="text-slate-400 text-xs mt-1">สมาชิก Jongtour</p>
            </div>

            <nav className="p-3 space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto custom-scrollbar">
              {navGroups.map((group, idx) => (
                <div key={idx}>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 px-3">{group.title}</div>
                  <div className="space-y-0.5">
                    {group.links.map((link) => {
                      const isActive = pathname === link.path
                      return (
                        <Link 
                          key={link.path} 
                          href={link.path}
                          className={`flex items-center gap-3 px-3 py-2 rounded-2xl text-sm transition-all ${
                            isActive 
                              ? 'bg-orange-50 text-orange-600 font-bold' 
                              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium'
                          }`}
                        >
                          <svg className={`w-5 h-5 shrink-0 ${isActive ? 'text-orange-500' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isActive ? 2.5 : 2} d={link.icon} />
                          </svg>
                          <span className="truncate">{link.name}</span>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              ))}

              <div className="pt-2 mt-2 border-t border-slate-100">
                <button 
                  onClick={() => logout()}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-2xl text-sm font-bold text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                >
                  <svg className="w-5 h-5 shrink-0 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                  Logout
                </button>
              </div>
            </nav>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0">
          {children}
        </main>

      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-200 z-40 flex items-center justify-around px-2 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        {coreLinks.map((link) => {
          const isActive = pathname === link.path
          return (
            <Link 
              key={link.path}
              href={link.path}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
                isActive ? 'text-orange-600' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <svg className={`w-6 h-6 ${isActive ? 'scale-110 transition-transform' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isActive ? 2.5 : 2} d={link.icon} />
              </svg>
              <span className={`text-[10px] ${isActive ? 'font-bold' : 'font-medium'}`}>{link.name}</span>
            </Link>
          )
        })}
        {/* Mobile Menu Toggle Button */}
        <button 
          onClick={() => setIsMobileMenuOpen(true)}
          className="flex flex-col items-center justify-center w-full h-full space-y-1 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          <span className="text-[10px] font-medium">Menu</span>
        </button>
      </div>

      {/* Mobile Bottom Sheet Menu (Accordion / Drawer) */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-fade-in" onClick={() => setIsMobileMenuOpen(false)}></div>
          <div className="bg-white w-full max-h-[85vh] rounded-t-3xl overflow-hidden flex flex-col animate-slide-up relative z-10">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white">
              <h3 className="font-black text-slate-800 text-lg">เมนูทั้งหมด</h3>
              <button onClick={() => setIsMobileMenuOpen(false)} className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-500">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="overflow-y-auto pb-safe p-4">
              <nav className="space-y-6">
                {navGroups.map((group, idx) => (
                  <div key={idx}>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2 px-3">{group.title}</div>
                    <div className="grid grid-cols-1 gap-1">
                      {group.links.map((link) => {
                        const isActive = pathname === link.path
                        return (
                          <Link 
                            key={link.path} 
                            href={link.path}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm transition-all ${
                              isActive 
                                ? 'bg-orange-50 text-orange-600 font-bold' 
                                : 'text-slate-600 active:bg-slate-50 font-medium'
                            }`}
                          >
                            <svg className={`w-5 h-5 shrink-0 ${isActive ? 'text-orange-500' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isActive ? 2.5 : 2} d={link.icon} />
                            </svg>
                            <span className="truncate">{link.name}</span>
                          </Link>
                        )
                      })}
                    </div>
                  </div>
                ))}
                
                <div className="pt-2 mt-2 border-t border-slate-100">
                  <button 
                    onClick={() => logout()}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <svg className="w-5 h-5 shrink-0 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                    Logout
                  </button>
                </div>
              </nav>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
