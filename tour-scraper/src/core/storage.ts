// ─── Supabase Storage Client ────────────────
// Uploads images to Supabase Storage with dedup via SHA256 hash filenames

import { createClient } from '@supabase/supabase-js';

const BUCKET = 'tour-images';

let _supabase: ReturnType<typeof createClient> | null = null;

export function getSupabase() {
  if (!_supabase) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    }
    _supabase = createClient(url, key);
  }
  return _supabase;
}

export async function uploadIfAbsent(
  path: string,
  data: Buffer,
  contentType: string,
): Promise<string> {
  const supabase = getSupabase();

  // Try upload — if already exists, Supabase will error with "already exists"
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, data, {
      contentType,
      cacheControl: '31536000',   // 1 year cache
      upsert: false,               // don't overwrite
    });

  if (error && !error.message.includes('already exists') && !error.message.includes('Duplicate')) {
    throw error;
  }

  // Get public URL
  const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return pub.publicUrl;
}
