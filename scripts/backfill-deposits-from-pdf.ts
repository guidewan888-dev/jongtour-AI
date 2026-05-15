import 'dotenv/config';
import OpenAI from 'openai';
import { PDFParse } from 'pdf-parse';
import { getSupabaseAdmin } from '../src/lib/supabaseAdmin';
import { extractDepositFromText, resolveAndPersistScraperDeposit } from '../src/lib/depositResolver';

const OCR_MIN_DEPOSIT = 500;
const OCR_MAX_DEPOSIT = 300000;
const FETCH_TIMEOUT_MS = 45_000;
const OCR_TIMEOUT_MS = 90_000;
const GS25_BASE_URL = 'https://gs25travel.com';
const GS25_LOGIN_URL = `${GS25_BASE_URL}/login`;
const DEPOSIT_EVIDENCE_PATTERN = /(มัดจำ|ค่ามัดจำ|ชำระมัดจำ|deposit|down\s*payment|booking\s*fee)/i;

let gs25Session:
  | {
      browser: any;
      context: any;
      loginPage: any;
    }
  | null = null;
let gs25SessionInitPromise: Promise<typeof gs25Session> | null = null;
let gs25FallbackDisabled = false;

const decodeHtmlEntities = (value: string) =>
  value
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>');

const normalizeDeposit = (value: unknown): number => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 0;
  const rounded = Math.round(parsed);
  if (rounded < OCR_MIN_DEPOSIT || rounded > OCR_MAX_DEPOSIT) return 0;
  return rounded;
};

const parseJsonLoose = (raw: string): any => {
  if (!raw) return null;
  const cleaned = raw.replace(/```json/gi, '').replace(/```/g, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const objectMatch = cleaned.match(/\{[\s\S]*\}/);
    if (!objectMatch) return null;
    try {
      return JSON.parse(objectMatch[0]);
    } catch {
      return null;
    }
  }
};

const extractDepositViaPdfParse = async (pdfBuffer: Buffer, priceFrom: number): Promise<number> => {
  if (!pdfBuffer?.length) return 0;
  const parser = new PDFParse({ data: pdfBuffer });
  try {
    const textResult = await parser.getText();
    const parsed = extractDepositFromText(textResult?.text || '', priceFrom);
    return parsed ? Math.round(parsed) : 0;
  } catch {
    return 0;
  } finally {
    await parser.destroy().catch(() => undefined);
  }
};

const loadPlaywrightModule = async (): Promise<any | null> => {
  try {
    return await import('playwright');
  } catch {
    try {
      return await import('../tour-scraper/node_modules/playwright');
    } catch {
      return null;
    }
  }
};

const ensureGs25Session = async () => {
  if (gs25FallbackDisabled) return null;
  if (gs25Session) return gs25Session;
  if (gs25SessionInitPromise) return gs25SessionInitPromise;

  gs25SessionInitPromise = (async () => {
    const username = String(process.env.GS25_EMAIL || '').trim();
    const password = String(process.env.GS25_PASSWORD || '').trim();
    if (!username || !password) {
      console.warn('[gs25-fallback] GS25_EMAIL or GS25_PASSWORD not set; fallback disabled');
      gs25FallbackDisabled = true;
      return null;
    }

    const playwright = await loadPlaywrightModule();
    if (!playwright?.chromium) {
      console.warn('[gs25-fallback] playwright not available; fallback disabled');
      gs25FallbackDisabled = true;
      return null;
    }

    const browser = await playwright.chromium.launch({ headless: true });
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    });
    const loginPage = await context.newPage();

    await loginPage.goto(GS25_LOGIN_URL, { waitUntil: 'networkidle', timeout: FETCH_TIMEOUT_MS });
    await loginPage.fill('input[name="username"]', username);
    await loginPage.fill('input[name="password"]', password);
    await Promise.all([
      loginPage.waitForNavigation({ waitUntil: 'networkidle', timeout: FETCH_TIMEOUT_MS }).catch(() => undefined),
      loginPage.click('button[type="submit"]'),
    ]);
    await loginPage.waitForTimeout(1200);

    const session = { browser, context, loginPage };
    gs25Session = session;
    console.log(`[gs25-fallback] logged in (${loginPage.url()})`);
    return session;
  })()
    .catch((error) => {
      console.warn(`[gs25-fallback] login failed: ${error instanceof Error ? error.message : String(error)}`);
      gs25FallbackDisabled = true;
      return null;
    })
    .finally(() => {
      gs25SessionInitPromise = null;
    });

  return gs25SessionInitPromise;
};

