'use server'

import { createClient } from '@/utils/supabase/server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function createSupportTicket(formData: FormData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }

  const customer = await prisma.customer.findFirst({ where: { email: user.email } })
  if (!customer) return { error: 'Customer not found' }

  const topic = formData.get('topic') as string
  const bookingRef = formData.get('bookingRef') as string
  const priority = formData.get('priority') as string || 'NORMAL'
  const message = formData.get('message') as string

  if (!topic || !message) return { error: 'Missing required fields' }

  try {
    const ticketNo = `TK-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`
    
    const ticket = await prisma.supportTicket.create({
      data: {
        ticketNo,
        customerId: customer.id,
        topic,
        bookingRef: bookingRef || null,
        priority,
        messages: {
          create: {
            senderType: 'CUSTOMER',
            message: message
          }
        }
      }
    })

    revalidatePath('/account/support')
    return { success: true, ticketId: ticket.ticketNo }
  } catch (error) {
    console.error(error)
    return { error: 'Failed to create ticket' }
  }
}

export async function replyToTicket(formData: FormData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }

  const customer = await prisma.customer.findFirst({ where: { email: user.email } })
  if (!customer) return { error: 'Customer not found' }

  const ticketId = formData.get('ticketId') as string
  const message = formData.get('message') as string

  if (!ticketId || !message) return { error: 'Missing required fields' }

  try {
    const ticket = await prisma.supportTicket.findUnique({ where: { id: ticketId } })
    if (!ticket || ticket.customerId !== customer.id) {
      return { error: 'Ticket not found or unauthorized' }
    }

    await prisma.supportMessage.create({
      data: {
        ticketId,
        senderType: 'CUSTOMER',
        message
      }
    })

    await prisma.supportTicket.update({
      where: { id: ticketId },
      data: { updatedAt: new Date() }
    })

    revalidatePath(`/account/support/${ticket.ticketNo}`)
    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: 'Failed to reply' }
  }
}
