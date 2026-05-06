import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Server-side Supabase REST client (service_role).
 * 
 * SECURITY: Credentials are read from environment variables only.
 * On Vercel, set these in Project Settings → Environment Variables:
 *   - SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL)
 *   - SUPABASE_SERVICE_ROLE_KEY
 * 
 * This module is server-side only — never import in client components.
 */

let _client: SupabaseClient | null = null;

function getUrl(): string {
  return (
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    ''
  );
}

function getServiceKey(): string {
  return (
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SB_SERVICE_KEY ||
    ''
  );
}

export function getSupabaseAdmin(): SupabaseClient {
  if (_client) return _client;

  const url = getUrl();
  const key = getServiceKey();

  if (!url || !key) {
    throw new Error(
      `[SupabaseAdmin] Missing env vars. ` +
      `SUPABASE_URL=${!!url}, SUPABASE_SERVICE_ROLE_KEY=${!!key}. ` +
      `Set these in Vercel Dashboard → Settings → Environment Variables.`
    );
  }

  _client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  return _client;
}
