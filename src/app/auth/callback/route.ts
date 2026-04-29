import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      const response = NextResponse.redirect(`${origin}${next}`)
      // Force copy all cookies to the response object to bypass Vercel edge issues
      cookieStore.getAll().forEach((cookie) => {
        response.cookies.set(cookie.name, cookie.value, {
          domain: cookie.domain,
          path: cookie.path,
          secure: cookie.secure,
          httpOnly: cookie.httpOnly,
          sameSite: cookie.sameSite as any,
          expires: cookie.expires,
        })
      })
      return response
    } else {
      // Add error message to URL for debugging
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message || 'Could not authenticate user')}`)
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=No+code+provided`)
}
