import Link from 'next/link';

export const metadata = {
  title: 'Jongtour - เที่ยวทั่วโลกกับบริษัททัวร์คุณภาพ',
  description: 'Jongtour แหล่งรวมแพ็กเกจทัวร์คุณภาพ บทความท่องเที่ยว โปรโมชัน และคู่มือการเดินทางครบวงจร',
};

export default function InfoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-md shadow-indigo-200">
              J
            </div>
            <span className="text-2xl font-black text-slate-800 tracking-tight">
              Jongtour<span className="text-indigo-600">.</span>
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6">
            <Link href="/" className="text-sm font-bold text-slate-900 hover:text-indigo-600 transition-colors">
              Home
            </Link>
            <Link href="/about" className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors">
              About
            </Link>
            <Link href="/destinations" className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors">
              Destination Guide
            </Link>
            <Link href="/travel-guide" className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors">
              Travel Guide
            </Link>
            <Link href="/blog" className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors">
              Blog
            </Link>
            <Link href="/promotions" className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors">
              Promotions
            </Link>
            <div className="relative group">
              <button className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors flex items-center gap-1">
                Help Center
              </button>
              <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                <Link href="/faq" className="block px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-indigo-600">FAQ</Link>
              </div>
            </div>
            <Link href="/contact" className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors">
              Contact Us
            </Link>
          </nav>

          {/* CTA Buttons */}
          <div className="flex items-center gap-4">
            <a 
              href="https://tour.jongtour.com" 
              className="hidden sm:inline-flex items-center justify-center px-6 py-2.5 rounded-full text-sm font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors"
            >
              ค้นหาทัวร์
            </a>
            <a 
              href="https://booking.jongtour.com" 
              className="items-center justify-center px-6 py-2.5 rounded-full text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
            >
              เช็คสถานะการจอง
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full bg-white">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 pt-16 pb-8 text-slate-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12 border-b border-slate-800 pb-12">
            <div className="col-span-1 md:col-span-2">
              <span className="text-2xl font-black text-white tracking-tight mb-4 block">
                Jongtour<span className="text-indigo-500">.</span>
              </span>
              <p className="text-slate-400 text-sm leading-relaxed max-w-sm mb-6">
                เปิดประสบการณ์ท่องเที่ยวทั่วโลกไปกับ Jongtour เราคัดสรรแพ็กเกจทัวร์คุณภาพจาก Partner ชั้นนำ เพื่อให้ทุกการเดินทางของคุณเต็มไปด้วยความสุขและความทรงจำที่ยอดเยี่ยม
              </p>
            </div>
            <div>
              <h3 className="text-white font-bold mb-4 uppercase text-sm tracking-wider">แพลตฟอร์มของเรา</h3>
              <ul className="space-y-3 text-sm text-slate-400">
                <li><a href="https://tour.jongtour.com" className="hover:text-indigo-400 transition-colors">ค้นหาทัวร์ (Tour Search)</a></li>
                <li><a href="https://booking.jongtour.com" className="hover:text-indigo-400 transition-colors">เช็คสถานะการจอง (My Booking)</a></li>
                <li><a href="https://agent.jongtour.com" className="hover:text-indigo-400 transition-colors">สำหรับตัวแทน (Agent Portal)</a></li>
                <li><a href="https://sale.jongtour.com" className="hover:text-indigo-400 transition-colors">ระบบจัดการตัวแทนขาย (CRM)</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-bold mb-4 uppercase text-sm tracking-wider">บริการช่วยเหลือ & นโยบาย</h3>
              <ul className="space-y-3 text-sm text-slate-400">
                <li><Link href="/help-center" className="hover:text-indigo-400 transition-colors">ศูนย์ช่วยเหลือ (Help Center)</Link></li>
                <li><Link href="/faq" className="hover:text-indigo-400 transition-colors">คำถามที่พบบ่อย (FAQ)</Link></li>
                <li><Link href="/contact" className="hover:text-indigo-400 transition-colors">ติดต่อเรา (Contact Us)</Link></li>
                <li><Link href="/terms" className="hover:text-indigo-400 transition-colors">เงื่อนไขการให้บริการ (Terms & Conditions)</Link></li>
                <li><Link href="/privacy-policy" className="hover:text-indigo-400 transition-colors">นโยบายความเป็นส่วนตัว (Privacy Policy)</Link></li>
                <li><Link href="/pdpa" className="hover:text-indigo-400 transition-colors">นโยบายคุ้มครองข้อมูลส่วนบุคคล (PDPA)</Link></li>
              </ul>
            </div>
          </div>
          <div className="text-center text-slate-500 text-xs">
            &copy; {new Date().getFullYear()} Jongtour Platform. All rights reserved. Designed for Enterprise Travel Tech.
          </div>
        </div>
      </footer>
    </div>
  );
}
