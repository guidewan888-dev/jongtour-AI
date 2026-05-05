export const dynamic = 'force-dynamic';
import React from 'react'
import { createClient } from '@/utils/supabase/server'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import SocialConnectionsClient from './SocialConnectionsClient'

export default async function CustomerSocialConnectionsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const customer = await prisma.customer.findFirst({
    where: { email: user.email },
    include: {
      socialAccounts: true
    }
  })

  if (!customer) redirect('/login')

  // Check if user has password set in Supabase
  const hasPassword = user.app_metadata.providers?.includes('email') || false

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-800">เน€เธเธทเนเธญเธกเธ•เนเธญเธเธฑเธเธเธต (Social Connections)</h1>
          <p className="text-slate-500 text-sm mt-1">เธเธฑเธ”เธเธฒเธฃเธเธฒเธฃเน€เธเนเธฒเธชเธนเนเธฃเธฐเธเธเธเนเธฒเธ Google, LINE เนเธฅเธฐ Facebook</p>
        </div>
      </div>

      <SocialConnectionsClient 
        hasPassword={hasPassword}
        socialAccounts={customer.socialAccounts.map(acc => ({
          provider: acc.provider,
          providerEmail: acc.providerEmail,
          displayName: acc.displayName,
          linkedAt: acc.linkedAt
        }))}
      />
    </div>
  )
}

