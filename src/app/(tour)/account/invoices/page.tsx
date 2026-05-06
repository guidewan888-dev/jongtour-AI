export const dynamic = 'force-dynamic';
import React from 'react'
import { createClient } from '@/utils/supabase/server'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function CustomerInvoicesPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const customer = await prisma.customer.findFirst({
    where: { email: user.email },
    include: {
      bookings: {
        include: {
          tour: true,
          invoices: { orderBy: { createdAt: 'desc' } },
          receipts: { orderBy: { createdAt: 'desc' } }
        }
      }
    }
  })

  if (!customer) redirect('/login')

  // Flatten invoices and receipts
  const invoices = customer.bookings.flatMap(b => 
    b.invoices.map(inv => ({
      ...inv,
      bookingRef: b.bookingRef,
      tourName: b.tour.tourName
    }))
  ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const receipts = customer.bookings.flatMap(b => 
    b.receipts.map(rec => ({
      ...rec,
      bookingRef: b.bookingRef,
      tourName: b.tour.tourName
    }))
  ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const getInvoiceBadge = (status: string) => {
    switch(status) {
      case 'PAID': return <span className="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-md text-[10px] font-black tracking-wider uppercase border border-emerald-200">ชำระแล้ว (Paid)</span>
      case 'UNPAID': return <span className="bg-orange-100 text-orange-700 px-2.5 py-1 rounded-md text-[10px] font-black tracking-wider uppercase border border-orange-200">ค้างชำระ (Unpaid)</span>
      case 'PARTIAL': return <span className="bg-amber-100 text-amber-700 px-2.5 py-1 rounded-md text-[10px] font-black tracking-wider uppercase border border-amber-200">จ่ายบางส่วน (Partial)</span>
      case 'VOID': return <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md text-[10px] font-black tracking-wider uppercase border border-slate-200">ยกเลิก (Void)</span>
      default: return <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md text-[10px] font-black tracking-wider uppercase border border-slate-200">{status}</span>
    }
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-800">เอกสารการเงิน (Invoices & Receipts)</h1>
          <p className="text-slate-500 text-sm mt-1">ใบแจ้งหนี้ ใบเสร็จรับเงิน และการขอใบกำกับภาษี</p>
        </div>
        <Link href={`/account/support?topic=tax_invoice`} className="bg-slate-800 hover:bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-colors flex items-center justify-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          ขอใบกำกับภาษีเต็มรูปแบบ
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Column: Invoices */}
        <div>
          <h2 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center">
               <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
            </span>
            ใบแจ้งหนี้ (Invoices)
          </h2>
          
          {invoices.length > 0 ? (
            <div className="space-y-4">
              {invoices.map(inv => (
                <div key={inv.id} className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-orange-200 transition-colors shadow-sm group">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono font-bold text-slate-500">INV: {inv.invoiceNo}</span>
                        {getInvoiceBadge(inv.status)}
                      </div>
                      <Link href={`/account/bookings/${inv.bookingRef}`} className="text-sm font-bold text-slate-800 hover:text-orange-600 transition-colors line-clamp-1">{inv.tourName}</Link>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-0.5">ยอดสุทธิ</p>
                      <p className="text-lg font-black text-orange-600">฿{inv.totalAmount.toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center text-xs text-slate-500 font-medium bg-slate-50 p-2 rounded-lg mb-4">
                    <span>ออกเมื่อ: {new Date(inv.issueDate).toLocaleDateString('th-TH')}</span>
                    <span className={inv.status === 'UNPAID' ? 'text-red-500 font-bold' : ''}>ครบกำหนด: {new Date(inv.dueDate).toLocaleDateString('th-TH')}</span>
                  </div>

                  <div className="flex gap-2">
                    <button className="flex-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 px-3 py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                      Download
                    </button>
                    <button className="flex-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 px-3 py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                      Email
                    </button>
                    {inv.status === 'UNPAID' && (
                      <Link href={`/account/payments`} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-center shadow-sm">
                        ชำระเงิน
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center shadow-sm">
              <p className="text-slate-500 font-medium text-sm">ยังไม่มีใบแจ้งหนี้</p>
            </div>
          )}
        </div>

        {/* Right Column: Receipts */}
        <div>
          <h2 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
               <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </span>
            ใบเสร็จรับเงิน (Receipts)
          </h2>

          {receipts.length > 0 ? (
            <div className="space-y-4">
              {receipts.map(rec => (
                <div key={rec.id} className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-emerald-200 transition-colors shadow-sm group">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono font-bold text-slate-500">REC: {rec.receiptNo}</span>
                        <span className="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-md text-[10px] font-black tracking-wider uppercase border border-emerald-200">Official</span>
                      </div>
                      <Link href={`/account/bookings/${rec.bookingRef}`} className="text-sm font-bold text-slate-800 hover:text-emerald-600 transition-colors line-clamp-1">{rec.tourName}</Link>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-0.5">ยอดรับชำระ</p>
                      <p className="text-lg font-black text-emerald-600">฿{rec.amount.toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center text-xs text-slate-500 font-medium bg-slate-50 p-2 rounded-lg mb-4">
                    <span>วันที่รับเงิน: {new Date(rec.issueDate).toLocaleDateString('th-TH')}</span>
                  </div>

                  <div className="flex gap-2">
                    {rec.pdfUrl ? (
                      <a href={rec.pdfUrl} target="_blank" rel="noreferrer" className="flex-1 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-emerald-700 px-3 py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        Download PDF
                      </a>
                    ) : (
                      <button disabled className="flex-1 bg-slate-100 border border-slate-200 text-slate-400 px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-not-allowed">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        กำลังเตรียมไฟล์...
                      </button>
                    )}
                    <button className="flex-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 px-3 py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                      Email
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center shadow-sm">
              <p className="text-slate-500 font-medium text-sm">ยังไม่มีใบเสร็จรับเงิน</p>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

