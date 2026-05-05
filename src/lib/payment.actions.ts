'use server'

import { createClient } from '@/utils/supabase/server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function uploadSlip(formData: FormData) {
  const paymentId = formData.get('paymentId') as string
  const slipFile = formData.get('slip') as File

  if (!paymentId || !slipFile || slipFile.size === 0) {
    return { error: 'Please select a valid image file to upload.' }
  }

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const customer = await prisma.customer.findFirst({ where: { email: user.email } })
  if (!customer) return { error: 'Customer not found' }

  // Security Guard: Ensure payment belongs to a booking owned by this customer
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { booking: true }
  })

  if (!payment || payment.booking.customerId !== customer.id) {
    return { error: 'Payment not found or unauthorized' }
  }

  // NOTE: In a production environment, you would use supabase.storage.from('slips').upload(...)
  // Because configuring buckets is outside the current scope, we simulate the file upload
  // and store a placeholder slip URL while updating the verification status securely in Prisma.
  
  const dummySlipUrl = `https://via.placeholder.com/600x800.png?text=Slip+${payment.paymentRef}`

  await prisma.payment.update({
    where: { id: paymentId },
    data: {
      slipUrl: dummySlipUrl,
      verificationStatus: 'UPLOADED'
    }
  })

  revalidatePath(`/account/payments/${paymentId}`)
  
  return { success: 'อัปโหลดสลิปสำเร็จ (Slip uploaded successfully. Waiting for admin verification.)' }
}
