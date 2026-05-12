export const dynamic = 'force-dynamic';
import React from 'react'
import { createClient } from '@/utils/supabase/server'
import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'

export default async function VoucherDetailPage({ params }: { params: { booking_no: string } }) {
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
      tour: true,
      departure: true,
      vouchers: true,
      travelers: true
    }
  })

  // Security Guard: Check ownership
  if (!booking || booking.customerId !== customer.id) {
    notFound()
  }

  // Find active voucher
  const voucher = booking.vouchers.find(v => v.status === 'ACTIVE') || booking.vouchers[0]

  if (!voucher) {
    return (
      <div className="space-y-6 animate-fade-in-up max-w-3xl">
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-sm">
          <h3 className="text-xl font-black text-slate-800 mb-2">ยังไม่มี Voucher สำหรับการจองนี้</h3>
          <p className="text-slate-500 font-medium mb-6">Voucher จะพร้อมใช้งานเมื่อการชำระเงินเสร็จสมบูรณ์</p>
          <Link href={`/account/bookings/${booking.bookingRef}`} className="bg-orange-500 text-white px-6 py-2 rounded-xl text-sm font-bold">กลับหน้าการจอง</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in-up max-w-4xl">
      
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <Link href="/account/vouchers" className="text-emerald-600 hover:text-emerald-700 text-sm font-bold flex items-center gap-1 mb-2 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
            กลับหน้ารวม Voucher
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-black text-slate-800">E-Voucher</h1>
            <span className="bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg text-xs font-black tracking-wider uppercase border border-emerald-200">พร้อมใช้งาน (Active)</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Actions */}
        <div className="lg:col-span-1 space-y-4 order-2 lg:order-1">
          <div className="bg-emerald-50 rounded-3xl border border-emerald-100 shadow-sm p-6 text-center">
            <div className="w-16 h-16 bg-white text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            <h3 className="font-black text-emerald-900 mb-6">ดาวน์โหลดหรือส่งอีเมล</h3>
            
            <div className="space-y-3">
              {voucher.pdfUrl ? (
                 <a href={voucher.pdfUrl} target="_blank" rel="noreferrer" className="w-full flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-3 rounded-xl text-sm font-bold transition-colors shadow-sm gap-2">
                   <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                   ดาวน์โหลด PDF
                 </a>
              ) : (
                 <button disabled className="w-full flex items-center justify-center bg-slate-200 text-slate-500 px-4 py-3 rounded-xl text-sm font-bold cursor-not-allowed gap-2">
                   <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                   กำลังเตรียมไฟล์ PDF...
                 </button>
              )}
              <button className="w-full flex items-center justify-center bg-white text-emerald-700 border border-emerald-200 px-4 py-3 rounded-xl text-sm font-bold hover:bg-emerald-100 transition-colors gap-2 shadow-sm">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                ส่งเข้า Email ของฉัน
              </button>
            </div>
          </div>

          <div className="bg-amber-50 rounded-3xl border border-amber-100 shadow-sm p-6">
            <h3 className="font-black text-amber-900 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              ข้อควรระวัง (Important Note)
            </h3>
            <ul className="list-disc pl-5 text-xs text-amber-800 space-y-2 font-medium">
              <li>กรุณานำ Voucher นี้ไปแสดงต่อเจ้าหน้าที่ในวันเดินทาง (สามารถเปิดจากมือถือได้)</li>
              <li>กรุณาพกพาสปอร์ตตัวจริงที่มีอายุเหลือไม่น้อยกว่า 6 เดือนในวันเดินทาง</li>
              <li>หากมีข้อสงสัยหรือพบข้อมูลผิดพลาด กรุณาติดต่อแอดมินก่อนวันเดินทางอย่างน้อย 3 วันทำการ</li>
            </ul>
          </div>
        </div>

        {/* Right: Voucher Preview */}
        <div className="lg:col-span-2 order-1 lg:order-2">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-lg overflow-hidden relative">
             {/* Decorative header pattern */}
             <div className="h-4 w-full bg-gradient-to-r from-emerald-400 via-teal-500 to-emerald-600"></div>
             
             <div className="p-8 md:p-12">
               {/* Voucher Header */}
               <div className="flex justify-between items-start mb-8 pb-8 border-b-2 border-dashed border-slate-200">
                  <div>
                    <img src="/logo-orange.png" alt="Jongtour Logo" className="h-8 mb-4 object-contain" onError={(e) => { e.currentTarget.style.display='none'; }} />
                    <h2 className="text-2xl font-black text-slate-800 tracking-wider">OFFICIAL VOUCHER</h2>
                    <p className="text-slate-500 font-bold mt-1">JONGTOUR.COM</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Voucher Number</p>
                    <p className="text-xl font-mono font-black text-slate-800">{voucher.voucherNo}</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mt-2 mb-1">Issue Date</p>
                    <p className="text-sm font-bold text-slate-800">{new Date(voucher.issueDate).toLocaleDateString('th-TH')}</p>
                  </div>
               </div>

               {/* Content */}
               <div className="space-y-6">
                 <div>
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-wider mb-1">รายละเอียดทัวร์ (Tour Details)</p>
                    <h3 className="text-xl font-black text-slate-800 mb-2">{booking.tour.tourName}</h3>
                    <div className="grid grid-cols-2 gap-4 mt-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">วันเดินทาง (Date)</p>
                        <p className="text-sm font-bold text-slate-800">{new Date(booking.departure.startDate).toLocaleDateString('th-TH')} - {new Date(booking.departure.endDate).toLocaleDateString('th-TH')}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">รหัสทัวร์ (Code)</p>
                        <p className="text-sm font-bold text-slate-800">{booking.tour.tourCode}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">อ้างอิงการจอง (Booking Ref)</p>
                        <p className="text-sm font-bold text-slate-800">{booking.bookingRef}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">ผู้เดินทาง (Pax)</p>
                        <p className="text-sm font-bold text-slate-800">{booking.travelers.length} ท่าน</p>
                      </div>
                    </div>
                 </div>

                 <div className="pt-4 border-t border-slate-100">
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-wider mb-3">รายชื่อผู้เดินทาง (Passenger Manifest)</p>
                    <ul className="space-y-2">
                      {booking.travelers.map((t, idx) => (
                        <li key={t.id} className="flex items-center gap-3 text-sm font-bold text-slate-700">
                          <span className="w-6 text-slate-400">{idx + 1}.</span>
                          <span className="flex-1 uppercase">{t.title || ''} {t.firstName} {t.lastName}</span>
                          <span className="text-[10px] bg-slate-100 px-2 py-1 rounded text-slate-500">{t.paxType}</span>
                        </li>
                      ))}
                    </ul>
                 </div>
               </div>

             </div>
             
             {/* Decorative Footer */}
             <div className="bg-slate-50 border-t border-slate-100 p-6 flex justify-between items-center">
               <p className="text-xs font-bold text-slate-400">Jongtour - The Best Tour Portal</p>
               <div className="w-16 h-16 opacity-20">
                 {/* QR Code Placeholder */}
                 <svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 3h8v8H3V3zm2 2v4h4V5H5zm8-2h8v8h-8V3zm2 2v4h4V5h-4zM3 13h8v8H3v-8zm2 2v4h4v-4H5zm13-2h3v2h-3v-2zm-3 0h2v2h-2v-2zm3 3h3v2h-3v-2zm-2 3h2v2h-2v-2zm-3-3h2v2h-2v-2zm3 3h3v2h-3v-2zm-3-3h2v2h-2v-2z" /></svg>
               </div>
             </div>
          </div>
        </div>

      </div>
    </div>
  )
}

