export const dynamic = 'force-dynamic';
import React from 'react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

export default async function CustomerDashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch real customer data
  const customer = await prisma.customer.findFirst({
    where: { email: user.email },
    include: {
      bookings: {
        include: {
          tour: { include: { images: true } },
          departure: true,
          payments: true,
          vouchers: true
        },
        orderBy: { createdAt: 'desc' }
      }
    }
  })

  if (!customer) {
    redirect('/login')
  }

  // Calculate Metrics
  const allBookings = customer.bookings
  const now = new Date()
  
  // Upcoming trips: Confirmed, start date in future
  const upcomingTrips = allBookings.filter(b => 
    (b.status === 'confirmed' || b.status === 'voucher_issued' || b.status === 'paid') && 
    new Date(b.departure.startDate) > now
  ).sort((a, b) => new Date(a.departure.startDate).getTime() - new Date(b.departure.startDate).getTime())

  const nextTrip = upcomingTrips.length > 0 ? upcomingTrips[0] : null

  // Summary Counts
  const pendingPaymentCount = allBookings.filter(b => b.status === 'payment_pending').length
  const pendingConfirmCount = allBookings.filter(b => b.status === 'pending' || b.status === 'waiting_admin_review' || b.status === 'waiting_wholesale_confirm').length
  const confirmedCount = allBookings.filter(b => b.status === 'confirmed' || b.status === 'voucher_issued' || b.status === 'paid').length
  const completedCount = allBookings.filter(b => b.status === 'completed').length

  // Alerts
  const pendingPayments = allBookings.flatMap(b => b.payments.filter(p => p.status === 'PENDING').map(p => ({ ...p, bookingRef: b.bookingRef })))
  const activeVouchers = allBookings.flatMap(b => b.vouchers.filter(v => v.status === 'ACTIVE').map(v => ({ ...v, bookingRef: b.bookingRef, tourName: b.tour.tourName })))

  // Recent Activity (Top 5)
  const recentActivities = allBookings.slice(0, 5)

  return (
    <div className="space-y-8 animate-fade-in-up">
      
      {/* 1. Welcome Card */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">สวัสดีคุณ {customer.firstName}!</h1>
          <p className="text-slate-500 font-medium">นี่คือภาพรวมการจองและทริปการเดินทางของคุณ</p>
        </div>
        <Link href="/tours" className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-colors flex items-center justify-center gap-2 w-full md:w-auto">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          ค้นหาทัวร์ใหม่
        </Link>
      </div>

      {/* 4 & 5. Alerts (Payment & Voucher) */}
      {pendingPayments.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-red-100 text-red-600 rounded-full flex items-center justify-center shrink-0 mt-1">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div>
              <h3 className="font-black text-red-800 text-lg">รายการรอชำระเงิน</h3>
              <p className="text-red-600 text-sm font-medium mt-1">คุณมี {pendingPayments.length} รายการที่ต้องชำระเงิน (อ้างอิง: {pendingPayments[0].bookingRef})</p>
            </div>
          </div>
          <Link href={`/account/payments`} className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-sm whitespace-nowrap w-full sm:w-auto text-center transition-colors">
            ชำระเงินทันที
          </Link>
        </div>
      )}

      {activeVouchers.length > 0 && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shrink-0 mt-1">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>
            </div>
            <div>
              <h3 className="font-black text-emerald-800 text-lg">Voucher พร้อมใช้งาน</h3>
              <p className="text-emerald-700 text-sm font-medium mt-1">Voucher สำหรับ {activeVouchers[0].tourName} ของคุณพร้อมดาวน์โหลดแล้ว</p>
            </div>
          </div>
          <Link href={`/account/vouchers`} className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-sm whitespace-nowrap w-full sm:w-auto text-center transition-colors">
            ดาวน์โหลด Voucher
          </Link>
        </div>
      )}

      {/* 3. Booking Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="text-sm font-bold text-slate-500 mb-2">จองทั้งหมด</div>
          <div className="text-3xl font-black text-slate-800">{allBookings.length}</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-orange-100 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="absolute right-0 bottom-0 w-16 h-16 bg-orange-500 blur-3xl opacity-10"></div>
          <div className="text-sm font-bold text-orange-600 mb-2">รอชำระเงิน</div>
          <div className="text-3xl font-black text-slate-800">{pendingPaymentCount}</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-amber-100 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="absolute right-0 bottom-0 w-16 h-16 bg-amber-500 blur-3xl opacity-10"></div>
          <div className="text-sm font-bold text-amber-600 mb-2">รอยืนยัน (Pending)</div>
          <div className="text-3xl font-black text-slate-800">{pendingConfirmCount}</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="absolute right-0 bottom-0 w-16 h-16 bg-emerald-500 blur-3xl opacity-10"></div>
          <div className="text-sm font-bold text-emerald-600 mb-2">ยืนยันแล้ว (Confirmed)</div>
          <div className="text-3xl font-black text-slate-800">{confirmedCount}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (Main Content) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* 2. Upcoming Trips */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h2 className="font-black text-lg text-slate-800">ทริปที่กำลังจะมาถึง (Upcoming)</h2>
              {nextTrip && <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-lg text-[10px] font-black tracking-wider uppercase">Confirmed</span>}
            </div>
            
            {nextTrip ? (
              <div className="flex flex-col md:flex-row">
                <div className="w-full md:w-2/5 h-56 md:h-auto relative">
                  <img 
                    src={nextTrip.tour.images?.[0]?.imageUrl || "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800"} 
                    alt={nextTrip.tour.tourName} 
                    className="absolute inset-0 w-full h-full object-cover" 
                  />
                </div>
                <div className="p-6 flex-1 flex flex-col justify-center">
                  <div className="flex items-center gap-2 text-xs font-bold text-orange-600 mb-2 bg-orange-50 w-fit px-3 py-1 rounded-full">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    {new Date(nextTrip.departure.startDate).toLocaleDateString('th-TH')} - {new Date(nextTrip.departure.endDate).toLocaleDateString('th-TH')}
                  </div>
                  <h3 className="text-xl font-black text-slate-800 mb-2 leading-tight line-clamp-2">{nextTrip.tour.tourName}</h3>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <p className="text-[10px] uppercase font-black text-slate-400">Booking Ref</p>
                      <p className="text-sm font-bold text-slate-800">{nextTrip.bookingRef}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-black text-slate-400">Payment</p>
                      <p className="text-sm font-bold text-slate-800">{nextTrip.payments.every(p => p.status === 'COMPLETED') ? 'Paid' : 'Pending'}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link href={`/account/bookings/${nextTrip.bookingRef}`} className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-colors text-center w-full shadow-sm">
                      ดูรายละเอียดการจอง
                    </Link>
                    {activeVouchers.some(v => v.bookingRef === nextTrip.bookingRef) && (
                      <Link href={`/account/vouchers/${nextTrip.bookingRef}`} className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-5 py-2.5 rounded-xl text-sm font-bold transition-colors text-center w-full">
                        ดู Voucher
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center flex flex-col items-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <h3 className="font-black text-slate-800 text-lg mb-1">ยังไม่มีทริปที่กำลังจะมาถึง</h3>
                <p className="text-slate-500 text-sm mb-6">ออกไปค้นหาประสบการณ์ใหม่กับทัวร์สุดพิเศษจาก Jongtour</p>
                <Link href="/tours" className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-colors">
                  ดูทัวร์ทั้งหมด
                </Link>
              </div>
            )}
          </div>

          {/* 8. Recent Activity */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h2 className="font-black text-lg text-slate-800">การเคลื่อนไหวล่าสุด (Recent Activity)</h2>
            </div>
            {recentActivities.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {recentActivities.map(b => (
                  <div key={b.id} className="p-4 sm:p-6 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      b.status === 'confirmed' || b.status === 'paid' ? 'bg-emerald-100 text-emerald-600' : 
                      b.status === 'payment_pending' ? 'bg-red-100 text-red-600' : 
                      'bg-amber-100 text-amber-600'
                    }`}>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        {b.status === 'payment_pending' 
                          ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        }
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-800 truncate">{b.tour.tourName}</p>
                      <p className="text-xs text-slate-500">Ref: {b.bookingRef} • {new Date(b.createdAt).toLocaleDateString('th-TH')}</p>
                    </div>
                    <Link href={`/account/bookings/${b.bookingRef}`} className="text-orange-500 font-bold text-xs hover:underline whitespace-nowrap">
                      ดูรายละเอียด
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
               <div className="p-8 text-center text-slate-500 text-sm font-medium">ยังไม่มีประวัติการทำรายการ</div>
            )}
          </div>
          
        </div>

        {/* Right Column (Sidebar Cards) */}
        <div className="space-y-6">
          
          {/* 6. AI Assistant Card */}
          <div className="bg-gradient-to-br from-indigo-900 to-indigo-800 rounded-3xl p-6 shadow-md text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full blur-3xl opacity-30 -mr-10 -mt-10"></div>
            <div className="relative z-10">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20 mb-4">
                <svg className="w-6 h-6 text-indigo-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
              </div>
              <h3 className="font-black text-xl mb-2">มีคำถามเกี่ยวกับทริปไหม?</h3>
              <p className="text-indigo-200 text-sm mb-6 leading-relaxed">Jongtour Elite AI Planner พร้อมช่วยคุณออกแบบทริปและตอบคำถาม 24 ชม.</p>
              
              <div className="space-y-3">
                <Link href="/account/ai-chats" className="w-full bg-white text-indigo-900 px-4 py-2.5 rounded-xl text-sm font-black flex items-center justify-center gap-2 hover:bg-indigo-50 transition-colors shadow-sm">
                  คุยกับ AI Planner
                </Link>
                <Link href="/account/support" className="w-full bg-indigo-700 border border-indigo-500 text-white px-4 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-indigo-600 transition-colors">
                  ติดต่อเจ้าหน้าที่
                </Link>
              </div>
            </div>
          </div>

          {/* 7. Favorite Tours Widget */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-black text-slate-800">ทัวร์ที่บันทึกไว้</h3>
              <Link href="/account/favorites" className="text-xs font-bold text-orange-500 hover:underline">ดูทั้งหมด</Link>
            </div>
            <div className="p-5 text-center text-slate-500 text-sm font-medium">
              <svg className="w-10 h-10 mx-auto text-slate-200 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
              คุณยังไม่มีทัวร์ที่บันทึกไว้
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}

