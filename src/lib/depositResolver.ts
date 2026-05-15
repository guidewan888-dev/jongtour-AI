import { PDFParse } from 'pdf-parse';
import type { SupabaseClient } from '@supabase/supabase-js';

const PDF_TIMEOUT_MS = 20_000;
const MIN_DEPOSIT = 500;
const MAX_DEPOSIT = 300_000;

const pdfDepositCache = new Map<string, Promise<number | null>>();

const sanitizeDeposit = (value: number | null | undefined): number | null => {
  if (!value || !Number.isFinite(value)) return null;
  const rounded = Math.round(value);
  if (rounded < MIN_DEPOSIT || rounded > MAX_DEPOSIT) return null;
  return rounded;
};

const parseNumber = (input: string): number | null => {
  const clean = input.replace(/[^\d]/g, '');
  if (!clean) return null;
  const parsed = Number(clean);
  return Number.isFinite(parsed) ? parsed : null;
};

const decodeHtmlEntities = (value: string) =>
  value
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>');

export function extractDepositFromText(rawText: string, priceFrom = 0): number | null {
  if (!rawText) return null;
  const text = rawText.replace(/\u00A0/g, ' ').replace(/[ \t]+/g, ' ');

  const scoredCandidates: Array<{ amount: number; score: number; index: number }> = [];
  const collectCandidate = (rawAmount: string, score: number, index: number) => {
    const amount = sanitizeDeposit(parseNumber(rawAmount));
    if (!amount) return;
    scoredCandidates.push({ amount, score, index });
  };

  const rankedAmountPatterns = [
    {
      score: 130,
      pattern:
        /(?:ชำระ|วาง|จอง|สำรอง)?\s*(?:ค่ามัดจำ|ชำระมัดจำ|มัดจำ|deposit(?:\s*amount)?|down\s*payment)\s*(?:ต่อท่าน|ท่านละ|คนละ|ละ|per\s*person|person)?\s*[:\-–—]?\s*(?:฿|บาท|thb)?\s*([\d,]{3,7})/gi,
    },
    {
      score: 120,
      pattern:
        /(?:ชำระ|วาง|จอง|สำรอง)?\s*(?:deposit(?:\s*amount)?|down\s*payment)\s*(?:for|per)?\s*(?:person|pax)?\s*[:\-–—]?\s*(?:฿|บาท|thb)?\s*([\d,]{3,7})/gi,
    },
    {
      score: 110,
      pattern:
        /([\d,]{3,7})\s*(?:บาท|฿|thb)\s*(?:ต่อท่าน|ท่านละ|คนละ|ละ|per\s*person|person)?\s*(?:มัดจำ|deposit|down\s*payment)/gi,
    },
    {
      score: 90,
      pattern:
        /(?:มัดจำ|deposit|down\s*payment)[^\d\n]{0,20}([\d,]{3,7})/gi,
    },
  ];

  for (const { pattern, score } of rankedAmountPatterns) {
    for (const match of text.matchAll(pattern)) {
      collectCandidate(match[1] || '', score, match.index ?? Number.MAX_SAFE_INTEGER);
    }
  }

  if (scoredCandidates.length > 0) {
    scoredCandidates.sort((left, right) => {
      if (right.score !== left.score) return right.score - left.score;
      if (left.index !== right.index) return left.index - right.index;
      return right.amount - left.amount;
    });
    return scoredCandidates[0].amount;
  }

  const percentMatch = text.match(/(?:มัดจำ|deposit|down\s*payment)[^%\n]{0,40}?(\d{1,2})\s*%/i);
  if (percentMatch && priceFrom > 0) {
    const percent = Number(percentMatch[1]);
    if (percent > 0 && percent <= 100) {
      return sanitizeDeposit((priceFrom * percent) / 100);
    }
  }

  return null;
}

