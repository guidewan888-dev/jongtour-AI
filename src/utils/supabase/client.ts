import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // During build, NEXT_PUBLIC_ env vars may be absent.
  // We provide safe fallbacks that pass @supabase/ssr validation.
  // At runtime in the browser, the real values are always present.
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder';
  return createBrowserClient(url, key)
}

