import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies'

export function createClient(cookieStore?: ReadonlyRequestCookies) {
  // Support being called with or without a pre-fetched cookieStore
  const store = cookieStore || cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return store.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            // @ts-ignore - store may be readonly in some contexts
            store.set({ name, value, ...options })
          } catch (error) {
            // Called from Server Component — safe to ignore
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            // @ts-ignore
            store.set({ name, value: '', ...options })
          } catch (error) {
            // Called from Server Component — safe to ignore
          }
        },
      },
    }
  )
}
