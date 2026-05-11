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

export function extractDepositFromText(rawText: string, priceFrom = 0): number | null {
  if (!rawText) return null;
  const text = rawText.replace(/\u00A0/g, ' ').replace(/[ \t]+/g, ' ');

  const amountPatterns = [
    /(?:มัดจำ|ค่ามัดจำ|ชำระมัดจำ|deposit(?:\s*amount)?)\s*(?:ต่อท่าน|ท่านละ|คนละ|ละ|เริ่มต้น)?\s*[:\-–—]?\s*(?:฿|บาท)?\s*([\d,]{3,7})/gi,
    /([\d,]{3,7})\s*(?:บาท|฿)\s*(?:ต่อท่าน|ท่านละ|คนละ|ละ)?\s*(?:มัดจำ|deposit)/gi,
  ];

  const candidates: number[] = [];
  for (const pattern of amountPatterns) {
    for (const match of text.matchAll(pattern)) {
      const value = parseNumber(match[1] || '');
      const deposit = sanitizeDeposit(value);
      if (deposit) candidates.push(deposit);
    }
  }

  if (candidates.length > 0) {
    return Math.min(...candidates);
  }

  const percentMatch = text.match(/(?:มัดจำ|deposit)[^%\n]{0,30}?(\d{1,2})\s*%/i);
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
  if (lowerSite === 'gs25') {
    return {
      Referer: 'https://gs25travel.com/',
      Origin: 'https://gs25travel.com',
      Accept: 'application/pdf,*/*;q=0.8',
      'User-Agent': 'Mozilla/5.0 (compatible; JongtourBot/1.0)',
    };
  }

  return {
    Accept: 'application/pdf,*/*;q=0.8',
    'User-Agent': 'Mozilla/5.0 (compatible; JongtourBot/1.0)',
  };
};

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

interface ResolveScraperDepositParams {
  supabase: SupabaseClient;
  tourId: number;
  site: string;
  pdfUrl: string;
  currentDeposit?: number | null;
  priceFrom?: number | null;
  contextText?: string;
}

export async function resolveAndPersistScraperDeposit(params: ResolveScraperDepositParams): Promise<number> {
  const current = sanitizeDeposit(Number(params.currentDeposit || 0));
  if (current) return current;

  const fromContext = extractDepositFromText(params.contextText || '', Number(params.priceFrom || 0));
  const resolved = fromContext || await extractDepositFromPdfUrl(params.pdfUrl, Number(params.priceFrom || 0), params.site);
  const finalDeposit = sanitizeDeposit(resolved);
  if (!finalDeposit) return 0;

  await params.supabase
    .from('scraper_tours')
    .update({ deposit: finalDeposit })
    .eq('id', params.tourId)
    .or('deposit.is.null,deposit.eq.0');

  return finalDeposit;
}
