'use server'

import { createClient } from '@/utils/supabase/server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function upsertCustomerPreference(formData: FormData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }

  const customer = await prisma.customer.findFirst({ where: { email: user.email } })
  if (!customer) return { error: 'Customer not found' }

  try {
    // Parse form data arrays
    const preferredCountries = formData.get('preferredCountries') ? (formData.get('preferredCountries') as string).split(',').map(s => s.trim()).filter(Boolean) : []
    const travelStyle = formData.getAll('travelStyle') as string[]
    const hotelLevel = formData.getAll('hotelLevel') as string[]
    const airlinePreference = formData.getAll('airlinePreference') as string[]
    
    // Parse booleans
    const marketingConsent = formData.get('marketingConsent') === 'true'
    const dealAlerts = formData.get('dealAlerts') === 'true'
    
    // Parse numbers
    const budgetMinRaw = formData.get('budgetMin') as string
    const budgetMaxRaw = formData.get('budgetMax') as string
    const budgetMin = budgetMinRaw ? parseInt(budgetMinRaw) : null
    const budgetMax = budgetMaxRaw ? parseInt(budgetMaxRaw) : null

    const mealPreference = formData.get('mealPreference') as string || null
    const specialNeeds = formData.get('specialNeeds') as string || null

    await prisma.customerPreference.upsert({
      where: { customerId: customer.id },
      update: {
        preferredCountries,
        travelStyle,
        hotelLevel,
        airlinePreference,
        budgetMin,
        budgetMax,
        mealPreference,
        specialNeeds,
        marketingConsent,
        dealAlerts,
      },
      create: {
        customerId: customer.id,
        preferredCountries,
        preferredCities: [], // Default empty
        travelStyle,
        hotelLevel,
        airlinePreference,
        budgetMin,
        budgetMax,
        mealPreference,
        specialNeeds,
        marketingConsent,
        dealAlerts,
      }
    })

    revalidatePath('/account/preferences')
    return { success: true }
  } catch (error) {
    console.error('Error saving preferences:', error)
    return { error: 'ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง' }
  }
}
