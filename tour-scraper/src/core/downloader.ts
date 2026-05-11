// ─── Image Downloader ───────────────────────
// Downloads images, validates with sharp, uploads to Supabase Storage

import sharp from 'sharp';
import { createHash } from 'crypto';
import { uploadIfAbsent } from './storage.js';
import type { ImageMeta } from '../types.js';

export async function downloadAndStore(
  imageUrl: string,
  ua: string,
): Promise<ImageMeta | null> {
  try {
    const isGs25Image = /https?:\/\/(?:www\.)?gs25travel\.com/i.test(imageUrl);
    const headers: Record<string, string> = {
      'User-Agent': ua,
    };
    if (isGs25Image) {
      headers.Referer = 'https://gs25travel.com/';
      headers.Origin = 'https://gs25travel.com';
      headers.Accept = 'image/*,*/*;q=0.8';
    }

    const res = await fetch(imageUrl, {
      headers,
      signal: AbortSignal.timeout(30_000),
    });

    if (!res.ok) return null;

    const buf = Buffer.from(await res.arrayBuffer());

    // Skip tiny files (icons, spacers)
    if (buf.length < 5_000) return null;

    // Validate image and get metadata
    const hash = createHash('sha256').update(buf).digest('hex');
    const meta = await sharp(buf).metadata();

    if (!meta.width || !meta.height) return null;
    if (meta.width < 200 || meta.height < 200) return null;

    const ext = (meta.format ?? 'jpeg').replace('jpeg', 'jpg');
    const storagePath = `images/${hash.slice(0, 2)}/${hash.slice(2, 4)}/${hash}.${ext}`;
    const publicUrl = await uploadIfAbsent(storagePath, buf, `image/${ext}`);

    return {
      originalUrl: imageUrl,
      storagePath,
      publicUrl,
      fileHash: hash,
      width: meta.width,
      height: meta.height,
      fileSize: buf.length,
    };
  } catch (e) {
    console.warn(`[image] ${imageUrl} →`, (e as Error).message);
    return null;
  }
}
