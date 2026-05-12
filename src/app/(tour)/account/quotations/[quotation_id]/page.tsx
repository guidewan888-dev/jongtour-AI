export const dynamic = 'force-dynamic';
import React from 'react'
import { createClient } from '@/utils/supabase/server'
import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'

export default async function QuotationDetailPage({ params }: { params: { quotation_id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || !user.email) redirect('/login')

  const quotation = await prisma.quotation.findUnique({
    where: { quotationRef: params.quotation_id },
    include: {
      departure: {
        include: {
          tour: true
        }
      },
      agent: true
    }
  })

  // Security Guard: Check if quotation email matches logged-in user email
  if (!quotation || quotation.customerEmail !== user.email) {
    notFound()
  }

  const isExpired = new Date() > new Date(quotation.validUntil) && quotation.status !== 'BOOKED'
  const paxTotal = quotation.paxAdult + quotation.paxChild

  return (
    <div className="space-y-6 animate-fade-in-up max-w-4xl">
      
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <Link href="/account/quotations" className="text-indigo-600 hover:text-indigo-700 text-sm font-bold flex items-center gap-1 mb-2 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
            กลับหน้ารวมใบเสนอราคา
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-black text-slate-800">Quotation {quotation.quotationRef}</h1>
            {quotation.status === 'BOOKED' ? (
               <span className="bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg text-xs font-black tracking-wider uppercase border border-emerald-200">จองแล้ว (Booked)</span>
            ) : isExpired || quotation.status === 'EXPIRED' ? (
               <span className="bg-slate-100 text-slate-500 px-3 py-1.5 rounded-lg text-xs font-black tracking-wider uppercase border border-slate-200">หมดอายุ (Expired)</span>
            ) : (
               <span className="bg-orange-100 text-orange-700 px-3 py-1.5 rounded-lg text-xs font-black tracking-wider uppercase border border-orange-200">รอยืนยัน (Active)</span>
            )}
          </div>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
           {quotation.status === 'ACTIVE' && !isExpired && (
             <Link href={`/checkout?q=${quotation.quotationRef}`} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-colors text-center flex-1 md:flex-none">
               ยืนยันการจอง & ชำระเงิน
             </Link>
           )}
           <button className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-colors text-center flex-1 md:flex-none flex items-center justify-center gap-2">
             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
             Download PDF
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 md:p-8">
            <h2 className="text-xl font-black text-slate-800 mb-6 border-b border-slate-100 pb-4">สรุปแพ็กเกจทัวร์ (Tour Summary)</h2>
            
            <div className="space-y-4">
              <h3 className="text-lg font-black text-indigo-900">{quotation.departure.tour.tourName}</h3>
              <p className="text-sm font-bold text-slate-500">รหัสทัวร์: {quotation.departure.tour.tourCode}</p>
              
              <div className="grid grid-cols-2 gap-4 mt-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">วันเดินทาง</p>
                  <p className="text-sm font-bold text-slate-800">{new Date(quotation.departure.startDate).toLocaleDateString('th-TH')} - {new Date(quotation.departure.endDate).toLocaleDateString('th-TH')}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">จำนวนผู้เดินทาง</p>
                  <p className="text-sm font-bold text-slate-800">{paxTotal} ท่าน (ผู้ใหญ่ {quotation.paxAdult}, เด็ก {quotation.paxChild})</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">ผู้เสนอราคา</p>
                  <p className="text-sm font-bold text-slate-800">{quotation.agent.contactName}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">เสนอให้ (ลูกค้า)</p>
                  <p className="text-sm font-bold text-slate-800">{quotation.customerName}</p>
                </div>
              </div>
            </div>

            {quotation.notes && (
              <div className="mt-6 pt-6 border-t border-slate-100">
                <p className="text-[10px] font-black uppercase text-indigo-500 tracking-wider mb-2">หมายเหตุเพิ่มเติมจากเจ้าหน้าที่</p>
                <div className="bg-indigo-50 text-indigo-800 p-4 rounded-xl text-sm font-medium whitespace-pre-wrap">
                  {quotation.notes}
                </div>
              </div>
            )}

          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6">
            <h3 className="font-black text-slate-800 mb-4">เงื่อนไขการเสนอราคา (Terms & Conditions)</h3>
            <ul className="list-disc pl-5 text-sm text-slate-600 space-y-2">
              <li>ใบเสนอราคานี้อ้างอิงราคาตั๋วและโปรโมชั่น ณ วันที่ออกเอกสาร หากไม่ยืนยันภายในเวลาที่กำหนด ราคาอาจเปลี่ยนแปลงได้</li>
              <li>การยืนยันการจองจะสมบูรณ์เมื่อบริษัทได้รับชำระเงินมัดจำตามที่ระบุในเอกสารแนบท้ายเรียบร้อยแล้ว</li>
              <li>ราคานี้รวมภาษีมูลค่าเพิ่ม 7% และหัก ณ ที่จ่าย (ถ้ามี) หากต้องการใบกำกับภาษีเต็มรูปแบบ กรุณาแจ้งล่วงหน้า</li>
              <li>การแก้ไขรายละเอียดการเดินทางหรือจำนวนผู้เดินทาง อาจส่งผลให้ราคาทัวร์มีการเปลี่ยนแปลง</li>
            </ul>
          </div>
        </div>

        {/* Right: Pricing Sidebar */}
        <div className="space-y-6">
          <div className="bg-indigo-900 rounded-3xl shadow-sm overflow-hidden text-white relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full blur-3xl opacity-30 -mr-10 -mt-10"></div>
            <div className="p-6 relative z-10">
              <h3 className="font-black text-lg mb-6">สรุปค่าใช้จ่าย</h3>
              
              <div className="space-y-3 mb-6 text-sm">
                <div className="flex justify-between items-center text-indigo-200">
                  <span>ราคาผู้ใหญ่ ({quotation.paxAdult} ท่าน)</span>
                  <span className="font-bold text-white">รวมในยอดสุทธิ</span>
                </div>
                {quotation.paxChild > 0 && (
                  <div className="flex justify-between items-center text-indigo-200">
                    <span>ราคาเด็ก ({quotation.paxChild} ท่าน)</span>
                    <span className="font-bold text-white">รวมในยอดสุทธิ</span>
                  </div>
                )}
                <div className="pt-3 mt-3 border-t border-indigo-700 flex flex-col items-end">
                  <span className="text-xs font-black uppercase text-indigo-300 tracking-wider mb-1">ยอดรวมสุทธิ (Total Net Price)</span>
                  <span className="font-black text-3xl text-white">฿{quotation.totalSellingPrice.toLocaleString()}</span>
                </div>
              </div>

              {quotation.status === 'ACTIVE' && !isExpired ? (
                <div className="space-y-3 mt-6 border-t border-indigo-700 pt-6">
                  <p className="text-xs text-orange-300 font-bold text-center mb-2 flex items-center justify-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    ยืนยันก่อน: {new Date(quotation.validUntil).toLocaleString('th-TH')}
                  </p>
                  <Link href={`/checkout?q=${quotation.quotationRef}`} className="w-full bg-white text-indigo-900 hover:bg-slate-100 px-4 py-3 rounded-xl text-sm font-black transition-colors text-center block shadow-sm">
                    ยืนยันการจองทันที
                  </Link>
                </div>
              ) : (
                <div className="w-full bg-slate-800/50 text-slate-300 px-4 py-3 rounded-xl text-sm font-bold text-center border border-slate-700/50 mt-6">
                  {quotation.status === 'BOOKED' ? 'ดำเนินการจองแล้ว' : 'ใบเสนอราคาหมดอายุแล้ว'}
                </div>
              )}
            </div>
          </div>

          {/* Contact / Modify Card */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
             <h3 className="font-black text-slate-800 mb-4">ต้องการปรับเปลี่ยน?</h3>
             <div className="space-y-3">
               <Link href={`/account/support?ref=${quotation.quotationRef}&topic=modify_quotation`} className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2">
                 ขอปรับแก้ไขใบเสนอราคา
               </Link>
               <a href={`mailto:${quotation.agent.email || 'sale@jongtour.com'}?subject=สอบถาม Quotation ${quotation.quotationRef}`} className="w-full bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2">
                 ติดต่อ {quotation.agent.contactName || 'Sale Manager'}
               </a>
             </div>
          </div>
        </div>

      </div>
    </div>
  )
}

