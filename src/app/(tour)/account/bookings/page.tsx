export const dynamic = 'force-dynamic';
import React from 'react'
import { createClient } from '@/utils/supabase/server'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import BookingsClient from './BookingsClient'

export default async function CustomerBookingsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const customer = await prisma.customer.findFirst({
    where: { email: user.email },
    include: {
      bookings: {
        include: {
          tour: { include: { images: true } },
          departure: true,
          payments: true,
          vouchers: true
        },
        orderBy: { createdAt: 'desc' }
      }
    }
  })

  if (!customer) {
    redirect('/login')
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-800">ประวัติการจอง (My Bookings)</h1>
          <p className="text-slate-500 text-sm mt-1">ตรวจสอบสถานะ ชำระเงิน และดาวน์โหลดเอกสารการเดินทางของคุณ</p>
        </div>
      </div>

      <BookingsClient bookings={customer.bookings} />

    </div>
  )
}

