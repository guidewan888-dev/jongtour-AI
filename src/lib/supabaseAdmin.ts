import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Server-side Supabase REST client (service_role).
 * 
 * Uses HTTPS REST API — works even when direct DB (port 5432) is blocked.
 * 
 * SECURITY NOTES:
 * - This module is server-side only — never import in client components.
 * - On Vercel, set NEXT_PUBLIC_SB_SK as encrypted env var.
 *   (We use NEXT_PUBLIC_ prefix because Vercel's encrypted env vars 
 *    only reliably reach serverless functions when inlined at build time.)
 * - Despite the NEXT_PUBLIC_ prefix, the service role key is only used 
 *   server-side in this file and API routes.
 */

let _client: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (_client) return _client;

  const url = 
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    '';

  const key = 
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SB_SK ||
    '';

  if (!url || !key) {
    throw new Error(
      `[SupabaseAdmin] Missing env vars. ` +
      `URL=${!!url}, KEY=${!!key}. ` +
      `Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SB_SK in Vercel.`
    );
  }

  _client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  return _client;
}
