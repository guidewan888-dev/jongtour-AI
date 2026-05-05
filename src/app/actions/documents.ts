'use server'

import { prisma } from '@/lib/prisma'

/**
 * Updates a traveler's document URL in the database.
 * Called after a successful Supabase Storage upload.
 */
export async function updateTravelerDocument(
  travelerId: string,
  documentType: 'passport' | 'visa' | 'other',
  fileUrl: string
): Promise<{ success?: boolean; error?: string }> {
  try {
    if (!travelerId || !fileUrl) {
      return { error: 'Missing required parameters' }
    }

    await (prisma as any).traveler.update({
      where: { id: travelerId },
      data: {
        passportFileUrl: documentType === 'passport' ? fileUrl : undefined,
        passportUploaded: documentType === 'passport' ? true : undefined,
      }
    })

    return { success: true }
  } catch (err: any) {
    console.error('updateTravelerDocument error:', err)
    return { error: err.message || 'Failed to update document' }
  }
}
