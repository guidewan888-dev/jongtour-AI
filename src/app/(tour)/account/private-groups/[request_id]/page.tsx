export const dynamic = 'force-dynamic';
import React from 'react'
import { createClient } from '@/utils/supabase/server'
import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'

export default async function PrivateGroupDetailPage({ params }: { params: { request_id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const customer = await prisma.customer.findFirst({
    where: { email: user.email }
  })

  if (!customer) redirect('/login')

  const request = await prisma.aiPrivateGroupDraft.findUnique({
    where: { id: params.request_id }
  })

  // Security Guard
  if (!request || request.customerId !== customer.id) {
    notFound()
  }

  const aiItinerary = request.aiItinerary as any[] || []

  return (
    <div className="space-y-6 animate-fade-in-up max-w-4xl">
      
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <Link href="/account/private-groups" className="text-indigo-600 hover:text-indigo-700 text-sm font-bold flex items-center gap-1 mb-2 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
            เธเธฅเธฑเธเนเธเธซเธเนเธฒเธฃเธงเธกเธเธณเธเธญ
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-black text-slate-800">Private Group Request</h1>
            <span className="bg-orange-100 text-orange-700 px-3 py-1.5 rounded-lg text-xs font-black tracking-wider uppercase border border-orange-200">
              {request.status === 'PENDING_SALE' ? 'เธฃเธญเน€เธเนเธฒเธซเธเนเธฒเธ—เธตเนเธ•เธดเธ”เธ•เนเธญเธเธฅเธฑเธ' : request.status}
            </span>
          </div>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
           <Link href={`/account/support?topic=private_group&ref=${request.id}`} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-colors text-center flex-1 md:flex-none flex items-center justify-center gap-2">
             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
             เธ•เธดเธ”เธ•เนเธญเน€เธเนเธฒเธซเธเนเธฒเธ—เธตเน Sale
           </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 md:p-8">
            <h2 className="text-xl font-black text-slate-800 mb-6 border-b border-slate-100 pb-4">เธชเธฃเธธเธเธเธงเธฒเธกเธ•เนเธญเธเธเธฒเธฃ (Requirement Summary)</h2>
            
            <div className="space-y-4">
              <h3 className="text-lg font-black text-indigo-900">เธ—เธฃเธดเธเธชเนเธงเธเธ•เธฑเธงเนเธ {request.destination}</h3>
              <p className="text-sm font-bold text-slate-500">เธชเนเธ•เธฅเนเธเธฒเธฃเธ—เนเธญเธเน€เธ—เธตเนเธขเธง: {request.style || 'เธ—เธฑเนเธงเนเธ'}</p>
              
              <div className="grid grid-cols-2 gap-4 mt-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">เธฃเธฐเธขเธฐเน€เธงเธฅเธฒ</p>
                  <p className="text-sm font-bold text-slate-800">{request.durationDays} เธงเธฑเธ</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">เธเธณเธเธงเธเธเธนเนเน€เธ”เธดเธเธ—เธฒเธ</p>
                  <p className="text-sm font-bold text-slate-800">{request.pax} เธ—เนเธฒเธ</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">เธเธเธเธฃเธฐเธกเธฒเธ“เธ•เนเธญเธ—เนเธฒเธ</p>
                  <p className="text-sm font-bold text-slate-800">{request.budgetPerPax ? `เธฟ${request.budgetPerPax.toLocaleString()}` : 'เนเธกเนเธฃเธฐเธเธธ'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">เธงเธฑเธเธ—เธตเนเธชเนเธเธเธณเธเธญ</p>
                  <p className="text-sm font-bold text-slate-800">{new Date(request.createdAt).toLocaleDateString('th-TH')}</p>
                </div>
              </div>
            </div>

            {request.assumptions && (
              <div className="mt-6 pt-6 border-t border-slate-100">
                <p className="text-[10px] font-black uppercase text-indigo-500 tracking-wider mb-2">เน€เธเธทเนเธญเธเนเธเนเธฅเธฐเธเธฒเธฃเธเธฃเธฐเน€เธกเธดเธเน€เธเธทเนเธญเธเธ•เนเธเธเธฒเธ AI</p>
                <div className="bg-indigo-50 text-indigo-800 p-4 rounded-xl text-sm font-medium whitespace-pre-wrap">
                  {request.assumptions}
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 md:p-8">
            <h3 className="font-black text-slate-800 mb-6">เนเธเธเธเธฒเธฃเน€เธ”เธดเธเธ—เธฒเธเธเธเธฑเธเธฃเนเธฒเธ (AI Draft Itinerary)</h3>
            
            {aiItinerary.length > 0 ? (
              <div className="space-y-6">
                {aiItinerary.map((day: any, idx: number) => (
                  <div key={idx} className="relative pl-6 border-l-2 border-indigo-100 pb-2">
                    <div className="absolute w-3 h-3 bg-indigo-500 rounded-full -left-[7px] top-1.5 ring-4 ring-white"></div>
                    <h4 className="text-md font-black text-slate-800 mb-1">เธงเธฑเธเธ—เธตเน {day.day || idx + 1}: {day.title || 'เธ—เนเธญเธเน€เธ—เธตเนเธขเธง'}</h4>
                    <p className="text-sm text-slate-600 leading-relaxed font-medium">
                      {day.description || day.details || 'เนเธกเนเธกเธตเธฃเธฒเธขเธฅเธฐเน€เธญเธตเธขเธ”'}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-sm font-bold text-slate-500">เธขเธฑเธเนเธกเนเธกเธตเนเธเธเธเธฒเธฃเน€เธ”เธดเธเธ—เธฒเธเธเธเธฑเธเธฃเนเธฒเธ</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Pricing Sidebar */}
        <div className="space-y-6">
          <div className="bg-slate-800 rounded-3xl shadow-sm overflow-hidden text-white relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-600 rounded-full blur-3xl opacity-30 -mr-10 -mt-10"></div>
            <div className="p-6 relative z-10">
              <h3 className="font-black text-lg mb-6">เธเธฃเธฐเน€เธกเธดเธเธฃเธฒเธเธฒเนเธ”เธข AI</h3>
              
              <div className="space-y-3 mb-6 text-sm text-center bg-slate-900/50 p-6 rounded-2xl border border-slate-700/50">
                <span className="text-xs font-black uppercase text-slate-400 tracking-wider mb-1 block">เธฃเธฒเธเธฒเธเธฃเธฐเน€เธกเธดเธเน€เธเธทเนเธญเธเธ•เนเธ (Estimate)</span>
                <span className="font-black text-3xl text-emerald-400 block mb-2">เธฟ{request.estimatedPrice.toLocaleString()}</span>
                <span className="text-xs text-slate-500">เธชเธณเธซเธฃเธฑเธเธเธนเนเน€เธ”เธดเธเธ—เธฒเธ {request.pax} เธ—เนเธฒเธ</span>
              </div>

              <div className="w-full bg-slate-700/50 text-slate-300 px-4 py-3 rounded-xl text-xs font-medium text-center border border-slate-600/50 mt-6 leading-relaxed">
                * เธฃเธฒเธเธฒเธเธตเนเน€เธเนเธเน€เธเธตเธขเธเธเธฒเธฃเธเธฃเธฐเน€เธกเธดเธเน€เธเธทเนเธญเธเธ•เนเธเนเธ”เธข AI เน€เธ—เนเธฒเธเธฑเนเธ เน€เธเนเธฒเธซเธเนเธฒเธ—เธตเนเธเธฐเธ•เธดเธ”เธ•เนเธญเธเธฅเธฑเธเน€เธเธทเนเธญเน€เธชเธเธญเธฃเธฒเธเธฒเธญเธขเนเธฒเธเน€เธเนเธเธ—เธฒเธเธเธฒเธฃเธญเธตเธเธเธฃเธฑเนเธ
              </div>
            </div>
          </div>

          {/* Contact Sale Card */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
             <h3 className="font-black text-slate-800 mb-4">เธชเธ–เธฒเธเธฐเธเธฒเธฃเธ”เธณเน€เธเธดเธเธเธฒเธฃ</h3>
             
             <div className="flex items-center gap-3 mb-4 bg-orange-50 p-4 rounded-xl border border-orange-100">
               <div className="w-10 h-10 bg-orange-200 text-orange-600 rounded-full flex items-center justify-center shrink-0">
                 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
               </div>
               <div>
                 <p className="text-sm font-black text-orange-800">เธฃเธญเธเธฒเธฃเธ•เธดเธ”เธ•เนเธญเธเธฅเธฑเธ</p>
                 <p className="text-xs font-medium text-orange-600">เน€เธเนเธฒเธซเธเนเธฒเธ—เธตเน Sale Manager เธเธณเธฅเธฑเธเธ•เธฃเธงเธเธชเธญเธเนเธฅเธฐเธเธฑเธ”เธ—เธณเนเธเน€เธชเธเธญเธฃเธฒเธเธฒ</p>
               </div>
             </div>

             <div className="space-y-3">
               <Link href={`/account/ai-chats`} className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2">
                 เธเธฅเธฑเธเนเธเธเธธเธขเธเธฑเธ AI Planner
               </Link>
             </div>
          </div>
        </div>

      </div>
    </div>
  )
}

