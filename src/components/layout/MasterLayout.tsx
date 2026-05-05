import React from 'react';
import MasterHeader, { LayoutVariant } from '../navigation/MasterHeader';
import MasterSidebar from '../navigation/MasterSidebar';

interface MasterLayoutProps {
  children: React.ReactNode;
  variant: LayoutVariant;
}

export default function MasterLayout({ children, variant }: MasterLayoutProps) {
  if (variant === 'admin') {
    return (
      <div className="flex min-h-screen bg-slate-50 font-sans">
        <MasterSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <MasterHeader variant="admin" />
          <main className="flex-1 p-6 lg:p-8 overflow-auto">{children}</main>
        </div>
      </div>
    );
  }

  // Public, Booking, Business
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans">
      <MasterHeader variant={variant} />
      <main className={`flex-1 ${variant === 'booking' ? 'max-w-3xl mx-auto w-full px-4 py-8' : ''}`}>
        {children}
      </main>
      {variant !== 'booking' && (
        <footer className="bg-slate-900 text-slate-400 py-12 mt-auto">
          <div className="container mx-auto px-4 text-center text-sm">
            <p>© {new Date().getFullYear()} Jongtour. Official Architecture System.</p>
          </div>
        </footer>
      )}
    </div>
  );
}
