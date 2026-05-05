import React from 'react'
import { prisma } from '@/lib/prisma'
import CustomersListClient from './CustomersListClient'

export const dynamic = 'force-dynamic'

export default async function AdminCustomersPage() {
  const customers = await prisma.customer.findMany({
    include: {
      _count: { select: { bookings: true } },
      socialAccounts: { select: { provider: true } }
    },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-800">จัดการลูกค้า (Customers)</h1>
          <p className="text-slate-500 text-sm mt-1">รายชื่อลูกค้าทั้งหมด ประวัติการจอง และการตั้งค่าบัญชี</p>
        </div>
      </div>

      <CustomersListClient customers={customers} />
    </div>
  )
}
