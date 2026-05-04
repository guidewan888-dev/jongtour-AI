import Link from 'next/link';
import { Search, Map, Zap, Repeat, CalendarDays, User, Menu } from 'lucide-react';

export const metadata = {
  title: 'Jongtour Marketplace - ค้นหาทัวร์ต่างประเทศราคาถูก',
  description: 'ค้นหาและเปรียบเทียบแพ็กเกจทัวร์ต่างประเทศ โปรไฟไหม้ ด้วยระบบ AI อัจฉริยะ',
};

export default function TourLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-orange-100 selection:text-orange-900">


      {/* Main Content */}
      <main className="flex-1 w-full relative">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <span className="text-xl font-black text-slate-800 tracking-tight block mb-4">
                Jong<span className="text-orange-500">tour</span>
              </span>
              <p className="text-sm text-slate-500 leading-relaxed">
                Tour Search Engine & Marketplace อันดับ 1 รวบรวมแพ็กเกจทัวร์จากโฮลเซลล์ชั้นนำทั่วประเทศ
              </p>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-4">Discover</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li><Link href="/search" className="hover:text-orange-500">All Tours</Link></li>
                <li><Link href="/destinations" className="hover:text-orange-500">Destinations</Link></li>
                <li><Link href="/promotions" className="hover:text-orange-500">Promotions</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-4">Tools</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li><Link href="/ai" className="hover:text-orange-500 flex items-center justify-center sm:justify-start gap-1"><Zap size={14} className="text-orange-500"/> AI Search</Link></li>
                <li><Link href="/compare" className="hover:text-orange-500">Compare Tours</Link></li>
                <li><a href="https://booking.jongtour.com" className="hover:text-orange-500">My Bookings</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-4">Corporate</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li><a href="https://info.jongtour.com" className="hover:text-orange-500">About Jongtour</a></li>
                <li><a href="https://agent.jongtour.com" className="hover:text-orange-500">Agent Portal</a></li>
                <li><a href="https://sale.jongtour.com" className="hover:text-orange-500">Contact Sales</a></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function NavItem({ href, icon, label, highlight, active }: { href: string, icon: React.ReactNode, label: string, highlight?: boolean, active?: boolean }) {
  return (
    <Link 
      href={href} 
      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-colors
        ${active ? 'text-orange-600 bg-orange-50' : 
          highlight ? 'text-indigo-600 hover:bg-indigo-50' : 
          'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}
      `}
    >
      {icon}
      {label}
    </Link>
  );
}
