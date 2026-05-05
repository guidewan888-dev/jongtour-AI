import React from 'react'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export default async function AdminCustomerDetailLayout({ 
  children, 
  params 
}: { 
  children: React.ReactNode
  params: { id: string } 
}) {
  const customer = await prisma.customer.findUnique({
    where: { id: params.id },
    include: {
      user: { include: { agent: true, saleLeads: true } },
      _count: { select: { bookings: true, supportTickets: true } }
    }
  })

  if (!customer) notFound()

  const tabs = [
    { id: 'overview', name: 'Overview' },
    { id: 'profile', name: 'Profile' },
    { id: 'bookings', name: 'Bookings' },
    { id: 'payments', name: 'Payments' },
    { id: 'quotations', name: 'Quotations' },
    { id: 'private-groups', name: 'Private Groups' },
    { id: 'conversations', name: 'Conversations' },
    { id: 'documents', name: 'Documents' },
    { id: 'favorites', name: 'Favorites' },
    { id: 'ai-history', name: 'AI History' },
    { id: 'pdpa', name: 'PDPA' },
    { id: 'audit-log', name: 'Audit Log' },
  ]

  return (
    <div className="space-y-6">
      
      {/* Back Button & Header */}
      <div>
        <Link href="/customers" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors mb-4">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
          กลับหน้ารวมลูกค้า
        </Link>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-indigo-100 text-indigo-700 font-black text-2xl flex items-center justify-center shrink-0 border border-indigo-200 shadow-inner">
              {customer.firstName.charAt(0)}{customer.lastName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-xl font-black text-slate-800">{customer.firstName} {customer.lastName}</h1>
                <span className={`px-2.5 py-1 rounded-md text-[10px] font-black tracking-wider uppercase border ${
                  customer.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 
                  customer.status === 'INACTIVE' ? 'bg-slate-100 text-slate-600 border-slate-200' : 
                  'bg-red-100 text-red-700 border-red-200'
                }`}>
                  {customer.status}
                </span>
                {customer.tags.map(tag => (
                  <span key={tag} className="text-[10px] font-bold text-purple-700 bg-purple-100 border border-purple-200 px-2 py-0.5 rounded-full">{tag}</span>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-500">
                <span className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  {customer.email}
                </span>
                <span className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  {customer.phone}
                </span>
                <span className="text-slate-300">|</span>
                <span>ID: {customer.id}</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button className="bg-white border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition-colors flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Create Booking
            </button>
            <button className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition-colors">
              Actions
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white border-y md:border md:rounded-2xl border-slate-200 shadow-sm overflow-x-auto hide-scrollbar sticky top-0 z-10">
        <nav className="flex px-2 min-w-max">
          {tabs.map(tab => (
            <Link 
              key={tab.id}
              href={`/customers/${customer.id}/${tab.id}`}
              className="px-4 py-3.5 text-xs font-bold text-slate-600 hover:text-indigo-600 hover:bg-slate-50 transition-colors whitespace-nowrap"
            >
              {tab.name}
            </Link>
          ))}
        </nav>
      </div>

      {/* Tab Content Area */}
      <div className="bg-transparent min-h-[500px]">
        {children}
      </div>

    </div>
  )
}
