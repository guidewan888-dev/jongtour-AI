import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qterfftaebnoawnzkfgu.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_SRwNSJ89mInda5FcuB1W2w_9IEJlSOI';

export const createClient = (cookieStore: Awaited<ReturnType<typeof cookies>>) => {
  // Try to detect localhost from headers if possible, otherwise rely on a default safe fallback
  // In server components during local dev, NODE_ENV is usually enough, but if they run `npm start`
  // locally, we need to be careful.
  const isLocalhost = process.env.NEXT_PUBLIC_SITE_URL?.includes('localhost') || process.env.NODE_ENV === 'development';
  const cookieDomain = process.env.NEXT_PUBLIC_COOKIE_DOMAIN || ((process.env.NODE_ENV === 'production' && !isLocalhost) ? '.jongtour.com' : undefined);
  const isSecure = process.env.NODE_ENV === 'production' && !isLocalhost;

  return createServerClient(
    supabaseUrl!,
    supabaseKey!,
    {
      cookieOptions: {
        domain: cookieDomain,
        path: '/',
        sameSite: 'lax',
        secure: isSecure,
      },
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, { ...options, domain: cookieDomain || options.domain, secure: isSecure })
            })
          } catch {
            // The `setAll` method was called from a Server Component.
          }
        },
      },
    },
  );
};
