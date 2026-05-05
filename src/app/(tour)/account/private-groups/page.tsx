export const dynamic = 'force-dynamic';
import React from 'react'
import { createClient } from '@/utils/supabase/server'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function CustomerPrivateGroupsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const customer = await prisma.customer.findFirst({
    where: { email: user.email }
  })

  if (!customer) redirect('/login')

  const requests = await prisma.aiPrivateGroupDraft.findMany({
    where: { customerId: customer.id },
    orderBy: { createdAt: 'desc' }
  })

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'PENDING_SALE': return <span className="bg-orange-100 text-orange-700 px-2.5 py-1 rounded-md text-[10px] font-black tracking-wider uppercase border border-orange-200">เธฃเธญเน€เธเนเธฒเธซเธเนเธฒเธ—เธตเนเธ•เธดเธ”เธ•เนเธญเธเธฅเธฑเธ (Pending Sale)</span>
      case 'QUOTED': return <span className="bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-md text-[10px] font-black tracking-wider uppercase border border-indigo-200">เธชเนเธเนเธเน€เธชเธเธญเธฃเธฒเธเธฒเนเธฅเนเธง (Quoted)</span>
      case 'REJECTED': return <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md text-[10px] font-black tracking-wider uppercase border border-slate-200">เธขเธเน€เธฅเธดเธ (Cancelled)</span>
      case 'BOOKED': return <span className="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-md text-[10px] font-black tracking-wider uppercase border border-emerald-200">เธขเธทเธเธขเธฑเธเธเธฒเธฃเธเธญเธเนเธฅเนเธง (Booked)</span>
      default: return <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md text-[10px] font-black tracking-wider uppercase border border-slate-200">{status}</span>
    }
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-800">เธเธณเธเธญเธเธฃเธธเนเธเธชเนเธงเธเธ•เธฑเธง (Private Group Requests)</h1>
          <p className="text-slate-500 text-sm mt-1">เธเธฃเธฐเธงเธฑเธ•เธดเธเธฒเธฃเธเธญเธญเธญเธเนเธเธเนเธเนเธเน€เธเธเธ—เธฑเธงเธฃเนเธชเนเธงเธเธ•เธฑเธงเนเธ”เธข AI Planner</p>
        </div>
        <Link href="/account/ai-chats" className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-colors flex items-center justify-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
          เธชเธฃเนเธฒเธเธเธณเธเธญเนเธซเธกเน
        </Link>
      </div>

      {requests.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {requests.map(req => (
            <div key={req.id} className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm hover:border-indigo-300 transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-6 group">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <span className="text-xs font-mono font-bold text-slate-500">REQ: {req.id.slice(-8).toUpperCase()}</span>
                  {getStatusBadge(req.status)}
                </div>
                <Link href={`/account/private-groups/${req.id}`} className="font-black text-slate-800 text-lg hover:text-indigo-600 transition-colors line-clamp-1">
                  เธ—เธฑเธงเธฃเนเธชเนเธงเธเธ•เธฑเธง {req.destination} ({req.durationDays} เธงเธฑเธ)
                </Link>
                <div className="flex flex-wrap gap-x-6 gap-y-2 mt-3 text-sm font-medium text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                    เธเธณเธเธงเธ {req.pax} เธ—เนเธฒเธ
                  </span>
                  <span className="flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    เธเธเธเธฃเธฐเธกเธฒเธ“ {req.budgetPerPax ? `เธฟ${req.budgetPerPax.toLocaleString()} / เธ—เนเธฒเธ` : 'เนเธกเนเนเธ”เนเธฃเธฐเธเธธ'}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    เธชเนเธเธเธณเธเธญเน€เธกเธทเนเธญ {new Date(req.createdAt).toLocaleDateString('th-TH')}
                  </span>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 shrink-0">
                <div className="text-left sm:text-right w-full sm:w-auto">
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">เธฃเธฒเธเธฒเธเธฃเธฐเน€เธกเธดเธเนเธ”เธข AI (Estimate)</p>
                  <p className="text-2xl font-black text-slate-800">เธฟ{req.estimatedPrice.toLocaleString()}</p>
                </div>
                <Link href={`/account/private-groups/${req.id}`} className="w-full sm:w-auto bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 px-6 py-3 rounded-xl text-sm font-bold shadow-sm transition-colors text-center whitespace-nowrap border border-slate-200 hover:border-indigo-200">
                  เธ”เธนเธฃเธฒเธขเธฅเธฐเน€เธญเธตเธขเธ”
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-sm flex flex-col items-center">
          <div className="w-20 h-20 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mb-6 border border-indigo-100">
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
          </div>
          <h3 className="text-xl font-black text-slate-800 mb-2">เธขเธฑเธเนเธกเนเธกเธตเธเธณเธเธญเธเธฃเธธเนเธเธชเนเธงเธเธ•เธฑเธง</h3>
          <p className="text-slate-500 font-medium mb-8 max-w-sm mx-auto">
            เธเธณเธฅเธฑเธเธงเธฒเธเนเธเธเธ—เธฃเธดเธเธชเนเธงเธเธ•เธฑเธงเธชเธณเธซเธฃเธฑเธเธเธฃเธญเธเธเธฃเธฑเธงเธซเธฃเธทเธญเธญเธเธเนเธเธฃเธญเธขเธนเนเนเธเนเนเธซเธก? เนเธซเน AI Planner เธเนเธงเธขเธญเธญเธเนเธเธเธ—เธฃเธดเธเนเธฅเธฐเธเธฃเธฐเน€เธกเธดเธเธฃเธฒเธเธฒเนเธซเนเธเธธเธ“เธเธฃเธต!
          </p>
          <Link href="/account/ai-chats" className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl text-sm font-bold shadow-sm transition-colors">
            เน€เธฃเธดเนเธกเธญเธญเธเนเธเธเธ—เธฃเธดเธเธ”เนเธงเธข AI
          </Link>
        </div>
      )}
    </div>
  )
}

