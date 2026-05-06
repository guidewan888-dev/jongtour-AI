export const dynamic = 'force-dynamic';
import React from 'react'
import { createClient } from '@/utils/supabase/server'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import ProfileClient from './ProfileClient'

export default async function CustomerProfilePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const customer = await prisma.customer.findFirst({
    where: { email: user.email }
  })

  const profile = await prisma.userProfile.findUnique({
    where: { userId: user.id }
  })

  if (!customer) {
    redirect('/login')
  }

  // Determine avatar letter
  const initial = customer.firstName ? customer.firstName.charAt(0).toUpperCase() : 'U'

  return (
    <div className="space-y-6 animate-fade-in-up max-w-3xl">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-800">ข้อมูลส่วนตัว (Profile)</h1>
          <p className="text-slate-500 text-sm mt-1">จัดการข้อมูลส่วนตัว ข้อมูลติดต่อ และความชอบในการเดินทาง</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-8">
        
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row gap-8 items-start mb-10 pb-8 border-b border-slate-100">
          <div className="w-24 h-24 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-3xl font-black shrink-0 relative group cursor-pointer shadow-inner">
            {initial}
            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </div>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-black text-slate-800">{customer.firstName} {customer.lastName}</h2>
            <p className="text-slate-500 font-medium">Jongtour Member</p>
            <div className="flex flex-wrap gap-2 mt-4">
              {user.email_confirmed_at ? (
                <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-md text-[10px] font-black tracking-wider uppercase border border-emerald-200 flex items-center gap-1 shadow-sm">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  Email Verified
                </span>
              ) : (
                <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-md text-[10px] font-black tracking-wider uppercase border border-amber-200 flex items-center gap-1 shadow-sm">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  Email Not Verified
                </span>
              )}
              {profile?.preferences && (profile.preferences as any).allergy_note && (
                <span className="bg-red-100 text-red-700 px-3 py-1 rounded-md text-[10px] font-black tracking-wider uppercase border border-red-200 flex items-center gap-1 shadow-sm">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  Allergy Notes
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Client Form */}
        <ProfileClient customer={customer} profile={profile} userEmail={user.email || ''} />

      </div>
    </div>
  )
}

