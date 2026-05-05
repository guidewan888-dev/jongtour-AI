// CookieConsent is imported in root layout (src/app/layout.tsx)

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <a href="/" className="font-bold text-2xl text-orange-600 tracking-tight">Jongtour</a>
          <nav className="hidden md:flex gap-6 text-sm font-medium">
            <a href="/" className="text-slate-600 hover:text-orange-600 transition-colors">Home</a>
            <a href="/tours" className="text-slate-600 hover:text-orange-600 transition-colors">Tours</a>
            <a href="/search" className="text-slate-600 hover:text-orange-600 transition-colors">Destinations</a>
            <a href="/about" className="text-slate-600 hover:text-orange-600 transition-colors">About</a>
            <a href="/contact" className="text-slate-600 hover:text-orange-600 transition-colors">Contact</a>
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="bg-slate-900 text-slate-400 py-12 mt-auto">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="text-white font-bold text-lg mb-3">🧳 Jongtour</div>
              <p className="text-sm leading-relaxed">แพลตฟอร์มจองทัวร์ครบวงจร ทั้งกรุ๊ปทัวร์ ส่วนตัว และวีซ่า</p>
            </div>
            <div>
              <div className="text-white font-semibold text-sm mb-3">บริการ</div>
              <div className="space-y-2 text-sm">
                <a href="/tours" className="block hover:text-white transition-colors">ทัวร์กรุ๊ป</a>
                <a href="/fit" className="block hover:text-white transition-colors">ทัวร์ส่วนตัว</a>
                <a href="/visa" className="block hover:text-white transition-colors">วีซ่า</a>
              </div>
            </div>
            <div>
              <div className="text-white font-semibold text-sm mb-3">เกี่ยวกับ</div>
              <div className="space-y-2 text-sm">
                <a href="/about" className="block hover:text-white transition-colors">เกี่ยวกับเรา</a>
                <a href="/blog" className="block hover:text-white transition-colors">บทความ</a>
                <a href="/faq" className="block hover:text-white transition-colors">คำถามที่พบบ่อย</a>
              </div>
            </div>
            <div>
              <div className="text-white font-semibold text-sm mb-3">กฎหมาย</div>
              <div className="space-y-2 text-sm">
                <a href="/terms" className="block hover:text-white transition-colors">ข้อกำหนดการใช้งาน</a>
                <a href="/privacy-policy" className="block hover:text-white transition-colors">นโยบายความเป็นส่วนตัว</a>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-700 pt-6 text-center text-sm">
            <p>© {new Date().getFullYear()} Jongtour Co., Ltd. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
