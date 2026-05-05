export const dynamic = 'force-dynamic';
import React from 'react'
import { createClient } from '@/utils/supabase/server'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function CustomerQuotationsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || !user.email) redirect('/login')

  // Find quotations matching the customer's email
  const quotations = await prisma.quotation.findMany({
    where: { customerEmail: user.email },
    include: {
      departure: {
        include: {
          tour: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  const getStatusBadge = (status: string, validUntil: Date) => {
    const isExpired = new Date() > new Date(validUntil)
    if (status === 'BOOKED') {
      return <span className="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-md text-[10px] font-black tracking-wider uppercase border border-emerald-200">เธ—เธณเธฃเธฒเธขเธเธฒเธฃเธเธญเธเนเธฅเนเธง (Booked)</span>
    }
    if (isExpired || status === 'EXPIRED') {
      return <span className="bg-slate-100 text-slate-500 px-2.5 py-1 rounded-md text-[10px] font-black tracking-wider uppercase border border-slate-200">เธซเธกเธ”เธญเธฒเธขเธธ (Expired)</span>
    }
    return <span className="bg-orange-100 text-orange-700 px-2.5 py-1 rounded-md text-[10px] font-black tracking-wider uppercase border border-orange-200">เธฃเธญเธเธฒเธฃเธขเธทเธเธขเธฑเธ (Active)</span>
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-800">เนเธเน€เธชเธเธญเธฃเธฒเธเธฒ (Quotations)</h1>
          <p className="text-slate-500 text-sm mt-1">เนเธเน€เธชเธเธญเธฃเธฒเธเธฒเธ—เธตเน Sales Manager เธซเธฃเธทเธญ AI Planner เธชเธฃเนเธฒเธเนเธซเนเธเธธเธ“</p>
        </div>
      </div>

      {quotations.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {quotations.map(q => {
            const isExpired = new Date() > new Date(q.validUntil) && q.status !== 'BOOKED'
            
            return (
              <div key={q.id} className={`bg-white border ${isExpired ? 'border-slate-200 opacity-75' : 'border-indigo-100'} rounded-2xl p-5 sm:p-6 shadow-sm hover:border-indigo-300 transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-6 group`}>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <span className="text-xs font-mono font-bold text-slate-500">REF: {q.quotationRef}</span>
                    {getStatusBadge(q.status, q.validUntil)}
                  </div>
                  <Link href={`/account/quotations/${q.quotationRef}`} className="font-black text-slate-800 text-lg hover:text-indigo-600 transition-colors line-clamp-1">
                    {q.departure.tour.tourName}
                  </Link>
                  <div className="flex flex-wrap gap-x-6 gap-y-2 mt-3 text-sm font-medium text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      {new Date(q.departure.startDate).toLocaleDateString('th-TH')}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                      {q.paxAdult + q.paxChild} เธ—เนเธฒเธ
                    </span>
                    <span className="flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      เนเธเนเนเธ”เนเธ–เธถเธ {new Date(q.validUntil).toLocaleDateString('th-TH')}
                    </span>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 shrink-0">
                  <div className="text-left sm:text-right w-full sm:w-auto">
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">เธขเธญเธ”เธฃเธงเธกเธชเธธเธ—เธเธด</p>
                    <p className="text-2xl font-black text-indigo-700">เธฟ{q.totalSellingPrice.toLocaleString()}</p>
                  </div>
                  <Link href={`/account/quotations/${q.quotationRef}`} className={`w-full sm:w-auto ${q.status === 'ACTIVE' && !isExpired ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'} px-6 py-3 rounded-xl text-sm font-bold shadow-sm transition-colors text-center whitespace-nowrap`}>
                    เธ”เธนเธฃเธฒเธขเธฅเธฐเน€เธญเธตเธขเธ”
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-sm flex flex-col items-center">
          <div className="w-20 h-20 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mb-6 border border-indigo-100">
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          </div>
          <h3 className="text-xl font-black text-slate-800 mb-2">เธขเธฑเธเนเธกเนเธกเธตเนเธเน€เธชเธเธญเธฃเธฒเธเธฒ</h3>
          <p className="text-slate-500 font-medium mb-8 max-w-sm mx-auto">
            เธเธธเธ“เธชเธฒเธกเธฒเธฃเธ–เนเธซเนเธเธเธฑเธเธเธฒเธเธเธฒเธขเธซเธฃเธทเธญ AI Planner เธเธญเธเน€เธฃเธฒเธเธฑเธ”เธ—เธณเนเธเน€เธชเธเธญเธฃเธฒเธเธฒเธ—เธฑเธงเธฃเนเนเธเธเธเธฅเธธเนเธกเธชเนเธงเธเธ•เธฑเธงเธซเธฃเธทเธญเนเธเนเธเน€เธเธเธเธดเน€เธจเธฉเนเธซเนเธเธธเธ“เนเธ”เน
          </p>
          <div className="flex gap-4">
            <Link href="/account/ai-chats" className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl text-sm font-bold shadow-sm transition-colors flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
              เธเธธเธขเธเธฑเธ AI Planner
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

