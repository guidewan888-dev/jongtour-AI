'use server'

import { createClient } from '@/utils/supabase/server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function removeFavoriteTour(tourId: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }

  const customer = await prisma.customer.findFirst({ where: { email: user.email } })
  if (!customer) return { error: 'Customer not found' }

  try {
    await prisma.customerFavorite.delete({
      where: {
        customerId_tourId: {
          customerId: customer.id,
          tourId: tourId
        }
      }
    })
    
    revalidatePath('/account/favorites')
    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: 'Failed to remove favorite' }
  }
}

export async function markNotificationAsRead(notificationId: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }

  const customer = await prisma.customer.findFirst({ where: { email: user.email } })
  if (!customer) return { error: 'Customer not found' }

  try {
    const notification = await prisma.notification.findUnique({ where: { id: notificationId } })
    if (!notification || notification.customerId !== customer.id) {
       return { error: 'Notification not found' }
    }

    await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true }
    })
    
    revalidatePath('/account/notifications')
    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: 'Failed to mark as read' }
  }
}

export async function markAllNotificationsAsRead() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }

  const customer = await prisma.customer.findFirst({ where: { email: user.email } })
  if (!customer) return { error: 'Customer not found' }

  try {
    await prisma.notification.updateMany({
      where: { customerId: customer.id, isRead: false },
      data: { isRead: true }
    })
    
    revalidatePath('/account/notifications')
    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: 'Failed to mark all as read' }
  }
}
