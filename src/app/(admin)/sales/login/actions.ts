'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Please enter both email and password' }
  }

  const supabase = createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  // Check role to ensure early feedback (though middleware also protects)
  const role = data.user?.user_metadata?.role || 'USER'
  const allowedRoles = ['SALE_MANAGER', 'SALE_STAFF', 'ADMIN', 'SUPER_ADMIN']
  
  if (!allowedRoles.includes(role)) {
    await supabase.auth.signOut()
    return { error: 'Access Denied: You do not have permission to access the Sale CRM.' }
  }

  redirect('/dashboard')
}
