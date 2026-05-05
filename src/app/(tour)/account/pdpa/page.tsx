export const dynamic = 'force-dynamic';
import React from 'react'
import { createClient } from '@/utils/supabase/server'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import PdpaClient from './PdpaClient'

export default async function CustomerPdpaPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Find customer and their consent + logs
  const customer = await prisma.customer.findFirst({
    where: { email: user.email },
    include: {
      consent: true,
      consentLogs: {
        orderBy: { createdAt: 'desc' },
        take: 30
      }
    }
  })

  if (!customer) redirect('/login')

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-800">เธเธงเธฒเธกเน€เธเนเธเธชเนเธงเธเธ•เธฑเธงเนเธฅเธฐ PDPA (Data Privacy)</h1>
          <p className="text-slate-500 text-sm mt-1">เธเธฑเธ”เธเธฒเธฃเธชเธดเธ—เธเธดเนเธฅเธฐเธเธณเธขเธดเธเธขเธญเธกเนเธเธเธฒเธฃเนเธเนเธเนเธญเธกเธนเธฅเธชเนเธงเธเธเธธเธเธเธฅเธ•เธฒเธก เธ.เธฃ.เธ. เธเธธเนเธกเธเธฃเธญเธเธเนเธญเธกเธนเธฅเธชเนเธงเธเธเธธเธเธเธฅ</p>
        </div>
      </div>

      <PdpaClient 
        initialConsent={customer.consent} 
        logs={customer.consentLogs} 
      />
    </div>
  )
}

