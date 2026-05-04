import { ShieldCheck, Lock, CheckCircle2 } from 'lucide-react';
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
    <div className="min-h-screen bg-background flex flex-col font-sans">


      {/* Trust Banner */}
      <div className="bg-primary/5 border-b border-primary/10 py-2">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center gap-6 text-xs text-trust-800 font-medium">
            <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-primary"/> ยืนยันที่นั่งทันที</span>
            <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-primary"/> ไม่มีบวกเพิ่มทีหลัง</span>
            <span className="flex items-center gap-1 hidden md:flex"><CheckCircle2 className="w-3.5 h-3.5 text-primary"/> เจ้าหน้าที่ดูแล 24 ชม.</span>
         </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 w-full py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>

      {/* Trust Footer */}
      <footer className="bg-white py-10 border-t border-border mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
                 <ShieldCheck className="w-5 h-5 text-emerald-600" /> 
              </div>
              <div>
                 <p className="text-sm font-bold text-trust-900">100% Secure Payment</p>
                 <p className="text-xs text-muted-foreground">เข้ารหัสข้อมูลระดับสูงสุด (SSL 256-bit)</p>
              </div>
            </div>
            
            <div className="text-sm text-trust-900 text-center md:text-left">
              มีข้อสงสัย? ติดต่อ Call Center <span className="font-bold text-primary">02-123-4567</span>
            </div>
            
            <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
              <a href="/info/privacy-policy" target="_blank" className="hover:text-primary transition-colors">Privacy Policy</a>
              <span>|</span>
              <a href="/info/terms" target="_blank" className="hover:text-primary transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
