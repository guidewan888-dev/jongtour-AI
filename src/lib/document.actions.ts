'use server'

import { createClient } from '@/utils/supabase/server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function uploadCustomerDocument(formData: FormData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }

  const customer = await prisma.customer.findFirst({ where: { email: user.email } })
  if (!customer) return { error: 'Customer not found' }

  const file = formData.get('file') as File
  const documentType = formData.get('documentType') as string
  const bookingId = formData.get('bookingId') as string

  if (!file || !documentType) return { error: 'Missing required fields' }

  // Restrict file size to 10MB
  if (file.size > 10 * 1024 * 1024) {
    return { error: 'File size exceeds 10MB limit' }
  }

  try {
    const fileExt = file.name.split('.').pop()
    const fileName = `${customer.id}/${documentType}_${Date.now()}.${fileExt}`

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('customer-documents')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('Supabase storage error:', uploadError)
      return { error: 'Failed to upload file to storage. Please ensure the bucket exists.' }
    }

    const { data: { publicUrl } } = supabase.storage
      .from('customer-documents')
      .getPublicUrl(fileName)

    await prisma.customerDocument.create({
      data: {
        customerId: customer.id,
        bookingId: bookingId || null,
        documentType,
        fileUrl: publicUrl,
        fileName: file.name,
        fileSize: file.size,
        status: 'PENDING'
      }
    })

    revalidatePath('/account/documents')
    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: 'An unexpected error occurred during upload.' }
  }
}

export async function deleteCustomerDocument(documentId: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }

  const customer = await prisma.customer.findFirst({ where: { email: user.email } })
  if (!customer) return { error: 'Customer not found' }

  try {
    const doc = await prisma.customerDocument.findUnique({ where: { id: documentId } })
    if (!doc || doc.customerId !== customer.id) {
      return { error: 'Document not found or unauthorized' }
    }

    // Optional: Delete from Supabase storage as well
    // const filePath = doc.fileUrl.split('/customer-documents/')[1]
    // if (filePath) {
    //   await supabase.storage.from('customer-documents').remove([filePath])
    // }

    await prisma.customerDocument.delete({ where: { id: documentId } })

    revalidatePath('/account/documents')
    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: 'Failed to delete document' }
  }
}
