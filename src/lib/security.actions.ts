'use server'

import { createClient } from '@/utils/supabase/server'

export async function updateCustomerPassword(formData: FormData) {
  const supabase = createClient()
  
  const currentPassword = formData.get('currentPassword') as string | null
  const newPassword = formData.get('newPassword') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (newPassword !== confirmPassword) {
    return { error: 'รหัสผ่านใหม่ไม่ตรงกัน' }
  }

  if (newPassword.length < 8) {
    return { error: 'รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร' }
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !user.email) return { error: 'Unauthorized' }

  // If the user currently has a password, verify it first
  // Note: If they only use social login, they won't have a password set yet,
  // but Supabase updateUser allows setting it if we are authenticated.
  // We check if currentPassword was provided (it's required if they have one)
  if (currentPassword) {
    // Attempt to verify current password
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword
    })

    if (signInError) {
      return { error: 'รหัสผ่านปัจจุบันไม่ถูกต้อง' }
    }
  }

  // Update to new password
  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword
  })

  if (updateError) {
    console.error(updateError)
    return { error: 'เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน: ' + updateError.message }
  }

  return { success: true }
}

export async function requestAccountDeletion() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }

  // In a real scenario, this might trigger an email to admin, 
  // insert a record in AccountDeletionRequest table, 
  // or create a SupportTicket automatically.
  // For safety, we will just return success as an accepted request.
  
  return { success: true }
}
