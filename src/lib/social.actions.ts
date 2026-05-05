'use server'

import { createClient } from '@/utils/supabase/server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function disconnectSocialAccount(provider: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }

  const customer = await prisma.customer.findFirst({
    where: { email: user.email },
    include: { socialAccounts: true }
  })

  if (!customer) return { error: 'Customer not found' }

  // Check safety rule: If no password and only 1 social account, block disconnection
  const hasPassword = user.app_metadata.providers?.includes('email') || false
  if (!hasPassword && customer.socialAccounts.length <= 1) {
    return { error: 'คุณต้องตั้งรหัสผ่าน หรือเชื่อมต่อโซเชียลบัญชีอื่นก่อน จึงจะสามารถยกเลิกการเชื่อมต่อบัญชีนี้ได้' }
  }

  try {
    // Note: To fully disconnect from Supabase Auth, you would call `supabase.auth.unlinkIdentity(identity)` 
    // Here we mainly remove our internal Prisma mapping so it doesn't show in the UI and blocks our custom sync.
    // Full unlink requires fetching user identities first.
    const { data: identitiesData } = await supabase.auth.getUserIdentities()
    if (identitiesData && identitiesData.identities) {
      const identity = identitiesData.identities.find(id => id.provider === provider)
      if (identity) {
        await supabase.auth.unlinkIdentity(identity)
      }
    }

    await prisma.customerSocialAccount.deleteMany({
      where: {
        customerId: customer.id,
        provider: provider
      }
    })

    revalidatePath('/account/social-connections')
    revalidatePath('/account/security')
    return { success: true }
  } catch (error) {
    console.error('Error disconnecting social account:', error)
    return { error: 'เกิดข้อผิดพลาดในการยกเลิกการเชื่อมต่อ' }
  }
}

export async function connectSocialAccount(provider: string) {
  // Initiates an OAuth sign-in which links to the current session if user is logged in
  // Usually this is done on the client via supabase.auth.linkIdentity()
  // But we can return the auth URL to redirect if needed, or handle client-side.
  // Returning an error here since the actual linking should be done client-side with linkIdentity.
  return { error: 'Please use client-side supabase.auth.linkIdentity' }
}
