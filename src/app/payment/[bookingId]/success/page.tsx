import Link from "next/link";
import { CheckCircle2, FileText, ArrowRight, Calendar, MapPin } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

export default async function PaymentSuccessPage({ params }: { params: { bookingId: string } }) {
  const bookingId = params.bookingId;

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: booking, error } = await supabase
    .from('Booking')
    .select(`
      *,
      departure:TourDeparture(
        *,
        tour:Tour(*)
      )
    `)
    .eq('id', bookingId)
    .single();

  if (error || !booking) {
    console.error("Booking not found on success page:", error);
    // Even if it fails, we show a generic success just in case
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full">
        
        {/* Progress Stepper */}
        <div className="flex items-center justify-center mb-10">
          <div className="flex items-center gap-4 text-sm font-bold">
            <div className="flex items-center gap-2 text-green-500">
              <CheckCircle2 className="w-8 h-8" />
              <span className="hidden md:inline">ข้อมูลผู้เดินทาง</span>
            </div>
            <div className="w-8 md:w-12 h-px bg-green-500"></div>
            <div className="flex items-center gap-2 text-green-500">
              <CheckCircle2 className="w-8 h-8" />
              <span className="hidden md:inline">ชำระเงิน</span>
            </div>
            <div className="w-8 md:w-12 h-px bg-green-500"></div>
            <div className="flex items-center gap-2 text-green-500">
              <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <span>เสร็จสิ้น</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl shadow-green-900/5 border border-gray-100 text-center">
          <div className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-16 h-16" />
          </div>
          
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
            แจ้งชำระเงินสำเร็จ!
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-lg mx-auto">
            ระบบได้รับข้อมูลการชำระเงินของท่านเรียบร้อยแล้ว สำหรับรหัสการจอง <span className="font-mono font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded">{bookingId.slice(0, 8).toUpperCase()}</span>
          </p>

          {booking && booking.departure && booking.departure.tour && (
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 text-left mb-8 flex gap-4 items-center">
              {booking.departure.tour.imageUrl && (
                <img src={booking.departure.tour.imageUrl} alt="Tour" className="w-16 h-16 object-cover rounded-xl" />
              )}
              <div>
                <h4 className="font-bold text-gray-900">{booking.departure.tour.title}</h4>
                <div className="text-sm text-gray-500 mt-1 flex gap-4">
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {booking.departure.tour.destination}</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> 
                    {new Date(booking.departure.startDate).toLocaleDateString('th-TH', {day:'2-digit', month:'short'})} - {new Date(booking.departure.endDate).toLocaleDateString('th-TH', {day:'2-digit', month:'short'})}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 text-left mb-8">
            <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-500" />
              ขั้นตอนต่อไป
            </h3>
            <ul className="text-blue-800 space-y-2 text-sm md:text-base">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0"></div>
                เจ้าหน้าที่จะทำการตรวจสอบยอดเงินและยืนยันสถานะการจอง ภายใน 1-2 ชั่วโมง (เวลาทำการ)
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0"></div>
                เมื่อการตรวจสอบเสร็จสิ้น ท่านจะได้รับอีเมลยืนยันการจอง และเอกสารใบแจ้งหนี้/ใบเสร็จรับเงิน
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0"></div>
                กรุณาเตรียมภาพถ่ายพาสปอร์ตของท่าน เพื่อใช้ในการดำเนินการจองตั๋วเครื่องบิน
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={`/user/bookings/${bookingId}`} className="flex-1 bg-white border-2 border-gray-200 text-gray-700 py-3.5 rounded-xl font-bold text-lg hover:bg-gray-50 hover:border-gray-300 transition-colors">
              ดูรายละเอียดการจอง
            </Link>
            <Link href="/user/bookings" className="flex-1 flex items-center justify-center gap-2 bg-gray-900 text-white py-3.5 rounded-xl font-bold text-lg hover:bg-gray-800 transition-colors shadow-lg shadow-gray-900/20">
              การจองของฉัน
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
        
      </div>
    </main>
  );
}
