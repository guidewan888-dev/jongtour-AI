import { MapPin, Calendar, Users, FileText, Download, ChevronRight, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function CustomerPortalPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">การจองของฉัน (My Bookings)</h1>
          <p className="text-slate-500 mt-2">จัดการการจอง ดาวน์โหลดเอกสาร และติดตามสถานะการเดินทาง</p>
        </div>
        <div className="hidden sm:block">
          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold">K</div>
            <div className="text-sm">
              <p className="font-bold text-slate-800 leading-none">Khun Customer</p>
              <p className="text-xs text-slate-500">customer@email.com</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        
        {/* Booking Card 1 - Confirmed */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 border-b border-slate-200 p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">Confirmed</span>
                <span className="font-mono text-sm text-slate-500">BOK-89293</span>
              </div>
              <h2 className="text-lg font-bold text-slate-800">ฮอกไกโด ซัปโปโร เล่นสกี 6D4N</h2>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-sm text-slate-500 mb-1">ชำระแล้ว (Paid)</p>
              <p className="text-xl font-black text-slate-900">฿89,800</p>
            </div>
          </div>
          
          <div className="p-4 sm:p-6 flex flex-col md:flex-row gap-6">
            <div className="flex-1 grid grid-cols-2 gap-4">
              <div className="flex gap-3 items-start">
                <Calendar className="text-slate-400 shrink-0" size={20} />
                <div>
                  <p className="text-xs text-slate-500 font-medium">เดินทาง</p>
                  <p className="text-sm font-semibold text-slate-800">12 ต.ค. - 17 ต.ค. 2026</p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <Users className="text-slate-400 shrink-0" size={20} />
                <div>
                  <p className="text-xs text-slate-500 font-medium">ผู้เดินทาง</p>
                  <p className="text-sm font-semibold text-slate-800">ผู้ใหญ่ 2 ท่าน</p>
                </div>
              </div>
              <div className="flex gap-3 items-start col-span-2">
                <MapPin className="text-slate-400 shrink-0" size={20} />
                <div>
                  <p className="text-xs text-slate-500 font-medium">จุดนัดพบ</p>
                  <p className="text-sm font-semibold text-slate-800">สนามบินสุวรรณภูมิ อาคารผู้โดยสารขาออก ชั้น 4 ประตู 3</p>
                </div>
              </div>
            </div>
            
            <div className="md:w-64 flex flex-col gap-2 shrink-0 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
              <button className="flex items-center justify-between px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-sm font-bold rounded-lg transition-colors">
                <span className="flex items-center gap-2"><FileText size={16} /> โหลด Voucher</span>
                <Download size={16} />
              </button>
              <button className="flex items-center justify-between px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-sm font-bold rounded-lg border border-slate-200 transition-colors">
                <span className="flex items-center gap-2"><FileText size={16} /> โหลดใบเสร็จรับเงิน</span>
                <Download size={16} />
              </button>
              <button className="text-center text-xs text-slate-400 hover:text-red-500 font-medium mt-2">
                ขอยกเลิกการจอง / ขอคืนเงิน
              </button>
            </div>
          </div>
        </div>

        {/* Booking Card 2 - Pending Supplier */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden opacity-80">
          <div className="bg-slate-50 border-b border-slate-200 p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-1 rounded uppercase tracking-wider flex items-center gap-1">
                  <AlertCircle size={12} /> รอคอนเฟิร์ม (On Request)
                </span>
                <span className="font-mono text-sm text-slate-500">BOK-89295</span>
              </div>
              <h2 className="text-lg font-bold text-slate-800">ทัวร์เกาหลี โซล นามิ 5D3N</h2>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-sm text-slate-500 mb-1">ชำระแล้ว (Paid)</p>
              <p className="text-xl font-black text-slate-900">฿35,000</p>
            </div>
          </div>
          
          <div className="p-4 sm:p-6">
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-sm text-amber-800 mb-4">
              <p className="font-bold">ระบบกำลังรอการยืนยันที่นั่งจากผู้จัดทัวร์ (Supplier)</p>
              <p>กรุณารอ 1-2 วันทำการ หากที่นั่งเต็มระบบจะทำการคืนเงินเต็มจำนวน (Full Refund) ให้คุณทันที</p>
            </div>
            <button className="flex items-center justify-between px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-sm font-bold rounded-lg border border-slate-200 transition-colors w-full sm:w-64">
              <span className="flex items-center gap-2"><FileText size={16} /> โหลดใบเสร็จรับเงิน</span>
              <Download size={16} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
