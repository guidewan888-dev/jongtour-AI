import { CheckCircle, Download, FileText, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function BookingSuccessPage({ params }: { params: { bookingId: string } }) {
  return (
    <div className="max-w-2xl mx-auto py-12">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden text-center">
        
        <div className="bg-emerald-500 py-12 px-6 flex flex-col items-center">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-lg">
            <CheckCircle size={40} className="text-emerald-500" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight mb-2">การจองสำเร็จ!</h1>
          <p className="text-emerald-50">ชำระเงินเรียบร้อยแล้ว เราได้ส่งอีเมลยืนยันการจองไปให้คุณแล้ว</p>
        </div>

        <div className="p-8">
          <div className="bg-slate-50 rounded-xl p-6 border border-slate-100 mb-8 inline-block min-w-[300px]">
            <p className="text-sm text-slate-500 font-medium mb-1">หมายเลขการจอง (Booking ID)</p>
            <p className="text-3xl font-mono font-black text-slate-800">{params.bookingId}</p>
          </div>

          <div className="text-left space-y-4 text-sm text-slate-600 mb-8 border-t border-slate-100 pt-8">
            <h3 className="font-bold text-slate-800 text-base mb-2">ขั้นตอนต่อไป:</h3>
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold shrink-0">1</div>
              <p>ระบบกำลังประสานงานกับผู้จัดทัวร์ (Supplier) เพื่อออกเอกสาร Voucher การเดินทาง</p>
            </div>
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold shrink-0">2</div>
              <p>คุณสามารถดาวน์โหลดใบเสร็จรับเงิน (Receipt) ได้ทันทีจาก Customer Portal</p>
            </div>
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold shrink-0">3</div>
              <p>หากต้องการความช่วยเหลือ แจ้งหมายเลข Booking ID กับทีมงาน Support ได้ตลอด 24 ชม.</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/booking/portal" className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors">
              <User size={18} /> ไปที่หน้าจัดการการจอง
            </Link>
            <button className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold rounded-xl transition-colors">
              <Download size={18} /> โหลดใบเสร็จรับเงิน
            </button>
          </div>
        </div>
      </div>
      
      <div className="text-center mt-8">
        <a href="https://tour.jongtour.com" className="text-slate-500 hover:text-indigo-600 font-medium flex items-center justify-center gap-1">
          กลับไปค้นหาทัวร์เพิ่ม <ArrowRight size={16} />
        </a>
      </div>
    </div>
  );
}
// Note: User component from lucide-react is missing in imports. Fixing.
import { User } from 'lucide-react';
