'use server'

import { createClient } from '@/utils/supabase/server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function updateConsentStatus(formData: FormData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }

  const customer = await prisma.customer.findFirst({
    where: { email: user.email },
    include: { consent: true }
  })
  
  if (!customer) return { error: 'Customer not found' }

  const type = formData.get('type') as string // 'PRIVACY', 'MARKETING', 'DATA_USAGE'
  const value = formData.get('value') === 'true'

  if (!['PRIVACY', 'MARKETING', 'DATA_USAGE'].includes(type)) {
    return { error: 'Invalid consent type' }
  }

  try {
    const currentConsent = customer.consent
    const oldVal = currentConsent ? (
      type === 'PRIVACY' ? currentConsent.privacyAccepted :
      type === 'MARKETING' ? currentConsent.marketingConsent :
      currentConsent.dataUsageConsent
    ) : false

    if (oldVal === value) return { success: true } // No change needed

    const action = value ? `OPT_IN_${type}` : `OPT_OUT_${type}`

    // Start Transaction: Upsert Consent + Insert Log
    await prisma.$transaction(async (tx) => {
      // 1. Upsert Consent
      await tx.customerConsent.upsert({
        where: { customerId: customer.id },
        update: {
          privacyAccepted: type === 'PRIVACY' ? value : undefined,
          marketingConsent: type === 'MARKETING' ? value : undefined,
          dataUsageConsent: type === 'DATA_USAGE' ? value : undefined,
          updatedAt: new Date()
        },
        create: {
          customerId: customer.id,
          privacyAccepted: type === 'PRIVACY' ? value : false,
          marketingConsent: type === 'MARKETING' ? value : false,
          dataUsageConsent: type === 'DATA_USAGE' ? value : false,
        }
      })

      // 2. Insert Log
      await tx.consentLog.create({
        data: {
          customerId: customer.id,
          action,
          consentType: type,
          ipAddress: 'Logged by Server', // IP parsing would usually require headers() in a real middleware
          userAgent: 'Portal Action'
        }
      })

      // Sync with preferences table if marketing consent changes
      if (type === 'MARKETING') {
        await tx.customerPreference.updateMany({
          where: { customerId: customer.id },
          data: { marketingConsent: value }
        })
      }
    })

    revalidatePath('/account/pdpa')
    return { success: true }
  } catch (error) {
    console.error('Consent update error:', error)
    return { error: 'ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง' }
  }
}

export async function requestDataExport() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }

  const customer = await prisma.customer.findFirst({ where: { email: user.email } })
  if (!customer) return { error: 'Customer not found' }

  try {
    // Generate a Support Ticket for the admin team
    const ticketNo = `TK-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`
    await prisma.supportTicket.create({
      data: {
        ticketNo,
        customerId: customer.id,
        topic: 'data_export_request',
        priority: 'NORMAL',
        messages: {
          create: {
            senderType: 'CUSTOMER',
            message: 'ขอดาวน์โหลดสำเนาข้อมูลส่วนบุคคลของฉัน (Data Export Request) ตามสิทธิ์ PDPA'
          }
        }
      }
    })

    return { success: true, ticketId: ticketNo }
  } catch (error) {
    console.error(error)
    return { error: 'เกิดข้อผิดพลาดในการส่งคำขอ' }
  }
}

export async function safeRequestAccountDeletion() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }

  const customer = await prisma.customer.findFirst({
    where: { email: user.email },
    include: {
      bookings: {
        where: {
          status: { in: ['CONFIRMED', 'WAITING_CONFIRM', 'WAITING_PAYMENT'] }
        }
      }
    }
  })
  
  if (!customer) return { error: 'Customer not found' }

  if (customer.bookings.length > 0) {
    return { error: 'ไม่สามารถลบข้อมูลได้ เนื่องจากคุณยังมีรายการจองที่รอการเดินทางหรือค้างชำระอยู่ กรุณาติดต่อพนักงาน' }
  }

  try {
    // Generate a Support Ticket for the admin team to safely delete data later
    const ticketNo = `TK-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`
    await prisma.supportTicket.create({
      data: {
        ticketNo,
        customerId: customer.id,
        topic: 'account_deletion_request',
        priority: 'HIGH',
        messages: {
          create: {
            senderType: 'CUSTOMER',
            message: 'ขอลบข้อมูลส่วนบุคคลและยกเลิกบัญชีนี้ (Account Deletion Request) ตามสิทธิ์ PDPA'
          }
        }
      }
    })

    return { success: true, ticketId: ticketNo }
  } catch (error) {
    console.error(error)
    return { error: 'เกิดข้อผิดพลาดในการส่งคำขอ' }
  }
}
