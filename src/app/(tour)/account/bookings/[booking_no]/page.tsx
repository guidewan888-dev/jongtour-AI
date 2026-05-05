export const dynamic = 'force-dynamic';
import React from 'react'
import { createClient } from '@/utils/supabase/server'
import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'

export default async function BookingDetailPage({ params }: { params: { booking_no: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const customer = await prisma.customer.findFirst({
    where: { email: user.email }
  })

  if (!customer) redirect('/login')

  const booking = await prisma.booking.findUnique({
    where: { bookingRef: params.booking_no },
    include: {
      tour: { include: { images: true } },
      departure: true,
      supplier: true,
      travelers: true,
      items: true,
      payments: true,
      vouchers: true,
      invoices: true
    }
  })

  // Security Guard Rule: 403 / Not Found if not owner
  if (!booking || booking.customerId !== customer.id) {
    notFound()
  }

  // Derived states
  const isPaid = booking.payments.every(p => p.status === 'COMPLETED') && booking.payments.length > 0
  const paymentStatus = isPaid ? 'PAID' : booking.payments.some(p => p.status === 'PENDING') ? 'PENDING' : 'UNPAID'
  const hasActiveVoucher = booking.vouchers.some(v => v.status === 'ACTIVE')
  
  const paidAmount = booking.payments.filter(p => p.status === 'COMPLETED').reduce((sum, p) => sum + p.amount, 0)
  const outstandingAmount = booking.totalPrice - paidAmount

  // Format Status
  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'confirmed': 
      case 'paid': 
      case 'voucher_issued':
        return <span className="bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg text-xs font-black tracking-wider uppercase border border-emerald-200">Confirmed</span>
      case 'payment_pending': 
        return <span className="bg-orange-100 text-orange-700 px-3 py-1.5 rounded-lg text-xs font-black tracking-wider uppercase border border-orange-200">Awaiting Payment</span>
      case 'pending':
      case 'waiting_admin_review':
      case 'waiting_wholesale_confirm':
        return <span className="bg-amber-100 text-amber-700 px-3 py-1.5 rounded-lg text-xs font-black tracking-wider uppercase border border-amber-200">Pending Confirm</span>
      case 'completed': 
        return <span className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-black tracking-wider uppercase border border-slate-200">Completed</span>
      case 'cancelled': 
        return <span className="bg-red-100 text-red-700 px-3 py-1.5 rounded-lg text-xs font-black tracking-wider uppercase border border-red-200">Cancelled</span>
      default: 
        return <span className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-black tracking-wider uppercase border border-slate-200">{status}</span>
    }
  }

  return (
    <div className="space-y-6 animate-fade-in-up max-w-4xl">
      
      {/* 1. Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <Link href="/account/bookings" className="text-orange-500 hover:text-orange-600 text-sm font-bold flex items-center gap-1 mb-2 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
            เธเธฅเธฑเธเนเธเธซเธเนเธฒเธเธฃเธฐเธงเธฑเธ•เธดเธเธฒเธฃเธเธญเธ
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-black text-slate-800">Booking {booking.bookingRef}</h1>
            {getStatusBadge(booking.status)}
          </div>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          {paymentStatus !== 'PAID' && booking.status !== 'cancelled' && (
            <Link href="/account/payments" className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-colors text-center flex-1 md:flex-none">
              เธเธณเธฃเธฐเน€เธเธดเธเธ—เธฑเธเธ—เธต
            </Link>
          )}
          <Link href={`/account/support?ref=${booking.bookingRef}`} className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-colors text-center flex-1 md:flex-none">
            เธ•เธดเธ”เธ•เนเธญเนเธญเธ”เธกเธดเธ
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (Main Info) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* 2. Tour Summary */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex flex-col md:flex-row">
              <div className="w-full md:w-48 h-48 md:h-auto relative bg-slate-100 shrink-0">
                <img src={booking.tour.images?.[0]?.imageUrl || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800'} alt={booking.tour.tourName} className="absolute inset-0 w-full h-full object-cover" />
              </div>
              <div className="p-6 flex-1 flex flex-col justify-center">
                <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-1">{booking.tour.tourCode}</p>
                <h2 className="text-xl font-black text-slate-800 leading-tight mb-4">{booking.tour.tourName}</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">เธงเธฑเธเน€เธ”เธดเธเธ—เธฒเธ (Departure)</p>
                    <p className="text-sm font-bold text-slate-800">
                      {new Date(booking.departure.startDate).toLocaleDateString('th-TH')} - {new Date(booking.departure.endDate).toLocaleDateString('th-TH')}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">เธฃเธฐเธขเธฐเน€เธงเธฅเธฒ (Duration)</p>
                    <p className="text-sm font-bold text-slate-800">{booking.tour.durationDays} เธงเธฑเธ {booking.tour.durationNights} เธเธทเธ</p>
                  </div>
                  {booking.supplierContactName && (
                    <div className="col-span-2">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">เธเธนเนเธเธฑเธ”เธ—เธฑเธงเธฃเน (Operator)</p>
                      <p className="text-sm font-bold text-slate-800">{booking.supplier.displayName}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 3. Traveler List */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <h3 className="font-black text-slate-800">เธฃเธฒเธขเธเธทเนเธญเธเธนเนเน€เธ”เธดเธเธ—เธฒเธ (Travelers)</h3>
              <span className="text-xs font-bold text-slate-500">{booking.travelers.length} เธ—เนเธฒเธ</span>
            </div>
            <div className="divide-y divide-slate-100">
              {booking.travelers.map((t, idx) => (
                <div key={t.id} className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-black text-sm shrink-0">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-800">{t.title || ''} {t.firstName} {t.lastName}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t.paxType}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {t.passportNo ? (
                       <span className="text-xs font-bold bg-emerald-50 text-emerald-600 px-3 py-1 rounded-md border border-emerald-100">Passport โ”</span>
                    ) : (
                       <span className="text-xs font-bold bg-amber-50 text-amber-600 px-3 py-1 rounded-md border border-amber-100">เธฃเธญเธซเธเนเธฒเธเธฒเธชเธเธญเธฃเนเธ•</span>
                    )}
                  </div>
                </div>
              ))}
              {booking.travelers.length === 0 && (
                <div className="p-8 text-center text-slate-500 text-sm font-medium">เนเธกเนเธกเธตเธเนเธญเธกเธนเธฅเธเธนเนเน€เธ”เธดเธเธ—เธฒเธ เนเธเธฃเธ”เธ•เธดเธ”เธ•เนเธญเนเธญเธ”เธกเธดเธ</div>
              )}
            </div>
          </div>

          {/* 8. Cancellation Policy */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6">
            <h3 className="font-black text-slate-800 mb-2">เธเนเธขเธเธฒเธขเธเธฒเธฃเธขเธเน€เธฅเธดเธ (Cancellation Policy)</h3>
            <p className="text-sm text-slate-500 font-medium mb-4">
              เธซเธฒเธเธ•เนเธญเธเธเธฒเธฃเธขเธเน€เธฅเธดเธเธเธฒเธฃเน€เธ”เธดเธเธ—เธฒเธ เธเธฃเธธเธ“เธฒเนเธเนเธเธฅเนเธงเธเธซเธเนเธฒเธญเธขเนเธฒเธเธเนเธญเธข 30 เธงเธฑเธเธเนเธญเธเน€เธ”เธดเธเธ—เธฒเธ เน€เธเธทเนเธญเธฃเธฑเธเน€เธเธดเธเธเธทเธเธ•เธฒเธกเน€เธเธทเนเธญเธเนเธเธเธฃเธดเธฉเธฑเธ— เธซเธฒเธเธขเธเน€เธฅเธดเธเธเธฃเธฐเธเธฑเนเธเธเธดเธ”เธญเธฒเธเธกเธตเธเนเธฒเธเธฃเธฃเธกเน€เธเธตเธขเธกเธ•เธฒเธกเธ—เธตเนเธฃเธฐเธเธธเนเธเน€เธญเธเธชเธฒเธฃ
            </p>
            {booking.status !== 'cancelled' && booking.status !== 'completed' && (
               <Link href={`/account/support?ref=${booking.bookingRef}&topic=cancel`} className="text-sm font-bold text-red-600 hover:text-red-700 hover:underline">
                 เธชเนเธเธเธณเธเธญเธขเธเน€เธฅเธดเธเธเธฒเธฃเน€เธ”เธดเธเธ—เธฒเธ (Request Cancellation)
               </Link>
            )}
          </div>
          
        </div>

        {/* Right Column (Sidebar) */}
        <div className="space-y-6">
          
          {/* 4. Payment Summary */}
          <div className="bg-slate-800 rounded-3xl shadow-sm overflow-hidden text-white relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500 rounded-full blur-3xl opacity-20 -mr-10 -mt-10"></div>
            <div className="p-6 relative z-10">
              <h3 className="font-black text-lg mb-6">เธชเธฃเธธเธเธเนเธฒเนเธเนเธเนเธฒเธข</h3>
              
              <div className="space-y-3 mb-6 text-sm">
                <div className="flex justify-between items-center text-slate-300">
                  <span>เธขเธญเธ”เธชเธธเธ—เธเธด (Total)</span>
                  <span className="font-bold text-white">เธฟ{booking.totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-emerald-400">
                  <span>เธเธณเธฃเธฐเนเธฅเนเธง (Paid)</span>
                  <span className="font-bold">เธฟ{paidAmount.toLocaleString()}</span>
                </div>
                <div className="pt-3 mt-3 border-t border-slate-700 flex justify-between items-center">
                  <span className="font-black">เธเนเธฒเธเธเธณเธฃเธฐ (Outstanding)</span>
                  <span className="font-black text-xl text-orange-400">เธฟ{outstandingAmount.toLocaleString()}</span>
                </div>
              </div>

              {outstandingAmount > 0 && booking.status !== 'cancelled' ? (
                <Link href="/account/payments" className="w-full bg-orange-500 hover:bg-orange-600 text-white px-4 py-3 rounded-xl text-sm font-bold transition-colors text-center block shadow-sm">
                  เธเธณเธฃเธฐเธขเธญเธ”เธเธเน€เธซเธฅเธทเธญ
                </Link>
              ) : (
                <div className="w-full bg-emerald-500/20 text-emerald-400 px-4 py-3 rounded-xl text-sm font-bold text-center border border-emerald-500/30">
                  เธเธณเธฃเธฐเน€เธเธดเธเธเธฃเธเธ–เนเธงเธ
                </div>
              )}
            </div>
          </div>

          {/* 5. Documents (Voucher / Invoice) */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100">
              <h3 className="font-black text-slate-800">เน€เธญเธเธชเธฒเธฃเธเธฒเธฃเธเธญเธ</h3>
            </div>
            <div className="p-5 space-y-3">
              {hasActiveVoucher ? (
                <Link href={`/account/vouchers/${booking.bookingRef}`} className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  เธ”เธฒเธงเธเนเนเธซเธฅเธ” E-Voucher
                </Link>
              ) : (
                <div className="w-full bg-slate-50 text-slate-400 px-4 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 border border-slate-100">
                  Voucher เธขเธฑเธเนเธกเนเธเธฃเนเธญเธก
                </div>
              )}
              
              <Link href={`/account/invoices`} className="w-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                เนเธเน€เธชเธฃเนเธเธฃเธฑเธเน€เธเธดเธ (Invoice)
              </Link>
            </div>
          </div>

          {/* 7. Support / Communication */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100">
              <h3 className="font-black text-slate-800">เธ•เนเธญเธเธเธฒเธฃเธเธงเธฒเธกเธเนเธงเธขเน€เธซเธฅเธทเธญ?</h3>
            </div>
            <div className="p-5 space-y-3">
              <Link href={`/account/ai-chats?ref=${booking.bookingRef}`} className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2">
                เธ–เธฒเธก AI Planner
              </Link>
              <Link href={`/account/support?ref=${booking.bookingRef}`} className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2 border border-slate-200">
                เน€เธเธดเธ” Ticket เนเธเนเธเธเธฑเธเธซเธฒ
              </Link>
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}

