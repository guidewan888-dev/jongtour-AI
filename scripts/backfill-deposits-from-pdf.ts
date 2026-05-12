import 'dotenv/config';
import OpenAI from 'openai';
import { getSupabaseAdmin } from '../src/lib/supabaseAdmin';
import { resolveAndPersistScraperDeposit } from '../src/lib/depositResolver';

const OCR_MIN_DEPOSIT = 500;
const OCR_MAX_DEPOSIT = 300000;
const DEPOSIT_EVIDENCE_PATTERN = /(มัดจำ|ค่ามัดจำ|ชำระมัดจำ|deposit|down\s*payment|booking\s*fee)/i;

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
    const response = await params.openai.responses.create({
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
    });

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

  for (const tour of rows) {
    try {
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
