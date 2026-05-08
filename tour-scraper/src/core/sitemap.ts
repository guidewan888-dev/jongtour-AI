// ─── Sitemap Parser ─────────────────────────
// Discovers tour URLs from sitemap.xml (supports index + .gz)

import { XMLParser } from 'fast-xml-parser';
import { gunzipSync } from 'zlib';

const parser = new XMLParser({ ignoreAttributes: false });

export async function discoverUrls(
  sitemapUrls: string[],
  pattern: RegExp,
  ua: string,
): Promise<string[]> {
  const found = new Set<string>();

  for (const url of sitemapUrls) {
    try {
      const urls = await parseSitemap(url, ua, 0);
      for (const u of urls) {
        try {
          if (pattern.test(new URL(u).pathname)) {
            found.add(u);
          }
        } catch {
          // invalid URL, skip
        }
      }
    } catch (e) {
      console.warn(`[sitemap] ${url} →`, (e as Error).message);
    }
  }

  console.log(`[sitemap] Total unique tour URLs: ${found.size}`);
  return [...found];
}

async function parseSitemap(url: string, ua: string, depth: number): Promise<string[]> {
  if (depth > 3) return [];

  const res = await fetch(url, {
    headers: { 'User-Agent': ua },
    signal: AbortSignal.timeout(30_000),
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  let text: string;
  if (url.endsWith('.gz')) {
    const buf = Buffer.from(await res.arrayBuffer());
    text = gunzipSync(buf).toString('utf8');
  } else {
    text = await res.text();
  }

  // Skip non-XML responses
  if (!text.trim().startsWith('<?xml') && !text.trim().startsWith('<')) {
    return [];
  }

  const parsed = parser.parse(text);

  // Sitemap Index → recurse into child sitemaps
  if (parsed.sitemapindex) {
    const subs = toArray(parsed.sitemapindex.sitemap).map((s: any) => s.loc);
    console.log(`[sitemap] Index ${url} → ${subs.length} child sitemaps`);
    const all: string[] = [];
    for (const sub of subs) {
      all.push(...(await parseSitemap(sub, ua, depth + 1)));
    }
    return all;
  }

  // URL Set → extract URLs
  if (parsed.urlset) {
    const urls = toArray(parsed.urlset.url).map((u: any) => u.loc).filter(Boolean);
    console.log(`[sitemap] ${url} → ${urls.length} URLs`);
    return urls;
  }

  return [];
}

function toArray<T>(x: T | T[] | undefined): T[] {
  if (!x) return [];
  return Array.isArray(x) ? x : [x];
}
