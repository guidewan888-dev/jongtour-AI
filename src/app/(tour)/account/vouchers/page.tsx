export const dynamic = 'force-dynamic';
import React from 'react'
import { createClient } from '@/utils/supabase/server'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function CustomerVouchersPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const customer = await prisma.customer.findFirst({
    where: { email: user.email },
    include: {
      bookings: {
        include: {
          vouchers: {
            orderBy: { createdAt: 'desc' }
          },
          tour: { include: { images: true } },
          departure: true
        }
      }
    }
  })

  if (!customer) redirect('/login')

  // Flatten vouchers and attach booking context
  const vouchers = customer.bookings.flatMap(b => 
    b.vouchers.map(v => ({
      ...v,
      bookingRef: b.bookingRef,
      tourName: b.tour.tourName,
      tourCode: b.tour.tourCode,
      startDate: b.departure.startDate,
      endDate: b.departure.endDate,
      imageUrl: b.tour.images?.[0]?.imageUrl || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800'
    }))
  ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'ACTIVE': return <span className="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-md text-[10px] font-black tracking-wider uppercase border border-emerald-200">พร้อมใช้งาน (Active)</span>
      case 'USED': return <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md text-[10px] font-black tracking-wider uppercase border border-slate-200">ใช้งานแล้ว (Used)</span>
      case 'REVOKED': return <span className="bg-red-100 text-red-700 px-2.5 py-1 rounded-md text-[10px] font-black tracking-wider uppercase border border-red-200">ยกเลิก (Revoked)</span>
      default: return <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md text-[10px] font-black tracking-wider uppercase border border-slate-200">{status}</span>
    }
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-800">เอกสาร E-Voucher</h1>
          <p className="text-slate-500 text-sm mt-1">ดาวน์โหลดเอกสารยืนยันการเดินทางและ Voucher ต่างๆ ของคุณ</p>
        </div>
      </div>

      {vouchers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {vouchers.map(v => (
            <div key={v.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-emerald-300 transition-colors shadow-sm group flex flex-col h-full">
              <div className="h-32 relative bg-slate-100">
                <img src={v.imageUrl as string} alt={v.tourName} className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-3 left-4 right-4 flex justify-between items-end">
                  <span className="text-white font-black text-sm drop-shadow-md line-clamp-1">{v.tourName}</span>
                </div>
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded font-mono text-[10px] font-black text-slate-800 shadow-sm border border-white/50">
                  {v.tourCode}
                </div>
              </div>
              
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono font-bold text-slate-400">Voucher: {v.voucherNo}</span>
                    {getStatusBadge(v.status)}
                  </div>
                  
                  <div className="space-y-2 mb-6">
                    <div className="flex justify-between items-center text-sm font-medium border-b border-slate-50 pb-2">
                      <span className="text-slate-400">อ้างอิงการจอง</span>
                      <Link href={`/account/bookings/${v.bookingRef}`} className="text-orange-500 font-bold hover:underline">{v.bookingRef}</Link>
                    </div>
                    <div className="flex justify-between items-center text-sm font-medium border-b border-slate-50 pb-2">
                      <span className="text-slate-400">วันที่เดินทาง</span>
                      <span className="text-slate-800 font-bold">{new Date(v.startDate).toLocaleDateString('th-TH')}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm font-medium border-b border-slate-50 pb-2">
                      <span className="text-slate-400">วันที่ออกเอกสาร</span>
                      <span className="text-slate-800 font-bold">{new Date(v.issueDate).toLocaleDateString('th-TH')}</span>
                    </div>
                  </div>
                </div>
                
                <Link 
                  href={`/account/vouchers/${v.bookingRef}`}
                  className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2"
                >
                  เปิดดู Voucher
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-sm flex flex-col items-center">
          <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-6 border border-emerald-100">
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>
          </div>
          <h3 className="text-xl font-black text-slate-800 mb-2">ยังไม่มี Voucher ที่พร้อมดาวน์โหลด</h3>
          <p className="text-slate-500 font-medium mb-8 max-w-sm mx-auto">
            Voucher จะพร้อมให้ดาวน์โหลดหลังจากที่คุณชำระเงินเต็มจำนวนและสถานะการจองเป็น Confirmed แล้ว
          </p>
          <Link href="/account/bookings" className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-xl text-sm font-bold shadow-sm transition-colors">
            ตรวจสอบสถานะการจอง
          </Link>
        </div>
      )}
    </div>
  )
}

