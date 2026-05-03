import { CheckCircle2, Copy, FileText, ChevronRight, Download } from 'lucide-react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function BookingSuccessPage({ params }: { params: { bookingId: string } }) {
  const booking = await prisma.booking.findUnique({
    where: { id: params.bookingId },
    include: {
      departure: { include: { tour: true } }
    }
  });

  if (!booking) notFound();

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-emerald-500 p-8 text-center text-white">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">จองที่นั่งสำเร็จ!</h1>
          <p className="text-emerald-50">ระบบได้ทำการตัดโควต้าที่นั่งให้คุณเรียบร้อยแล้ว</p>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="bg-slate-50 rounded-2xl border border-slate-100 p-6 mb-8 text-center">
            <p className="text-sm text-slate-500 font-medium mb-1">รหัสการจอง (Booking Reference)</p>
            <div className="flex items-center justify-center gap-3">
              <span className="text-3xl font-black text-slate-800 font-mono tracking-wider">{booking.bookingRef}</span>
              <button className="text-slate-400 hover:text-indigo-600 transition-colors" title="Copy">
                <Copy size={20} />
              </button>
            </div>
          </div>

          <div className="space-y-4 mb-8 text-sm">
            <div className="flex justify-between py-3 border-b border-slate-100">
              <span className="text-slate-500">โปรแกรมทัวร์</span>
              <span className="font-bold text-slate-800 text-right w-2/3">{booking.departure?.tour?.tourName}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-slate-100">
              <span className="text-slate-500">จำนวนผู้เดินทาง</span>
              <span className="font-bold text-slate-800">{booking.paxAdult} ท่าน</span>
            </div>
            <div className="flex justify-between py-3 border-b border-slate-100">
              <span className="text-slate-500">ยอดชำระสุทธิ (B2B Net)</span>
              <span className="font-bold text-indigo-600 text-lg">฿{booking.totalPrice.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-3">
              <span className="text-slate-500">กำหนดชำระเงิน</span>
              <span className="font-bold text-red-500">ภายใน 24 ชั่วโมง</span>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8 flex gap-3">
            <FileText className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-bold mb-1">สิ่งที่คุณต้องทำต่อไป:</p>
              <ul className="list-disc pl-4 space-y-1 text-amber-700">
                <li>กรุณาชำระเงินตามยอดสุทธิ และอัปโหลดสลิปที่หน้า "ประวัติการจอง"</li>
                <li>หากไม่ชำระเงินภายในเวลาที่กำหนด ระบบจะยกเลิกการจองและคืนที่นั่งโดยอัตโนมัติ</li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/b2b/bookings" className="flex-1 bg-slate-900 text-white text-center py-3.5 rounded-xl font-bold hover:bg-slate-800 transition-colors flex justify-center items-center gap-2">
              <FileText size={18} /> ดูประวัติการจอง
            </Link>
            <Link href={`/b2b/checkout/${booking.departureId}/invoice`} className="flex-1 bg-white text-slate-700 border border-slate-200 text-center py-3.5 rounded-xl font-bold hover:bg-slate-50 transition-colors flex justify-center items-center gap-2">
              <Download size={18} /> โหลดใบแจ้งหนี้ (Invoice)
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
