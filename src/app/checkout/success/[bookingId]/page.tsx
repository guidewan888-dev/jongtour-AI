import { CheckCircle2, Download, FileText } from 'lucide-react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function B2CBookingSuccessPage({ params }: { params: { bookingId: string } }) {
  const booking = await prisma.booking.findUnique({
    where: { id: params.bookingId },
    include: {
      departure: { include: { tour: true } }
    }
  });

  if (!booking) notFound();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden max-w-2xl w-full">
        {/* Header */}
        <div className="bg-[#5392f9] p-8 text-center text-white">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">การจองและชำระเงินสำเร็จ!</h1>
          <p className="text-blue-50">ขอบคุณที่เลือกเดินทางกับ Jongtour</p>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="bg-gray-50 rounded-2xl border border-gray-100 p-6 mb-8 text-center">
            <p className="text-sm text-gray-500 font-medium mb-1">รหัสการจอง (Booking Reference)</p>
            <span className="text-3xl font-black text-gray-800 font-mono tracking-wider">{booking.bookingRef}</span>
          </div>

          <div className="space-y-4 mb-8 text-sm">
            <div className="flex justify-between py-3 border-b border-gray-100">
              <span className="text-gray-500">โปรแกรมทัวร์</span>
              <span className="font-bold text-gray-800 text-right w-2/3">{booking.departure?.tour?.tourName}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-gray-100">
              <span className="text-gray-500">จำนวนผู้เดินทาง</span>
              <span className="font-bold text-gray-800">{booking.paxAdult + (booking.paxChild || 0)} ท่าน</span>
            </div>
            <div className="flex justify-between py-3 border-b border-gray-100">
              <span className="text-gray-500">สถานะการชำระเงิน</span>
              <span className="font-bold text-green-600">ชำระแล้ว (PAID)</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/" className="flex-1 bg-gray-900 text-white text-center py-3.5 rounded-xl font-bold hover:bg-gray-800 transition-colors flex justify-center items-center gap-2">
               กลับสู่หน้าหลัก
            </Link>
            <Link href={`/checkout/success/${booking.id}/receipt`} className="flex-1 bg-white text-[#5392f9] border border-[#5392f9] text-center py-3.5 rounded-xl font-bold hover:bg-blue-50 transition-colors flex justify-center items-center gap-2">
              <Download size={18} /> ดาวน์โหลดใบเสร็จ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