const closeGs25Session = async () => {
  if (!gs25Session) return;
  const session = gs25Session;
  gs25Session = null;
  await session.loginPage?.close().catch(() => undefined);
  await session.context?.close().catch(() => undefined);
  await session.browser?.close().catch(() => undefined);
};

const collectGs25PdfCandidates = (html: string, baseUrl: string): string[] => {
  const candidates = new Set<string>();
  const addCandidate = (rawHref: string) => {
    const href = decodeHtmlEntities(String(rawHref || '').trim());
    if (!href) return;
    try {
      const full = /^https?:\/\//i.test(href) ? href : new URL(href, baseUrl).toString();
      if (/documents\/pdfview\//i.test(full) || /program_pdf_/i.test(full) || /\.pdf(\?|$)/i.test(full)) {
        candidates.add(full);
      }
    } catch {
      return;
    }
  };

  for (const match of html.matchAll(/href=["']([^"']+)["']/gi)) {
    addCandidate(match[1] || '');
  }
  for (const match of html.matchAll(/https?:\/\/[^"'\s>]*(?:documents\/pdfview\/|program_pdf_|\.pdf)[^"'\s>]*/gi)) {
    addCandidate(match[0] || '');
  }
  return [...candidates];
};

const fetchGs25PdfBufferWithSession = async (params: {
  tourCode: string;
  sourceUrl?: string;
  pdfUrl?: string;
}): Promise<{ pdfUrl: string; buffer: Buffer } | null> => {
  const session = await ensureGs25Session();
  if (!session) return null;

  const sourceUrl = String(params.sourceUrl || '').trim();
  const candidates = new Set<string>();
  const initialPdfUrl = String(params.pdfUrl || '').trim();
  if (/^https?:\/\//i.test(initialPdfUrl)) candidates.add(initialPdfUrl);

  if (/^https?:\/\//i.test(sourceUrl)) {
    const detailPage = await session.context.newPage();
    try {
      await detailPage.goto(sourceUrl, { waitUntil: 'networkidle', timeout: FETCH_TIMEOUT_MS });
      await detailPage.waitForTimeout(800);
      const html = await detailPage.content();
      for (const candidate of collectGs25PdfCandidates(html, sourceUrl)) {
        candidates.add(candidate);
      }
    } catch (error) {
      console.warn(`[gs25-fallback] source open failed ${params.tourCode}: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      await detailPage.close().catch(() => undefined);
    }
  }

  if (candidates.size === 0) return null;

  for (const candidate of candidates) {
    try {
      const response = await session.context.request.get(candidate, {
        timeout: FETCH_TIMEOUT_MS,
        headers: {
          Referer: sourceUrl || `${GS25_BASE_URL}/`,
          Origin: GS25_BASE_URL,
          Accept: 'application/pdf,*/*;q=0.8',
        },
      });
      if (!response.ok()) continue;

      const buffer = Buffer.from(await response.body());
      if (!buffer.length) continue;

      const contentType = String(response.headers()['content-type'] || '').toLowerCase();
      const pdfSignature = buffer.slice(0, 4).toString('latin1');
      const isPdf = contentType.includes('pdf') || pdfSignature === '%PDF' || /\.pdf(\?|$)/i.test(candidate);
      if (!isPdf) continue;

      return { pdfUrl: candidate, buffer };
    } catch {
      continue;
    }
  }

  return null;
};

const fetchPdfBuffer = async (pdfUrl: string): Promise<Buffer | null> => {
  const normalizedUrl = String(pdfUrl || '').trim();
  if (!/^https?:\/\//i.test(normalizedUrl)) return null;

  try {
    const response = await fetch(normalizedUrl, {
      method: 'GET',
      redirect: 'follow',
      headers: {
        Accept: 'application/pdf,*/*;q=0.8',
        'User-Agent': 'Mozilla/5.0 (compatible; JongtourBot/1.0)',
      },
      cache: 'no-store',
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!response.ok) return null;

    const contentType = response.headers.get('content-type') || '';
    if (!/pdf/i.test(contentType) && !/\.pdf(\?|$)/i.test(normalizedUrl)) return null;

    const buffer = Buffer.from(await response.arrayBuffer());
    if (!buffer.length || buffer.length > 25 * 1024 * 1024) return null;
    return buffer;
  } catch {
    return null;
  }
};

const refreshBestIntlPdfUrlFromSource = async (sourceUrl: string): Promise<string | null> => {
  const normalizedSource = String(sourceUrl || '').trim();
  if (!/^https?:\/\//i.test(normalizedSource)) return null;

  try {
    const response = await fetch(normalizedSource, {
      method: 'GET',
      redirect: 'follow',
      headers: {
        Accept: 'text/html,application/xhtml+xml',
        'User-Agent': 'Mozilla/5.0 (compatible; JongtourBot/1.0)',
      },
      cache: 'no-store',
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!response.ok) return null;

    const html = await response.text();
    if (!html) return null;

    const cloudfrontMatch = html.match(/https?:\/\/[^"'\s>]*cloudfront[^"'\s>]*\.pdf[^"'\s>]*/i);
    if (cloudfrontMatch?.[0]) return decodeHtmlEntities(cloudfrontMatch[0]);

    const genericMatch = html.match(/href=["']([^"']+\.pdf[^"']*)["']/i);
    if (!genericMatch?.[1]) return null;

    const href = decodeHtmlEntities(genericMatch[1]);
    if (/^https?:\/\//i.test(href)) return href;
    return new URL(href, normalizedSource).toString();
  } catch {
    return null;
  }
};

const extractDepositViaPdfOcr = async (params: {
  openai: OpenAI;
  pdfBuffer: Buffer;
  filename: string;
  priceFrom: number;
}): Promise<{ deposit: number; evidence: string }> => {
  const file = new File([params.pdfBuffer], params.filename, { type: 'application/pdf' });
  const uploaded = await params.openai.files.create({ file, purpose: 'user_data' });

  try {
    const response = await Promise.race([
      params.openai.responses.create({
      model: process.env.BACKFILL_OCR_MODEL || 'gpt-4.1-mini',
      max_output_tokens: 350,
      input: [
        {
          role: 'user',
          content: [
            {
              type: 'input_text',
              text: [
                'Extract booking deposit per person from this tour PDF.',
                'Return ONLY JSON:',
                '{"deposit_baht": number|null, "evidence_text": string, "matched_keyword": string|null, "confidence": "high"|"medium"|"low"}',
                'Rules:',
                '- Deposit must be tied to keywords: มัดจำ, ค่ามัดจำ, ชำระมัดจำ, deposit, down payment, booking fee.',
                '- Ignore full tour price or promotion price.',
                '- If multiple deposit amounts appear, return the smallest valid per-person deposit amount.',
                '- If no reliable deposit amount is found, return deposit_baht=null.',
              ].join('\n'),
            },
            { type: 'input_file', file_id: uploaded.id },
          ],
        },
      ],
      }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`OCR timeout after ${OCR_TIMEOUT_MS}ms`)), OCR_TIMEOUT_MS),
      ),
    ]) as Awaited<ReturnType<typeof params.openai.responses.create>>;

    const parsed = parseJsonLoose(response.output_text || '');
    if (!parsed) return { deposit: 0, evidence: '' };

    const deposit = normalizeDeposit(parsed.deposit_baht);
    const evidence = String(parsed.evidence_text || '').trim();
    const matchedKeyword = String(parsed.matched_keyword || '').trim();
    const hasKeywordEvidence = DEPOSIT_EVIDENCE_PATTERN.test(evidence) || DEPOSIT_EVIDENCE_PATTERN.test(matchedKeyword);
    if (!deposit || !hasKeywordEvidence) return { deposit: 0, evidence };

    if (params.priceFrom > 0 && deposit >= params.priceFrom) {
      return { deposit: 0, evidence };
    }

    return { deposit, evidence };
  } finally {
    await params.openai.files.delete(uploaded.id).catch(() => undefined);
  }
};

async function run() {
  const supabase = getSupabaseAdmin();
  const limit = Number(process.env.BACKFILL_LIMIT || 300);
  const force = String(process.env.BACKFILL_FORCE || '').toLowerCase() === 'true';
  const siteFilter = String(process.env.BACKFILL_SITE || '').trim().toLowerCase();
  const ocrEnabled = String(process.env.BACKFILL_OCR || '').toLowerCase() === 'true';
  const ocrSites = new Set(
    String(process.env.BACKFILL_OCR_SITES || 'bestintl')
      .split(',')
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean),
  );
  const codeFilterSet = new Set(
    String(process.env.BACKFILL_CODES || '')
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean),
  );

  const openAiApiKey = process.env.OPENAI_API_KEY;
  const openai = ocrEnabled && openAiApiKey ? new OpenAI({ apiKey: openAiApiKey }) : null;

  let query = supabase
    .from('scraper_tours')
    .select('id, site, tour_code, title, description, highlights, source_url, price_from, pdf_url, deposit')
    .eq('is_active', true)
    .not('pdf_url', 'is', null)
    .neq('pdf_url', '')
    .order('last_scraped_at', { ascending: false });

  if (siteFilter) {
    query = query.eq('site', siteFilter);
  }

  if (!force) {
    query = query.or('deposit.is.null,deposit.eq.0');
  }

  const { data: tours, error } = await query.limit(limit);
  if (error) {
    throw new Error(`[backfill-deposit] query failed: ${error.message}`);
  }

  const rows = (tours || []).filter((row) => codeFilterSet.size === 0 || codeFilterSet.has(String(row.tour_code || '').trim()));
  console.log(`[backfill-deposit] found ${rows.length} tours | force=${force} | site=${siteFilter || 'all'} | ocr=${ocrEnabled}`);
  if (rows.length === 0) return;

  let updated = 0;
  let skipped = 0;
  let failed = 0;
  let ocrAttempted = 0;
  let ocrUpdated = 0;

  try {
    for (const tour of rows) {
      try {
        console.log(`PROCESSING ${tour.site}/${tour.tour_code}`);
        const contextText = [tour.title || '', tour.description || '', ...(Array.isArray(tour.highlights) ? tour.highlights : [])].join('\n');

        const before = Number(tour.deposit || 0);
        const deposit = await resolveAndPersistScraperDeposit({
          supabase,
          tourId: tour.id,
          site: tour.site || '',
          pdfUrl: tour.pdf_url || '',
          currentDeposit: tour.deposit,
          priceFrom: Number(tour.price_from || 0),
          contextText,
          forceRefresh: force,
          sourceUrl: tour.source_url || '',
        });

        if (deposit > 0 && deposit !== before) {
          updated += 1;
          console.log(`UPDATED ${tour.site}/${tour.tour_code} -> ${deposit.toLocaleString()}`);
          continue;
        }

        if (deposit > 0) {
          skipped += 1;
          console.log(`UNCHANGED ${tour.site}/${tour.tour_code} -> ${deposit.toLocaleString()}`);
          continue;
        }

        const site = String(tour.site || '').toLowerCase();
        let gs25SessionPdf: { pdfUrl: string; buffer: Buffer } | null = null;

        if (site === 'gs25') {
          gs25SessionPdf = await fetchGs25PdfBufferWithSession({
            tourCode: String(tour.tour_code || ''),
            sourceUrl: String(tour.source_url || ''),
            pdfUrl: String(tour.pdf_url || ''),
          });
          if (gs25SessionPdf) {
            const parsedDeposit = await extractDepositViaPdfParse(gs25SessionPdf.buffer, Number(tour.price_from || 0));
            if (parsedDeposit > 0) {
              await supabase
                .from('scraper_tours')
                .update({ deposit: parsedDeposit, pdf_url: gs25SessionPdf.pdfUrl })
                .eq('id', tour.id);
              updated += 1;
              console.log(`GS25_SESSION_UPDATED ${tour.site}/${tour.tour_code} -> ${parsedDeposit.toLocaleString()}`);
              continue;
            }
          }
        }

        const shouldTryOcr = !!openai && ocrSites.has(site);
        if (!shouldTryOcr) {
          skipped += 1;
          console.log(`NOT_FOUND ${tour.site}/${tour.tour_code}`);
          continue;
        }

        ocrAttempted += 1;
        let pdfUrl = String(tour.pdf_url || '').trim();
        let pdfBuffer = await fetchPdfBuffer(pdfUrl);

        if (!pdfBuffer && site === 'bestintl' && tour.source_url) {
          const refreshedPdfUrl = await refreshBestIntlPdfUrlFromSource(String(tour.source_url || ''));
          if (refreshedPdfUrl) {
            pdfUrl = refreshedPdfUrl;
            pdfBuffer = await fetchPdfBuffer(pdfUrl);
            await supabase.from('scraper_tours').update({ pdf_url: pdfUrl }).eq('id', tour.id);
          }
        }

        if (!pdfBuffer && site === 'gs25' && gs25SessionPdf) {
          pdfUrl = gs25SessionPdf.pdfUrl;
          pdfBuffer = gs25SessionPdf.buffer;
          await supabase.from('scraper_tours').update({ pdf_url: pdfUrl }).eq('id', tour.id);
        }

        if (!pdfBuffer) {
          skipped += 1;
          console.log(`OCR_SKIP_PDF_UNAVAILABLE ${tour.site}/${tour.tour_code}`);
          continue;
        }

        const ocrResult = await extractDepositViaPdfOcr({
          openai,
          pdfBuffer,
          filename: `${tour.site}-${tour.tour_code}.pdf`,
          priceFrom: Number(tour.price_from || 0),
        });

        if (ocrResult.deposit > 0) {
          await supabase
            .from('scraper_tours')
            .update({ deposit: ocrResult.deposit, pdf_url: pdfUrl })
            .eq('id', tour.id);
          updated += 1;
          ocrUpdated += 1;
          console.log(`OCR_UPDATED ${tour.site}/${tour.tour_code} -> ${ocrResult.deposit.toLocaleString()} | ${ocrResult.evidence.slice(0, 120)}`);
        } else {
          skipped += 1;
          console.log(`OCR_NOT_FOUND ${tour.site}/${tour.tour_code}`);
        }
      } catch (error: any) {
        failed += 1;
        console.error(`FAILED ${tour.site}/${tour.tour_code}: ${error.message}`);
      }
    }
  } finally {
    await closeGs25Session();
  }

  console.log('\n=== Backfill Summary ===');
  console.log(`Updated: ${updated}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Failed : ${failed}`);
  console.log(`OCR Attempted: ${ocrAttempted}`);
  console.log(`OCR Updated : ${ocrUpdated}`);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
