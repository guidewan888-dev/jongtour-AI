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
            กลับหน้ารวมคำขอ
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-black text-slate-800">Private Group Request</h1>
            <span className="bg-orange-100 text-orange-700 px-3 py-1.5 rounded-lg text-xs font-black tracking-wider uppercase border border-orange-200">
              {request.status === 'PENDING_SALE' ? 'รอเจ้าหน้าที่ติดต่อกลับ' : request.status}
            </span>
          </div>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
           <Link href={`/account/support?topic=private_group&ref=${request.id}`} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-colors text-center flex-1 md:flex-none flex items-center justify-center gap-2">
             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
             ติดต่อเจ้าหน้าที่ Sale
           </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 md:p-8">
            <h2 className="text-xl font-black text-slate-800 mb-6 border-b border-slate-100 pb-4">สรุปความต้องการ (Requirement Summary)</h2>
            
            <div className="space-y-4">
              <h3 className="text-lg font-black text-indigo-900">ทริปส่วนตัวไป {request.destination}</h3>
              <p className="text-sm font-bold text-slate-500">สไตล์การท่องเที่ยว: {request.style || 'ทั่วไป'}</p>
              
              <div className="grid grid-cols-2 gap-4 mt-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">ระยะเวลา</p>
                  <p className="text-sm font-bold text-slate-800">{request.durationDays} วัน</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">จำนวนผู้เดินทาง</p>
                  <p className="text-sm font-bold text-slate-800">{request.pax} ท่าน</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">งบประมาณต่อท่าน</p>
                  <p className="text-sm font-bold text-slate-800">{request.budgetPerPax ? `฿${request.budgetPerPax.toLocaleString()}` : 'ไม่ระบุ'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">วันที่ส่งคำขอ</p>
                  <p className="text-sm font-bold text-slate-800">{new Date(request.createdAt).toLocaleDateString('th-TH')}</p>
                </div>
              </div>
            </div>

            {request.assumptions && (
              <div className="mt-6 pt-6 border-t border-slate-100">
                <p className="text-[10px] font-black uppercase text-indigo-500 tracking-wider mb-2">เงื่อนไขและการประเมินเบื้องต้นจาก AI</p>
                <div className="bg-indigo-50 text-indigo-800 p-4 rounded-xl text-sm font-medium whitespace-pre-wrap">
                  {request.assumptions}
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 md:p-8">
            <h3 className="font-black text-slate-800 mb-6">แผนการเดินทางฉบับร่าง (AI Draft Itinerary)</h3>
            
            {aiItinerary.length > 0 ? (
              <div className="space-y-6">
                {aiItinerary.map((day: any, idx: number) => (
                  <div key={idx} className="relative pl-6 border-l-2 border-indigo-100 pb-2">
                    <div className="absolute w-3 h-3 bg-indigo-500 rounded-full -left-[7px] top-1.5 ring-4 ring-white"></div>
                    <h4 className="text-md font-black text-slate-800 mb-1">วันที่ {day.day || idx + 1}: {day.title || 'ท่องเที่ยว'}</h4>
                    <p className="text-sm text-slate-600 leading-relaxed font-medium">
                      {day.description || day.details || 'ไม่มีรายละเอียด'}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-sm font-bold text-slate-500">ยังไม่มีแผนการเดินทางฉบับร่าง</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Pricing Sidebar */}
        <div className="space-y-6">
          <div className="bg-slate-800 rounded-3xl shadow-sm overflow-hidden text-white relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-600 rounded-full blur-3xl opacity-30 -mr-10 -mt-10"></div>
            <div className="p-6 relative z-10">
              <h3 className="font-black text-lg mb-6">ประเมินราคาโดย AI</h3>
              
              <div className="space-y-3 mb-6 text-sm text-center bg-slate-900/50 p-6 rounded-2xl border border-slate-700/50">
                <span className="text-xs font-black uppercase text-slate-400 tracking-wider mb-1 block">ราคาประเมินเบื้องต้น (Estimate)</span>
                <span className="font-black text-3xl text-emerald-400 block mb-2">฿{request.estimatedPrice.toLocaleString()}</span>
                <span className="text-xs text-slate-500">สำหรับผู้เดินทาง {request.pax} ท่าน</span>
              </div>

              <div className="w-full bg-slate-700/50 text-slate-300 px-4 py-3 rounded-xl text-xs font-medium text-center border border-slate-600/50 mt-6 leading-relaxed">
                * ราคานี้เป็นเพียงการประเมินเบื้องต้นโดย AI เท่านั้น เจ้าหน้าที่จะติดต่อกลับเพื่อเสนอราคาอย่างเป็นทางการอีกครั้ง
              </div>
            </div>
          </div>

          {/* Contact Sale Card */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
             <h3 className="font-black text-slate-800 mb-4">สถานะการดำเนินการ</h3>
             
             <div className="flex items-center gap-3 mb-4 bg-orange-50 p-4 rounded-xl border border-orange-100">
               <div className="w-10 h-10 bg-orange-200 text-orange-600 rounded-full flex items-center justify-center shrink-0">
                 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
               </div>
               <div>
                 <p className="text-sm font-black text-orange-800">รอการติดต่อกลับ</p>
                 <p className="text-xs font-medium text-orange-600">เจ้าหน้าที่ Sale Manager กำลังตรวจสอบและจัดทำใบเสนอราคา</p>
               </div>
             </div>

             <div className="space-y-3">
               <Link href={`/account/ai-chats`} className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2">
                 กลับไปคุยกับ AI Planner
               </Link>
             </div>
          </div>
        </div>

      </div>
    </div>
  )
}

