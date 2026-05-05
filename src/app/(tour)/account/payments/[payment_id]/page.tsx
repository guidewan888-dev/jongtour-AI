export const dynamic = 'force-dynamic';
import React from 'react'
import { createClient } from '@/utils/supabase/server'
import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import PaymentSlipClient from './PaymentSlipClient'

export default async function PaymentDetailPage({ params }: { params: { payment_id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const customer = await prisma.customer.findFirst({
    where: { email: user.email }
  })

  if (!customer) redirect('/login')

  const payment = await prisma.payment.findUnique({
    where: { id: params.payment_id },
    include: {
      booking: {
        include: {
          tour: true
        }
      }
    }
  })

  // Security Guard: Must be the owner
  if (!payment || payment.booking.customerId !== customer.id) {
    notFound()
  }

  const { booking } = payment

  return (
    <div className="space-y-6 animate-fade-in-up max-w-4xl">
      
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <Link href="/account/payments" className="text-orange-500 hover:text-orange-600 text-sm font-bold flex items-center gap-1 mb-2 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
            เธเธฅเธฑเธเนเธเธซเธเนเธฒเธฃเธงเธกเธเธฒเธฃเธเธณเธฃเธฐเน€เธเธดเธ
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-black text-slate-800">Payment {payment.paymentRef}</h1>
            {payment.status === 'COMPLETED' ? (
              <span className="bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg text-xs font-black tracking-wider uppercase border border-emerald-200">เธชเธณเน€เธฃเนเธ (Paid)</span>
            ) : payment.status === 'PENDING' ? (
              <span className="bg-orange-100 text-orange-700 px-3 py-1.5 rounded-lg text-xs font-black tracking-wider uppercase border border-orange-200">เธฃเธญเธเธณเธฃเธฐเน€เธเธดเธ</span>
            ) : (
              <span className="bg-red-100 text-red-700 px-3 py-1.5 rounded-lg text-xs font-black tracking-wider uppercase border border-red-200">{payment.status}</span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: Details */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 md:p-8">
            <h2 className="text-xl font-black text-slate-800 mb-6">เธฃเธฒเธขเธฅเธฐเน€เธญเธตเธขเธ”เธฃเธฒเธขเธเธฒเธฃ (Details)</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-slate-100">
                <span className="text-xs font-black text-slate-400 uppercase tracking-wider">เธญเนเธฒเธเธญเธดเธเธเธฒเธฃเธเธญเธ (Booking Ref)</span>
                <Link href={`/account/bookings/${booking.bookingRef}`} className="text-sm font-bold text-orange-600 hover:underline">{booking.bookingRef}</Link>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-slate-100">
                <span className="text-xs font-black text-slate-400 uppercase tracking-wider">เธเธทเนเธญเธ—เธฑเธงเธฃเน (Tour Name)</span>
                <span className="text-sm font-bold text-slate-800 text-right max-w-[200px] truncate">{booking.tour.tourName}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-slate-100">
                <span className="text-xs font-black text-slate-400 uppercase tracking-wider">เธเนเธญเธเธ—เธฒเธเธเธณเธฃเธฐเน€เธเธดเธ (Method)</span>
                <span className="text-sm font-black text-slate-800 uppercase">{payment.paymentMethod.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-slate-100">
                <span className="text-xs font-black text-slate-400 uppercase tracking-wider">เธงเธฑเธเธ—เธตเนเธ—เธณเธฃเธฒเธขเธเธฒเธฃ (Date)</span>
                <span className="text-sm font-bold text-slate-800">{new Date(payment.createdAt).toLocaleDateString('th-TH')}</span>
              </div>
              <div className="flex justify-between items-center pt-3">
                <span className="text-sm font-black text-slate-800">เธขเธญเธ”เธชเธธเธ—เธเธด (Total Amount)</span>
                <span className="text-2xl font-black text-orange-600">เธฟ{payment.amount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
             <div className="p-5 border-b border-slate-100">
                <h3 className="font-black text-slate-800">เธ•เนเธญเธเธเธฒเธฃเนเธเน€เธชเธฃเนเธเธฃเธฑเธเน€เธเธดเธ?</h3>
             </div>
             <div className="p-5">
               {payment.status === 'COMPLETED' ? (
                 <Link href="/account/invoices" className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 px-4 py-3 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2">
                   <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                   เนเธเธ—เธตเนเธซเธเนเธฒ Invoice / Receipt
                 </Link>
               ) : (
                 <p className="text-sm text-slate-500 font-medium text-center">เนเธเน€เธชเธฃเนเธเธฃเธฑเธเน€เธเธดเธเธเธฐเธชเธฒเธกเธฒเธฃเธ–เธ”เธฒเธงเธเนเนเธซเธฅเธ”เนเธ”เนเน€เธกเธทเนเธญเธเธฒเธฃเธเธณเธฃเธฐเน€เธเธดเธเน€เธชเธฃเนเธเธชเธกเธเธนเธฃเธ“เน</p>
               )}
             </div>
          </div>
        </div>

        {/* Right Column: Payment & Slip Upload */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 md:p-8">
            <h2 className="text-xl font-black text-slate-800 mb-2">เธญเธฑเธเนเธซเธฅเธ”เธชเธฅเธดเธ (Upload Slip)</h2>
            <p className="text-sm text-slate-500 font-medium mb-6">เธเธฃเธธเธ“เธฒเธญเธฑเธเนเธซเธฅเธ”เธซเธฅเธฑเธเธเธฒเธเธเธฒเธฃเนเธญเธเน€เธเธดเธเน€เธเธทเนเธญเธขเธทเธเธขเธฑเธเธเธฒเธฃเธเธณเธฃเธฐเน€เธเธดเธ</p>
            
            <PaymentSlipClient paymentId={payment.id} verificationStatus={payment.verificationStatus || 'PENDING'} />

          </div>

          <div className="bg-indigo-50 rounded-3xl border border-indigo-100 shadow-sm overflow-hidden p-6">
             <div className="flex gap-4">
                <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center shrink-0">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                </div>
                <div>
                  <h3 className="font-black text-indigo-900 mb-1">เธ•เธดเธ”เธ•เนเธญเธเนเธฒเธขเธเธฒเธฃเน€เธเธดเธ</h3>
                  <p className="text-xs text-indigo-700 font-medium mb-3">เธซเธฒเธเธกเธตเธเธฑเธเธซเธฒเธเธฒเธฃเธเธณเธฃเธฐเน€เธเธดเธ เธชเธฒเธกเธฒเธฃเธ–เธ•เธดเธ”เธ•เนเธญเนเธญเธ”เธกเธดเธเนเธ”เนเธ—เธฑเธเธ—เธต</p>
                  <Link href={`/account/support?ref=${payment.paymentRef}`} className="text-sm font-bold text-indigo-600 hover:text-indigo-800 hover:underline">
                    เนเธเนเธเธเธฑเธเธซเธฒเธเธฒเธฃเธเธณเธฃเธฐเน€เธเธดเธ &rarr;
                  </Link>
                </div>
             </div>
          </div>
        </div>

      </div>
    </div>
  )
}

