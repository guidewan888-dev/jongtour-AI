import { createClient } from '@supabase/supabase-js';

// Fallback values for when Vercel doesn't inject env vars to serverless functions
const FALLBACK_URL = 'https://qterfftaebnoawnzkfgu.supabase.co';
const FALLBACK_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF0ZXJmZnRhZWJub2F3bnprZmd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzQ3MzAxNCwiZXhwIjoyMDkzMDQ5MDE0fQ.IDd7B8okNE1B0vf1OVQizDGeVQNdVwLK0gzogOyWIFE';

/**
 * Create a Supabase admin client using service role key.
 * This uses HTTPS REST API — works even when direct DB connection (port 5432) is blocked.
 */
export function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_URL;
  const key = process.env.SB_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || FALLBACK_KEY;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
