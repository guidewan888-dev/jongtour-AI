import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qterfftaebnoawnzkfgu.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_SRwNSJ89mInda5FcuB1W2w_9IEJlSOI';

export const createClient = (cookieStore: Awaited<ReturnType<typeof cookies>>) => {
  const cookieDomain = process.env.NEXT_PUBLIC_COOKIE_DOMAIN || (process.env.NODE_ENV === 'production' ? '.jongtour.com' : undefined);
  return createServerClient(
    supabaseUrl!,
    supabaseKey!,
    {
      cookieOptions: {
        domain: cookieDomain,
        path: '/',
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      },
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, { ...options, domain: cookieDomain || options.domain })
            })
          } catch {
            // The `setAll` method was called from a Server Component.
          }
        },
      },
    },
  );
};
