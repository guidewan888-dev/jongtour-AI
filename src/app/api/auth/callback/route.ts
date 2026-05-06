export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  // next is the URL to redirect to after successful login
  const next = requestUrl.searchParams.get('next') || '/'

  if (code) {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)
    
    // Exchange the code for a session
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      return NextResponse.redirect(new URL(next, requestUrl.origin))
    } else {
      console.error('Callback error:', error.message)
    }
  }

  // Return the user to an error page with some instructions
  return NextResponse.redirect(new URL('/auth/admin-login?error=Invalid_Token', requestUrl.origin))
}

