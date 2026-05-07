'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { adminMenu } from '@/config/adminMenu';

export default function MasterSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex-shrink-0 min-h-screen sticky top-0">
      <div className="h-16 flex items-center px-6 font-bold text-xl border-b border-slate-800">
        <Link href="/dashboard" className="flex items-center">
          <span className="text-orange-500">Jongtour</span> <span className="ml-2 font-light text-white">Admin</span>
        </Link>
      </div>
      <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-4rem)]">
        {adminMenu.map((item, idx) => {
          const isGroupActive = pathname === item.href || pathname?.startsWith(item.href + '/') || 
            item.children?.some(c => pathname === c.href || pathname?.startsWith(c.href + '/'));
          return (
            <div key={idx} className="mb-2">
              <Link 
                href={item.href} 
                className={`flex items-center px-3 py-2 rounded-md transition-colors group ${
                  isGroupActive && !item.children ? 'bg-slate-800 text-white' : 'hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span className="font-medium">{item.label}</span>
                {item.status === 'COMING_SOON' && <span className="ml-auto text-[10px] bg-slate-700 px-1.5 py-0.5 rounded">Soon</span>}
                {item.badge && <span className="ml-auto text-[10px] bg-orange-600 text-white px-1.5 py-0.5 rounded">{item.badge}</span>}
              </Link>
              {item.children && (
                <div className="ml-4 pl-3 border-l border-slate-700 mt-1 space-y-1">
                  {item.children.map((child, cIdx) => {
                    const isActive = pathname === child.href || pathname?.startsWith(child.href + '/');
                    return (
                      <Link 
                        key={cIdx} 
                        href={child.href} 
                        className={`block px-3 py-1.5 text-sm rounded-md transition-colors ${
                          isActive ? 'bg-slate-800 text-white font-medium' : 'hover:bg-slate-800 hover:text-white'
                        }`}
                      >
                        {child.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
