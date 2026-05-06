import { createClient } from '@supabase/supabase-js';

/**
 * Create a Supabase admin client using service role key.
 * This uses HTTPS REST API — works even when direct DB connection (port 5432) is blocked.
 */
export function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('Missing SUPABASE env vars');
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
