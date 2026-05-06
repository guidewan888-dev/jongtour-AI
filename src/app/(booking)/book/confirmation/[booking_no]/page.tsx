export const dynamic = 'force-dynamic';
import React from "react";
import Link from "next/link";
import { CheckCircle, Download, MessageCircle, Calendar, MapPin, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function ConfirmationPage({ params }: { params: { booking_no: string } }) {
  // Fetch real booking data from DB
  let booking;
  try {
    booking = await prisma.booking.findUnique({
      where: { bookingRef: params.booking_no },
      include: {
        tour: true,
        departure: true,
        travelers: true,
        payments: true,
      },
    });
  } catch {
    // DB connection issue — show basic confirmation
    booking = null;
  }

  // If booking not found, show a basic confirmation with the ref
  const tourName = booking?.tour?.tourName || "โปรแกรมทัวร์";
  const tourCode = booking?.tour?.tourCode || "";
  const departureDate = booking?.departure
    ? new Date(booking.departure.startDate).toLocaleDateString("th-TH", { day: "numeric", month: "long", year: "numeric" })
    : "รอยืนยัน";
  const travelerCount = booking?.travelers?.length || 1;
  const totalPrice = booking?.totalPrice || 0;
  const contactEmail = booking?.travelers?.[0]
    ? `${booking.travelers[0].firstName}...`
    : "";

  return (
    <div className="bg-white">
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        {/* Success Icon */}
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-scale-in">
          <CheckCircle className="w-10 h-10 text-emerald-600" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">จองสำเร็จ! 🎉</h1>
        <p className="text-slate-500 mb-1">Booking #{params.booking_no}</p>
        {tourCode && <p className="text-sm text-slate-400">รหัสทัวร์: {tourCode}</p>}

        {/* Booking Summary */}
        <div className="g-card p-6 mt-8 text-left">
          <h3 className="font-bold text-slate-900 mb-4">สรุปการจอง</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-primary shrink-0" />
              <div><span className="text-slate-500">โปรแกรม: </span><span className="font-medium">{tourName}</span></div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-primary shrink-0" />
              <div><span className="text-slate-500">วันเดินทาง: </span><span className="font-medium">{departureDate}</span></div>
            </div>
            <div className="flex items-center gap-3">
              <Users className="w-4 h-4 text-primary shrink-0" />
              <div><span className="text-slate-500">ผู้เดินทาง: </span><span className="font-medium">{travelerCount} ท่าน</span></div>
            </div>
          </div>
          {totalPrice > 0 && (
            <>
              <hr className="my-4 border-slate-100" />
              <div className="flex justify-between font-bold text-lg">
                <span>ยอดชำระ</span>
                <span className="text-primary">฿{totalPrice.toLocaleString()}</span>
              </div>
            </>
          )}
        </div>

        {/* Next Steps */}
        <div className="g-card p-6 mt-6 text-left bg-blue-50 border-blue-100">
          <h3 className="font-bold text-blue-900 mb-3">ขั้นตอนถัดไป</h3>
          <ol className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start gap-2"><span className="w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</span>ทีมงานจะตรวจสอบการชำระเงินภายใน 1-2 ชั่วโมง</li>
            <li className="flex items-start gap-2"><span className="w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</span>อัพโหลดสำเนาพาสปอร์ตก่อนเดินทาง 14 วัน</li>
            <li className="flex items-start gap-2"><span className="w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</span>รับ Voucher ก่อนเดินทาง 3 วัน</li>
          </ol>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
          <Link href={`/account/bookings/${params.booking_no}`} className="btn-primary">ดูรายละเอียดการจอง</Link>
          <Link href="/contact" className="btn-outline flex items-center justify-center gap-2"><MessageCircle className="w-4 h-4" /> ติดต่อเจ้าหน้าที่</Link>
        </div>
      </div>
    </div>
  );
}
