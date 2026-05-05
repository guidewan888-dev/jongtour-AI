import React from 'react';
import { publicMenu } from '@/config/publicMenu';
import { adminMenu } from '@/config/adminMenu';

export type LayoutVariant = 'public' | 'admin' | 'booking' | 'business';

export default function MasterHeader({ variant }: { variant: LayoutVariant }) {
  if (variant === 'admin') {
    return (
      <header className="h-16 bg-white border-b flex items-center justify-end px-6 shadow-sm sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-slate-600 bg-slate-100 px-3 py-1 rounded-full">Admin User</span>
        </div>
      </header>
    );
  }

  if (variant === 'booking') {
    return (
      <header className="h-16 bg-white border-b flex items-center justify-center px-6 sticky top-0 z-50">
        <div className="font-bold text-xl text-orange-600">Jongtour <span className="text-slate-400 font-light ml-2">Secure Checkout</span></div>
      </header>
    );
  }

  // Public & Business Header
  const isBusiness = variant === 'business';
  const menuSource = isBusiness ? [] : publicMenu;

  return (
    <header className={`h-16 ${isBusiness ? 'bg-orange-600 text-white' : 'bg-white border-b'} flex items-center sticky top-0 z-50 transition-colors`}>
      <div className="container mx-auto px-4 flex items-center justify-between">
        <div className={`font-bold text-2xl tracking-tight ${isBusiness ? 'text-white' : 'text-orange-600'}`}>
          Jongtour {isBusiness && <span className="font-light text-lg opacity-80">Partners</span>}
        </div>
        <nav className="hidden md:flex gap-6 text-sm font-medium items-center">
          {menuSource.map((item, idx) => (
            <a 
              key={idx} 
              href={item.href} 
              className={`transition-colors ${isBusiness ? 'hover:text-orange-200' : 'text-slate-600 hover:text-orange-600'}`}
            >
              {item.label}
              {item.badge && <span className="ml-2 text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded-full">{item.badge}</span>}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
