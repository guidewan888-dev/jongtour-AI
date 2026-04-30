import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import TravelerUploadItem from "@/components/user/TravelerUploadItem";
import prisma from "@/lib/prisma";

export default async function BookingDetailsPage({ params }: { params: { id: string } }) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const bookingId = params.id;
  const isMock = bookingId.includes('mock');

  // If mock, hardcode the data
  let booking: any = null;

  if (isMock) {
    booking = {
      id: bookingId,
      status: bookingId.includes('12345678') ? 'PENDING' : bookingId.includes('87654321') ? 'DEPOSIT_PAID' : 'FULL_PAID',
      totalPrice: bookingId.includes('12345678') ? 45900 : 15900,
      createdAt: new Date(),
      departure: {
        startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 19 * 24 * 60 * 60 * 1000),
        tour: {
          title: bookingId.includes('12345678') ? 'ทัวร์ญี่ปุ่น โตเกียว ฟูจิ โอซาก้า 6 วัน 4 คืน' : bookingId.includes('99887766') ? 'ทัวร์เยอรมัน สวิตเซอร์แลนด์ ฝรั่งเศส 9 วัน 6 คืน' : 'ทัวร์เวียดนาม ดานัง ฮอยอัน บานาฮิลล์',
          destination: bookingId.includes('12345678') ? 'ประเทศญี่ปุ่น' : bookingId.includes('99887766') ? 'เยอรมัน (Germany)' : 'ประเทศเวียดนาม',
          imageUrl: bookingId.includes('12345678') ? 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=800&auto=format&fit=crop' : bookingId.includes('99887766') ? 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?q=80&w=800&auto=format&fit=crop' : 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?q=80&w=800&auto=format&fit=crop',
          durationDays: bookingId.includes('12345678') ? 6 : bookingId.includes('99887766') ? 9 : 4,
          requiresVisa: bookingId.includes('99887766') // เยอรมันใช้วีซ่า
        }
      },
      travelers: [
        { name: 'คุณสมชาย ใจดี', passportNo: 'AA1234567', passportUploaded: true },
        { name: 'คุณสมหญิง รักดี', passportNo: 'AB7654321', passportUploaded: false },
        { name: 'ด.ช.สมบูรณ์ ใจดี', passportNo: 'AC1122334', passportUploaded: false },
        { name: 'คุณปู่สมศักดิ์ ใจดี', passportNo: 'AD9988776', passportUploaded: true },
        { name: 'คุณย่าสมศรี ใจดี', passportNo: 'AE5544332', passportUploaded: true },
        { name: 'คุณน้าสมหวัง รักดี', passportNo: 'AF6677889', passportUploaded: false }
      ]
    };
  } else {
    // Fetch real data
    const dbUser = await prisma.user.findUnique({ where: { email: user.email } });
    if (!dbUser) redirect('/user/bookings');

    booking = await prisma.booking.findUnique({
      where: { id: bookingId, userId: dbUser.id },
      include: {
        departure: { include: { tour: true } },
        travelers: true,
        payments: true
      }
    });

    if (!booking) redirect('/user/bookings');
  }

  // --- MOCK STATE OVERRIDE ---
  if (isMock && cookieStore.get(`paid_${bookingId}`)?.value === 'true') {
    booking.status = 'AWAITING_CONFIRMATION';
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <span className="bg-orange-100 text-orange-700 px-4 py-1.5 rounded-full text-sm font-bold">รอการชำระเงิน</span>;
      case 'AWAITING_CONFIRMATION':
        return <span className="bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-sm font-bold">รอการยืนยัน</span>;
      case 'DEPOSIT_PAID':
        return <span className="bg-purple-100 text-purple-700 px-4 py-1.5 rounded-full text-sm font-bold">จ่ายมัดจำแล้ว</span>;
      case 'FULL_PAID':
        return <span className="bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-sm font-bold">ชำระเต็มจำนวนแล้ว</span>;
      case 'CANCELLED':
        return <span className="bg-red-100 text-red-700 px-4 py-1.5 rounded-full text-sm font-bold">ยกเลิกแล้ว</span>;
      default:
        return <span className="bg-gray-100 text-gray-700 px-4 py-1.5 rounded-full text-sm font-bold">{status}</span>;
    }
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/user/bookings" className="text-gray-400 hover:text-gray-600 transition-colors">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">รายละเอียดการจอง</h1>
        {isMock && <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-3 py-1 rounded-full border border-yellow-300 ml-auto">ข้อมูลตัวอย่าง</span>}
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm mb-6">
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-50/50">
          <div>
            <p className="text-sm text-gray-500 mb-1">รหัสการจอง: <span className="font-mono text-gray-900 font-bold">{booking.id.slice(-8).toUpperCase()}</span></p>
            <p className="text-sm text-gray-500">วันที่ทำรายการ: {new Date(booking.createdAt).toLocaleDateString('th-TH')}</p>
          </div>
          <div>{getStatusBadge(booking.status)}</div>
        </div>

        {booking.status === 'FULL_PAID' && new Date(booking.departure.startDate) > new Date() && (() => {
          const daysLeft = Math.ceil((new Date(booking.departure.startDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
          const isAppointmentReady = daysLeft <= 14; // ใบนัดหมายออกเมื่อเหลือน้อยกว่า 14 วัน
          
          return (
            <div className="px-6 pt-6 -mb-2">
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-green-800 mb-1">
                    ✈️ เตรียมตัวให้พร้อม! คุณมีกำหนดการเดินทางในอีก {daysLeft} วัน
                  </h4>
                  <p className="text-sm text-green-700">
                    ออกเดินทางวันที่ {new Date(booking.departure.startDate).toLocaleDateString('th-TH')}
                  </p>
                </div>
              </div>
              
              {isAppointmentReady && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center gap-4 mt-3 animate-pulse">
                  <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-yellow-800 mb-1">
                      แจ้งเตือน: ใบนัดหมายการเดินทางของคุณออกแล้ว!
                    </h4>
                    <p className="text-sm text-yellow-700">
                      กรุณาดาวน์โหลดและตรวจสอบเวลา สถานที่จุดนัดพบ ด้านล่างนี้
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-6 mb-8">
            <div className="w-full md:w-64 h-40 relative rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
              {booking.departure.tour.imageUrl ? (
                <Image src={booking.departure.tour.imageUrl} alt={booking.departure.tour.title} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">ไม่มีรูปภาพ</div>
              )}
            </div>
            
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900 mb-2">{booking.departure.tour.title}</h2>
              <p className="text-gray-600 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {booking.departure.tour.destination} ({booking.departure.tour.durationDays} วัน {booking.departure.tour.durationDays - 1} คืน)
              </p>
              
              <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4">
                <p className="text-sm font-medium text-gray-800 mb-2 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  กำหนดการเดินทาง
                </p>
                <p className="text-gray-600">
                  {new Date(booking.departure.startDate).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })} - 
                  {new Date(booking.departure.endDate).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-8 mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              ข้อมูลผู้เดินทาง ({booking.travelers?.length || 0} ท่าน)
            </h3>
            
            <div className="max-h-[260px] overflow-y-auto pr-2 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {booking.travelers?.map((traveler: any, index: number) => (
                  <TravelerUploadItem key={index} traveler={traveler} index={index} />
                ))}
              </div>
            </div>
          </div>

          {booking.departure.tour.requiresVisa && (
            <div className="border-t border-gray-100 pt-8 mb-8">
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center shrink-0">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">เอกสารประกอบการยื่นวีซ่า (Visa)</h3>
                    <p className="text-sm text-gray-600 mb-2">ทัวร์นี้เดินทางไปยังประเทศที่จำเป็นต้องใช้วีซ่า กรุณาจัดเตรียมและอัปโหลดเอกสารให้ครบถ้วนก่อนวันนัดหมายยื่น</p>
                    <div className="flex flex-wrap gap-2">
                      <span className="bg-white border border-red-200 text-red-600 px-2 py-1 rounded text-xs font-bold shadow-sm">เอกสารยังไม่ครบ 3 ท่าน</span>
                      <span className="bg-white border border-green-200 text-green-600 px-2 py-1 rounded text-xs font-bold shadow-sm">เอกสารครบแล้ว 3 ท่าน</span>
                    </div>
                  </div>
                </div>
                
                <Link href={`/user/bookings/${booking.id}/visa`} className="w-full md:w-auto shrink-0 bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/30 text-center flex items-center justify-center gap-2">
                  จัดการเอกสารวีซ่า
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </Link>
              </div>
            </div>
          )}

          {booking.status === 'FULL_PAID' && (
            <div className="border-t border-gray-100 pt-8 mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                เอกสารการเดินทาง (ดาวน์โหลด)
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link href={`/user/document-preview?doc=program&bookingId=${booking.id}`} className="bg-white border-2 border-blue-100 hover:border-blue-300 rounded-xl p-4 flex items-center gap-4 transition-all group hover:shadow-md text-left w-full">
                  <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-[#5392f9] group-hover:text-white transition-colors">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 mb-1 group-hover:text-[#5392f9] transition-colors">โปรแกรมทัวร์ฉบับเต็ม</h4>
                    <p className="text-xs text-gray-500">ไฟล์ PDF (ขนาด 2.4 MB)</p>
                  </div>
                </Link>
                
                <Link href={`/user/document-preview?doc=appointment&bookingId=${booking.id}`} className="bg-white border-2 border-yellow-100 hover:border-yellow-300 rounded-xl p-4 flex items-center gap-4 transition-all group hover:shadow-md text-left w-full">
                  <div className="w-12 h-12 bg-yellow-50 text-yellow-600 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-yellow-500 group-hover:text-white transition-colors">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 mb-1 group-hover:text-yellow-600 transition-colors">ใบนัดหมายเตรียมตัวเดินทาง</h4>
                    <p className="text-xs text-gray-500">สถานที่นัดพบ และการเตรียมตัว</p>
                  </div>
                </Link>
              </div>
            </div>
          )}

          <div className="border-t border-gray-100 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-gray-50 rounded-xl p-6">
              
              {booking.status === 'PENDING' && (() => {
                const depositAmount = (booking.travelers?.length || 1) * 5000; // สมมติมัดจำท่านละ 5,000 บาท
                
                return (
                  <div className="w-full flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                      <p className="text-gray-500 font-medium mb-1">ยอดชำระสุทธิ (Total Price)</p>
                      <p className="text-3xl font-bold text-gray-900 mb-2">฿ {booking.totalPrice.toLocaleString()}</p>
                      <p className="text-sm text-red-500 font-medium flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        กรุณาชำระเงินเพื่อยืนยันที่นั่งก่อนทัวร์เต็ม!
                      </p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                      <div className="bg-white border-2 border-blue-100 rounded-xl p-4 flex flex-col justify-center shadow-sm">
                        <p className="text-xs text-gray-500 mb-1 text-center font-bold">แบ่งจ่ายบางส่วน</p>
                        <Link 
                          href={`/payment/${booking.id}?type=deposit`} 
                          className="w-full bg-white border-2 border-[#5392f9] text-[#5392f9] px-6 py-2.5 rounded-lg font-bold text-base hover:bg-blue-50 transition-colors text-center whitespace-nowrap"
                        >
                          ชำระมัดจำ (฿ {depositAmount.toLocaleString()})
                        </Link>
                      </div>
                      
                      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 flex flex-col justify-center shadow-sm relative">
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                          แนะนำ
                        </div>
                        <p className="text-xs text-blue-600 mb-1 text-center font-bold">จ่ายทีเดียวจบ</p>
                        <Link 
                          href={`/payment/${booking.id}?type=full`} 
                          className="w-full bg-[#5392f9] text-white px-6 py-2.5 rounded-lg font-bold text-base hover:bg-blue-600 transition-colors text-center shadow-md shadow-blue-500/20 whitespace-nowrap"
                        >
                          ชำระเต็มจำนวน (฿ {booking.totalPrice.toLocaleString()})
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {booking.status === 'DEPOSIT_PAID' && (
                <>
                  <div className="flex-1 w-full flex justify-between md:justify-start md:gap-12 border-b md:border-b-0 md:border-r border-gray-200 pb-4 md:pb-0 md:pr-12">
                    <div>
                      <p className="text-gray-500 font-medium text-sm mb-1">ยอดรวมทั้งหมด</p>
                      <p className="text-lg font-bold text-gray-700">฿ {booking.totalPrice.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 font-medium text-sm mb-1">ชำระมัดจำแล้ว</p>
                      <p className="text-lg font-bold text-green-600">฿ 10,000</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3 w-full md:w-auto md:pl-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-2 md:gap-6">
                      <div>
                        <p className="text-purple-600 font-bold mb-1">ยอดคงเหลือที่ต้องชำระ</p>
                        <p className="text-3xl font-bold text-[#5392f9]">฿ {(booking.totalPrice - 10000).toLocaleString()}</p>
                        {/* Calculate due date automatically (e.g. 20 days before departure) */}
                        <p className="text-xs text-gray-500 mt-1 font-medium flex items-center gap-1">
                          <svg className="w-3.5 h-3.5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          ครบกำหนดชำระ: <span className="text-red-500">
                            {new Date(new Date(booking.departure.startDate).getTime() - 20 * 24 * 60 * 60 * 1000).toLocaleDateString('th-TH')}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 mt-2">
                      <Link href={`/payment/${booking.id}`} className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-xl font-bold text-base hover:bg-purple-700 transition-colors text-center shadow-lg shadow-purple-500/30 whitespace-nowrap">
                        ชำระเงินส่วนที่เหลือ
                      </Link>
                      <Link href={`/user/document-preview?doc=invoice&bookingId=${booking.id}`} className="flex-1 bg-white border-2 border-purple-200 text-purple-700 px-4 py-3 rounded-xl font-bold text-base hover:bg-purple-50 transition-colors flex items-center justify-center gap-2 whitespace-nowrap">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        โหลด Invoice
                      </Link>
                    </div>
                  </div>
                </>
              )}

              {(booking.status === 'AWAITING_CONFIRMATION') && (
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 w-full">
                  <div>
                    <p className="text-gray-500 font-medium mb-1">ยอดชำระสุทธิ (Total Price)</p>
                    <p className="text-3xl font-bold text-gray-800">฿ {booking.totalPrice.toLocaleString()}</p>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 text-blue-700 px-6 py-3 rounded-xl flex items-center gap-3">
                    <svg className="w-6 h-6 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <div>
                      <p className="font-bold">อยู่ระหว่างการตรวจสอบยอดเงิน</p>
                      <p className="text-sm opacity-80">เจ้าหน้าที่จะอัปเดตสถานะภายใน 1-2 ชั่วโมง</p>
                    </div>
                  </div>
                </div>
              )}

              {(booking.status === 'FULL_PAID' || booking.status === 'CANCELLED') && (
                <>
                  <div>
                    <p className="text-gray-500 font-medium mb-1">ยอดชำระสุทธิ (Total Price)</p>
                    <p className="text-3xl font-bold text-green-600">฿ {booking.totalPrice.toLocaleString()}</p>
                  </div>
                  <Link href={`/user/document-preview?doc=receipt&bookingId=${booking.id}`} className="w-full md:w-auto bg-white border-2 border-gray-200 text-gray-600 px-8 py-3 rounded-xl font-bold text-lg hover:bg-gray-50 transition-colors text-center">
                    พิมพ์ใบเสร็จรับเงิน
                  </Link>
                </>
              )}

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
