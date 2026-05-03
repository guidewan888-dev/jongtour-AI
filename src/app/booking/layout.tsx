import { ShieldCheck, Lock } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Secure Checkout | Jongtour Platform',
  description: 'ระบบจองทัวร์และชำระเงินที่ปลอดภัยได้มาตรฐาน',
};

export default function BookingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Secure Header - No Distractions (No Navigation Links) */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo (Can link back to tour domain to cancel flow) */}
          <a href="https://tour.jongtour.com" className="flex items-center gap-2 group">
            <span className="text-xl font-black text-slate-800 tracking-tight group-hover:text-slate-600 transition-colors">
              Jong<span className="text-orange-500">tour</span>
            </span>
          </a>

          {/* Secure Trust Badge */}
          <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full">
            <Lock size={14} className="fill-emerald-700" />
            <span className="text-xs font-bold uppercase tracking-wider">Secure Checkout</span>
          </div>

        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>

      {/* Trust Footer */}
      <footer className="bg-slate-100 py-8 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-semibold text-slate-500 flex items-center gap-1">
                <ShieldCheck size={16} /> Secure Payment Processing
              </span>
            </div>
            <div className="text-sm text-slate-400">
              Need help? Contact our support team at <span className="font-semibold text-slate-500">02-123-4567</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-400">
              <a href="https://info.jongtour.com/privacy-policy" target="_blank" className="hover:text-slate-600">Privacy Policy</a>
              <span>|</span>
              <a href="https://info.jongtour.com/terms" target="_blank" className="hover:text-slate-600">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
