'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { CustomerEmptyState } from '@/components/ui/CustomerEmptyState'
import { CustomerStatusBadge } from '@/components/ui/CustomerStatusBadge'

type BookingItem = any // Simplify for this layout showcase

export default function BookingsClient({ bookings }: { bookings: BookingItem[] }) {
  
  if (!bookings || bookings.length === 0) {
    return (
      <CustomerEmptyState 
        title="คุณยังไม่มีประวัติการจอง"
        description="เริ่มวางแผนการเดินทางในฝันของคุณกับเราวันนี้ ค้นหาแพ็กเกจทัวร์ที่ใช่สำหรับคุณ"
        actionLabel="ค้นหาแพ็กเกจทัวร์"
        actionHref="/tours"
      />
    )
  }

  // Mobile-first Card Layout
  return (
    <div className="space-y-6">
      {bookings.map(booking => {
        
        // Simple logic to determine timeline step
        const isPaid = booking.payments && booking.payments.some((p: any) => p.status === 'COMPLETED')
        const isConfirmed = booking.status === 'CONFIRMED' || booking.status === 'VOUCHER_ISSUED'
        const hasVoucher = booking.status === 'VOUCHER_ISSUED'
        const isCancelled = booking.status === 'CANCELLED'

        return (
          <div key={booking.id} className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            
            {/* Card Header (Image + Title) */}
            <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row gap-5">
              {/* Tour Thumbnail (Hidden on very small screens, visible on md+) */}
              <div className="hidden md:block w-32 h-24 rounded-2xl bg-slate-100 relative overflow-hidden shrink-0">
                {booking.tour?.images?.[0]?.imageUrl ? (
                  <Image src={booking.tour.images[0].imageUrl} alt="Tour" fill className="object-cover" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-slate-300">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L28 20" /></svg>
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div>
                    <h3 className="font-black text-slate-800 text-lg leading-tight line-clamp-2">{booking.tour?.tourName || 'แพ็กเกจทัวร์พิเศษ (Manual Booking)'}</h3>
                    <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">Booking ID: {booking.bookingRef}</p>
                  </div>
                  <CustomerStatusBadge status={booking.status} className="shrink-0" />
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">วันเดินทาง</p>
                    <p className="text-sm font-bold text-slate-700">
                      {booking.departure?.startDate ? new Date(booking.departure.startDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' }) : 'รอการยืนยัน'} - 
                      {booking.departure?.endDate ? new Date(booking.departure.endDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' }) : ''}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">ยอดชำระสุทธิ</p>
                    <p className="text-sm font-black text-orange-600">฿{booking.totalPrice?.toLocaleString() || 0}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Horizontal Timeline (Scrollable on mobile) */}
            {!isCancelled && (
              <div className="px-5 py-6 bg-slate-50/50 overflow-x-auto hide-scrollbar">
                <div className="min-w-[400px] flex items-center justify-between relative px-4">
                  {/* Background Line */}
                  <div className="absolute left-8 right-8 top-3 h-1 bg-slate-200 rounded-full z-0"></div>
                  
                  {/* Progress Line */}
                  <div 
                    className="absolute left-8 top-3 h-1 bg-emerald-500 rounded-full z-0 transition-all duration-500"
                    style={{ width: hasVoucher ? 'calc(100% - 4rem)' : isConfirmed ? '66%' : isPaid ? '33%' : '0%' }}
                  ></div>

                  {/* Step 1: Pending */}
                  <div className="relative z-10 flex flex-col items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center border-4 border-white shadow-sm">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700">รับเรื่องจอง</span>
                  </div>

                  {/* Step 2: Paid */}
                  <div className="relative z-10 flex flex-col items-center gap-2">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center border-4 border-white shadow-sm transition-colors ${isPaid ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                      {isPaid ? <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg> : <span className="text-xs font-bold">2</span>}
                    </div>
                    <span className={`text-[10px] font-bold ${isPaid ? 'text-emerald-700' : 'text-slate-400'}`}>ชำระเงิน</span>
                  </div>

                  {/* Step 3: Confirmed */}
                  <div className="relative z-10 flex flex-col items-center gap-2">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center border-4 border-white shadow-sm transition-colors ${isConfirmed ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                      {isConfirmed ? <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg> : <span className="text-xs font-bold">3</span>}
                    </div>
                    <span className={`text-[10px] font-bold ${isConfirmed ? 'text-emerald-700' : 'text-slate-400'}`}>ยืนยันที่นั่ง</span>
                  </div>

                  {/* Step 4: Voucher */}
                  <div className="relative z-10 flex flex-col items-center gap-2">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center border-4 border-white shadow-sm transition-colors ${hasVoucher ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                      {hasVoucher ? <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg> : <span className="text-xs font-bold">4</span>}
                    </div>
                    <span className={`text-[10px] font-bold ${hasVoucher ? 'text-emerald-700' : 'text-slate-400'}`}>รับวอยเชอร์</span>
                  </div>
                </div>
              </div>
            )}

            {/* Actions Footer */}
            <div className="p-4 bg-white border-t border-slate-100 flex flex-col sm:flex-row items-center gap-3">
              <Link 
                href={`/account/bookings/${booking.bookingRef}`}
                className="w-full sm:w-auto flex-1 text-center bg-white border border-slate-200 hover:border-orange-300 hover:bg-orange-50 text-slate-600 hover:text-orange-700 px-4 py-2.5 rounded-2xl text-sm font-bold shadow-sm transition-colors"
              >
                ดูรายละเอียด
              </Link>
              {!isPaid && !isCancelled && (
                <button className="w-full sm:w-auto flex-1 text-center bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 rounded-2xl text-sm font-bold shadow-sm transition-colors">
                  แจ้งชำระเงิน
                </button>
              )}
              {hasVoucher && (
                <button className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-2xl text-sm font-bold shadow-sm transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  โหลดวอยเชอร์
                </button>
              )}
            </div>

          </div>
        )
      })}
    </div>
  )
}
