export const dynamic = 'force-dynamic';
import React from 'react'
import { createClient } from '@/utils/supabase/server'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function CustomerPaymentsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const customer = await prisma.customer.findFirst({
    where: { email: user.email },
    include: {
      bookings: {
        include: {
          payments: {
            orderBy: { createdAt: 'desc' }
          },
          tour: true
        }
      }
    }
  })

  if (!customer) redirect('/login')

  // Flatten payments and attach booking context
  const payments = customer.bookings.flatMap(b => 
    b.payments.map(p => ({
      ...p,
      bookingRef: b.bookingRef,
      tourName: b.tour.tourName
    }))
  ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const pendingPayments = payments.filter(p => p.status === 'PENDING')
  const completedPayments = payments.filter(p => p.status === 'COMPLETED')

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'COMPLETED': return <span className="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-md text-[10px] font-black tracking-wider uppercase border border-emerald-200">สำเร็จ (Paid)</span>
      case 'PENDING': return <span className="bg-orange-100 text-orange-700 px-2.5 py-1 rounded-md text-[10px] font-black tracking-wider uppercase border border-orange-200">รอชำระเงิน</span>
      case 'FAILED': return <span className="bg-red-100 text-red-700 px-2.5 py-1 rounded-md text-[10px] font-black tracking-wider uppercase border border-red-200">ล้มเหลว (Failed)</span>
      case 'REFUNDED': return <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md text-[10px] font-black tracking-wider uppercase border border-slate-200">คืนเงินแล้ว (Refunded)</span>
      default: return <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md text-[10px] font-black tracking-wider uppercase border border-slate-200">{status}</span>
    }
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-800">การชำระเงิน (Payments)</h1>
          <p className="text-slate-500 text-sm mt-1">ประวัติการชำระเงินและรายการค้างชำระทั้งหมดของคุณ</p>
        </div>
      </div>

      {pendingPayments.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-black text-red-600 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            รายการรอชำระเงิน (Outstanding Payments)
          </h2>
          <div className="grid grid-cols-1 gap-4">
            {pendingPayments.map(p => (
              <div key={p.id} className="bg-white border-2 border-red-100 rounded-2xl p-5 sm:p-6 shadow-sm hover:border-red-200 transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="bg-red-100 text-red-700 px-2.5 py-1 rounded-md text-[10px] font-black tracking-wider uppercase">Pending</span>
                    <span className="text-xs font-mono font-bold text-slate-400">Ref: {p.paymentRef}</span>
                  </div>
                  <h3 className="font-black text-slate-800 text-lg">{p.tourName}</h3>
                  <p className="text-sm font-bold text-slate-500 mt-1">Booking: <Link href={`/account/bookings/${p.bookingRef}`} className="text-orange-500 hover:underline">{p.bookingRef}</Link></p>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto mt-2 md:mt-0">
                  <div className="text-left sm:text-right w-full sm:w-auto">
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">ยอดชำระ (Amount)</p>
                    <p className="text-2xl font-black text-red-600">฿{p.amount.toLocaleString()}</p>
                  </div>
                  <Link href={`/account/payments/${p.id}`} className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl text-sm font-bold shadow-sm transition-colors text-center whitespace-nowrap">
                    ชำระเงินทันที
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-lg font-black text-slate-800 mb-4">ประวัติการชำระเงิน (Payment History)</h2>
        {completedPayments.length > 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-wider">Payment Ref</th>
                    <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-wider">Booking</th>
                    <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-wider">Date</th>
                    <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-wider">Method</th>
                    <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-wider">Amount</th>
                    <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-wider text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {completedPayments.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="py-4 px-6 font-mono text-sm font-bold text-slate-600">{p.paymentRef}</td>
                      <td className="py-4 px-6 text-sm font-bold text-orange-600">
                        <Link href={`/account/bookings/${p.bookingRef}`} className="hover:underline">{p.bookingRef}</Link>
                      </td>
                      <td className="py-4 px-6 text-sm font-bold text-slate-600">{new Date(p.createdAt).toLocaleDateString('th-TH')}</td>
                      <td className="py-4 px-6 text-xs font-black text-slate-500 uppercase">{p.paymentMethod.replace('_', ' ')}</td>
                      <td className="py-4 px-6 text-sm font-black text-slate-800">฿{p.amount.toLocaleString()}</td>
                      <td className="py-4 px-6">{getStatusBadge(p.status)}</td>
                      <td className="py-4 px-6 text-right">
                        <Link href={`/account/payments/${p.id}`} className="text-orange-500 hover:text-orange-600 text-sm font-bold hover:underline opacity-0 group-hover:opacity-100 transition-opacity">
                          รายละเอียด
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-sm">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
              <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
            </div>
            <p className="text-slate-500 font-medium">ยังไม่มีประวัติการชำระเงินที่เสร็จสมบูรณ์</p>
          </div>
        )}
      </div>

    </div>
  )
}

