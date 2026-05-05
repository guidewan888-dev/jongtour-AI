export const dynamic = 'force-dynamic';
import React from 'react'
import { createClient } from '@/utils/supabase/server'
import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import TicketReplyClient from './TicketReplyClient'

export default async function SupportTicketDetailPage({ params }: { params: { ticket_id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const customer = await prisma.customer.findFirst({
    where: { email: user.email }
  })

  if (!customer) redirect('/login')

  const ticket = await prisma.supportTicket.findUnique({
    where: { ticketNo: params.ticket_id },
    include: {
      messages: { orderBy: { createdAt: 'asc' } },
      staff: true
    }
  })

  // Security guard
  if (!ticket || ticket.customerId !== customer.id) {
    notFound()
  }

  return (
    <div className="space-y-6 animate-fade-in-up max-w-4xl">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <Link href="/account/support" className="text-indigo-600 hover:text-indigo-700 text-sm font-bold flex items-center gap-1 mb-2 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
            เธเธฅเธฑเธเธซเธเนเธฒเธฃเธงเธก Ticket
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-black text-slate-800">TK: {ticket.ticketNo}</h1>
            <span className={`px-3 py-1 rounded-lg text-xs font-black tracking-wider uppercase border ${
              ticket.status === 'CLOSED' ? 'bg-slate-100 text-slate-600 border-slate-200' :
              ticket.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
              ticket.status === 'IN_PROGRESS' ? 'bg-orange-100 text-orange-700 border-orange-200' :
              'bg-blue-100 text-blue-700 border-blue-200'
            }`}>
              {ticket.status}
            </span>
          </div>
          <p className="text-slate-500 text-sm font-bold mt-2">
            เธซเธกเธงเธ”เธซเธกเธนเน: {ticket.topic.toUpperCase()} {ticket.bookingRef ? `| เธญเนเธฒเธเธญเธดเธ: ${ticket.bookingRef}` : ''}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="space-y-4 mb-8">
        {ticket.messages.map((msg, idx) => {
          const isCustomer = msg.senderType === 'CUSTOMER'
          return (
            <div key={msg.id} className={`flex ${isCustomer ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] md:max-w-[75%] rounded-3xl p-5 shadow-sm ${
                isCustomer 
                  ? 'bg-indigo-600 text-white rounded-tr-sm' 
                  : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm'
              }`}>
                <div className={`text-[10px] font-bold uppercase tracking-wider mb-2 flex items-center gap-2 ${isCustomer ? 'text-indigo-200' : 'text-slate-400'}`}>
                   {isCustomer ? 'เธเธธเธ“ (Customer)' : `เน€เธเนเธฒเธซเธเนเธฒเธ—เธตเน (Staff) ${ticket.staff ? `- ${ticket.staff.email}` : ''}`}
                   <span className="opacity-50">โ€ข</span>
                   {new Date(msg.createdAt).toLocaleString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                </div>
                <p className={`text-sm whitespace-pre-wrap leading-relaxed font-medium ${isCustomer ? 'text-white' : 'text-slate-700'}`}>
                  {msg.message}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Reply Box */}
      <TicketReplyClient ticketId={ticket.id} isClosed={ticket.status === 'CLOSED'} />
    </div>
  )
}

