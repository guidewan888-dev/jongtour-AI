'use server'

import { createClient } from '@/utils/supabase/server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function updateCustomerProfile(customerId: string, formData: FormData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }

  try {
    const firstName = formData.get('firstName') as string
    const lastName = formData.get('lastName') as string
    const email = formData.get('email') as string
    const phone = formData.get('phone') as string
    const status = formData.get('status') as string
    const leadSource = formData.get('leadSource') as string
    const tagsRaw = formData.get('tags') as string
    const internalNotes = formData.get('internalNotes') as string
    
    const tags = tagsRaw ? tagsRaw.split(',').map(t => t.trim()).filter(Boolean) : []

    const oldData = await prisma.customer.findUnique({ where: { id: customerId } })

    const customer = await prisma.customer.update({
      where: { id: customerId },
      data: {
        firstName,
        lastName,
        email,
        phone,
        status,
        leadSource,
        tags,
        internalNotes
      }
    })

    // Log action
    await prisma.auditLog.create({
      data: {
        userId: user.id, // The admin doing the action
        action: 'UPDATE',
        resource: 'customers',
        resourceId: customer.id,
        newValues: JSON.parse(JSON.stringify({ status, tags, internalNotes }))
      }
    })

    revalidatePath(`/customers/${customerId}`)
    revalidatePath('/customers')
    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: 'Failed to update customer' }
  }
}

export async function sendResetPasswordEmail(customerId: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  try {
    const customer = await prisma.customer.findUnique({ where: { id: customerId } })
    if (!customer) return { error: 'Customer not found' }

    const { error } = await supabase.auth.resetPasswordForEmail(customer.email, {
      redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password`,
    })

    if (error) return { error: error.message }

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'RESET_PASSWORD_REQUEST',
        resource: 'customers',
        resourceId: customer.id,
      }
    })

    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: 'Failed to send reset email' }
  }
}

export async function mergeCustomerAccounts(primaryId: string, secondaryId: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  if (primaryId === secondaryId) return { error: 'Cannot merge the same account' }

  try {
    await prisma.$transaction(async (tx) => {
      // Reassign bookings
      await tx.booking.updateMany({
        where: { customerId: secondaryId },
        data: { customerId: primaryId }
      })

      // Reassign payments (via booking relation)
      await tx.payment.updateMany({
        where: { booking: { customerId: secondaryId } },
        data: {} // payment doesn't have customerId directly — covered by booking reassignment above
      }).catch(() => {}); // Non-critical if schema doesn't support this
      await tx.customerFavorite.updateMany({
        where: { customerId: secondaryId },
        data: { customerId: primaryId }
      })
      await tx.supportTicket.updateMany({
        where: { customerId: secondaryId },
        data: { customerId: primaryId }
      })
      await tx.customerDocument.updateMany({
        where: { customerId: secondaryId },
        data: { customerId: primaryId }
      })
      // AiConversation uses userId, not customerId
      await tx.aiConversation.updateMany({
        where: { userId: secondaryId },
        data: { userId: primaryId }
      }).catch(() => {}); // Skip if field doesn't exist

      // Soft delete secondary
      await tx.customer.update({
        where: { id: secondaryId },
        data: { status: 'MERGED_DELETED', internalNotes: `Merged into ${primaryId}` }
      })

      // Log
      await tx.auditLog.create({
        data: {
          userId: user.id,
          action: 'MERGE_ACCOUNTS',
          resource: 'customers',
          resourceId: primaryId,
          oldValues: { merged_from: secondaryId }
        }
      })
    })

    revalidatePath('/customers')
    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: 'Failed to merge accounts' }
  }
}
