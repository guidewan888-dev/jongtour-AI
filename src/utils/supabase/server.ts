import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies'

export function createClient(cookieStore?: ReadonlyRequestCookies) {
  // Support being called with or without a pre-fetched cookieStore
  const store = cookieStore || cookies()

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  // ANON_KEY (JWT) is preferred. Fallback to SERVICE_ROLE_KEY (also JWT).
  // PUBLISHABLE_KEY (sb_publishable_*) is NOT accepted by @supabase/ssr.
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY 
    || process.env.SUPABASE_SERVICE_ROLE_KEY!;

  return createServerClient(
    supabaseUrl,
    supabaseKey,
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
