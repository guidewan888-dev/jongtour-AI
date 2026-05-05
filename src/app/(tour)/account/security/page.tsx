export const dynamic = 'force-dynamic';
import React from 'react'
import { createClient } from '@/utils/supabase/server'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import SecurityClient from './SecurityClient'

export default async function CustomerSecurityPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const customer = await prisma.customer.findFirst({
    where: { email: user.email },
    include: {
      socialAccounts: true,
      loginHistory: {
        orderBy: { createdAt: 'desc' },
        take: 20
      }
    }
  })

  if (!customer) redirect('/login')

  // Check if user has password set in Supabase
  // Users authenticated via OAuth without setting a password often don't have one
  // Supabase identity providers
  const hasPassword = user.app_metadata.providers?.includes('email') || false

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-800">เธเธงเธฒเธกเธเธฅเธญเธ”เธ เธฑเธข (Security Settings)</h1>
          <p className="text-slate-500 text-sm mt-1">เธเธฑเธ”เธเธฒเธฃเธฃเธซเธฑเธชเธเนเธฒเธ เธเธฑเธเธเธตเนเธเน€เธเธตเธขเธฅ เนเธฅเธฐเธ•เธฃเธงเธเธชเธญเธเธเธดเธเธเธฃเธฃเธกเธเธฒเธฃเน€เธเนเธฒเธชเธนเนเธฃเธฐเธเธ</p>
        </div>
      </div>

      <SecurityClient 
        hasPassword={hasPassword}
        socialAccounts={customer.socialAccounts}
        loginHistory={customer.loginHistory}
      />
    </div>
  )
}