const buildPdfHeaders = (site?: string) => {
  const lowerSite = String(site || '').toLowerCase();
  const headers: Record<string, string> = {
    Accept: 'application/pdf,*/*;q=0.8',
    'User-Agent': 'Mozilla/5.0 (compatible; JongtourBot/1.0)',
  };
  if (lowerSite === 'gs25') {
    headers.Referer = 'https://gs25travel.com/';
    headers.Origin = 'https://gs25travel.com';
  }
  return headers;
};

const buildHtmlHeaders = (site?: string) => {
  const lowerSite = String(site || '').toLowerCase();
  const headers: Record<string, string> = {
    Accept: 'text/html,application/xhtml+xml',
    'User-Agent': 'Mozilla/5.0 (compatible; JongtourBot/1.0)',
  };
  if (lowerSite === 'gs25') {
    headers.Referer = 'https://gs25travel.com/';
    headers.Origin = 'https://gs25travel.com';
  }
  return headers;
};

async function extractDepositFromSourcePage(sourceUrl: string, priceFrom = 0, site?: string): Promise<number | null> {
  const url = String(sourceUrl || '').trim();
  if (!/^https?:\/\//i.test(url)) return null;

  try {
    const res = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      headers: buildHtmlHeaders(site),
      cache: 'no-store',
    });
    if (!res.ok) return null;

    const html = await res.text();
    if (!html) return null;

    // Lightweight html-to-text extraction for keyword matching
    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/gi, ' ')
      .replace(/&amp;/gi, '&')
      .replace(/&#39;/gi, "'")
      .replace(/&quot;/gi, '"')
      .replace(/[ \t]+/g, ' ')
      .replace(/\s*\n\s*/g, '\n');

    return extractDepositFromText(text, priceFrom);
  } catch {
    return null;
  }
}

export async function extractDepositFromPdfUrl(pdfUrl: string, priceFrom = 0, site?: string): Promise<number | null> {
  const normalizedUrl = String(pdfUrl || '').trim();
  if (!/^https?:\/\//i.test(normalizedUrl)) return null;

  if (!pdfDepositCache.has(normalizedUrl)) {
    pdfDepositCache.set(
      normalizedUrl,
      (async () => {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), PDF_TIMEOUT_MS);

        try {
          const res = await fetch(normalizedUrl, {
            method: 'GET',
            redirect: 'follow',
            headers: buildPdfHeaders(site),
            cache: 'no-store',
            signal: controller.signal,
          });
          if (!res.ok) return null;

          const contentType = res.headers.get('content-type') || '';
          if (!/pdf/i.test(contentType) && !/\.pdf(\?|$)/i.test(normalizedUrl)) {
            return null;
          }

          const buffer = Buffer.from(await res.arrayBuffer());
          if (buffer.length === 0) return null;

          const parser = new PDFParse({ data: buffer });
          try {
            const textResult = await parser.getText();
            const fromText = extractDepositFromText(textResult?.text || '', priceFrom);
            if (fromText) return fromText;
          } finally {
            await parser.destroy().catch(() => undefined);
          }

          const rawText = buffer.toString('latin1');
          return extractDepositFromText(rawText, priceFrom);
        } catch {
          return null;
        } finally {
          clearTimeout(timeout);
        }
      })(),
    );
  }

  return pdfDepositCache.get(normalizedUrl)!;
}

