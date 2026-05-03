import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qterfftaebnoawnzkfgu.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_SRwNSJ89mInda5FcuB1W2w_9IEJlSOI';

export const createClient = () => {
  const cookieDomain = process.env.NEXT_PUBLIC_COOKIE_DOMAIN || (process.env.NODE_ENV === 'production' ? '.jongtour.com' : undefined);
  return createBrowserClient(
    supabaseUrl!,
    supabaseKey!,
    {
      cookieOptions: {
        domain: cookieDomain,
        path: '/',
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      }
    }
  );
};
