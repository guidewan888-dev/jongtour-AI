export const dynamic = 'force-dynamic';
import React from 'react'
import { createClient } from '@/utils/supabase/server'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function CustomerAiChatsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || !user.email) redirect('/login')

  const customer = await prisma.customer.findFirst({
    where: { email: user.email }
  })

  if (!customer) redirect('/login')

  // Find User record to link AiConversation if it exists
  const dbUser = await prisma.user.findUnique({
    where: { email: user.email }
  })

  // We fetch AI conversations tied to the user's ID
  const conversations = await prisma.aiConversation.findMany({
    where: { 
      userId: dbUser?.id || 'NO_USER_ID' // Fallback to avoid matching nulls to all anonymous
    },
    include: {
      AiMessage: {
        orderBy: { createdAt: 'desc' },
        take: 1
      }
    },
    orderBy: { updatedAt: 'desc' }
  })

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-800">ประวัติการคุยกับ AI Planner</h1>
          <p className="text-slate-500 text-sm mt-1">บทสนทนาและแพลนเที่ยวที่ให้ AI ช่วยออกแบบ</p>
        </div>
        <Link href="/ai-center" className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-colors flex items-center justify-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
          เริ่มคุยใหม่ (New Chat)
        </Link>
      </div>

      {conversations.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {conversations.map(chat => {
            const lastMessage = chat.AiMessage[0]
            
            return (
              <div key={chat.id} className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm hover:border-indigo-300 transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-6 group">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <span className="text-xs font-mono font-bold text-slate-500">ID: {chat.sessionId.slice(-8).toUpperCase()}</span>
                    {chat.status === 'ACTIVE' ? (
                       <span className="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-md text-[10px] font-black tracking-wider uppercase border border-emerald-200">กำลังคุย (Active)</span>
                    ) : (
                       <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md text-[10px] font-black tracking-wider uppercase border border-slate-200">จบสนทนา (Closed)</span>
                    )}
                  </div>
                  <h3 className="font-black text-slate-800 text-lg line-clamp-1 mb-1">
                    {chat.summary || 'บทสนทนาการจัดทริป'}
                  </h3>
                  {lastMessage && (
                    <p className="text-sm font-medium text-slate-500 line-clamp-1 italic mb-3">
                      "{lastMessage.content ?? "".slice(0, 100)}{lastMessage.content ?? "".length > 100 ? '...' : ''}"
                    </p>
                  )}
                  <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      อัปเดตล่าสุด: {new Date(chat.updatedAt).toLocaleString('th-TH')}
                    </span>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 shrink-0">
                  <Link href={`/ai-planner?session=${chat.sessionId}`} className="w-full sm:w-auto bg-white border border-slate-200 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 hover:border-indigo-200 px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-colors text-center whitespace-nowrap flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                    คุยต่อ
                  </Link>
                  <Link href={`/account/support?topic=ai_booking_assist&ref=${chat.sessionId}`} className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-colors text-center whitespace-nowrap">
                    ให้พนักงานช่วยจอง
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-sm flex flex-col items-center">
          <div className="w-20 h-20 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mb-6 border border-indigo-100">
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
          </div>
          <h3 className="text-xl font-black text-slate-800 mb-2">ยังไม่มีประวัติการคุยกับ AI</h3>
          <p className="text-slate-500 font-medium mb-8 max-w-sm mx-auto">
            คุณสามารถให้ AI Planner ช่วยค้นหาทัวร์ เปรียบเทียบราคา หรือออกแบบทริปส่วนตัวให้คุณได้ฟรีตลอด 24 ชั่วโมง
          </p>
          <Link href="/ai-center" className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl text-sm font-bold shadow-sm transition-colors">
            เริ่มคุยกับ AI เลย
          </Link>
        </div>
      )}
    </div>
  )
}

