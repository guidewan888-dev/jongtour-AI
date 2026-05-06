import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Server-side Supabase REST client (service_role).
 * 
 * Uses HTTPS REST API — works even when direct DB (port 5432) is blocked.
 * This module is server-side only — never import in client components.
 * 
 * TODO: Once SUPABASE_SERVICE_ROLE_KEY is properly set in Vercel Dashboard,
 * remove the FALLBACK_KEY constant and rely on env vars only.
 */

// Temporary fallback until Vercel env vars are set via Dashboard
const FALLBACK_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
  || process.env.NEXT_PUBLIC_SB_SK
  || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF0ZXJmZnRhZWJub2F3bnprZmd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzQ3MzAxNCwiZXhwIjoyMDkzMDQ5MDE0fQ.IDd7B8okNE1B0vf1OVQizDGeVQNdVwLK0gzogOyWIFE';

let _client: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (_client) return _client;

  const url =
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    'https://qterfftaebnoawnzkfgu.supabase.co';

  const key = FALLBACK_KEY;

  _client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  return _client;
}
