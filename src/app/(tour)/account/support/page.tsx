export const dynamic = 'force-dynamic';
import React from 'react'
import { createClient } from '@/utils/supabase/server'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import CreateTicketClient from './CreateTicketClient'

export default async function CustomerSupportPage({ searchParams }: { searchParams: { topic?: string, ref?: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const customer = await prisma.customer.findFirst({
    where: { email: user.email }
  })

  if (!customer) redirect('/login')

  const tickets = await prisma.supportTicket.findMany({
    where: { customerId: customer.id },
    orderBy: { updatedAt: 'desc' }
  })

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'OPEN': return <span className="bg-blue-100 text-blue-700 px-2.5 py-1 rounded-md text-[10px] font-black tracking-wider uppercase border border-blue-200">รอดำเนินการ (Open)</span>
      case 'IN_PROGRESS': return <span className="bg-orange-100 text-orange-700 px-2.5 py-1 rounded-md text-[10px] font-black tracking-wider uppercase border border-orange-200">กำลังตรวจสอบ (In Progress)</span>
      case 'RESOLVED': return <span className="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-md text-[10px] font-black tracking-wider uppercase border border-emerald-200">แก้ไขแล้ว (Resolved)</span>
      case 'CLOSED': return <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md text-[10px] font-black tracking-wider uppercase border border-slate-200">ปิดงาน (Closed)</span>
      default: return <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md text-[10px] font-black tracking-wider uppercase border border-slate-200">{status}</span>
    }
  }

  const getPriorityBadge = (priority: string) => {
    if (priority === 'URGENT' || priority === 'HIGH') {
       return <span className="text-red-600 font-black text-xs uppercase tracking-wider flex items-center gap-1"><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>ด่วน</span>
    }
    return <span className="text-slate-400 font-bold text-xs uppercase tracking-wider">ปกติ</span>
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-800">ศูนย์ช่วยเหลือ (Support)</h1>
          <p className="text-slate-500 text-sm mt-1">ติดต่อเจ้าหน้าที่ แจ้งปัญหา หรือสอบถามข้อมูลเพิ่มเติม</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Create Form */}
        <div className="lg:col-span-1 space-y-6 order-2 lg:order-1">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8 sticky top-24">
            <h2 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
               <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
               เปิด Ticket ใหม่
            </h2>
            <CreateTicketClient prefilledTopic={searchParams.topic || ''} prefilledRef={searchParams.ref || ''} />
          </div>
        </div>

        {/* Right: Ticket List */}
        <div className="lg:col-span-2 order-1 lg:order-2">
          <h2 className="text-lg font-black text-slate-800 mb-4">ประวัติการติดต่อของคุณ</h2>
          
          {tickets.length > 0 ? (
            <div className="space-y-4">
              {tickets.map(ticket => (
                <Link href={`/account/support/${ticket.ticketNo}`} key={ticket.id} className="block bg-white border border-slate-200 rounded-2xl p-5 hover:border-indigo-300 transition-colors shadow-sm group">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-xs font-mono font-bold text-slate-500">TK: {ticket.ticketNo}</span>
                        {getStatusBadge(ticket.status)}
                      </div>
                      <h3 className="text-base font-black text-slate-800 group-hover:text-indigo-600 transition-colors">
                        {ticket.topic === 'tax_invoice' ? 'ขอใบกำกับภาษีเต็มรูปแบบ' : ticket.topic.replace('_', ' ').toUpperCase()}
                      </h3>
                      {ticket.bookingRef && (
                        <p className="text-xs font-bold text-slate-400 mt-1">Ref: {ticket.bookingRef}</p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      {getPriorityBadge(ticket.priority)}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center text-xs text-slate-500 font-medium bg-slate-50 p-2.5 rounded-xl">
                    <span className="flex items-center gap-1">
                      อัปเดตล่าสุด: {new Date(ticket.updatedAt).toLocaleString('th-TH')}
                    </span>
                    <span className="text-indigo-500 font-bold flex items-center gap-1 group-hover:underline">
                      ดูบทสนทนา &rarr;
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-sm flex flex-col items-center">
              <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
              </div>
              <p className="text-slate-500 font-medium text-sm">ยังไม่มีประวัติการติดต่อ</p>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

