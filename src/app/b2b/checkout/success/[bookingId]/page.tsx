import { CheckCircle2, Copy, FileText, ChevronRight, Download } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function BookingSuccessPage({ params }: { params: { bookingId: string } }) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: booking } = await supabase
    .from('bookings')
    .select('*, departure:departures(*, tour:tours(*))')
    .eq('id', params.bookingId)
    .single();

  if (!booking) notFound();

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-green-500 p-8 text-center text-white">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">จองที่นั่งสำเร็จ!</h1>
          <p className="text-green-50">ระบบได้ทำการตัดโควตาที่นั่งให้คุณเรียบร้อยแล้ว</p>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="bg-gray-50 rounded-2xl border border-gray-100 p-6 mb-8 text-center">
            <p className="text-sm text-gray-500 font-bold mb-1">รหัสการจอง (Booking Reference)</p>
            <div className="flex items-center justify-center gap-3">
              <span className="text-3xl font-black text-gray-800 font-mono tracking-wider">{booking.bookingRef}</span>
              <button className="text-gray-400 hover:text-blue-600 transition-colors" title="Copy">
                <Copy size={20} />
              </button>
            </div>
          </div>

          <div className="space-y-4 mb-8 text-sm">
            <div className="flex justify-between py-3 border-b border-gray-100">
              <span className="text-gray-500 font-bold">โปรแกรมทัวร์</span>
              <span className="font-bold text-gray-800 text-right w-2/3">{booking.departure?.tour?.tourName || "ไม่ระบุ"}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-gray-100">
              <span className="text-gray-500 font-bold">จำนวนผู้เดินทาง</span>
              <span className="font-bold text-gray-800">{booking.paxAdult} ท่าน</span>
            </div>
            <div className="flex justify-between py-3 border-b border-gray-100">
              <span className="text-gray-500 font-bold">ยอดชำระสุทธิ (B2B Net)</span>
              <span className="font-black text-blue-600 text-lg">฿{booking.totalPrice?.toLocaleString() || 0}</span>
            </div>
            <div className="flex justify-between py-3">
              <span className="text-gray-500 font-bold">กำหนดชำระเงิน</span>
              <span className="font-bold text-red-500">ภายใน 24 ชั่วโมง</span>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8 flex gap-3 shadow-sm">
            <FileText className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-bold mb-1">สิ่งที่คุณต้องทำต่อไป:</p>
              <ul className="list-disc pl-4 space-y-1 font-medium text-amber-700">
                <li>กรุณาชำระเงินตามยอดสุทธิ และอัปโหลดสลิปที่หน้า "ประวัติการจอง"</li>
                <li>หากไม่ชำระเงินภายในเวลาที่กำหนด ระบบจะยกเลิกการจองและคืนที่นั่งโดยอัตโนมัติ</li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/b2b/bookings" className="flex-1 bg-slate-900 text-white text-center py-3.5 rounded-xl font-bold hover:bg-slate-800 transition-colors flex justify-center items-center gap-2 shadow-sm">
              <FileText size={18} /> ดูประวัติการจอง
            </Link>
            <button className="flex-1 bg-white text-gray-700 border border-gray-200 text-center py-3.5 rounded-xl font-bold hover:bg-gray-50 transition-colors flex justify-center items-center gap-2 shadow-sm">
              <Download size={18} /> โหลดใบแจ้งหนี้ (Invoice)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
