export const dynamic = 'force-dynamic';
import React from 'react'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export default async function CustomerPaymentsPage({ params }: { params: { id: string } }) {
  const customer = await prisma.customer.findUnique({
    where: { id: params.id },
    include: {
      bookings: {
        include: { payments: { orderBy: { createdAt: 'desc' } } }
      }
    }
  })

  if (!customer) notFound()

  const allPayments = customer.bookings.flatMap(b => 
    b.payments.map(p => ({ ...p, bookingNo: b.bookingRef }))
  ).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

  const totalPaid = allPayments.filter(p => p.status === 'COMPLETED').reduce((acc, p) => acc + p.amount, 0)

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
          <p className="text-xs font-bold text-slate-500 mb-1">เธขเธญเธ”เธเธณเธฃเธฐเนเธฅเนเธงเธ—เธฑเนเธเธซเธกเธ” (Total Paid)</p>
          <p className="text-2xl font-black text-emerald-600">เธฟ{totalPaid.toLocaleString()}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
          <p className="text-xs font-bold text-slate-500 mb-1">เธเธณเธเธงเธเธฃเธฒเธขเธเธฒเธฃเนเธญเธ (Transactions)</p>
          <p className="text-2xl font-black text-slate-800">{allPayments.length}</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">เธเธฃเธฐเธงเธฑเธ•เธดเธเธฒเธฃเธเธณเธฃเธฐเน€เธเธดเธ</h2>
          <button className="text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors">
            + เธเธฑเธเธ—เธถเธเธฃเธฑเธเธเธณเธฃเธฐเน€เธเธดเธ
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-bold text-slate-600 text-xs uppercase tracking-wider">เธงเธฑเธเน€เธงเธฅเธฒ (Date)</th>
                <th className="px-6 py-4 font-bold text-slate-600 text-xs uppercase tracking-wider">เธฃเธฒเธขเธเธฒเธฃเธเธญเธ (Booking)</th>
                <th className="px-6 py-4 font-bold text-slate-600 text-xs uppercase tracking-wider">เธเนเธญเธเธ—เธฒเธ (Method)</th>
                <th className="px-6 py-4 font-bold text-slate-600 text-xs uppercase tracking-wider">เธขเธญเธ”เน€เธเธดเธ (Amount)</th>
                <th className="px-6 py-4 font-bold text-slate-600 text-xs uppercase tracking-wider">เธชเธ–เธฒเธเธฐเธเธฒเธฃเธเธณเธฃเธฐ</th>
                <th className="px-6 py-4 font-bold text-slate-600 text-xs uppercase tracking-wider">เธ•เธฃเธงเธเธชเธญเธเธชเธฅเธดเธ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {allPayments.length > 0 ? (
                allPayments.map(payment => (
                  <tr key={payment.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-800">{new Date(payment.createdAt).toLocaleDateString('th-TH')}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{new Date(payment.createdAt).toLocaleTimeString('th-TH')}</p>
                    </td>
                    <td className="px-6 py-4">
                      <Link href={`/bookings/${payment.bookingId}`} className="font-bold text-indigo-600 hover:underline">
                        {payment.bookingNo}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-700 capitalize">{payment.paymentMethod.replace('_', ' ')}</p>
                      <p className="text-[10px] font-mono text-slate-400 mt-0.5">Ref: {payment.paymentRef}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-black text-slate-800">เธฟ{payment.amount.toLocaleString()}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-black tracking-wider uppercase border ${
                        payment.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 
                        payment.status === 'FAILED' ? 'bg-red-100 text-red-700 border-red-200' : 
                        'bg-orange-100 text-orange-700 border-orange-200'
                      }`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-black tracking-wider uppercase border ${
                        payment.verificationStatus === 'VERIFIED' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 
                        payment.verificationStatus === 'UPLOADED' ? 'bg-blue-100 text-blue-700 border-blue-200' : 
                        payment.verificationStatus === 'REJECTED' ? 'bg-red-100 text-red-700 border-red-200' : 
                        'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>
                        {payment.verificationStatus}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500 font-medium">
                    เธขเธฑเธเนเธกเนเธกเธตเธเธฃเธฐเธงเธฑเธ•เธดเธเธฒเธฃเธเธณเธฃเธฐเน€เธเธดเธ
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