async function refreshPdfUrlFromSource(sourceUrl: string, site?: string): Promise<string | null> {
  const url = String(sourceUrl || '').trim();
  if (!/^https?:\/\//i.test(url)) return null;
  const lowerSite = String(site || '').toLowerCase();

  try {
    const res = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      headers: {
        Accept: 'text/html,application/xhtml+xml',
        'User-Agent': 'Mozilla/5.0 (compatible; JongtourBot/1.0)',
      },
      cache: 'no-store',
    });
    if (!res.ok) return null;

    const html = await res.text();
    if (!html) return null;

    if (lowerSite === 'go365') {
      const go365FileHost = html.match(/https?:\/\/[^"'\s>]*(?:file4load|loadfileall)[^"'\s>]*(?:\.pdf|download)[^"'\s>]*/i);
      if (go365FileHost?.[0]) return decodeHtmlEntities(go365FileHost[0]);
    }

    if (lowerSite === 'gs25') {
      const gs25PdfView = html.match(/href=["']([^"']*documents\/pdfview\/[^"']*)["']/i);
      if (gs25PdfView?.[1]) {
        const href = decodeHtmlEntities(gs25PdfView[1]);
        if (/^https?:\/\//i.test(href)) return href;
        return new URL(href, url).toString();
      }
    }

    if (lowerSite === 'itravels') {
      const itravelPdf = html.match(/href=["']([^"']*(?:\.pdf|\/pdf[^"']*))["']/i);
      if (itravelPdf?.[1]) {
        const href = decodeHtmlEntities(itravelPdf[1]);
        if (/^https?:\/\//i.test(href)) return href;
        return new URL(href, url).toString();
      }
    }

    const cloudfrontMatch = html.match(/https?:\/\/[^"'\s>]*cloudfront[^"'\s>]*\.pdf[^"'\s>]*/i);
    if (cloudfrontMatch?.[0]) return decodeHtmlEntities(cloudfrontMatch[0]);

    const genericPdfMatch = html.match(/href=["']([^"']+\.pdf[^"']*)["']/i);
    if (!genericPdfMatch?.[1]) return null;

    const href = decodeHtmlEntities(genericPdfMatch[1]);
    if (/^https?:\/\//i.test(href)) return href;
    return new URL(href, url).toString();
  } catch {
    return null;
  }
}

interface ResolveScraperDepositParams {
  supabase: SupabaseClient;
  tourId: number;
  site: string;
  pdfUrl: string;
  sourceUrl?: string;
  currentDeposit?: number | null;
  priceFrom?: number | null;
  contextText?: string;
  forceRefresh?: boolean;
}

export async function resolveAndPersistScraperDeposit(params: ResolveScraperDepositParams): Promise<number> {
  const current = sanitizeDeposit(Number(params.currentDeposit || 0));
  if (current && !params.forceRefresh) return current;

  const fromContext = extractDepositFromText(params.contextText || '', Number(params.priceFrom || 0));
  let pdfUrl = String(params.pdfUrl || '').trim();
  let resolved = fromContext || await extractDepositFromPdfUrl(pdfUrl, Number(params.priceFrom || 0), params.site);

  const site = String(params.site || '').toLowerCase();
  const shouldRefreshPdfUrl = ['bestintl', 'go365', 'itravels', 'gs25'].includes(site);
  if (!resolved && params.sourceUrl) {
    resolved = await extractDepositFromSourcePage(params.sourceUrl, Number(params.priceFrom || 0), site);
  }
  if (!resolved && shouldRefreshPdfUrl && params.sourceUrl) {
    const refreshedPdfUrl = await refreshPdfUrlFromSource(params.sourceUrl, site);
    if (refreshedPdfUrl) {
      pdfUrl = refreshedPdfUrl;
      resolved = await extractDepositFromPdfUrl(pdfUrl, Number(params.priceFrom || 0), params.site);
    }
  }

  const finalDeposit = sanitizeDeposit(resolved);
  if (!finalDeposit) {
    if (pdfUrl && pdfUrl !== String(params.pdfUrl || '').trim()) {
      await params.supabase
        .from('scraper_tours')
        .update({ pdf_url: pdfUrl })
        .eq('id', params.tourId);
    }
    return current || 0;
  }

  if (current !== finalDeposit || pdfUrl !== String(params.pdfUrl || '').trim()) {
    const updatePayload: Record<string, any> = { deposit: finalDeposit };
    if (pdfUrl) updatePayload.pdf_url = pdfUrl;
    await params.supabase
      .from('scraper_tours')
      .update(updatePayload)
      .eq('id', params.tourId);
  }

  return finalDeposit;
}
