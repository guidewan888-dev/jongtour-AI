import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import prisma from "@/lib/prisma";

export default async function BookingsPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Find user in Prisma DB by email (since Supabase auth ID might differ from Prisma cuid, though usually they sync)
  const { data: dbUser } = await supabase
    .from('User')
    .select('*')
    .eq('email', user.email || '')
    .single();

  // If user is not yet in Prisma, they won't have bookings
  let bookingsData: any[] = [];
  if (dbUser) {
    const { data } = await supabase
      .from('Booking')
      .select(`
        *,
        departure:TourDeparture(
          *,
          tour:Tour(*)
        ),
        payments:Payment(*)
      `)
      .eq('userId', dbUser.id)
      .order('createdAt', { ascending: false });
    
    if (data) bookingsData = data;
  }
  
  let bookings = bookingsData;

  // --- MOCK DATA FOR DEMONSTRATION ---
  // If the user has no real bookings, show them a sample
  if (bookings.length === 0) {
    bookings = [
      {
        id: 'mock-booking-12345678',
        status: 'PENDING',
        totalPrice: 45900,
        createdAt: new Date(),
        departure: {
          startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
          endDate: new Date(Date.now() + 19 * 24 * 60 * 60 * 1000), // 19 days from now
          tour: {
            title: 'ทัวร์ญี่ปุ่น โตเกียว ฟูจิ โอซาก้า 6 วัน 4 คืน (เที่ยวเต็มวัน ไม่มีวันอิสระ)',
            destination: 'ประเทศญี่ปุ่น (Japan)',
            imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=800&auto=format&fit=crop',
          }
        }
      } as any,
      {
        id: 'mock-booking-87654321',
        status: 'DEPOSIT_PAID',
        totalPrice: 15900,
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        departure: {
          startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          endDate: new Date(Date.now() + 33 * 24 * 60 * 60 * 1000),
          tour: {
            title: 'ทัวร์เวียดนาม ดานัง ฮอยอัน บานาฮิลล์ 4 วัน 3 คืน',
            destination: 'ประเทศเวียดนาม (Vietnam)',
            imageUrl: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?q=80&w=800&auto=format&fit=crop',
          }
        }
      } as any,
      {
        id: 'mock-booking-11223344',
        status: 'FULL_PAID',
        totalPrice: 28900,
        createdAt: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000), // 5 months ago
        departure: {
          startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 2 months ago
          endDate: new Date(Date.now() - 55 * 24 * 60 * 60 * 1000),
          tour: {
            title: 'ทัวร์เกาหลี โซล นามิ สกีรีสอร์ท 5 วัน 3 คืน',
            destination: 'ประเทศเกาหลีใต้ (South Korea)',
            imageUrl: 'https://images.unsplash.com/photo-1517154421773-0529f29ea451?q=80&w=800&auto=format&fit=crop',
          }
        }
      } as any,
      {
        id: 'mock-booking-99887766',
        status: 'FULL_PAID',
        totalPrice: 89900,
        createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000), // 45 days ago
        departure: {
          startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          tour: {
            title: 'ทัวร์เยอรมัน สวิตเซอร์แลนด์ ฝรั่งเศส 9 วัน 6 คืน',
            destination: 'เยอรมัน (Germany) / ยุโรป',
            imageUrl: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?q=80&w=800&auto=format&fit=crop',
            requiresVisa: true
          }
        }
      } as any
    ];
  }


  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-semibold">รอการชำระเงิน</span>;
      case 'AWAITING_CONFIRMATION':
        return <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">รอการยืนยัน</span>;
      case 'DEPOSIT_PAID':
        return <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-semibold">จ่ายมัดจำแล้ว</span>;
      case 'FULL_PAID':
        return <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">ชำระเต็มจำนวนแล้ว</span>;
      case 'CANCELLED':
        return <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-semibold">ยกเลิกแล้ว</span>;
      default:
        return <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-semibold">{status}</span>;
    }
  };

  // --- MOCK STATE OVERRIDE ---
  // If the user has paid in the mock payment flow, update their status to AWAITING_CONFIRMATION
  bookings = bookings.map((b: any) => {
    if (b.id.includes('mock') && cookieStore.get(`paid_${b.id}`)?.value === 'true') {
      return { ...b, status: 'AWAITING_CONFIRMATION' };
    }
    return b;
  });

  const now = new Date();
  const upcomingBookings = bookings.filter((b: any) => new Date(b.departure.endDate) >= now);
  const pastBookings = bookings.filter((b: any) => new Date(b.departure.endDate) < now);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">รายการจอง</h1>
        {bookings.length > 0 && bookings[0].id.includes('mock') && (
          <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-3 py-1 rounded-full animate-pulse border border-yellow-300">
            *ตัวอย่างหน้าตาเวลาจองสำเร็จ
          </span>
        )}
      </div>

      {bookings.length === 0 && !bookings[0]?.id?.includes('mock') ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl border border-gray-100">
          <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">ยังไม่มีทริปในขณะนี้</h3>
          <p className="text-gray-500 text-sm mb-6">เริ่มค้นหาและจองทริปในฝันของคุณกับเราได้เลย</p>
          <Link href="/" className="inline-flex items-center justify-center bg-[#5392f9] text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-600 transition-colors">
            ค้นหาทัวร์
          </Link>
        </div>
      ) : (
        <div className="space-y-12">
          
          {/* Upcoming Bookings */}
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">ทริปที่กำลังจะมาถึง</h2>
            {upcomingBookings.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-xl border border-gray-100 text-gray-500 text-sm">
                ไม่มีรายการจองที่กำลังจะมาถึง
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingBookings.map((booking: any) => (
                  <Link href={`/user/bookings/${booking.id}`} key={booking.id} className="border border-gray-100 rounded-xl p-4 hover:shadow-lg transition-all bg-white flex flex-col md:flex-row gap-4 group cursor-pointer hover:border-blue-200">
                    <div className="w-full md:w-48 h-32 relative rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                      {booking.departure.tour.imageUrl ? (
                        <Image src={booking.departure.tour.imageUrl} alt={booking.departure.tour.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">ไม่มีรูปภาพ</div>
                      )}
                    </div>
                    
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-gray-900 text-lg line-clamp-1 group-hover:text-[#5392f9] transition-colors">{booking.departure.tour.title}</h3>
                          {getStatusBadge(booking.status)}
                        </div>
                        <p className="text-sm text-gray-500 flex items-center gap-1.5 mb-1">
                          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                          {booking.departure.tour.destination}
                        </p>
                        <p className="text-sm text-gray-500 flex items-center gap-1.5">
                          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          เดินทาง: {new Date(booking.departure.startDate).toLocaleDateString('th-TH')} - {new Date(booking.departure.endDate).toLocaleDateString('th-TH')}
                        </p>
                      </div>
                      
                      <div className="flex justify-between items-end mt-4 pt-4 border-t border-gray-100">
                        <div>
                          <p className="text-xs text-gray-500">รหัสการจอง: <span className="font-mono text-gray-700">{booking.id.slice(-8).toUpperCase()}</span></p>
                          <p className="text-xs text-gray-500 mt-0.5">วันที่จอง: {new Date(booking.createdAt).toLocaleDateString('th-TH')}</p>
                        </div>
                        <div className="text-right flex flex-col items-end gap-1.5">
                          <p className="font-bold text-[#5392f9] text-lg">฿ {booking.totalPrice.toLocaleString()}</p>
                          <span className="text-xs font-bold text-blue-500 bg-blue-50 px-3 py-1 rounded-full group-hover:bg-[#5392f9] group-hover:text-white transition-colors">ดูรายละเอียด &rarr;</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Past Bookings */}
          {pastBookings.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">ทริปที่ผ่านมาแล้ว</h2>
              <div className="space-y-4">
                {pastBookings.map((booking: any) => (
                  <Link href={`/user/reviews/write/${booking.id}`} key={booking.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all bg-gray-50 flex flex-col md:flex-row gap-4 group cursor-pointer opacity-80 hover:opacity-100">
                    <div className="w-full md:w-40 h-28 relative rounded-lg overflow-hidden flex-shrink-0 bg-gray-200 grayscale group-hover:grayscale-0 transition-all duration-300">
                      {booking.departure.tour.imageUrl ? (
                        <Image src={booking.departure.tour.imageUrl} alt={booking.departure.tour.title} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">ไม่มีรูปภาพ</div>
                      )}
                    </div>
                    
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-bold text-gray-700 text-base line-clamp-1 group-hover:text-[#5392f9] transition-colors">{booking.departure.tour.title}</h3>
                          <span className="bg-gray-200 text-gray-600 px-3 py-1 rounded-full text-xs font-semibold">เดินทางเรียบร้อย</span>
                        </div>
                        <p className="text-xs text-gray-500 flex items-center gap-1.5 mb-1">
                          {booking.departure.tour.destination}
                        </p>
                        <p className="text-xs text-gray-500 flex items-center gap-1.5">
                          เดินทางเมื่อ: {new Date(booking.departure.startDate).toLocaleDateString('th-TH')} - {new Date(booking.departure.endDate).toLocaleDateString('th-TH')}
                        </p>
                      </div>
                      
                      <div className="flex justify-between items-end mt-3 pt-3 border-t border-gray-200">
                        <div>
                          <p className="text-[10px] text-gray-400">รหัส: <span className="font-mono">{booking.id.slice(-8).toUpperCase()}</span></p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold text-gray-500 bg-white border border-gray-200 px-3 py-1 rounded-full group-hover:border-[#5392f9] group-hover:text-[#5392f9] transition-colors">เขียนรีวิวทริปนี้</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
