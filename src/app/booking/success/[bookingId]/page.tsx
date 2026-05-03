import { CheckCircle, Download, ArrowRight, User, PartyPopper, CalendarDays, Receipt } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent } from "@/components/ui-new/Card";
import { Button } from "@/components/ui-new/Button";
import { Badge } from "@/components/ui-new/Badge";

export default function BookingSuccessPage({ params }: { params: { bookingId: string } }) {
  return (
    <div className="max-w-3xl mx-auto py-8">
      
      {/* Modern Stepper */}
      <div className="bg-white rounded-2xl shadow-sm border border-border p-6 mb-8">
        <div className="relative flex items-center justify-between w-full">
          {/* Background Line */}
          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-primary rounded-full"></div>
          
          {/* Step 1: Completed */}
          <div className="relative z-10 flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold shadow-sm ring-4 ring-white">
               <CheckCircle className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-primary">ข้อมูลผู้เดินทาง</span>
          </div>
          
          {/* Step 2: Completed */}
          <div className="relative z-10 flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold shadow-sm ring-4 ring-white">
               <CheckCircle className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-primary">ชำระเงิน</span>
          </div>
          
          {/* Step 3: Active */}
          <div className="relative z-10 flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold shadow-md shadow-primary/20 ring-4 ring-white">
               <PartyPopper className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-primary">เสร็จสิ้น</span>
          </div>
        </div>
      </div>

      <Card className="border-border shadow-floating overflow-hidden text-center border-none">
        
        {/* Success Header Area */}
        <div className="bg-emerald-500 py-16 px-6 relative overflow-hidden">
          {/* Abstract pattern */}
          <div className="absolute inset-0 opacity-10">
             <div className="absolute top-0 -left-10 w-40 h-40 bg-white rounded-full mix-blend-overlay"></div>
             <div className="absolute bottom-10 right-10 w-60 h-60 bg-white rounded-full mix-blend-overlay"></div>
          </div>
          
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-xl shadow-emerald-900/20 text-emerald-500 ring-8 ring-emerald-400">
              <CheckCircle className="w-12 h-12" />
            </div>
            <Badge variant="outline" className="bg-white/20 border-transparent text-white mb-4 px-4 py-1 backdrop-blur-sm">Booking Confirmed</Badge>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">การจองเสร็จสมบูรณ์!</h1>
            <p className="text-emerald-50 text-lg max-w-lg mx-auto">
               เราได้รับยอดชำระเงินของคุณเรียบร้อยแล้ว<br/>อีเมลยืนยันการจองได้ถูกส่งไปยังอีเมลของคุณ
            </p>
          </div>
        </div>

        <CardContent className="p-8 md:p-12 bg-white">
          
          {/* Booking Reference Block */}
          <div className="bg-muted/50 rounded-2xl p-8 border border-border inline-block min-w-full md:min-w-[400px] mb-10 shadow-inner">
            <p className="text-sm text-muted-foreground font-medium mb-2 uppercase tracking-widest">หมายเลขการจอง (Booking ID)</p>
            <p className="text-4xl md:text-5xl font-mono font-black text-primary tracking-wider">{params.bookingId}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left mb-10">
             {/* Left: Summary */}
             <div className="space-y-4">
                <h3 className="font-bold text-trust-900 text-lg border-b border-border pb-2">สรุปการเดินทาง</h3>
                <div className="flex items-start gap-3 text-sm">
                   <CalendarDays className="w-5 h-5 text-primary shrink-0" />
                   <div>
                      <span className="text-muted-foreground block mb-0.5">โปรแกรมทัวร์</span>
                      <span className="font-semibold text-trust-900">แพ็กเกจทัวร์ฮอกไกโด ซัปโปโร โอตารุ</span>
                   </div>
                </div>
                <div className="flex items-start gap-3 text-sm">
                   <User className="w-5 h-5 text-primary shrink-0" />
                   <div>
                      <span className="text-muted-foreground block mb-0.5">ผู้เดินทาง</span>
                      <span className="font-semibold text-trust-900">SOMCHAI JONGTOUR (+1 ผู้ติดตาม)</span>
                   </div>
                </div>
             </div>
             
             {/* Right: Next Steps */}
             <div className="space-y-4">
                <h3 className="font-bold text-trust-900 text-lg border-b border-border pb-2">ขั้นตอนต่อไป</h3>
                <div className="flex items-start gap-3 text-sm">
                   <div className="w-5 h-5 rounded-full bg-primary-100 text-primary-800 flex items-center justify-center font-bold shrink-0 text-xs mt-0.5">1</div>
                   <span className="text-muted-foreground">ระบบกำลังออกเอกสาร Voucher การเดินทาง</span>
                </div>
                <div className="flex items-start gap-3 text-sm">
                   <div className="w-5 h-5 rounded-full bg-primary-100 text-primary-800 flex items-center justify-center font-bold shrink-0 text-xs mt-0.5">2</div>
                   <span className="text-muted-foreground">เตรียมตัวให้พร้อม ทีมงานจะติดต่อไปก่อนเดินทาง 7 วัน</span>
                </div>
             </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="rounded-full px-8 shadow-md" asChild>
               <Link href="/user/bookings/1234">ไปที่หน้าจัดการการจอง <ArrowRight className="w-4 h-4 ml-2" /></Link>
            </Button>
            <Button variant="outline" size="lg" className="rounded-full px-8 bg-white border-border text-trust-900">
               <Receipt className="w-4 h-4 mr-2" /> โหลดใบเสร็จรับเงิน
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <div className="text-center mt-8">
        <Link href="/" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
          กลับสู่หน้าหลักแพลตฟอร์ม
        </Link>
      </div>
    </div>
  );
}
