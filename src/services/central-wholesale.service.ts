import { createHash } from 'crypto';
import OpenAI from 'openai';
import { PDFParse } from 'pdf-parse';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

type SyncResult = {
  wholesalerId: string;
  recordsAdded: number;
  recordsUpdated: number;
  recordsFailed: number;
};

type QualityIssue = {
  wholesale_id: string;
  canonical_tour_id: string | null;
  departure_id: string | null;
  issue_code: string;
  severity: 'error' | 'warning';
  field_name: string;
  message: string;
  payload: Record<string, any>;
};

type QualityReportRow = {
  id: string;
  wholesale_id: string;
  generated_at: string;
  status: string;
  total_mapped_tours: number;
  total_departures: number;
  complete_departures: number;
  missing_departure_count: number;
  missing_adult_price_count: number;
  missing_deposit_count: number;
  missing_seat_count: number;
  missing_pdf_count: number;
  invalid_seat_count: number;
  completeness_percent: number;
  summary: Record<string, any>;
};

type PdfExtractionJobStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'retry';

type DepartureCompletenessRow = {
  departure_id: string;
  wholesale_id: string;
  canonical_tour_id: string | null;
  source_departure_key: string;
  departure_date: string | null;
  return_date: string | null;
  has_departure_date: boolean;
  has_adult_price: boolean;
  has_child_with_bed_price: boolean;
  has_child_without_bed_price: boolean;
  has_infant_price: boolean;
  has_single_supplement_price: boolean;
  has_deposit_amount: boolean;
  deposit_type: 'per_person' | 'per_booking' | 'unknown';
  has_seat_available: boolean;
  has_pdf_url: boolean;
  pdf_url: string;
  missing_fields: string[];
  missing_count: number;
  is_complete: boolean;
  price_source: string;
  price_extraction_status: string;
  need_review: boolean;
  updated_at: string | null;
};

const SCRAPER_WHOLESALERS: Array<{ id: string; name: string }> = [
  { id: 'worldconnection', name: 'World Connection' },
  { id: 'itravels', name: 'iTravels Center' },
  { id: 'bestintl', name: 'Best International' },
  { id: 'gs25', name: 'GS25 Travel' },
];
const ENABLE_INLINE_PDF_PARSE_IN_SCRAPER_SYNC =
  String(process.env.CENTRAL_SYNC_SKIP_INLINE_PDF || 'true').toLowerCase() !== 'true';
const ENABLE_FAST_SCRAPER_SYNC =
  String(process.env.CENTRAL_SYNC_FAST_SCRAPER || 'true').toLowerCase() === 'true';
const STRICT_PDF_REFRESH_SITES = new Set(['bestintl', 'gs25']);

const SUPPLIER_NAME_FALLBACK: Record<string, string> = {
  SUP_LETGO: "Let's Go",
  SUP_TOURFACTORY: 'Tour Factory',
  SUP_CHECKIN: 'Check In Group',
  SUP_GO365: 'Go365 Travel',
};

const toNum = (value: any): number => {
  if (value === null || value === undefined || value === '') return 0;
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  const cleaned = String(value).replace(/[^\d.-]/g, '');
  if (!cleaned) return 0;
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
};

const asDate = (value: any): string | null => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
};

const slugify = (value: string): string =>
  String(value || '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

const shortHash = (value: string): string => createHash('md5').update(value).digest('hex').slice(0, 8);

const clampInt = (value: number | null): number | null => {
  if (value === null || value === undefined) return null;
  const v = Math.round(value);
  return Number.isFinite(v) ? Math.max(v, 0) : null;
};

const toNullableInt = (value: any): number | null => {
  if (value === null || value === undefined || value === '') return null;
  return clampInt(toNum(value));
};

const normalizeDepositType = (raw: any): 'per_person' | 'per_booking' | 'unknown' => {
  const source = String(raw || '').toLowerCase();
  if (!source) return 'unknown';
  if (source.includes('person') || source.includes('per_person') || source.includes('ท่าน') || source.includes('คน')) return 'per_person';
  if (source.includes('booking') || source.includes('per_booking')) return 'per_booking';
  return 'unknown';
};

const detectNeedReviewForPrices = (payload: {
  adult_price: number | null;
  child_with_bed_price: number | null;
  child_without_bed_price: number | null;
  infant_price: number | null;
  single_supplement_price: number | null;
  deposit_amount: number | null;
  deposit_type: 'per_person' | 'per_booking' | 'unknown';
  price_source: string;
}) => {
  if (!payload.adult_price || payload.adult_price <= 0) return true;
  if (!payload.deposit_amount || payload.deposit_amount <= 0) return true;
  if (payload.deposit_type === 'unknown') return true;
  if (!payload.single_supplement_price || payload.single_supplement_price <= 0) return true;
  if (
    (!payload.child_with_bed_price || payload.child_with_bed_price <= 0) &&
    (!payload.child_without_bed_price || payload.child_without_bed_price <= 0)
  ) {
    return true;
  }
  return false;
};

const extractPriceFromText = (text: string, patterns: RegExp[]): number | null => {
  const source = String(text || '');
  for (const pattern of patterns) {
    const match = source.match(pattern);
    if (!match?.[1]) continue;
    const amount = toNum(match[1]);
    if (amount > 0) return amount;
  }
  return null;
};

const parseScraperRawTextPrices = (rawText: string) => {
  const text = String(rawText || '');
  const adult = extractPriceFromText(text, [
    /adult[^0-9]{0,20}([\d,]{3,8})/i,
    /ผู้ใหญ่[^0-9]{0,20}([\d,]{3,8})/i,
  ]);
  const childWithBed = extractPriceFromText(text, [
    /child(?:\s*with\s*bed)?[^0-9]{0,20}([\d,]{3,8})/i,
    /เด็ก(?:มีเตียง)?[^0-9]{0,20}([\d,]{3,8})/i,
  ]);
  const childWithoutBed = extractPriceFromText(text, [
    /child(?:\s*no\s*bed|without\s*bed)[^0-9]{0,20}([\d,]{3,8})/i,
    /เด็ก(?:ไม่มีเตียง)?[^0-9]{0,20}([\d,]{3,8})/i,
  ]);
  const infant = extractPriceFromText(text, [
    /infant[^0-9]{0,20}([\d,]{3,8})/i,
    /ทารก[^0-9]{0,20}([\d,]{3,8})/i,
  ]);
  const single = extractPriceFromText(text, [
    /single(?:\s*supplement|\s*room)?[^0-9]{0,20}([\d,]{3,8})/i,
    /พักเดี่ยว[^0-9]{0,20}([\d,]{3,8})/i,
  ]);

  return {
    adult,
    childWithBed,
    childWithoutBed,
    infant,
    single,
  };
};

type ExtractedField = {
  amount: number | null;
  context: string;
  keyword: string;
};

type ExtractedPricingFromText = {
  adult: ExtractedField | null;
  childWithBed: ExtractedField | null;
  childWithoutBed: ExtractedField | null;
  infant: ExtractedField | null;
  single: ExtractedField | null;
  deposit: ExtractedField | null;
  depositType: 'per_person' | 'per_booking' | 'unknown';
  pricingConditions: string[];
};

const PDF_TIMEOUT_MS = 12_000;
const pdfTextCache = new Map<string, string>();
const pdfOcrCache = new Map<string, { text: string; confidence: number; error: string | null }>();
const MAX_PDF_QUEUE_ATTEMPTS = 4;
const PDF_OCR_TIMEOUT_MS = 120_000;
const PDF_OCR_MIN_TEXT_LENGTH = 90;
const GS25_BASE_URL = 'https://gs25travel.com';
const GS25_LOGIN_URL = `${GS25_BASE_URL}/login`;

type Gs25Session = {
  browser: any;
  context: any;
  loginPage: any;
};

let gs25Session: Gs25Session | null = null;
let gs25SessionInitPromise: Promise<Gs25Session | null> | null = null;
let gs25SessionDisabled = false;

type PdfTextExtractionMeta = {
  text: string;
  source: 'embedded' | 'ocr' | 'none';
  extractionConfidence: number;
  extractedTextSnippet: string;
  ocrError: string | null;
};

type JobDepartureContext = {
  id: string;
  sourceDepartureKey: string;
  departureDate: string | null;
  returnDate: string | null;
  departureKeyTokens: string[];
  tourCodeTokens: string[];
};

let openAiClient: OpenAI | null | undefined;

const DEPOSIT_PER_PERSON_HINT = /(ท่านละ|คนละ|ต่อคน|ต่อท่าน|per\s*person|\/\s*person|person)/i;
const DEPOSIT_PER_BOOKING_HINT = /(ต่อการจอง|ทั้งการจอง|ทั้งกรุ๊ป|ทั้งคณะ|per\s*booking|\/\s*booking|booking)/i;

const KEYWORDS = {
  adult: ['ผู้ใหญ่', 'adult', 'starting price', 'tour price', 'price from', 'ราคาเริ่มต้น', 'ราคาทัวร์'],
  childWithBed: ['เด็กมีเตียง', 'child with bed', 'child w/ bed', 'child bed', 'เด็กเสริมเตียง'],
  childWithoutBed: ['เด็กไม่มีเตียง', 'เด็กไม่เสริมเตียง', 'child no bed', 'child without bed', 'child w/o bed'],
  infant: ['ทารก', 'infant'],
  single: ['พักเดี่ยว', 'ห้องพักเดี่ยว', 'เพิ่มพักเดี่ยว', 'ค่าพักเดี่ยว', 'single supplement', 'single room', 'single charge', 'single occupancy'],
  deposit: ['มัดจำ', 'เงินมัดจำ', 'ชำระมัดจำ', 'เงินจอง', 'ค่าจอง', 'ชำระงวดแรก', 'deposit', 'booking deposit', 'deposit amount'],
  conditions: [
    'เงื่อนไข',
    'หมายเหตุ',
    'เด็กอายุต่ำกว่า',
    'เด็กพักกับผู้ใหญ่',
    'เด็กมีเตียง',
    'เด็กไม่มีเตียง',
    'ทารก',
    'พักเดี่ยว',
    'single supplement',
    'deposit',
    'มัดจำ',
  ],
};

const amountPattern = /(?:฿|บาท|thb)?\s*([0-9]{1,3}(?:,[0-9]{3})+|[0-9]{3,6})(?:\s*บาท|฿|thb)?/gi;

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function splitTextLines(value: string): string[] {
  return String(value || '')
    .replace(/\r/g, '\n')
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function extractAmounts(line: string): number[] {
  const source = String(line || '');
  const numbers: number[] = [];
  const hasInsuranceHint = /insurance|ประกัน|กรมธรรม์|วงเงิน/i.test(source);
  const hasDateHint = /\b\d{1,2}\s*(?:-|–|\/)\s*\d{1,2}\b|ม\.ค|ก\.พ|มี\.ค|เม\.ย|พ\.ค|มิ\.ย|ก\.ค|ส\.ค|ก\.ย|ต\.ค|พ\.ย|ธ\.ค|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec/i.test(source);

  for (const match of source.matchAll(amountPattern)) {
    const rawAmount = String(match[1] || '');
    const n = toNum(match[1]);
    if (hasInsuranceHint && n >= 200_000) continue;
    if (hasDateHint && !rawAmount.includes(',') && n >= 2400 && n <= 2700) continue;
    if (n >= 100 && n <= 2_000_000) {
      numbers.push(n);
    }
  }
  return numbers;
}

function isLikelyPricingLine(line: string): boolean {
  const source = String(line || '');
  if (!source) return false;
  const amounts = extractAmounts(source);
  if (amounts.length === 0) return false;
  if (/[฿]|บาท|thb|ราคา|price|ผู้ใหญ่|adult|เด็ก|child|ทารก|infant|พักเดี่ยว|single|มัดจำ|deposit/i.test(source)) {
    return true;
  }
  if (/\d{1,3},\d{3}/.test(source)) return true;
  return amounts.length >= 2;
}

function pickAmountFromLine(line: string, strategy: 'min' | 'max' | 'first' = 'first'): number | null {
  const amounts = extractAmounts(line);
  if (amounts.length === 0) return null;
  if (strategy === 'min') return Math.min(...amounts);
  if (strategy === 'max') return Math.max(...amounts);
  return amounts[0];
}

function extractFieldFromLines(lines: string[], keywords: string[], strategy: 'min' | 'max' | 'first' = 'first'): ExtractedField | null {
  const keywordRegexes = keywords.map((k) => new RegExp(escapeRegex(k), 'i'));
  for (let idx = 0; idx < lines.length; idx += 1) {
    const line = lines[idx];
    const hit = keywordRegexes.find((rx) => rx.test(line));
    if (!hit) continue;
    const candidateIndexes = [idx, idx + 1, idx + 2, idx - 1].filter((i) => i >= 0 && i < lines.length);
    let amount: number | null = null;
    let context = line;
    for (const cidx of candidateIndexes) {
      const candidateLine = lines[cidx];
      if (cidx !== idx && !isLikelyPricingLine(candidateLine)) continue;
      amount = pickAmountFromLine(candidateLine, strategy);
      if (amount && amount > 0) {
        context = cidx === idx ? line : `${line} | ${candidateLine}`;
        break;
      }
    }
    if (!(amount && amount > 0)) continue;
    return {
      amount,
      context: context.slice(0, 500),
      keyword: hit.source.replace(/\\+/g, ''),
    };
  }
  return null;
}

function extractFieldByRegex(text: string, keyword: string, patterns: RegExp[], options?: {
  min?: number;
  max?: number;
  skip?: (amount: number, context: string) => boolean;
}): ExtractedField | null {
  const candidates: ExtractedField[] = [];
  const source = String(text || '');
  const min = options?.min ?? 0;
  const max = options?.max ?? Number.MAX_SAFE_INTEGER;

  for (const pattern of patterns) {
    for (const match of source.matchAll(pattern)) {
      const amountRaw = String(match[1] || '');
      const amount = toNum(amountRaw);
      const context = String(match[0] || '').slice(0, 500);
      if (!(amount > 0)) continue;
      if (amount < min || amount > max) continue;
      if (options?.skip?.(amount, context)) continue;
      candidates.push({
        amount,
        context,
        keyword,
      });
    }
  }

  if (candidates.length === 0) return null;
  return candidates.sort((a, b) => Number(a.amount || 0) - Number(b.amount || 0))[0];
}

function detectDepositTypeFromLines(lines: string[]): 'per_person' | 'per_booking' | 'unknown' {
  const text = lines.join(' | ');
  if (DEPOSIT_PER_PERSON_HINT.test(text)) return 'per_person';
  if (DEPOSIT_PER_BOOKING_HINT.test(text)) return 'per_booking';
  return 'unknown';
}

function findConditionLines(lines: string[]): string[] {
  const rx = /(เงื่อนไข|หมายเหตุ|ราคาเด็ก|เด็ก(?:มีเตียง|ไม่มีเตียง|เสริมเตียง|ไม่เสริมเตียง)|ทารก|infant|single supplement|พักเดี่ยว|มัดจำ|deposit|per\s*person|per\s*booking|พักกับผู้ใหญ่|อายุต่ำกว่า|คิดราคาเท่าผู้ใหญ่|ลดราคา)/i;
  return lines.filter((line) => rx.test(String(line || ''))).slice(0, 50);
}

function parseDiscountFromConditionLine(line: string): number | null {
  const source = String(line || '');
  const match = source.match(/(?:ลด|discount)\s*([0-9]{1,3}(?:,[0-9]{3})+|[0-9]{3,6})/i);
  if (!match?.[1]) return null;
  const amount = toNum(match[1]);
  return amount > 0 ? amount : null;
}

function extractPricingFromTextWithContext(text: string): ExtractedPricingFromText {
  const lines = splitTextLines(text);
  const conditionLines = findConditionLines(lines);

  const adultFromLine = extractFieldFromLines(lines, KEYWORDS.adult);
  const adult =
    adultFromLine && /tip|ทิป|ค่าทิป|service charge|ค่าบริการ/i.test(String(adultFromLine.context || ''))
      ? null
      : adultFromLine;

  const childWithBedFromLine = extractFieldFromLines(lines, KEYWORDS.childWithBed);
  const childWithBedFromRegex = extractFieldByRegex(
    text,
    'child_with_bed',
    [
      /(?:เด็กมีเตียง|เด็กเสริมเตียง|child(?:\s*with\s*bed|w\/?\s*bed)|cwb)[^\d\n]{0,40}([\d,]{3,8})\s*(?:บาท|thb)?/gi,
      /([\d,]{3,8})\s*(?:บาท|thb)?[^\n]{0,30}(?:เด็กมีเตียง|เด็กเสริมเตียง|child(?:\s*with\s*bed|w\/?\s*bed)|cwb)/gi,
    ],
    {
      min: 500,
      max: 500_000,
      skip: (_amount, context) => /tip|ทิป|ค่าทิป|service charge/i.test(context),
    },
  );
  const childWithoutBedFromLine = extractFieldFromLines(lines, KEYWORDS.childWithoutBed);
  const childWithoutBedFromRegex = extractFieldByRegex(
    text,
    'child_without_bed',
    [
      /(?:เด็กไม่มีเตียง|เด็กไม่เสริมเตียง|child(?:\s*without\s*bed|no\s*bed|w\/?\s*o\s*bed)|cnb)[^\d\n]{0,40}([\d,]{3,8})\s*(?:บาท|thb)?/gi,
      /([\d,]{3,8})\s*(?:บาท|thb)?[^\n]{0,30}(?:เด็กไม่มีเตียง|เด็กไม่เสริมเตียง|child(?:\s*without\s*bed|no\s*bed|w\/?\s*o\s*bed)|cnb)/gi,
    ],
    {
      min: 500,
      max: 500_000,
      skip: (_amount, context) => /tip|ทิป|ค่าทิป|service charge/i.test(context),
    },
  );
  const childGeneric = extractFieldByRegex(
    text,
    'child_generic',
    [
      /(?:ราคาเด็ก|child(?:\s*fare|\s*price)?)[^\d\n]{0,24}([\d,]{3,8})\s*(?:บาท|thb)?/gi,
      /([\d,]{3,8})\s*(?:บาท|thb)?[^\n]{0,24}(?:ราคาเด็ก|child(?:\s*fare|\s*price)?)/gi,
    ],
    {
      min: 500,
      max: 500_000,
      skip: (_amount, context) => /infant|ทารก|tip|ทิป|ค่าทิป/i.test(context),
    },
  );

  const infantFromLine = extractFieldFromLines(lines, KEYWORDS.infant);
  const infantFromRegex = extractFieldByRegex(
    text,
    'infant',
    [
      /(?:ทารก|infant)[^\d\n]{0,40}([\d,]{2,8})\s*(?:บาท|thb)?/gi,
      /([\d,]{2,8})\s*(?:บาท|thb)?[^\n]{0,24}(?:ทารก|infant)/gi,
    ],
    {
      min: 50,
      max: 100_000,
      skip: (_amount, context) => /insurance|ประกัน|วงเงิน/i.test(context),
    },
  );

  const singleFromLine = extractFieldFromLines(lines, KEYWORDS.single, 'min');
  const singleFromRegex = extractFieldByRegex(
    text,
    'single',
    [
      /(?:พักเดี่ยว|ห้องพักเดี่ยว|เพิ่มพักเดี่ยว|single(?:\s*supplement|\s*room|\s*charge|\s*occupancy)?)[^\d\n]{0,30}([\d,]{3,8})\s*(?:บาท|thb)?/gi,
      /([\d,]{3,8})\s*(?:บาท|thb)?[^\n]{0,30}(?:พักเดี่ยว|single(?:\s*supplement|\s*room|\s*charge|\s*occupancy)?)/gi,
    ],
    {
      min: 500,
      max: 300_000,
      skip: (amount, context) => /insurance|ประกัน|กรมธรรม์|วงเงิน/i.test(context) && amount >= 200_000,
    },
  );

  const depositFromLine = extractFieldFromLines(lines, KEYWORDS.deposit, 'min');
  const depositFromRegex = extractFieldByRegex(
    text,
    'deposit',
    [
      /(?:มัดจำ|เงินมัดจำ|ค่าจอง|ชำระงวดแรก|เงินจอง|deposit(?:\s*amount)?|booking\s*deposit)[^\n]{0,100}?([0-9][0-9,.\s-]{2,14})\s*(?:บาท|฿|thb|\/\s*ท่าน|\/\s*คน)?/gi,
      /([0-9][0-9,.\s-]{2,14})\s*(?:บาท|฿|thb|\/\s*ท่าน|\/\s*คน)?[^\n]{0,60}(?:มัดจำ|เงินมัดจำ|ค่าจอง|เงินจอง|deposit(?:\s*amount)?|booking\s*deposit)/gi,
    ],
    {
      min: 500,
      max: 300_000,
      skip: (amount, context) => {
        if (/มัดจำ\/ที่นั่ง|deposit\/seat/i.test(context) && amount > 20_000) return true;
        if (adult?.amount && adult.amount > 0 && amount >= adult.amount) return true;
        return false;
      },
    },
  );

  const tableRows = lines
    .filter((line) => parseDateCandidatesFromLine(line).length > 0)
    .map((line) => ({ line, amounts: extractAmounts(line) }))
    .filter((row) => row.amounts.length >= 2);
  const tableAdult = (() => {
    if (tableRows.length === 0) return null;
    const nums = tableRows[0].amounts.filter((n) => n >= 5_000);
    if (nums.length > 0) return nums[0];
    return tableRows[0].amounts[0] || null;
  })();
  const tableChildWithBed = tableRows.length > 0 && tableRows[0].amounts.length >= 2 ? tableRows[0].amounts[1] : null;
  const tableChildWithoutBed = tableRows.length > 0 && tableRows[0].amounts.length >= 3 ? tableRows[0].amounts[2] : tableChildWithBed;
  const tableSingle = (() => {
    if (tableRows.length === 0) return null;
    const first = tableRows[0].amounts;
    if (first.length >= 4) return first[3];
    if (first.length === 3 && first[2] > 0 && first[0] > 0 && first[2] < first[0]) return first[2];
    return null;
  })();

  const tableDeposit = (() => {
    const hit = lines.find((line) => /มัดจำ\/ที่นั่ง|deposit\/seat|เงินมัดจำ|booking deposit|ค่าจอง|deposit amount/i.test(line));
    if (!hit) return null;
    const nums = extractAmounts(hit);
    if (nums.length === 0) return null;
    return nums.filter((n) => n >= 500 && n <= 300_000).sort((a, b) => a - b)[0] || null;
  })();

  const pricingConditions = conditionLines.length > 0
    ? conditionLines
    : lines.filter((line) => KEYWORDS.conditions.some((k) => new RegExp(escapeRegex(k), 'i').test(line))).slice(0, 30);

  const childSameAsAdult = pricingConditions.some((line) =>
    /ไม่มีราคาเด็ก|เด็ก(?:มีเตียง|ไม่มีเตียง)?.{0,25}(?:เท่าผู้ใหญ่|คิดราคาเท่าผู้ใหญ่)|child.{0,30}(same as adult|equal adult)/i.test(String(line || '')),
  );
  const noBedDiscount = pricingConditions
    .filter((line) => /เด็กไม่มีเตียง|child(?:\s*without\s*bed|no\s*bed)/i.test(String(line || '')))
    .map((line) => parseDiscountFromConditionLine(line))
    .find((amount) => Number(amount || 0) > 0) || null;
  const withBedDiscount = pricingConditions
    .filter((line) => /เด็กมีเตียง|child(?:\s*with\s*bed)/i.test(String(line || '')))
    .map((line) => parseDiscountFromConditionLine(line))
    .find((amount) => Number(amount || 0) > 0) || null;

  const effectiveAdult =
    adult ||
    (tableAdult ? { amount: tableAdult, context: tableRows[0].line.slice(0, 500), keyword: 'table_adult' } : null);
  const effectiveChildWithBed =
    childWithBedFromLine ||
    childWithBedFromRegex ||
    childGeneric ||
    (tableChildWithBed ? { amount: tableChildWithBed, context: tableRows[0].line.slice(0, 500), keyword: 'table_child_with_bed' } : null) ||
    (withBedDiscount && effectiveAdult?.amount
      ? {
          amount: Math.max(effectiveAdult.amount - withBedDiscount, 0),
          context: `condition discount: ${withBedDiscount}`,
          keyword: 'condition_child_with_bed_discount',
        }
      : null) ||
    (childSameAsAdult && effectiveAdult?.amount
      ? { amount: effectiveAdult.amount, context: 'child price equals adult from pricing condition', keyword: 'child_same_as_adult' }
      : null);
  const effectiveChildWithoutBed =
    childWithoutBedFromLine ||
    childWithoutBedFromRegex ||
    (tableChildWithoutBed ? { amount: tableChildWithoutBed, context: tableRows[0].line.slice(0, 500), keyword: 'table_child_without_bed' } : null) ||
    (noBedDiscount && effectiveAdult?.amount
      ? {
          amount: Math.max(effectiveAdult.amount - noBedDiscount, 0),
          context: `condition discount: ${noBedDiscount}`,
          keyword: 'condition_child_without_bed_discount',
        }
      : null) ||
    effectiveChildWithBed ||
    (childSameAsAdult && effectiveAdult?.amount
      ? { amount: effectiveAdult.amount, context: 'child price equals adult from pricing condition', keyword: 'child_same_as_adult' }
      : null);
  const effectiveSingle =
    singleFromRegex ||
    singleFromLine ||
    (tableSingle ? { amount: tableSingle, context: tableRows[0].line.slice(0, 500), keyword: 'table_single' } : null);
  const effectiveInfant = infantFromLine || infantFromRegex;

  const depositFromLineFiltered =
    depositFromLine && /มัดจำ\/ที่นั่ง|deposit\/seat/i.test(String(depositFromLine.context || '')) && Number(depositFromLine.amount || 0) > 20_000
      ? null
      : depositFromLine;
  const deposit =
    depositFromRegex ||
    depositFromLineFiltered ||
    (tableDeposit ? { amount: tableDeposit, context: 'table deposit fallback', keyword: 'table_deposit' } : null);

  let depositType: 'per_person' | 'per_booking' | 'unknown' = 'unknown';
  const depositLine = String(deposit?.context || '');
  if (depositLine) {
    if (DEPOSIT_PER_PERSON_HINT.test(depositLine)) depositType = 'per_person';
    else if (DEPOSIT_PER_BOOKING_HINT.test(depositLine)) depositType = 'per_booking';
  }
  if (depositType === 'unknown') {
    depositType = detectDepositTypeFromLines(pricingConditions);
  }

  return {
    adult: effectiveAdult,
    childWithBed: effectiveChildWithBed,
    childWithoutBed: effectiveChildWithoutBed,
    infant: effectiveInfant,
    single: effectiveSingle,
    deposit,
    depositType,
    pricingConditions,
  };
}
function flattenObjectText(input: any, depth = 0): string {
  if (depth > 4 || input === null || input === undefined) return '';
  if (typeof input === 'string') return input;
  if (typeof input === 'number' || typeof input === 'boolean') return String(input);
  if (Array.isArray(input)) {
    return input.map((item) => flattenObjectText(item, depth + 1)).filter(Boolean).join('\n');
  }
  if (typeof input === 'object') {
    const lines: string[] = [];
    for (const [key, value] of Object.entries(input)) {
      const nested = flattenObjectText(value, depth + 1);
      if (!nested) continue;
      lines.push(`${key}: ${nested}`);
    }
    return lines.join('\n');
  }
  return '';
}

function getOpenAiClient(): OpenAI | null {
  if (openAiClient !== undefined) return openAiClient;
  const apiKey = String(process.env.OPENAI_API_KEY || '').trim();
  openAiClient = apiKey ? new OpenAI({ apiKey }) : null;
  return openAiClient;
}

function buildExtractedTextSnippet(value: string, maxChars = 800): string {
  const normalized = String(value || '').replace(/\s+/g, ' ').trim();
  if (!normalized) return '';
  return normalized.slice(0, maxChars);
}

function buildExtractedTextSnippetFromParsed(parsed: ExtractedPricingFromText, fallbackText = ''): string {
  const chunks = [
    parsed.adult?.context || '',
    parsed.childWithBed?.context || '',
    parsed.childWithoutBed?.context || '',
    parsed.infant?.context || '',
    parsed.single?.context || '',
    parsed.deposit?.context || '',
    ...(parsed.pricingConditions || []).slice(0, 4),
  ]
    .map((line) => String(line || '').trim())
    .filter(Boolean);
  return buildExtractedTextSnippet(chunks.join(' | ') || fallbackText, 1200);
}

function looksLikeScanPdfText(text: string): boolean {
  const normalized = String(text || '').replace(/\s+/g, ' ').trim();
  if (!normalized) return true;
  const alphaNumeric = normalized.match(/[A-Za-z0-9\u0E00-\u0E7F]/g) || [];
  return alphaNumeric.length < PDF_OCR_MIN_TEXT_LENGTH;
}

function estimateExtractionConfidence(params: {
  parsed: ExtractedPricingFromText;
  fromOcr: boolean;
  matchedByDeparture: boolean;
  ambiguous: boolean;
}): number {
  const { parsed, fromOcr, matchedByDeparture, ambiguous } = params;
  let score = 0;
  if ((parsed.adult?.amount || 0) > 0) score += 0.35;
  if ((parsed.deposit?.amount || 0) > 0) score += 0.25;
  if ((parsed.single?.amount || 0) > 0) score += 0.1;
  if ((parsed.childWithBed?.amount || 0) > 0) score += 0.08;
  if ((parsed.childWithoutBed?.amount || 0) > 0) score += 0.08;
  if ((parsed.infant?.amount || 0) > 0) score += 0.06;
  if (parsed.depositType !== 'unknown') score += 0.04;
  if (matchedByDeparture) score += 0.08;
  if (ambiguous) score -= 0.25;
  if (fromOcr) score -= 0.05;
  if (!Number.isFinite(score)) return 0;
  return Math.max(0, Math.min(0.99, Number(score.toFixed(2))));
}

function hasCriticalPricingGap(parsed: ExtractedPricingFromText): boolean {
  const hasChild = (parsed.childWithBed?.amount || 0) > 0 || (parsed.childWithoutBed?.amount || 0) > 0;
  const hasSingle = (parsed.single?.amount || 0) > 0;
  const hasDeposit = (parsed.deposit?.amount || 0) > 0;
  return !hasChild || !hasSingle || !hasDeposit;
}

function mergeParsedPricing(primary: ExtractedPricingFromText, secondary: ExtractedPricingFromText): ExtractedPricingFromText {
  const pricingConditions = Array.from(
    new Set([...(primary.pricingConditions || []), ...(secondary.pricingConditions || [])].filter(Boolean)),
  ).slice(0, 40);

  return {
    adult: primary.adult || secondary.adult || null,
    childWithBed: primary.childWithBed || secondary.childWithBed || null,
    childWithoutBed:
      primary.childWithoutBed ||
      secondary.childWithoutBed ||
      primary.childWithBed ||
      secondary.childWithBed ||
      null,
    infant: primary.infant || secondary.infant || null,
    single: primary.single || secondary.single || null,
    deposit: primary.deposit || secondary.deposit || null,
    depositType:
      primary.depositType !== 'unknown'
        ? primary.depositType
        : secondary.depositType !== 'unknown'
          ? secondary.depositType
          : 'unknown',
    pricingConditions,
  };
}

async function fetchPdfBuffer(pdfUrl: string, options?: { siteId?: string; sourceUrl?: string }): Promise<Buffer | null> {
  const normalizedUrl = String(pdfUrl || '').trim();
  if (!/^https?:\/\//i.test(normalizedUrl)) return null;
  const siteId = String(options?.siteId || '').trim().toLowerCase();
  const sourceUrl = String(options?.sourceUrl || '').trim();
  const isGs25Url = /gs25travel\.com/i.test(normalizedUrl) || siteId === 'gs25';

  try {
    const res = await fetch(normalizedUrl, {
      headers: {
        Accept: 'application/pdf,*/*;q=0.8',
        ...(isGs25Url ? { Referer: sourceUrl || `${GS25_BASE_URL}/`, Origin: GS25_BASE_URL } : {}),
      },
      signal: AbortSignal.timeout(PDF_TIMEOUT_MS),
      redirect: 'follow',
      cache: 'no-store',
    });
    if (!res.ok) {
      if (isGs25Url) {
        const sessionPdf = await fetchGs25PdfBufferWithSession({ sourceUrl, pdfUrl: normalizedUrl });
        if (sessionPdf?.buffer) return sessionPdf.buffer;
      }
      return null;
    }
    const buffer = Buffer.from(await res.arrayBuffer());
    if (!buffer.length || buffer.length > 25 * 1024 * 1024) {
      if (isGs25Url) {
        const sessionPdf = await fetchGs25PdfBufferWithSession({ sourceUrl, pdfUrl: normalizedUrl });
        if (sessionPdf?.buffer) return sessionPdf.buffer;
      }
      return null;
    }
    return buffer;
  } catch {
    if (isGs25Url) {
      const sessionPdf = await fetchGs25PdfBufferWithSession({ sourceUrl, pdfUrl: normalizedUrl });
      if (sessionPdf?.buffer) return sessionPdf.buffer;
    }
    return null;
  }
}

async function extractPdfTextViaOcr(
  pdfUrl: string,
  options?: { siteId?: string; sourceUrl?: string },
): Promise<{ text: string; confidence: number; error: string | null }> {
  const normalizedUrl = String(pdfUrl || '').trim();
  if (!normalizedUrl) return { text: '', confidence: 0, error: 'missing pdf url' };
  if (pdfOcrCache.has(normalizedUrl)) {
    const cached = pdfOcrCache.get(normalizedUrl)!;
    return { text: cached.text, confidence: cached.confidence, error: cached.error };
  }

  const openai = getOpenAiClient();
  if (!openai) {
    const result = { text: '', confidence: 0, error: 'OPENAI_API_KEY not configured' };
    pdfOcrCache.set(normalizedUrl, result);
    return result;
  }

  const pdfBuffer = await fetchPdfBuffer(normalizedUrl, options);
  if (!pdfBuffer) {
    const result = { text: '', confidence: 0, error: 'pdf buffer unavailable' };
    pdfOcrCache.set(normalizedUrl, result);
    return result;
  }

  let fileId = '';
  try {
    const file = new File([new Uint8Array(pdfBuffer)], `pricing-${shortHash(normalizedUrl)}.pdf`, { type: 'application/pdf' });
    const uploaded = await openai.files.create({ file, purpose: 'user_data' });
    fileId = uploaded.id;

    const response = await Promise.race([
      openai.responses.create({
        model: process.env.PDF_OCR_MODEL || 'gpt-4.1-mini',
        max_output_tokens: 1800,
        input: [
          {
            role: 'user',
            content: [
              {
                type: 'input_text',
                text: [
                  'Extract only text relevant for tour pricing and periods.',
                  'Include lines that mention date/period code, adult price, child with bed, child without bed, infant, single supplement, and deposit.',
                  'Keep original wording and numbers. Return plain text only.',
                ].join('\n'),
              },
              { type: 'input_file', file_id: uploaded.id },
            ],
          },
        ],
      }),
      new Promise((_, reject) => setTimeout(() => reject(new Error(`OCR timeout ${PDF_OCR_TIMEOUT_MS}ms`)), PDF_OCR_TIMEOUT_MS)),
    ]) as Awaited<ReturnType<typeof openai.responses.create>>;

    const text = String((response as any)?.output_text || '').trim();
    const confidence = text ? 0.65 : 0;
    const result = { text, confidence, error: null };
    pdfOcrCache.set(normalizedUrl, result);
    return result;
  } catch (error: any) {
    const result = { text: '', confidence: 0, error: String(error?.message || error || 'OCR failed') };
    pdfOcrCache.set(normalizedUrl, result);
    return result;
  } finally {
    if (fileId) {
      await openai.files.delete(fileId).catch(() => undefined);
    }
  }
}

async function fetchPdfText(pdfUrl: string, options?: { siteId?: string; sourceUrl?: string }): Promise<string> {
  const normalizedUrl = String(pdfUrl || '').trim();
  if (!normalizedUrl) return '';
  if (pdfTextCache.has(normalizedUrl)) return pdfTextCache.get(normalizedUrl) || '';

  let text = '';
  try {
    const buffer = await fetchPdfBuffer(normalizedUrl, options);
    if (!buffer) throw new Error('pdf buffer unavailable');
    const parser = new PDFParse({ data: buffer });
    try {
      const parsed = await parser.getText();
      text = String(parsed?.text || '').trim();
    } finally {
      await parser.destroy().catch(() => undefined);
    }
  } catch {
    text = '';
  }

  pdfTextCache.set(normalizedUrl, text);
  return text;
}

async function fetchPdfTextForExtraction(
  pdfUrl: string,
  options?: { siteId?: string; sourceUrl?: string },
): Promise<PdfTextExtractionMeta> {
  const embeddedText = await fetchPdfText(pdfUrl, options);
  const embeddedSnippet = buildExtractedTextSnippet(embeddedText);

  if (!looksLikeScanPdfText(embeddedText)) {
    return {
      text: embeddedText,
      source: embeddedText ? 'embedded' : 'none',
      extractionConfidence: embeddedText ? 0.78 : 0,
      extractedTextSnippet: embeddedSnippet,
      ocrError: null,
    };
  }

  const ocr = await extractPdfTextViaOcr(pdfUrl, options);
  if (ocr.text) {
    return {
      text: ocr.text,
      source: 'ocr',
      extractionConfidence: Math.max(ocr.confidence, 0.45),
      extractedTextSnippet: buildExtractedTextSnippet(ocr.text),
      ocrError: null,
    };
  }

  return {
    text: embeddedText,
    source: embeddedText ? 'embedded' : 'none',
    extractionConfidence: 0,
    extractedTextSnippet: embeddedSnippet,
    ocrError: ocr.error,
  };
}

const scraperPdfUrlCache = new Map<string, string>();

function decodeHtmlEntities(value: string): string {
  return String(value || '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

async function loadPlaywrightModule(): Promise<any | null> {
  const dynamicImport = new Function('modulePath', 'return import(modulePath)') as (modulePath: string) => Promise<any>;
  try {
    return await dynamicImport('playwright');
  } catch {
    try {
      return await dynamicImport('../../tour-scraper/node_modules/playwright');
    } catch {
      return null;
    }
  }
}

async function ensureGs25Session(): Promise<Gs25Session | null> {
  if (gs25SessionDisabled) return null;
  if (gs25Session) return gs25Session;
  if (gs25SessionInitPromise) return gs25SessionInitPromise;

  gs25SessionInitPromise = (async () => {
    const username = String(process.env.GS25_EMAIL || process.env.GS25_USERNAME || '').trim();
    const password = String(process.env.GS25_PASSWORD || '').trim();
    if (!username || !password) {
      gs25SessionDisabled = true;
      return null;
    }

    const playwright = await loadPlaywrightModule();
    if (!playwright?.chromium) {
      gs25SessionDisabled = true;
      return null;
    }

    const browser = await playwright.chromium.launch({ headless: true });
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    });
    const loginPage = await context.newPage();

    await loginPage.goto(GS25_LOGIN_URL, { waitUntil: 'networkidle', timeout: PDF_OCR_TIMEOUT_MS });
    await loginPage.fill('input[name="username"]', username);
    await loginPage.fill('input[name="password"]', password);
    await Promise.all([
      loginPage.waitForNavigation({ waitUntil: 'networkidle', timeout: PDF_OCR_TIMEOUT_MS }).catch(() => undefined),
      loginPage.click('button[type="submit"]'),
    ]);
    await loginPage.waitForTimeout(800);
    const session = { browser, context, loginPage };
    gs25Session = session;
    return session;
  })()
    .catch(() => {
      gs25SessionDisabled = true;
      return null;
    })
    .finally(() => {
      gs25SessionInitPromise = null;
    });

  return gs25SessionInitPromise;
}

async function closeGs25Session(): Promise<void> {
  if (!gs25Session) return;
  const session = gs25Session;
  gs25Session = null;
  await session.loginPage?.close().catch(() => undefined);
  await session.context?.close().catch(() => undefined);
  await session.browser?.close().catch(() => undefined);
}

function htmlToLines(html: string): string[] {
  const text = String(html || '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, '\n')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\r/g, '\n');
  return splitTextLines(decodeHtmlEntities(text));
}

function collectPdfCandidatesFromHtml(html: string, sourceUrl: string): string[] {
  const candidates = new Set<string>();
  const add = (raw: string) => {
    const href = decodeHtmlEntities(String(raw || '').trim());
    if (!href) return;
    try {
      const abs = /^https?:\/\//i.test(href) ? href : new URL(href, sourceUrl).toString();
      if (/\.pdf(\?|$)/i.test(abs) || /documents\/pdfview\//i.test(abs) || /program_pdf_/i.test(abs)) {
        candidates.add(abs);
      }
    } catch {
      return;
    }
  };
  for (const m of html.matchAll(/href=["']([^"']+)["']/gi)) add(m[1] || '');
  for (const m of html.matchAll(/https?:\/\/[^"'\s>]*(?:\.pdf|documents\/pdfview\/|program_pdf_)[^"'\s>]*/gi)) add(m[0] || '');
  return Array.from(candidates);
}

async function fetchGs25PdfBufferWithSession(params: {
  sourceUrl?: string;
  pdfUrl?: string;
}): Promise<{ pdfUrl: string; buffer: Buffer } | null> {
  const session = await ensureGs25Session();
  if (!session) return null;

  const sourceUrl = String(params.sourceUrl || '').trim();
  const candidates = new Set<string>();
  const currentPdfUrl = String(params.pdfUrl || '').trim();
  if (/^https?:\/\//i.test(currentPdfUrl)) candidates.add(currentPdfUrl);

  if (/^https?:\/\//i.test(sourceUrl)) {
    const detailPage = await session.context.newPage();
    try {
      await detailPage.goto(sourceUrl, { waitUntil: 'networkidle', timeout: PDF_OCR_TIMEOUT_MS });
      await detailPage.waitForTimeout(600);
      const html = await detailPage.content();
      for (const url of collectPdfCandidatesFromHtml(html, sourceUrl)) candidates.add(url);
    } catch {
      // ignore; continue with known candidates
    } finally {
      await detailPage.close().catch(() => undefined);
    }
  }

  for (const candidate of candidates) {
    try {
      const response = await session.context.request.get(candidate, {
        timeout: PDF_OCR_TIMEOUT_MS,
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
      const signature = buffer.slice(0, 4).toString('latin1');
      const isPdf = contentType.includes('pdf') || signature === '%PDF' || /\.pdf(\?|$)/i.test(candidate);
      if (!isPdf) continue;
      return { pdfUrl: candidate, buffer };
    } catch {
      continue;
    }
  }

  return null;
}

function parseSeatSnapshotFromText(source: string): { total: number | null; available: number | null; booked: number | null } {
  const text = String(source || '');
  if (!text) return { total: null, available: null, booked: null };

  const slash = text.match(/(?:seats?|ที่นั่ง|คงเหลือ)?\s*[:=]?\s*(\d{1,3})\s*\/\s*(\d{1,3})/i);
  if (slash) {
    const left = clampInt(toNum(slash[1]));
    const total = clampInt(toNum(slash[2]));
    if (left !== null && total !== null && total >= left) {
      return { total, available: left, booked: total - left };
    }
  }

  const totalMatch = text.match(/(?:ทั้งหมด|ที่นั่งรวม|total\s*seats?)\s*[:=]?\s*(\d{1,3})/i);
  const availMatch = text.match(/(?:คงเหลือ|เหลือ|available|seats?\s*left)\s*[:=]?\s*(\d{1,3})/i);
  const bookedMatch = text.match(/(?:จอง|booked|sold)\s*[:=]?\s*(\d{1,3})/i);

  const total = totalMatch ? clampInt(toNum(totalMatch[1])) : null;
  const available = availMatch ? clampInt(toNum(availMatch[1])) : null;
  const booked = bookedMatch ? clampInt(toNum(bookedMatch[1])) : null;

  if (total !== null && available !== null) return { total, available, booked: Math.max(total - available, 0) };
  if (total !== null && booked !== null) return { total, available: Math.max(total - booked, 0), booked };
  return { total, available, booked };
}

function inferPeriodStatus(rawText: string): string {
  const value = String(rawText || '').toLowerCase();
  if (/เต็ม|sold\s*out|full|close|closed|หมด/i.test(value)) return 'FULL';
  if (/cancel|ยกเลิก/i.test(value)) return 'CANCELLED';
  return 'AVAILABLE';
}

function parsePeriodsFromSourceLines(lines: string[]): Array<{
  start_date: string | null;
  end_date: string | null;
  price: number | null;
  seats_left: number | null;
  status: string;
  raw_text: string;
}> {
  const rows: Array<{
    start_date: string | null;
    end_date: string | null;
    price: number | null;
    seats_left: number | null;
    status: string;
    raw_text: string;
  }> = [];
  const seen = new Set<string>();

  for (let i = 0; i < lines.length; i += 1) {
    const line = String(lines[i] || '').trim();
    if (!line) continue;
    const windowText = [line, lines[i + 1] || '', lines[i + 2] || ''].join(' | ');
    const dates = parseDateCandidatesFromLine(windowText);
    if (dates.length === 0) continue;

    const startDate = dates[0] || null;
    const endDate = dates[1] || null;
    const amounts = extractAmounts(windowText).filter((n) => n >= 1500 && n <= 500000);
    const price = amounts.length > 0 ? Math.min(...amounts) : null;
    const seat = parseSeatSnapshotFromText(windowText);
    const key = `${startDate || 'na'}|${endDate || 'na'}|${price || 0}|${seat.available || -1}`;
    if (seen.has(key)) continue;
    seen.add(key);

    rows.push({
      start_date: startDate,
      end_date: endDate,
      price: price ? clampInt(price) : null,
      seats_left: seat.available,
      status: inferPeriodStatus(windowText),
      raw_text: windowText.slice(0, 500),
    });
  }

  return rows;
}

async function fetchSourcePageHtml(sourceUrl: string): Promise<string> {
  const url = String(sourceUrl || '').trim();
  if (!/^https?:\/\//i.test(url)) return '';
  try {
    const res = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      signal: AbortSignal.timeout(PDF_TIMEOUT_MS),
      cache: 'no-store',
      headers: {
        'user-agent': 'Mozilla/5.0 (compatible; JongTourBot/1.0; +https://jongtour.com)',
        Accept: 'text/html,application/xhtml+xml',
      },
    });
    if (!res.ok) return '';
    return await res.text();
  } catch {
    return '';
  }
}

async function resolveSourcePeriodsFallback(siteId: string, sourceUrl: string) {
  const html = await fetchSourcePageHtml(sourceUrl);
  if (!html) return [] as Array<{
    start_date: string | null;
    end_date: string | null;
    price: number | null;
    seats_left: number | null;
    status: string;
    raw_text: string;
  }>;

  const lines = htmlToLines(html);
  const parsed = parsePeriodsFromSourceLines(lines);

  if (parsed.length > 0) return parsed;

  if (siteId === 'gs25') {
    const sessionPdf = await fetchGs25PdfBufferWithSession({ sourceUrl });
    if (sessionPdf?.pdfUrl) {
      return [{
        start_date: extractFirstDepartureDateFromText(lines.join('\n')),
        end_date: null,
        price: null,
        seats_left: null,
        status: 'AVAILABLE',
        raw_text: `fallback_from_source|pdf=${sessionPdf.pdfUrl}`,
      }];
    }
  }

  return [];
}

async function resolveScraperPdfUrl(params: {
  siteId: string;
  sourceUrl: string;
  currentPdfUrl: string;
}): Promise<string> {
  const siteId = String(params.siteId || '').trim().toLowerCase();
  const sourceUrl = String(params.sourceUrl || '').trim();
  const currentPdfUrl = String(params.currentPdfUrl || '').trim();
  if (!sourceUrl) return currentPdfUrl;

  const cacheKey = `${siteId}|${sourceUrl}`;
  const mustRefreshEverySync = siteId === 'bestintl';
  if (!mustRefreshEverySync && scraperPdfUrlCache.has(cacheKey)) {
    return scraperPdfUrlCache.get(cacheKey) || currentPdfUrl;
  }

  let resolved = currentPdfUrl;
  let html = '';
  try {
    const res = await fetch(sourceUrl, {
      method: 'GET',
      redirect: 'follow',
      signal: AbortSignal.timeout(PDF_TIMEOUT_MS),
      cache: 'no-store',
      headers: {
        'user-agent': 'Mozilla/5.0 (compatible; JongTourBot/1.0; +https://jongtour.com)',
      },
    });
    if (res.ok) {
      html = await res.text();
      const candidates = collectPdfCandidatesFromHtml(html, sourceUrl).filter((url) => {
        if (siteId !== 'gs25') return true;
        return !/documents\/pdfview\//i.test(url) || /\.pdf(\?|$)/i.test(url);
      });
      if (candidates.length > 0) {
        resolved = candidates[0];
      }

      if (!resolved && siteId === 'gs25') {
        const gs25PathMatch = html.match(/\/documents\/pdfview\/[^"'\\s<>]+/i);
        if (gs25PathMatch?.[0]) {
          resolved = new URL(decodeHtmlEntities(gs25PathMatch[0]), sourceUrl).toString();
        }
      }
    }
  } catch {
    resolved = currentPdfUrl;
  }

  if (siteId === 'gs25' && (!resolved || /documents\/pdfview\//i.test(resolved))) {
    const sessionPdf = await fetchGs25PdfBufferWithSession({ sourceUrl, pdfUrl: resolved || currentPdfUrl });
    if (sessionPdf?.pdfUrl) {
      resolved = sessionPdf.pdfUrl;
    } else if (html) {
      const strictPdf = collectPdfCandidatesFromHtml(html, sourceUrl).find((url) => /\.pdf(\?|$)/i.test(url));
      if (strictPdf) resolved = strictPdf;
    }
  }

  scraperPdfUrlCache.set(cacheKey, resolved || currentPdfUrl);
  return resolved || currentPdfUrl;
}

function pickPaxPrice(priceSource: Record<string, number>, keys: string[]): number | null {
  for (const key of keys) {
    const amount = toNum(priceSource[key]);
    if (amount > 0) return amount;
  }
  return null;
}

function normalizePaxType(raw: any): string {
  const source = String(raw || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (!source) return '';
  if (source.includes('ADULT') || source === 'JOIN' || source === 'LAND' || source.includes('DOUBLE')) return 'ADULT';
  if (source.includes('CHILDWITHBED') || source.includes('CHILDBED') || source === 'CHILDWB') return 'CHILD_WITH_BED';
  if (source.includes('CHILDWITHOUTBED') || source.includes('CHILDNOBED') || source === 'CHILDNB') return 'CHILD_NO_BED';
  if (source === 'CHILD') return 'CHILD';
  if (source.includes('INFANT')) return 'INFANT';
  if (source.includes('SINGLESUPP') || source === 'SINGLE' || source.includes('SINGLEROOM') || source.includes('PRICEFORONE')) return 'SINGLE_SUPP';
  if (source.includes('DEPOSIT') || source.includes('BOOKINGFEE') || source.includes('DOWNPAYMENT')) return 'DEPOSIT';
  return source;
}

function collectPeriodsFromPayload(payload: any): any[] {
  if (!payload || typeof payload !== 'object') return [];
  const candidates = [
    payload.periods,
    payload.Periods,
    payload.tour_periods,
    payload.departure_periods,
    payload.schedule,
  ];
  for (const item of candidates) {
    if (Array.isArray(item) && item.length > 0) return item;
  }
  return [];
}

function buildPeriodLookup(periods: any[]): Record<string, any> {
  const map: Record<string, any> = {};
  const add = (key: any, row: any) => {
    const normalized = String(key || '').trim();
    if (!normalized) return;
    if (!map[normalized]) map[normalized] = row;
  };
  for (const period of periods || []) {
    add(period?.id, period);
    add(period?.period_id, period);
    add(period?.PeriodID, period);
    add(period?.period_code, period);
    add(period?.PeriodCode, period);
    add(period?.code, period);
  }
  return map;
}

function resolvePeriodForDeparture(departure: any, lookup: Record<string, any>): any | null {
  const keys = [
    departure?.externalDepartureId,
    departure?.id,
    departure?.source_departure_key,
    departure?.period_id,
    departure?.PeriodID,
  ]
    .map((value) => String(value || '').trim())
    .filter(Boolean);
  for (const key of keys) {
    if (lookup[key]) return lookup[key];
  }
  return null;
}

function hasUsefulPricing(parsed: ExtractedPricingFromText | null | undefined): boolean {
  if (!parsed) return false;
  return !!(
    (parsed.adult?.amount && parsed.adult.amount > 0) ||
    (parsed.childWithBed?.amount && parsed.childWithBed.amount > 0) ||
    (parsed.childWithoutBed?.amount && parsed.childWithoutBed.amount > 0) ||
    (parsed.infant?.amount && parsed.infant.amount > 0) ||
    (parsed.single?.amount && parsed.single.amount > 0) ||
    (parsed.deposit?.amount && parsed.deposit.amount > 0)
  );
}

function makePdfJobKey(wholesaleId: string, departureId: string | null, pdfUrl: string): string {
  return shortHash(`${wholesaleId}|${departureId || ''}|${String(pdfUrl || '').trim().toLowerCase()}`) + ':' + (departureId || 'tour');
}

const THAI_MONTH_MAP: Record<string, number> = {
  '\u0E21\u0E04': 1,
  '\u0E01\u0E1E': 2,
  '\u0E21\u0E35\u0E04': 3,
  '\u0E40\u0E21\u0E22': 4,
  '\u0E1E\u0E04': 5,
  '\u0E21\u0E34\u0E22': 6,
  '\u0E01\u0E04': 7,
  '\u0E2A\u0E04': 8,
  '\u0E01\u0E22': 9,
  '\u0E15\u0E04': 10,
  '\u0E1E\u0E22': 11,
  '\u0E18\u0E04': 12,
};

const EN_MONTH_MAP: Record<string, number> = {
  jan: 1, january: 1,
  feb: 2, february: 2,
  mar: 3, march: 3,
  apr: 4, april: 4,
  may: 5,
  jun: 6, june: 6,
  jul: 7, july: 7,
  aug: 8, august: 8,
  sep: 9, sept: 9, september: 9,
  oct: 10, october: 10,
  nov: 11, november: 11,
  dec: 12, december: 12,
};

function normalizeCodeToken(value: string): string {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u0E00-\u0E7F]/g, '');
}

function buildCodeTokens(raw: string): string[] {
  const source = String(raw || '').trim();
  if (!source) return [];
  const set = new Set<string>();
  const lower = source.toLowerCase();
  set.add(lower);
  const normalized = normalizeCodeToken(source);
  if (normalized.length >= 3) set.add(normalized);

  for (const part of source.split(/[\s|,;:/()\-_.]+/)) {
    const clean = normalizeCodeToken(part);
    if (clean.length >= 3) set.add(clean);
  }
  for (const match of source.matchAll(/[A-Za-z]{1,8}\d{2,10}|\d{2,10}[A-Za-z]{1,8}/g)) {
    const clean = normalizeCodeToken(match[0]);
    if (clean.length >= 3) set.add(clean);
  }
  return Array.from(set).slice(0, 20);
}

function normalizeYear(year: number): number {
  if (!Number.isFinite(year)) return year;
  if (year >= 2400 && year <= 2600) return year - 543;
  if (year >= 0 && year < 100) return year + 2000;
  return year;
}

function toIsoDateString(yearRaw: number, monthRaw: number, dayRaw: number): string | null {
  const year = normalizeYear(yearRaw);
  const month = Number(monthRaw);
  const day = Number(dayRaw);
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) return null;
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const dt = new Date(Date.UTC(year, month - 1, day));
  if (
    dt.getUTCFullYear() !== year ||
    dt.getUTCMonth() + 1 !== month ||
    dt.getUTCDate() !== day
  ) {
    return null;
  }
  return dt.toISOString().slice(0, 10);
}

function parseMonthNumberFromToken(token: string): number | null {
  const normalized = String(token || '')
    .toLowerCase()
    .replace(/[.\s]/g, '')
    .replace(/[^a-z\u0E00-\u0E7F]/g, '');
  if (!normalized) return null;
  if (EN_MONTH_MAP[normalized]) return EN_MONTH_MAP[normalized];
  if (THAI_MONTH_MAP[normalized]) return THAI_MONTH_MAP[normalized];
  return null;
}

function parseDateCandidatesFromLine(line: string): string[] {
  const source = String(line || '');
  if (!source) return [];
  const dates = new Set<string>();

  for (const m of source.matchAll(/\b(\d{4})[\/.-](\d{1,2})[\/.-](\d{1,2})\b/g)) {
    const iso = toIsoDateString(Number(m[1]), Number(m[2]), Number(m[3]));
    if (iso) dates.add(iso);
  }

  for (const m of source.matchAll(/\b(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{2,4})\b/g)) {
    const iso = toIsoDateString(Number(m[3]), Number(m[2]), Number(m[1]));
    if (iso) dates.add(iso);
  }

  for (const m of source.matchAll(/(\d{1,2})\s*([A-Za-z\u0E00-\u0E7F.]{2,20})\s*(\d{2,4})/g)) {
    const month = parseMonthNumberFromToken(m[2]);
    if (!month) continue;
    const iso = toIsoDateString(Number(m[3]), month, Number(m[1]));
    if (iso) dates.add(iso);
  }

  return Array.from(dates);
}

function extractFirstDepartureDateFromText(text: string): string | null {
  const lines = splitTextLines(text);
  const allDates = new Set<string>();
  for (const line of lines) {
    for (const iso of parseDateCandidatesFromLine(line)) {
      allDates.add(iso);
    }
  }
  if (allDates.size === 0) return null;
  return Array.from(allDates).sort()[0] || null;
}

function formatIsoDateTokens(isoDate: string | null): string[] {
  if (!isoDate) return [];
  const match = String(isoDate).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return [];
  const yyyy = match[1];
  const mm = match[2];
  const dd = match[3];
  const yyyyBe = String(Number(yyyy) + 543);
  const d = String(Number(dd));
  const m = String(Number(mm));
  return [
    `${yyyy}-${mm}-${dd}`,
    `${dd}/${mm}/${yyyy}`,
    `${dd}-${mm}-${yyyy}`,
    `${dd}.${mm}.${yyyy}`,
    `${d}/${m}/${yyyy}`,
    `${d}-${m}-${yyyy}`,
    `${dd}/${mm}/${yyyyBe}`,
    `${dd}-${mm}-${yyyyBe}`,
    `${d}/${m}/${yyyyBe}`,
    `${d}-${m}-${yyyyBe}`,
  ];
}

function extractDepartureContextPricing(lines: string[], departure: JobDepartureContext): ExtractedPricingFromText | null {
  const keyTokens = new Set<string>([
    ...departure.departureKeyTokens,
    ...departure.tourCodeTokens,
  ]);
  const depDate = String(departure.departureDate || '');
  const retDate = String(departure.returnDate || '');
  const anchors: Array<{ index: number; score: number }> = [];

  lines.forEach((line, idx) => {
    const lineLower = String(line || '').toLowerCase();
    const lineNormalized = normalizeCodeToken(lineLower);
    let score = 0;

    for (const token of keyTokens) {
      if (!token || token.length < 3) continue;
      if (lineLower.includes(token) || lineNormalized.includes(token)) {
        score += departure.departureKeyTokens.includes(token) ? 5 : 2;
      }
    }

    const candidateDates = parseDateCandidatesFromLine(line);
    const hasDepDate = depDate && candidateDates.includes(depDate);
    const hasRetDate = retDate && candidateDates.includes(retDate);
    if (hasDepDate) score += 4;
    if (hasRetDate) score += 4;
    if (hasDepDate && hasRetDate) score += 3;

    for (const token of formatIsoDateTokens(depDate || null)) {
      if (token && lineLower.includes(token.toLowerCase())) score += 2;
    }
    for (const token of formatIsoDateTokens(retDate || null)) {
      if (token && lineLower.includes(token.toLowerCase())) score += 2;
    }

    if (score > 0) anchors.push({ index: idx, score });
  });
  if (anchors.length === 0) return null;

  const contextSet = new Set<string>();
  const sortedAnchors = anchors
    .sort((a, b) => b.score - a.score)
    .slice(0, 18);

  for (const anchor of sortedAnchors) {
    const idx = anchor.index;
    const start = Math.max(0, idx - 3);
    const end = Math.min(lines.length - 1, idx + 7);
    for (let i = start; i <= end; i += 1) {
      contextSet.add(lines[i]);
    }
  }

  const contextText = Array.from(contextSet).join('\n');
  const parsed = extractPricingFromTextWithContext(contextText);
  return hasUsefulPricing(parsed) ? parsed : null;
}

function buildMissingFields(payload: {
  departureDate: any;
  adultPrice: number;
  childWithBedPrice: number;
  childWithoutBedPrice: number;
  singlePrice: number;
  depositAmount: number;
  depositType: string;
  seatTotal: number | null;
  seatAvailable: number | null;
  seatBooked: number | null;
  pdfUrl: string;
}): string[] {
  const missing: string[] = [];
  if (!payload.departureDate) missing.push('departure_date');
  if (!(payload.adultPrice > 0)) missing.push('adult_price');
  if (!(payload.childWithBedPrice > 0) && !(payload.childWithoutBedPrice > 0)) missing.push('child_price');
  if (!(payload.singlePrice > 0)) missing.push('single_supplement_price');
  if (!(payload.depositAmount > 0)) missing.push('deposit_amount');
  if (String(payload.depositType || 'unknown') === 'unknown') missing.push('deposit_type');
  if (payload.seatTotal === null || payload.seatTotal === undefined) missing.push('seat_total');
  if (payload.seatBooked === null || payload.seatBooked === undefined) missing.push('seat_booked');
  if (payload.seatAvailable === null || payload.seatAvailable === undefined) missing.push('seat_available');
  if (!payload.pdfUrl) missing.push('pdf_url');
  return missing;
}

function extractStructuredPriceFromPayload(payload: any): {
  adult: number | null;
  childWithBed: number | null;
  childWithoutBed: number | null;
  infant: number | null;
  single: number | null;
  deposit: number | null;
  depositType: 'per_person' | 'per_booking' | 'unknown';
} {
  const candidates: Record<string, Array<{ amount: number; key: string }>> = {
    adult: [],
    childWithBed: [],
    childWithoutBed: [],
    infant: [],
    single: [],
    deposit: [],
  };
  const visited = new Set<any>();

  const pushCandidate = (bucket: keyof typeof candidates, key: string, value: any) => {
    const amount = toNum(value);
    if (amount > 0) candidates[bucket].push({ amount, key });
  };

  const walk = (node: any, depth = 0) => {
    if (depth > 6 || node === null || node === undefined) return;
    if (visited.has(node)) return;
    if (typeof node === 'object') visited.add(node);

    if (Array.isArray(node)) {
      for (const item of node) walk(item, depth + 1);
      return;
    }

    if (typeof node !== 'object') return;
    for (const [rawKey, value] of Object.entries(node)) {
      const key = String(rawKey || '').toLowerCase();
      if (/adult|priceadult|double|join|land/.test(key)) pushCandidate('adult', key, value);
      if (/child.*with.*bed|childbed|child_wb|childprice/.test(key)) pushCandidate('childWithBed', key, value);
      if (/child.*no.*bed|child.*without.*bed|child_nb|childnobed/.test(key)) pushCandidate('childWithoutBed', key, value);
      if (/infant/.test(key)) pushCandidate('infant', key, value);
      if (/single|supplement/.test(key)) pushCandidate('single', key, value);
      if (/deposit|booking.?fee|down.?payment|มัดจำ|จอง/.test(key)) pushCandidate('deposit', key, value);

      if (typeof value === 'object') walk(value, depth + 1);
    }
  };
  walk(payload, 0);

  const pickFirst = (items: Array<{ amount: number }>): number | null => (items.length > 0 ? items[0].amount : null);
  const pickMin = (items: Array<{ amount: number }>): number | null =>
    items.length > 0 ? Math.min(...items.map((item) => item.amount)) : null;

  const depositType = normalizeDepositType(
    payload?.deposit_type ||
    payload?.depositType ||
    payload?.deposit_rule ||
    payload?.depositRule ||
    payload?.deposit_mode ||
    '',
  );

  return {
    adult: pickFirst(candidates.adult),
    childWithBed: pickFirst(candidates.childWithBed),
    childWithoutBed: pickFirst(candidates.childWithoutBed),
    infant: pickFirst(candidates.infant),
    single: pickMin(candidates.single),
    deposit: pickMin(candidates.deposit),
    depositType,
  };
}

type SupabaseWriteResult<T = any> = { data: T | null; error: { message: string } | null };
const SUPABASE_PAGE_SIZE = 1000;
const SUPABASE_IN_CHUNK_SIZE = 180;

async function assertWrite<T = any>(promise: Promise<SupabaseWriteResult<T>>, context: string): Promise<T | null> {
  const result = await promise;
  if (result.error) {
    throw new Error(`${context}: ${result.error.message}`);
  }
  return result.data;
}

async function fetchAllPages<T>(
  fetchPage: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: { message: string } | null }>,
  context: string,
): Promise<T[]> {
  const rows: T[] = [];
  for (let page = 0; page < 200; page += 1) {
    const from = page * SUPABASE_PAGE_SIZE;
    const to = from + SUPABASE_PAGE_SIZE - 1;
    const result = await fetchPage(from, to);
    if (result.error) throw new Error(`${context}: ${result.error.message}`);
    const batch = result.data || [];
    rows.push(...batch);
    if (batch.length < SUPABASE_PAGE_SIZE) break;
  }
  return rows;
}

async function fetchRowsByIdsChunked<T>(params: {
  table: string;
  select: string;
  idColumn: string;
  ids: string[];
  where?: Record<string, any>;
  context: string;
}): Promise<T[]> {
  const sb = getSupabaseAdmin();
  const rows: T[] = [];
  for (let i = 0; i < params.ids.length; i += SUPABASE_IN_CHUNK_SIZE) {
    const chunk = params.ids.slice(i, i + SUPABASE_IN_CHUNK_SIZE);
    if (chunk.length === 0) continue;
    let query: any = sb.from(params.table).select(params.select).in(params.idColumn, chunk);
    if (params.where) {
      for (const [key, value] of Object.entries(params.where)) {
        query = query.eq(key, value as any);
      }
    }
    const result = await query;
    if (result.error) throw new Error(`${params.context}: ${result.error.message}`);
    rows.push(...(result.data || []));
  }
  return rows;
}

async function ensureQualityTables() {
  const sb = getSupabaseAdmin();
  const nowIso = new Date().toISOString();

  const checks = await Promise.all([
    sb.from('sync_quality_reports').select('id').limit(1),
    sb.from('sync_quality_issues').select('id').limit(1),
  ]);

  const reportMissing = !!checks[0].error;
  const issueMissing = !!checks[1].error;
  if (!reportMissing && !issueMissing) return;

  // Fallback bootstrap via insert/delete when tables exist but empty.
  // If table truly does not exist, this will throw and be handled by caller.
  if (!reportMissing) {
    const tmp = await assertWrite(
      sb.from('sync_quality_reports').insert({
        wholesale_id: '__bootstrap__',
        generated_at: nowIso,
        status: 'BOOTSTRAP',
        total_mapped_tours: 0,
        total_departures: 0,
        complete_departures: 0,
        missing_departure_count: 0,
        missing_adult_price_count: 0,
        missing_deposit_count: 0,
        missing_seat_count: 0,
        missing_pdf_count: 0,
        invalid_seat_count: 0,
        completeness_percent: 0,
        summary: {},
      }).select('id').limit(1) as any,
      'sync_quality_reports bootstrap insert',
    );
    const id = (tmp as any)?.[0]?.id;
    if (id) {
      await assertWrite(sb.from('sync_quality_reports').delete().eq('id', id) as any, 'sync_quality_reports bootstrap cleanup');
    }
  }
}

function pushIssue(target: QualityIssue[], issue: QualityIssue) {
  target.push(issue);
}

async function runWholesalerQualityValidation(wholesaleId: string): Promise<{
  report: QualityReportRow;
  issues: QualityIssue[];
}> {
  const sb = getSupabaseAdmin();
  await ensureQualityTables();

  const [mappings, departures, pdfs] = await Promise.all([
    fetchAllPages<any>(
      (from, to) =>
        sb.from('wholesale_tour_mappings')
          .select('canonical_tour_id, wholesale_id, source_tour_key, source_tour_code')
          .eq('wholesale_id', wholesaleId)
          .range(from, to),
      'load wholesale_tour_mappings (quality)',
    ),
    fetchAllPages<any>(
      (from, to) =>
        sb.from('tour_departures')
          .select('id, canonical_tour_id, wholesale_id, source_departure_key, departure_date, return_date, status')
          .eq('wholesale_id', wholesaleId)
          .range(from, to),
      'load tour_departures (quality)',
    ),
    fetchAllPages<any>(
      (from, to) =>
        sb.from('tour_pdfs')
          .select('canonical_tour_id, wholesale_id, departure_id, pdf_url, is_active')
          .eq('wholesale_id', wholesaleId)
          .eq('is_active', true)
          .range(from, to),
      'load tour_pdfs (quality)',
    ),
  ]);

  const departureIdSet = new Set(departures.map((row: any) => String(row.id)));
  const [prices, seats] = await Promise.all([
    fetchRowsByIdsChunked<any>({
      table: 'tour_prices',
      select: 'departure_id, adult_price, child_with_bed_price, child_without_bed_price, infant_price, single_supplement_price, deposit_amount, deposit_type, extraction_status, need_review',
      idColumn: 'departure_id',
      ids: Array.from(departureIdSet),
      context: 'load tour_prices by departure_ids (quality)',
    }),
    fetchRowsByIdsChunked<any>({
      table: 'tour_seats',
      select: 'departure_id, seat_total, seat_available, seat_booked, source, need_review',
      idColumn: 'departure_id',
      ids: Array.from(departureIdSet),
      context: 'load tour_seats by departure_ids (quality)',
    }),
  ]);

  const mappingRows = mappings || [];
  const departuresRows = (departures || []).filter((row: any) => String(row.wholesale_id || '') === wholesaleId);
  const departureIds = departureIdSet;

  const priceByDeparture: Record<string, any> = {};
  (prices || []).forEach((row: any) => {
    const key = String(row.departure_id || '');
    if (key && departureIds.has(key)) priceByDeparture[key] = row;
  });

  const seatByDeparture: Record<string, any> = {};
  (seats || []).forEach((row: any) => {
    const key = String(row.departure_id || '');
    if (key && departureIds.has(key)) seatByDeparture[key] = row;
  });

  const pdfByDeparture: Record<string, string> = {};
  const pdfByCanonical: Record<string, string> = {};
  (pdfs || []).forEach((row: any) => {
    const depId = String(row.departure_id || '');
    const canonicalId = String(row.canonical_tour_id || '');
    const pdfUrl = String(row.pdf_url || '').trim();
    if (!pdfUrl) return;
    if (depId && !pdfByDeparture[depId]) pdfByDeparture[depId] = pdfUrl;
    if (canonicalId && !pdfByCanonical[canonicalId]) pdfByCanonical[canonicalId] = pdfUrl;
  });

  const issues: QualityIssue[] = [];
  const mappedTourIds = new Set(mappingRows.map((row: any) => String(row.canonical_tour_id || '')).filter(Boolean));
  const departuresByTour: Record<string, number> = {};
  departuresRows.forEach((row: any) => {
    const tourId = String(row.canonical_tour_id || '');
    if (!tourId) return;
    departuresByTour[tourId] = (departuresByTour[tourId] || 0) + 1;
  });

  for (const canonicalTourId of mappedTourIds) {
    if (!departuresByTour[canonicalTourId]) {
      pushIssue(issues, {
        wholesale_id: wholesaleId,
        canonical_tour_id: canonicalTourId,
        departure_id: null,
        issue_code: 'MISSING_DEPARTURE',
        severity: 'error',
        field_name: 'departure_id',
        message: 'Tour mapping has no departure rows',
        payload: {},
      });
    }
  }

  let completeDepartures = 0;
  for (const departure of departuresRows) {
    const departureId = String(departure.id);
    const canonicalTourId = String(departure.canonical_tour_id || '');
    let hasError = false;

    if (!departure.departure_date) {
      hasError = true;
      pushIssue(issues, {
        wholesale_id: wholesaleId,
        canonical_tour_id: canonicalTourId || null,
        departure_id: departureId,
        issue_code: 'MISSING_DATE',
        severity: 'error',
        field_name: 'departure_date',
        message: 'Departure date is missing',
        payload: { departure },
      });
    }

    const price = priceByDeparture[departureId];
    const adultPrice = toNum(price?.adult_price);
    const childWithBed = toNum(price?.child_with_bed_price);
    const childWithoutBed = toNum(price?.child_without_bed_price);
    const singleSupplement = toNum(price?.single_supplement_price);
    if (!(adultPrice > 0)) {
      hasError = true;
      pushIssue(issues, {
        wholesale_id: wholesaleId,
        canonical_tour_id: canonicalTourId || null,
        departure_id: departureId,
        issue_code: 'MISSING_ADULT_PRICE',
        severity: 'error',
        field_name: 'adult_price',
        message: 'Adult price is missing or invalid',
        payload: { price: price || null },
      });
    }

    if (!(childWithBed > 0) && !(childWithoutBed > 0)) {
      hasError = true;
      pushIssue(issues, {
        wholesale_id: wholesaleId,
        canonical_tour_id: canonicalTourId || null,
        departure_id: departureId,
        issue_code: 'MISSING_CHILD_PRICE',
        severity: 'warning',
        field_name: 'child_price',
        message: 'Child price is missing',
        payload: { price: price || null },
      });
    }

    if (!(singleSupplement > 0)) {
      hasError = true;
      pushIssue(issues, {
        wholesale_id: wholesaleId,
        canonical_tour_id: canonicalTourId || null,
        departure_id: departureId,
        issue_code: 'MISSING_SINGLE_SUPPLEMENT',
        severity: 'warning',
        field_name: 'single_supplement_price',
        message: 'Single supplement is missing',
        payload: { price: price || null },
      });
    }

    const deposit = toNum(price?.deposit_amount);
    if (!(deposit > 0)) {
      hasError = true;
      pushIssue(issues, {
        wholesale_id: wholesaleId,
        canonical_tour_id: canonicalTourId || null,
        departure_id: departureId,
        issue_code: 'MISSING_DEPOSIT',
        severity: 'warning',
        field_name: 'deposit_amount',
        message: 'Deposit is missing or invalid',
        payload: { price: price || null },
      });
    }

    const seat = seatByDeparture[departureId];
    const seatTotal = seat?.seat_total === null || seat?.seat_total === undefined ? null : toNum(seat.seat_total);
    const seatAvailable = seat?.seat_available === null || seat?.seat_available === undefined ? null : toNum(seat.seat_available);
    const seatBooked = seat?.seat_booked === null || seat?.seat_booked === undefined
      ? (seatTotal !== null && seatAvailable !== null ? Math.max(seatTotal - seatAvailable, 0) : null)
      : toNum(seat.seat_booked);
    if (seatTotal === null) {
      hasError = true;
      pushIssue(issues, {
        wholesale_id: wholesaleId,
        canonical_tour_id: canonicalTourId || null,
        departure_id: departureId,
        issue_code: 'MISSING_SEAT_TOTAL',
        severity: 'warning',
        field_name: 'seat_total',
        message: 'Seat total is missing',
        payload: { seat: seat || null },
      });
    }
    if (seatBooked === null) {
      hasError = true;
      pushIssue(issues, {
        wholesale_id: wholesaleId,
        canonical_tour_id: canonicalTourId || null,
        departure_id: departureId,
        issue_code: 'MISSING_SEAT_BOOKED',
        severity: 'warning',
        field_name: 'seat_booked',
        message: 'Seat booked is missing',
        payload: { seat: seat || null },
      });
    }
    if (seatAvailable === null) {
      hasError = true;
      pushIssue(issues, {
        wholesale_id: wholesaleId,
        canonical_tour_id: canonicalTourId || null,
        departure_id: departureId,
        issue_code: 'MISSING_SEAT',
        severity: 'warning',
        field_name: 'seat_available',
        message: 'Seat availability is missing',
        payload: { seat: seat || null },
      });
    } else if (seatTotal !== null && seatAvailable > seatTotal) {
      hasError = true;
      pushIssue(issues, {
        wholesale_id: wholesaleId,
        canonical_tour_id: canonicalTourId || null,
        departure_id: departureId,
        issue_code: 'INVALID_SEAT',
        severity: 'error',
        field_name: 'seat_available',
        message: 'Seat availability exceeds seat total',
        payload: { seat: seat || null },
      });
    }

    const pdfUrl = pdfByDeparture[departureId] || pdfByCanonical[canonicalTourId] || '';
    if (!pdfUrl) {
      hasError = true;
      pushIssue(issues, {
        wholesale_id: wholesaleId,
        canonical_tour_id: canonicalTourId || null,
        departure_id: departureId,
        issue_code: 'MISSING_PDF',
        severity: 'warning',
        field_name: 'pdf_url',
        message: 'PDF is missing',
        payload: {},
      });
    }

    if (!hasError) completeDepartures += 1;
  }

  const missingDepartureCount = issues.filter((row) => row.issue_code === 'MISSING_DEPARTURE').length;
  const missingAdultPriceCount = issues.filter((row) => row.issue_code === 'MISSING_ADULT_PRICE').length;
  const missingDepositCount = issues.filter((row) => row.issue_code === 'MISSING_DEPOSIT').length;
  const missingSeatCount = issues.filter((row) => row.issue_code === 'MISSING_SEAT').length;
  const missingPdfCount = issues.filter((row) => row.issue_code === 'MISSING_PDF').length;
  const invalidSeatCount = issues.filter((row) => row.issue_code === 'INVALID_SEAT').length;

  const totalDepartures = departuresRows.length;
  const completenessPercent = totalDepartures > 0 ? Number(((completeDepartures / totalDepartures) * 100).toFixed(2)) : 0;
  const status = issues.some((row) => row.severity === 'error') ? 'FAILED' : issues.length > 0 ? 'PARTIAL' : 'OK';

  const reportPayload = {
    wholesale_id: wholesaleId,
    generated_at: new Date().toISOString(),
    status,
    total_mapped_tours: mappedTourIds.size,
    total_departures: totalDepartures,
    complete_departures: completeDepartures,
    missing_departure_count: missingDepartureCount,
    missing_adult_price_count: missingAdultPriceCount,
    missing_deposit_count: missingDepositCount,
    missing_seat_count: missingSeatCount,
    missing_pdf_count: missingPdfCount,
    invalid_seat_count: invalidSeatCount,
    completeness_percent: completenessPercent,
    summary: {
      required_fields: [
        'canonical_tour_id',
        'wholesale_id',
        'departure_id',
        'departure_date',
        'adult_price',
        'deposit_amount',
        'seat_available',
        'pdf_url',
      ],
      issue_count: issues.length,
    },
  };

  const insertedReport = await assertWrite(
    sb.from('sync_quality_reports').insert(reportPayload).select('*').limit(1) as any,
    'sync_quality_reports insert',
  );

  const reportId = String((insertedReport as any)?.[0]?.id || '');
  if (reportId && issues.length > 0) {
    await assertWrite(
      sb.from('sync_quality_issues').insert(
        issues.map((row) => ({
          report_id: reportId,
          wholesale_id: row.wholesale_id,
          canonical_tour_id: row.canonical_tour_id,
          departure_id: row.departure_id,
          issue_code: row.issue_code,
          severity: row.severity,
          field_name: row.field_name,
          message: row.message,
          payload: row.payload,
        })),
      ) as any,
      'sync_quality_issues insert',
    );
  }

  return {
    report: ((insertedReport as any)?.[0] || {
      ...reportPayload,
      id: '',
    }) as QualityReportRow,
    issues,
  };
}

async function ensureWholesalersSeeded() {
  const sb = getSupabaseAdmin();

  const { data: suppliers } = await sb
    .from('suppliers')
    .select('id, "displayName", "canonicalName"');

  const apiRows = (suppliers || []).map((supplier: any) => ({
    id: String(supplier.id),
    name: String(supplier.displayName || supplier.canonicalName || supplier.id),
    source_type: 'api',
    is_active: true,
    updated_at: new Date().toISOString(),
  }));

  const scraperRows = SCRAPER_WHOLESALERS.map((site) => ({
    id: site.id,
    name: site.name,
    source_type: 'scraper',
    is_active: true,
    updated_at: new Date().toISOString(),
  }));

  const rows = [...apiRows, ...scraperRows];
  if (rows.length === 0) return;
  await assertWrite(sb.from('wholesalers').upsert(rows, { onConflict: 'id' }) as any, 'wholesalers upsert');
}

export async function syncCentralWholesale(options?: {
  wholesalerId?: string;
  includeApi?: boolean;
  includeScraper?: boolean;
  limitPerSource?: number;
}) {
  const includeApi = options?.includeApi ?? true;
  const includeScraper = options?.includeScraper ?? true;
  const limitPerSource = options?.limitPerSource ?? 2000;

  await ensureWholesalersSeeded();

  const results: SyncResult[] = [];
  if (includeApi) {
    const apiResults = await syncFromApiWholesalers({ wholesalerId: options?.wholesalerId, limit: limitPerSource });
    results.push(...apiResults);
  }
  if (includeScraper) {
    const scraperResults = await syncFromScraperWholesalers({ wholesalerId: options?.wholesalerId, limit: limitPerSource });
    results.push(...scraperResults);
  }

  return results;
}

async function ensurePdfExtractionQueueTable() {
  const sb = getSupabaseAdmin();
  const { error } = await sb.from('pdf_extraction_jobs').select('id').limit(1);
  if (error) {
    throw new Error(`pdf_extraction_jobs table is missing. Run scripts/sql/20260514_pdf_extraction_queue.sql first. (${error.message})`);
  }
}

async function buildDepartureMissingMap(wholesaleId?: string): Promise<Record<string, { missingCount: number; missingFields: string[] }>> {
  const rows = await getDepartureCompletenessReport({
    wholesalerId: wholesaleId,
    onlyIncomplete: false,
    limit: 20000,
    offset: 0,
  });
  const map: Record<string, { missingCount: number; missingFields: string[] }> = {};
  for (const row of rows) {
    map[row.departure_id] = {
      missingCount: row.missing_count,
      missingFields: row.missing_fields,
    };
  }
  return map;
}

export async function enqueuePdfExtractionJobs(options?: {
  wholesalerId?: string;
  force?: boolean;
  onlyMissingPricing?: boolean;
  limit?: number;
}) {
  const sb = getSupabaseAdmin();
  await ensurePdfExtractionQueueTable();
  const wholesalerId = String(options?.wholesalerId || '').trim() || undefined;
  const force = Boolean(options?.force);
  const onlyMissingPricing = options?.onlyMissingPricing !== false;
  const limit = Number.isFinite(Number(options?.limit)) ? Math.max(1, Number(options?.limit)) : 5000;

  let pdfQuery = sb
    .from('tour_pdfs')
    .select('id, canonical_tour_id, wholesale_id, departure_id, pdf_url, is_active, extraction_status')
    .eq('is_active', true)
    .limit(limit);
  if (wholesalerId) pdfQuery = pdfQuery.eq('wholesale_id', wholesalerId);
  const { data: pdfRows, error: pdfError } = await pdfQuery;
  if (pdfError) throw new Error(`load tour_pdfs failed: ${pdfError.message}`);

  const missingMap = onlyMissingPricing ? await buildDepartureMissingMap(wholesalerId) : {};
  const jobs: any[] = [];
  let queued = 0;
  let skipped = 0;

  for (const row of pdfRows || []) {
    const wid = String(row.wholesale_id || '').trim();
    const pdfUrl = String(row.pdf_url || '').trim();
    if (!wid || !pdfUrl) continue;
    const departureId = row.departure_id ? String(row.departure_id) : null;

    if (onlyMissingPricing && departureId) {
      const missing = missingMap[departureId];
      if (missing && missing.missingCount === 0) {
        skipped += 1;
        continue;
      }
    }

    const jobKey = makePdfJobKey(wid, departureId, pdfUrl);
    jobs.push({
      job_key: jobKey,
      wholesale_id: wid,
      canonical_tour_id: row.canonical_tour_id ? String(row.canonical_tour_id) : null,
      departure_id: departureId,
      pdf_url: pdfUrl,
      source_hint: String(row.extraction_status || 'raw'),
      status: 'pending',
      attempts: 0,
      priority: departureId ? 100 : 10,
      last_error: null,
      extraction_result: {
        pdf_id: String(row.id || ''),
        extraction_status: 'queued',
      },
      locked_at: null,
      updated_at: new Date().toISOString(),
    });
    queued += 1;
  }

  if (jobs.length === 0) {
    return { queued: 0, skipped, upserted: 0 };
  }

  if (!force) {
    for (const job of jobs) {
      const { data: existingRows } = await sb
        .from('pdf_extraction_jobs')
        .select('id, status')
        .eq('job_key', job.job_key)
        .limit(1);
      const existing = existingRows?.[0];
      if (existing && ['pending', 'processing', 'completed'].includes(String(existing.status || ''))) {
        skipped += 1;
        queued -= 1;
        continue;
      }
      await assertWrite(
        sb.from('pdf_extraction_jobs').upsert(job, { onConflict: 'job_key' }) as any,
        'pdf_extraction_jobs upsert',
      );
    }
    return { queued: Math.max(queued, 0), skipped, upserted: Math.max(queued, 0) };
  }

  await assertWrite(
    sb.from('pdf_extraction_jobs').upsert(jobs, { onConflict: 'job_key' }) as any,
    'pdf_extraction_jobs bulk upsert',
  );
  return { queued, skipped, upserted: queued };
}

async function resolveJobDepartures(job: any): Promise<JobDepartureContext[]> {
  const sb = getSupabaseAdmin();
  const resolveTourCodeTokens = async (canonicalTourId: string, wholesaleId: string): Promise<string[]> => {
    if (!canonicalTourId || !wholesaleId) return [];
    const { data: mappings } = await sb
      .from('wholesale_tour_mappings')
      .select('source_tour_key')
      .eq('canonical_tour_id', canonicalTourId)
      .eq('wholesale_id', wholesaleId)
      .limit(20);
    const tokenSet = new Set<string>();
    for (const row of mappings || []) {
      const sourceTourKey = String((row as any)?.source_tour_key || '').trim();
      for (const token of buildCodeTokens(sourceTourKey)) tokenSet.add(token);
    }
    return Array.from(tokenSet).slice(0, 30);
  };

  const departureId = String(job.departure_id || '').trim();
  if (departureId) {
    const { data: rows, error } = await sb
      .from('tour_departures')
      .select('id, canonical_tour_id, wholesale_id, source_departure_key, departure_date, return_date')
      .eq('id', departureId)
      .limit(1);
    if (error || !rows?.length) return [];
    const row = rows[0];
    const canonicalTourId = String((row as any).canonical_tour_id || '');
    const wholesaleId = String((row as any).wholesale_id || '');
    const sourceDepartureKey = String(row.source_departure_key || '');
    const tourCodeTokens = await resolveTourCodeTokens(canonicalTourId, wholesaleId);
    return [{
      id: String(row.id || departureId),
      sourceDepartureKey,
      departureDate: row.departure_date ? String(row.departure_date) : null,
      returnDate: row.return_date ? String(row.return_date) : null,
      departureKeyTokens: buildCodeTokens(sourceDepartureKey),
      tourCodeTokens,
    }];
  }

  const canonicalTourId = String(job.canonical_tour_id || '').trim();
  const wholesaleId = String(job.wholesale_id || '').trim();
  if (!canonicalTourId || !wholesaleId) return [];

  const tourCodeTokens = await resolveTourCodeTokens(canonicalTourId, wholesaleId);

  const { data: departures, error } = await sb
    .from('tour_departures')
    .select('id, source_departure_key, departure_date, return_date')
    .eq('canonical_tour_id', canonicalTourId)
    .eq('wholesale_id', wholesaleId)
    .limit(5000);
  if (error) return [];
  return (departures || [])
    .map((row: any) => ({
      id: String(row.id || ''),
      sourceDepartureKey: String(row.source_departure_key || ''),
      departureDate: row.departure_date ? String(row.departure_date) : null,
      returnDate: row.return_date ? String(row.return_date) : null,
      departureKeyTokens: buildCodeTokens(String(row.source_departure_key || '')),
      tourCodeTokens,
    }))
    .filter((row: JobDepartureContext) => Boolean(row.id));
}

async function applyPdfExtractionToDepartures(params: {
  wholesaleId: string;
  departureIds: string[];
  pdfId?: string | null;
  pdfUrl: string;
  parsed: ExtractedPricingFromText;
  parsedByDeparture?: Record<string, ExtractedPricingFromText>;
  ambiguousMatch?: boolean;
  extractionResult: Record<string, any>;
}) {
  const sb = getSupabaseAdmin();
  if (params.departureIds.length === 0) return { updated: 0 };

  const { data: existingPrices } = await sb
    .from('tour_prices')
    .select('*')
    .in('departure_id', params.departureIds)
    .limit(Math.max(params.departureIds.length, 1));

  const priceMap: Record<string, any> = {};
  (existingPrices || []).forEach((row: any) => {
    priceMap[String(row.departure_id)] = row;
  });

  let updated = 0;
  const hasMultipleDepartures = params.departureIds.length > 1;
  for (const departureId of params.departureIds) {
    const current = priceMap[departureId] || {};
    const currentAdult = toNum(current.adult_price);
    const currentChildWB = toNum(current.child_with_bed_price);
    const currentChildNB = toNum(current.child_without_bed_price);
    const currentInfant = toNum(current.infant_price);
    const currentSingle = toNum(current.single_supplement_price);
    const currentDeposit = toNum(current.deposit_amount);
    const parsedForDeparture =
      params.parsedByDeparture?.[departureId] ||
      (!hasMultipleDepartures && !params.ambiguousMatch ? params.parsed : null);
    const canApplyParsed = Boolean(parsedForDeparture && hasUsefulPricing(parsedForDeparture));

    const adultPrice = currentAdult > 0 ? currentAdult : parsedForDeparture?.adult?.amount || null;
    const childWithBedPrice = currentChildWB > 0 ? currentChildWB : parsedForDeparture?.childWithBed?.amount || null;
    const childWithoutBedPrice =
      currentChildNB > 0 ? currentChildNB : parsedForDeparture?.childWithoutBed?.amount || childWithBedPrice || null;
    const infantPrice = currentInfant > 0 ? currentInfant : parsedForDeparture?.infant?.amount || null;
    const singleSupplementPrice = currentSingle > 0 ? currentSingle : parsedForDeparture?.single?.amount || null;
    const depositAmount = currentDeposit > 0 ? currentDeposit : parsedForDeparture?.deposit?.amount || null;
    const depositType =
      normalizeDepositType(current.deposit_type) !== 'unknown'
        ? normalizeDepositType(current.deposit_type)
        : parsedForDeparture?.depositType && parsedForDeparture.depositType !== 'unknown'
          ? parsedForDeparture.depositType
          : depositAmount
            ? 'per_person'
            : 'unknown';

    const priceRow = {
      departure_id: departureId,
      price_type: 'central',
      adult_price: adultPrice,
      child_with_bed_price: childWithBedPrice,
      child_without_bed_price: childWithoutBedPrice,
      infant_price: infantPrice,
      single_supplement_price: singleSupplementPrice,
      deposit_amount: depositAmount,
      deposit_type: depositType,
      currency: 'THB',
      price_source: canApplyParsed ? 'pdf' : String(current.price_source || 'scraper'),
      extraction_status: canApplyParsed
        ? 'normalized'
        : (params.ambiguousMatch ? 'need_review' : String(current.extraction_status || 'normalized')),
      need_review: detectNeedReviewForPrices({
        adult_price: adultPrice,
        child_with_bed_price: childWithBedPrice,
        child_without_bed_price: childWithoutBedPrice,
        infant_price: infantPrice,
        single_supplement_price: singleSupplementPrice,
        deposit_amount: depositAmount,
        deposit_type: depositType,
        price_source: canApplyParsed ? 'pdf' : String(current.price_source || 'scraper'),
      }) || Boolean(params.ambiguousMatch),
      updated_at: new Date().toISOString(),
    };

    await assertWrite(
      sb.from('tour_prices').upsert(priceRow, { onConflict: 'departure_id,price_type' }) as any,
      'tour_prices upsert (pdf worker)',
    );
    updated += 1;
  }

  await assertWrite(
    sb.from('raw_wholesale_imports').insert({
      wholesale_id: params.wholesaleId,
      source_tour_key: params.departureIds.join(',').slice(0, 200),
      source_type: params.wholesaleId.startsWith('SUP_') ? 'api' : 'scraper',
      payload: {
        extraction_source: 'pdf_worker',
        pdf_id: params.pdfId || null,
        pdf_url: params.pdfUrl,
        departure_ids: params.departureIds,
        parsed: params.parsed,
        parsed_by_departure: params.parsedByDeparture || {},
        ambiguous_match: Boolean(params.ambiguousMatch),
        result: params.extractionResult,
      },
      payload_hash: shortHash(JSON.stringify({
        pdf_url: params.pdfUrl,
        departure_count: params.departureIds.length,
        deposit: params.parsed.deposit?.amount || null,
      })),
      extraction_status: 'pdf_extracted',
      need_review: !hasUsefulPricing(params.parsed) || Boolean(params.ambiguousMatch),
      imported_at: new Date().toISOString(),
    }) as any,
    'raw_wholesale_imports insert (pdf worker)',
  );

  return { updated };
}

async function resolvePdfJobContext(job: any): Promise<{ pdfUrl: string; siteId: string; sourceUrl: string }> {
  const sb = getSupabaseAdmin();
  const siteId = String(job.wholesale_id || '').trim().toLowerCase();
  const currentPdfUrl = String(job.pdf_url || '').trim();
  if (!siteId || !SCRAPER_WHOLESALERS.some((site) => site.id === siteId)) {
    return { pdfUrl: currentPdfUrl, siteId, sourceUrl: '' };
  }

  const canonicalTourId = String(job.canonical_tour_id || '').trim();
  if (!canonicalTourId) {
    return { pdfUrl: currentPdfUrl, siteId, sourceUrl: '' };
  }

  const { data: mappingRows } = await sb
    .from('wholesale_tour_mappings')
    .select('source_tour_key, source_url')
    .eq('canonical_tour_id', canonicalTourId)
    .eq('wholesale_id', siteId)
    .limit(1);

  const sourceTourKey = String(mappingRows?.[0]?.source_tour_key || '').trim();
  const sourceUrl = String(mappingRows?.[0]?.source_url || '').trim();
  if (!sourceUrl) {
    return { pdfUrl: currentPdfUrl, siteId, sourceUrl: '' };
  }

  const resolvedPdfUrl = await resolveScraperPdfUrl({
    siteId,
    sourceUrl,
    currentPdfUrl,
  });

  if (resolvedPdfUrl && resolvedPdfUrl !== currentPdfUrl) {
    await sb
      .from('pdf_extraction_jobs')
      .update({ pdf_url: resolvedPdfUrl, updated_at: new Date().toISOString() })
      .eq('id', job.id);

    const pdfId = String(job?.extraction_result?.pdf_id || '').trim();
    if (pdfId) {
      await sb
        .from('tour_pdfs')
        .update({ pdf_url: resolvedPdfUrl, updated_at: new Date().toISOString() })
        .eq('id', pdfId);
    }

    if (sourceTourKey) {
      let updated = false;
      const { data: byCode } = await sb
        .from('scraper_tours')
        .select('id')
        .eq('site', siteId)
        .eq('tour_code', sourceTourKey)
        .limit(1);
      if (byCode?.[0]?.id) {
        updated = true;
        await sb
          .from('scraper_tours')
          .update({ pdf_url: resolvedPdfUrl })
          .eq('id', byCode[0].id);
      }
      const numericId = Number(sourceTourKey);
      if (!updated && Number.isFinite(numericId) && numericId > 0) {
        await sb
          .from('scraper_tours')
          .update({ pdf_url: resolvedPdfUrl })
          .eq('id', numericId)
          .eq('site', siteId);
      }
    }
  }

  return {
    pdfUrl: resolvedPdfUrl || currentPdfUrl,
    siteId,
    sourceUrl,
  };
}

export async function processPdfExtractionQueue(options?: {
  wholesalerId?: string;
  batchSize?: number;
  maxRuntimeMs?: number;
}) {
  const sb = getSupabaseAdmin();
  await ensurePdfExtractionQueueTable();
  const wholesalerId = String(options?.wholesalerId || '').trim() || undefined;
  const batchSize = Number.isFinite(Number(options?.batchSize)) ? Math.max(1, Number(options?.batchSize)) : 20;
  const maxRuntimeMs = Number.isFinite(Number(options?.maxRuntimeMs)) ? Math.max(1_000, Number(options?.maxRuntimeMs)) : 240_000;
  const startedAt = Date.now();
  let processed = 0;
  let completed = 0;
  let failed = 0;
  let retried = 0;

  while (processed < batchSize && Date.now() - startedAt < maxRuntimeMs) {
    let query = sb
      .from('pdf_extraction_jobs')
      .select('*')
      .in('status', ['pending', 'retry'])
      .order('priority', { ascending: false })
      .order('updated_at', { ascending: true })
      .limit(1);
    if (wholesalerId) query = query.eq('wholesale_id', wholesalerId);

    const { data: rows, error } = await query;
    if (error) throw new Error(`load queue jobs failed: ${error.message}`);
    const job = rows?.[0];
    if (!job) break;

    const attempts = Number(job.attempts || 0);
    const { data: lockRows } = await sb
      .from('pdf_extraction_jobs')
      .update({
        status: 'processing',
        attempts: attempts + 1,
        locked_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', job.id)
      .eq('status', job.status)
      .select('id')
      .limit(1);
    if (!lockRows?.length) continue;

    processed += 1;
    try {
      const jobPdf = await resolvePdfJobContext(job);
      const pdfUrl = String(jobPdf.pdfUrl || job.pdf_url || '').trim();
      const pdfMeta = await fetchPdfTextForExtraction(pdfUrl, {
        siteId: jobPdf.siteId,
        sourceUrl: jobPdf.sourceUrl,
      });
      let parsed = extractPricingFromTextWithContext(pdfMeta.text);
      let ocrFallbackUsed = false;
      let ocrFallbackError: string | null = null;
      let ocrFallbackParsed: ExtractedPricingFromText | null = null;
      if (pdfMeta.source === 'embedded' && hasCriticalPricingGap(parsed)) {
        const ocrMeta = await extractPdfTextViaOcr(pdfUrl, {
          siteId: jobPdf.siteId,
          sourceUrl: jobPdf.sourceUrl,
        });
        if (ocrMeta.text) {
          ocrFallbackParsed = extractPricingFromTextWithContext(ocrMeta.text);
          parsed = mergeParsedPricing(parsed, ocrFallbackParsed);
          ocrFallbackUsed = true;
        } else if (ocrMeta.error) {
          ocrFallbackError = ocrMeta.error;
        }
      }
      const departures = await resolveJobDepartures(job);
      const departureIds = departures.map((row) => row.id);
      const lines = splitTextLines(pdfMeta.text);
      const parsedByDeparture: Record<string, ExtractedPricingFromText> = {};
      let matchedByDepartureCount = 0;
      for (const departure of departures) {
        const parsedByContext = extractDepartureContextPricing(lines, departure);
        if (parsedByContext && hasUsefulPricing(parsedByContext)) {
          parsedByDeparture[departure.id] = parsedByContext;
          matchedByDepartureCount += 1;
        }
      }

      const ambiguousMatch = departureIds.length > 1 && matchedByDepartureCount !== departureIds.length;
      const mergedSnippet = buildExtractedTextSnippetFromParsed(parsed, pdfMeta.extractedTextSnippet);
      const extractionConfidence = estimateExtractionConfidence({
        parsed,
        fromOcr: pdfMeta.source === 'ocr' || ocrFallbackUsed,
        matchedByDeparture: matchedByDepartureCount > 0,
        ambiguous: ambiguousMatch,
      });
      const extractionStatus = hasUsefulPricing(parsed)
        ? ambiguousMatch
          ? 'need_review'
          : 'normalized'
        : 'need_review';
      const pdfId = String(job?.extraction_result?.pdf_id || '').trim() || null;
      const extractionResult = {
        parsed,
        parsed_ocr_fallback: ocrFallbackParsed,
        useful: hasUsefulPricing(parsed),
        departure_count: departureIds.length,
        matched_departure_count: matchedByDepartureCount,
        ambiguous_match: ambiguousMatch,
        extracted_text_snippet: mergedSnippet,
        extraction_confidence: extractionConfidence,
        extraction_status: extractionStatus,
        extraction_source: pdfMeta.source,
        ocr_fallback_used: ocrFallbackUsed,
        ocr_fallback_error: ocrFallbackError,
        pdf_url: pdfUrl,
        pdf_id: pdfId,
        ocr_error: pdfMeta.ocrError,
      };

      if (departureIds.length > 0) {
        await applyPdfExtractionToDepartures({
          wholesaleId: String(job.wholesale_id || ''),
          departureIds,
          pdfId,
          pdfUrl,
          parsed,
          parsedByDeparture,
          ambiguousMatch,
          extractionResult,
        });
      }

      if (pdfId) {
        await assertWrite(
          sb.from('tour_pdfs').update({
            extraction_status: extractionStatus,
            need_review: extractionStatus === 'need_review',
            updated_at: new Date().toISOString(),
          }).eq('id', pdfId) as any,
          'tour_pdfs update extraction meta',
        );
      }

      await assertWrite(
        sb.from('pdf_extraction_jobs').update({
          status: 'completed',
          last_error: null,
          extraction_result: extractionResult,
          locked_at: null,
          updated_at: new Date().toISOString(),
        }).eq('id', job.id) as any,
        'pdf_extraction_jobs complete',
      );
      completed += 1;
    } catch (err: any) {
      const nextAttempts = attempts + 1;
      const canRetry = nextAttempts < MAX_PDF_QUEUE_ATTEMPTS;
      await assertWrite(
        sb.from('pdf_extraction_jobs').update({
          status: canRetry ? 'retry' : 'failed',
          last_error: String(err?.message || err || 'unknown'),
          locked_at: null,
          updated_at: new Date().toISOString(),
        }).eq('id', job.id) as any,
        'pdf_extraction_jobs fail',
      );
      if (canRetry) retried += 1;
      else failed += 1;
    }
  }

  if (gs25Session) {
    await closeGs25Session().catch(() => undefined);
  }

  return {
    processed,
    completed,
    failed,
    retried,
    durationMs: Date.now() - startedAt,
  };
}

async function syncFromApiWholesalers(params: { wholesalerId?: string; limit: number }): Promise<SyncResult[]> {
  const sb = getSupabaseAdmin();
  const filterWholesaler = params.wholesalerId ? params.wholesalerId.trim() : '';

  let supplierQuery = sb.from('suppliers').select('id, "displayName", "canonicalName"');
  if (filterWholesaler && filterWholesaler.startsWith('SUP_')) {
    supplierQuery = supplierQuery.eq('id', filterWholesaler);
  }

  const { data: suppliers, error: suppliersError } = await supplierQuery;
  if (suppliersError) throw new Error(`[central-sync] suppliers fetch failed: ${suppliersError.message}`);

  const results: SyncResult[] = [];
  for (const supplier of suppliers || []) {
    const wholesalerId = String(supplier.id);
    const supplierName = String(supplier.displayName || supplier.canonicalName || SUPPLIER_NAME_FALLBACK[wholesalerId] || wholesalerId);
    let limitedTours: any[] = [];
    let destinations: any[] = [];
    let departures: any[] = [];
    let rawSources: any[] = [];
    let pdfs: any[] = [];
    let prices: any[] = [];

    try {
      const tours = await fetchAllPages<any>(
        (from, to) =>
          sb
            .from('tours')
            .select('id, slug, "tourCode", "tourName", status, "supplierId", "externalTourId", "durationDays", "durationNights", "sourceUrl", "bookingUrl", "updatedAt"')
            .eq('supplierId', wholesalerId)
            .range(from, to),
        `load tours (${wholesalerId})`,
      );
      limitedTours = tours.slice(0, params.limit);
      const tourIds = (limitedTours || []).map((tour: any) => tour.id);

      [destinations, departures, pdfs, rawSources] = await Promise.all([
        fetchRowsByIdsChunked<any>({
          table: 'tour_destinations',
          select: '"tourId", country, city',
          idColumn: 'tourId',
          ids: tourIds.map(String),
          context: `load tour_destinations (${wholesalerId})`,
        }),
        fetchRowsByIdsChunked<any>({
          table: 'departures',
          select: 'id, "tourId", "externalDepartureId", "startDate", "endDate", status, "totalSeats", "remainingSeats"',
          idColumn: 'tourId',
          ids: tourIds.map(String),
          context: `load departures (${wholesalerId})`,
        }),
        fetchRowsByIdsChunked<any>({
          table: 'tour_pdfs',
          select: '"tourId", "pdfUrl"',
          idColumn: 'tourId',
          ids: tourIds.map(String),
          context: `load tour_pdfs (${wholesalerId})`,
        }),
        fetchAllPages<any>(
          (from, to) =>
            sb.from('tour_raw_sources')
              .select('"externalTourId", "rawPayload"')
              .eq('supplierId', wholesalerId)
              .range(from, to),
          `load tour_raw_sources (${wholesalerId})`,
        ),
      ]);

      const departureIds = (departures || []).map((departure: any) => String(departure.id || '')).filter(Boolean);
      prices = departureIds.length > 0
        ? await fetchRowsByIdsChunked<any>({
          table: 'prices',
          select: '"departureId", "paxType", "sellingPrice"',
          idColumn: 'departureId',
          ids: departureIds,
          context: `load prices (${wholesalerId})`,
        })
        : [];
    } catch (loadError: any) {
      await insertSyncLog({
        wholesaleId: wholesalerId,
        syncType: 'api_normalize',
        status: 'FAILED',
        message: `preload failed: ${String(loadError?.message || loadError || 'unknown')}`,
        recordsAdded: 0,
        recordsUpdated: 0,
        recordsFailed: 1,
      });
      results.push({ wholesalerId, recordsAdded: 0, recordsUpdated: 0, recordsFailed: 1 });
      continue;
    }

    const tourIds = (limitedTours || []).map((tour: any) => tour.id);
    if (tourIds.length === 0) {
      results.push({ wholesalerId, recordsAdded: 0, recordsUpdated: 0, recordsFailed: 0 });
      continue;
    }

    const destinationMap: Record<string, { country: string | null; city: string | null }> = {};
    (destinations || []).forEach((destination: any) => {
      if (!destinationMap[destination.tourId]) {
        destinationMap[destination.tourId] = {
          country: destination.country || null,
          city: destination.city || null,
        };
      }
    });

    const rawSourceMap: Record<string, any> = {};
    (rawSources || []).forEach((raw: any) => {
      rawSourceMap[String(raw.externalTourId)] = raw.rawPayload || {};
    });

    const pdfMap: Record<string, string> = {};
    (pdfs || []).forEach((pdf: any) => {
      if (!pdfMap[pdf.tourId] && pdf.pdfUrl) {
        pdfMap[pdf.tourId] = String(pdf.pdfUrl);
      }
    });

    const departuresByTour: Record<string, any[]> = {};
    (departures || []).forEach((departure: any) => {
      if (!departuresByTour[departure.tourId]) departuresByTour[departure.tourId] = [];
      departuresByTour[departure.tourId].push(departure);
    });

    const pricesByDeparture: Record<string, Record<string, number>> = {};
    (prices || []).forEach((price: any) => {
      const departureId = String(price.departureId || '');
      const paxType = normalizePaxType(price.paxType);
      const selling = toNum(price.sellingPrice);
      if (!departureId || !paxType || selling <= 0) return;
      if (!pricesByDeparture[departureId]) pricesByDeparture[departureId] = {};
      if (!pricesByDeparture[departureId][paxType] || selling < pricesByDeparture[departureId][paxType]) {
        pricesByDeparture[departureId][paxType] = selling;
      }
    });

    let added = 0;
    let updated = 0;
    let failed = 0;
    let firstErrorMessage = '';

    for (const tour of limitedTours || []) {
      try {
        const sourceTourKey = String(tour.externalTourId || tour.id);
        const sourcePayload = rawSourceMap[String(tour.externalTourId)] || {};
        const periodRows = collectPeriodsFromPayload(sourcePayload);
        const periodLookup = buildPeriodLookup(periodRows);
        const tourDepartureRows = departuresByTour[tour.id] || [];
        const needsPricingFallback = tourDepartureRows.some((departure: any) => {
          const source = pricesByDeparture[departure.id] || {};
          const hasAdult = !!pickPaxPrice(source, ['ADULT', 'JOIN', 'LAND']);
          const hasChild = !!pickPaxPrice(source, ['CHILD_WITH_BED', 'CHILD_BED', 'CHILD']);
          const hasSingle = !!pickPaxPrice(source, ['SINGLE_SUPP', 'SINGLE', 'SINGLE_ROOM']);
          const hasDeposit = !!pickPaxPrice(source, ['DEPOSIT']);
          return !(hasAdult && hasChild && hasSingle && hasDeposit);
        });
        const pdfUrlFromSource = pdfMap[tour.id] || String(
          sourcePayload?.FilePDF ||
          sourcePayload?.pdf ||
          sourcePayload?.PDF ||
          sourcePayload?.pdf_url ||
          sourcePayload?.pdfUrl ||
          sourcePayload?.tour_file?.file_pdf ||
          '',
        );
        const parsedStructuredPayload = extractStructuredPriceFromPayload(sourcePayload);
        const sourcePayloadText = flattenObjectText(sourcePayload);
        const parsedFromPayload = sourcePayloadText ? extractPricingFromTextWithContext(sourcePayloadText) : null;
        const pdfText = needsPricingFallback && pdfUrlFromSource ? await fetchPdfText(pdfUrlFromSource) : '';
        const parsedFromPdf = pdfText ? extractPricingFromTextWithContext(pdfText) : null;
        const canonicalKey = `api:${wholesalerId}:${sourceTourKey}`;
        const canonicalSlug = `${slugify(String(tour.tourName || 'tour').slice(0, 80)) || 'tour'}-${shortHash(canonicalKey)}`;
        const dest = destinationMap[tour.id] || { country: null, city: null };

        const canonicalTourRow = {
          canonical_key: canonicalKey,
          slug: canonicalSlug,
          title: String(tour.tourName || 'Untitled Tour'),
          country: dest.country,
          city: dest.city,
          duration_days: Number(tour.durationDays || 0),
          duration_nights: Number(tour.durationNights || 0),
          is_published: String(tour.status || '').toUpperCase() === 'PUBLISHED',
          need_review: !tour.tourName || !tour.slug,
          updated_at: new Date().toISOString(),
        };

        const { data: canonicalRows, error: canonicalErr } = await sb
          .from('canonical_tours')
          .upsert(canonicalTourRow, { onConflict: 'canonical_key' })
          .select('id')
          .limit(1);
        if (canonicalErr || !canonicalRows?.[0]?.id) throw new Error(canonicalErr?.message || 'canonical upsert failed');

        const canonicalTourId = canonicalRows[0].id as string;

        await assertWrite(sb.from('wholesale_tour_mappings').upsert({
          canonical_tour_id: canonicalTourId,
          wholesale_id: wholesalerId,
          source_tour_key: sourceTourKey,
          source_tour_code: String(tour.tourCode || ''),
          source_url: String(tour.sourceUrl || tour.bookingUrl || ''),
          status: 'active',
          need_review: false,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'wholesale_id,source_tour_key' }) as any, 'wholesale_tour_mappings upsert (api)');

        await assertWrite(sb.from('raw_wholesale_imports').insert({
          wholesale_id: wholesalerId,
          source_tour_key: sourceTourKey,
          source_type: 'api',
          payload: sourcePayload || {},
          payload_hash: shortHash(JSON.stringify(sourcePayload || {})),
          extraction_status: 'raw',
          need_review: false,
          imported_at: new Date().toISOString(),
        }) as any, 'raw_wholesale_imports insert (api)');

        if (parsedFromPayload || parsedFromPdf) {
          await assertWrite(sb.from('raw_wholesale_imports').insert({
            wholesale_id: wholesalerId,
            source_tour_key: sourceTourKey,
            source_type: 'api',
              payload: {
                extraction_source: 'api_text_pdf',
                pdf_url: pdfUrlFromSource || null,
                structured_payload_extraction: parsedStructuredPayload,
                payload_extraction: parsedFromPayload,
                pdf_extraction: parsedFromPdf,
              },
            payload_hash: shortHash(JSON.stringify({
              pdf_url: pdfUrlFromSource || null,
              payload_deposit: parsedFromPayload?.deposit?.amount || null,
              pdf_deposit: parsedFromPdf?.deposit?.amount || null,
            })),
            extraction_status: 'pdf_extracted',
            need_review: false,
            imported_at: new Date().toISOString(),
          }) as any, 'raw_wholesale_imports insert (api pricing extraction)');
        }

        for (const departure of tourDepartureRows) {
          const sourceDepartureKey = String(departure.externalDepartureId || departure.id);
          const sourcePeriod = resolvePeriodForDeparture(departure, periodLookup);
          const departureRow = {
            canonical_tour_id: canonicalTourId,
            wholesale_id: wholesalerId,
            source_departure_key: sourceDepartureKey,
            departure_date: asDate(departure.startDate),
            return_date: asDate(departure.endDate),
            status: String(departure.status || 'AVAILABLE').toUpperCase(),
            need_review: !departure.startDate,
            updated_at: new Date().toISOString(),
          };

          const { data: upsertedDepartureRows, error: depErr } = await sb
            .from('tour_departures')
            .upsert(departureRow, { onConflict: 'wholesale_id,source_departure_key' })
            .select('id')
            .limit(1);
          if (depErr || !upsertedDepartureRows?.[0]?.id) throw new Error(depErr?.message || 'departure upsert failed');

          const centralDepartureId = String(upsertedDepartureRows[0].id);
          const priceSource = pricesByDeparture[departure.id] || {};
          const periodAdult =
            toNum(sourcePeriod?.priceAdultDouble) ||
            toNum(sourcePeriod?.priceAdult) ||
            toNum(sourcePeriod?.price) ||
            toNum(sourcePeriod?.Price) ||
            toNum(sourcePeriod?.period_price_start) ||
            toNum(sourcePeriod?.period_price_min) ||
            0;
          const periodChildWithBed =
            toNum(sourcePeriod?.priceChild) ||
            toNum(sourcePeriod?.price_child) ||
            toNum(sourcePeriod?.Price_Child) ||
            0;
          const periodChildWithoutBed =
            toNum(sourcePeriod?.priceChildNoBed) ||
            toNum(sourcePeriod?.price_childnobed) ||
            toNum(sourcePeriod?.Price_ChildNB) ||
            toNum(sourcePeriod?.Price_Child_NB) ||
            0;
          const periodInfant =
            toNum(sourcePeriod?.priceInfant) ||
            toNum(sourcePeriod?.price_infant) ||
            toNum(sourcePeriod?.Price_Infant) ||
            0;
          const periodSingle =
            toNum(sourcePeriod?.priceForOne) ||
            toNum(sourcePeriod?.priceSingleRoomAdd) ||
            toNum(sourcePeriod?.Price_Single_Bed) ||
            toNum(sourcePeriod?.Price_Single) ||
            0;
          const periodDeposit =
            toNum(sourcePeriod?.deposit) ||
            toNum(sourcePeriod?.Deposit) ||
            toNum(sourcePeriod?.Deposit_End) ||
            0;
          const adultPrice =
            pickPaxPrice(priceSource, ['ADULT', 'JOIN', 'LAND']) ||
            (periodAdult > 0 ? periodAdult : null) ||
            parsedStructuredPayload.adult ||
            parsedFromPayload?.adult?.amount ||
            parsedFromPdf?.adult?.amount ||
            null;
          const childWithBedPrice =
            pickPaxPrice(priceSource, ['CHILD_WITH_BED', 'CHILD_BED', 'CHILD']) ||
            (periodChildWithBed > 0 ? periodChildWithBed : null) ||
            parsedStructuredPayload.childWithBed ||
            parsedFromPayload?.childWithBed?.amount ||
            parsedFromPdf?.childWithBed?.amount ||
            null;
          const childWithoutBedPrice =
            pickPaxPrice(priceSource, ['CHILD_NO_BED', 'CHILD_WITHOUT_BED', 'CHILD_NOBED']) ||
            (periodChildWithoutBed > 0 ? periodChildWithoutBed : null) ||
            parsedStructuredPayload.childWithoutBed ||
            parsedFromPayload?.childWithoutBed?.amount ||
            parsedFromPdf?.childWithoutBed?.amount ||
            childWithBedPrice ||
            null;
          const infantPrice =
            pickPaxPrice(priceSource, ['INFANT']) ||
            (periodInfant > 0 ? periodInfant : null) ||
            parsedStructuredPayload.infant ||
            parsedFromPayload?.infant?.amount ||
            parsedFromPdf?.infant?.amount ||
            null;
          const singlePrice =
            pickPaxPrice(priceSource, ['SINGLE_SUPP', 'SINGLE', 'SINGLE_ROOM']) ||
            (periodSingle > 0 ? periodSingle : null) ||
            parsedStructuredPayload.single ||
            parsedFromPayload?.single?.amount ||
            parsedFromPdf?.single?.amount ||
            null;
          const depositAmount =
            pickPaxPrice(priceSource, ['DEPOSIT']) ||
            (periodDeposit > 0 ? periodDeposit : null) ||
            parsedStructuredPayload.deposit ||
            parsedFromPayload?.deposit?.amount ||
            parsedFromPdf?.deposit?.amount ||
            null;
          const depositTypeFromPayload = normalizeDepositType(
            sourcePayload?.deposit_type ||
            sourcePayload?.depositType ||
            sourcePayload?.deposit_rule ||
            sourcePayload?.depositRule,
          );
          const depositTypeFromStructured = parsedStructuredPayload.depositType;
          const depositType =
            depositTypeFromPayload !== 'unknown'
              ? depositTypeFromPayload
              : depositTypeFromStructured !== 'unknown'
                ? depositTypeFromStructured
              : parsedFromPayload?.depositType && parsedFromPayload.depositType !== 'unknown'
                ? parsedFromPayload.depositType
                : parsedFromPdf?.depositType && parsedFromPdf.depositType !== 'unknown'
                  ? parsedFromPdf.depositType
                  : depositAmount
                    ? 'per_person'
                    : 'unknown';
          const priceSourceTag =
            parsedFromPdf && (parsedFromPdf.deposit || parsedFromPdf.single || parsedFromPdf.childWithBed || parsedFromPdf.childWithoutBed)
              ? 'api_pdf'
              : parsedFromPayload
                ? 'api_payload'
                : 'api';

          const priceRow = {
            departure_id: centralDepartureId,
            price_type: 'central',
            adult_price: adultPrice,
            child_with_bed_price: childWithBedPrice,
            child_without_bed_price: childWithoutBedPrice,
            infant_price: infantPrice,
            single_supplement_price: singlePrice,
            deposit_amount: depositAmount,
            deposit_type: depositType,
            currency: 'THB',
            price_source: priceSourceTag,
            extraction_status: 'normalized',
            need_review: detectNeedReviewForPrices({
              adult_price: adultPrice,
              child_with_bed_price: childWithBedPrice,
              child_without_bed_price: childWithoutBedPrice,
              infant_price: infantPrice,
              single_supplement_price: singlePrice,
              deposit_amount: depositAmount,
              deposit_type: depositType,
              price_source: priceSourceTag,
            }),
            updated_at: new Date().toISOString(),
          };

          await assertWrite(
            sb.from('tour_prices').upsert(priceRow, { onConflict: 'departure_id,price_type' }) as any,
            'tour_prices upsert (api)',
          );

          const seatTotal = toNullableInt(departure.totalSeats);
          const seatAvailable = toNullableInt(departure.remainingSeats);
          const seatTotalFromPeriod = clampInt(
            toNum(sourcePeriod?.group) ||
            toNum(sourcePeriod?.GroupSize) ||
            toNum(sourcePeriod?.seat_total) ||
            toNum(sourcePeriod?.period_total) ||
            0,
          );
          const seatAvailableFromPeriod = clampInt(
            toNum(sourcePeriod?.available) ||
            toNum(sourcePeriod?.seat_available) ||
            toNum(sourcePeriod?.Seat) ||
            toNum(sourcePeriod?.period_available) ||
            0,
          );
          const finalSeatTotal = seatTotal !== null ? seatTotal : seatTotalFromPeriod;
          const finalSeatAvailable = seatAvailable !== null ? seatAvailable : seatAvailableFromPeriod;
          const normalizedSeatTotal =
            finalSeatTotal !== null
              ? finalSeatTotal
              : (finalSeatAvailable !== null ? finalSeatAvailable : null);
          const normalizedSeatAvailable = finalSeatAvailable;
          const normalizedSeatBooked =
            normalizedSeatTotal !== null && normalizedSeatAvailable !== null
              ? Math.max(normalizedSeatTotal - normalizedSeatAvailable, 0)
              : null;

          await assertWrite(sb.from('tour_seats').upsert({
            departure_id: centralDepartureId,
            seat_total: normalizedSeatTotal,
            seat_available: normalizedSeatAvailable,
            seat_booked: normalizedSeatBooked,
            source: 'api',
            need_review: normalizedSeatTotal === null || normalizedSeatAvailable === null || normalizedSeatBooked === null,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'departure_id' }) as any, 'tour_seats upsert (api)');
        }

        const pdfUrl = pdfUrlFromSource;
        if (pdfUrl) {
          await assertWrite(sb.from('tour_pdfs').upsert({
            canonical_tour_id: canonicalTourId,
            wholesale_id: wholesalerId,
            departure_id: null,
            pdf_url: pdfUrl,
            extraction_status: parsedFromPdf ? 'normalized' : 'raw',
            need_review: false,
            is_active: true,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'wholesale_id,canonical_tour_id,pdf_url',
          }) as any, 'tour_pdfs upsert (api)');
        }

        added += 1;
      } catch (error: any) {
        failed += 1;
        if (!firstErrorMessage) {
          firstErrorMessage = String(error?.message || error || 'unknown error');
        }
      }
    }

    await insertSyncLog({
      wholesaleId: wholesalerId,
      syncType: 'api_normalize',
      status: failed > 0 ? 'PARTIAL' : 'SUCCESS',
      message: failed > 0 && firstErrorMessage ? `${supplierName} normalized | first_error=${firstErrorMessage}` : `${supplierName} normalized`,
      recordsAdded: added,
      recordsUpdated: updated,
      recordsFailed: failed,
    });
    try {
      await runWholesalerQualityValidation(wholesalerId);
    } catch (qualityError: any) {
      await insertSyncLog({
        wholesaleId: wholesalerId,
        syncType: 'quality_validation',
        status: 'FAILED',
        message: `quality validation failed: ${String(qualityError?.message || qualityError || 'unknown')}`,
        recordsAdded: 0,
        recordsUpdated: 0,
        recordsFailed: 1,
      });
    }
    try {
      await enqueuePdfExtractionJobs({
        wholesalerId,
        force: false,
        onlyMissingPricing: true,
        limit: Math.max(500, params.limit),
      });
      for (let round = 0; round < 15; round += 1) {
        const workerResult = await processPdfExtractionQueue({
          wholesalerId,
          batchSize: 80,
          maxRuntimeMs: 180_000,
        });
        if (Number(workerResult.processed || 0) < 80) break;
      }
    } catch (queueError: any) {
      await insertSyncLog({
        wholesaleId: wholesalerId,
        syncType: 'pdf_queue_enqueue',
        status: 'FAILED',
        message: `pdf queue enqueue failed: ${String(queueError?.message || queueError || 'unknown')}`,
        recordsAdded: 0,
        recordsUpdated: 0,
        recordsFailed: 1,
      });
    }
    results.push({ wholesalerId, recordsAdded: added, recordsUpdated: updated, recordsFailed: failed });
  }

  return results;
}

async function syncFromScraperWholesalers(params: { wholesalerId?: string; limit: number }): Promise<SyncResult[]> {
  const sb = getSupabaseAdmin();
  const filterWholesaler = params.wholesalerId ? params.wholesalerId.trim().toLowerCase() : '';
  const sites = filterWholesaler
    ? SCRAPER_WHOLESALERS.filter((site) => site.id === filterWholesaler)
    : SCRAPER_WHOLESALERS;

  const results: SyncResult[] = [];

  for (const site of sites) {
    const { data: tours, error: toursError } = await sb
      .from('scraper_tours')
      .select('id, site, tour_code, title, country, duration, price_from, source_url, pdf_url, deposit, highlights')
      .eq('site', site.id)
      .eq('is_active', true)
      .order('last_scraped_at', { ascending: false })
      .limit(params.limit);

    if (toursError) {
      await insertSyncLog({
        wholesaleId: site.id,
        syncType: 'scraper_normalize',
        status: 'FAILED',
        message: toursError.message,
        recordsAdded: 0,
        recordsUpdated: 0,
        recordsFailed: 1,
      });
      results.push({ wholesalerId: site.id, recordsAdded: 0, recordsUpdated: 0, recordsFailed: 1 });
      continue;
    }

    const scraperTourIds = (tours || []).map((tour: any) => Number(tour.id)).filter((id) => Number.isFinite(id));
    const { data: periods } = scraperTourIds.length > 0
      ? await sb
          .from('scraper_tour_periods')
          .select('id, tour_id, start_date, end_date, price, seats_left, status, raw_text')
          .in('tour_id', scraperTourIds)
      : { data: [] as any[] };

    const periodsByTour: Record<number, any[]> = {};
    (periods || []).forEach((period: any) => {
      const tourId = Number(period.tour_id);
      if (!periodsByTour[tourId]) periodsByTour[tourId] = [];
      periodsByTour[tourId].push(period);
    });

    let added = 0;
    let updated = 0;
    let failed = 0;
    let pruned = 0;
    let firstErrorMessage = '';
    const expectedDepartureKeysByTour = new Map<string, Set<string>>();

    for (const tour of tours || []) {
      try {
        const sourceTourKey = String(tour.tour_code || tour.id);
        const sourceUrl = String(tour.source_url || '');
        const rawPdfUrl = String(tour.pdf_url || '').trim();
        const shouldResolvePdfFromSource =
          !ENABLE_FAST_SCRAPER_SYNC ||
          !rawPdfUrl ||
          STRICT_PDF_REFRESH_SITES.has(site.id);
        const pdfUrl = shouldResolvePdfFromSource
          ? await resolveScraperPdfUrl({
              siteId: site.id,
              sourceUrl,
              currentPdfUrl: rawPdfUrl,
            })
          : rawPdfUrl;
        if (pdfUrl && pdfUrl !== rawPdfUrl) {
          await sb.from('scraper_tours').update({ pdf_url: pdfUrl }).eq('id', tour.id);
        }
        const pdfText = ENABLE_INLINE_PDF_PARSE_IN_SCRAPER_SYNC && pdfUrl
          ? await fetchPdfText(pdfUrl, { siteId: site.id, sourceUrl })
          : '';
        const parsedFromPdf = ENABLE_INLINE_PDF_PARSE_IN_SCRAPER_SYNC && pdfText
          ? extractPricingFromTextWithContext(pdfText)
          : null;
        const canonicalKey = `scraper:${site.id}:${sourceTourKey}`;
        const canonicalSlug = `${slugify(String(tour.title || 'tour').slice(0, 80)) || 'tour'}-${shortHash(canonicalKey)}`;
        const durationText = String(tour.duration || '');
        const durationMatch = durationText.match(/(\d+)\s*วัน\s*(\d+)?/);
        const days = durationMatch ? Number(durationMatch[1]) : 0;
        const nights = durationMatch ? Number(durationMatch[2] || Math.max(days - 1, 0)) : 0;

        const canonicalTourRow = {
          canonical_key: canonicalKey,
          slug: canonicalSlug,
          title: String(tour.title || sourceTourKey),
          country: String(tour.country || ''),
          city: null,
          duration_days: days,
          duration_nights: nights,
          is_published: true,
          need_review: !tour.title || !tour.price_from,
          updated_at: new Date().toISOString(),
        };

        const { data: canonicalRows, error: canonicalErr } = await sb
          .from('canonical_tours')
          .upsert(canonicalTourRow, { onConflict: 'canonical_key' })
          .select('id')
          .limit(1);
        if (canonicalErr || !canonicalRows?.[0]?.id) throw new Error(canonicalErr?.message || 'canonical upsert failed');

        const canonicalTourId = canonicalRows[0].id as string;
        const expectedKeys = expectedDepartureKeysByTour.get(canonicalTourId) || new Set<string>();

        await assertWrite(sb.from('wholesale_tour_mappings').upsert({
          canonical_tour_id: canonicalTourId,
          wholesale_id: site.id,
          source_tour_key: sourceTourKey,
          source_tour_code: String(tour.tour_code || ''),
          source_url: String(tour.source_url || ''),
          status: 'active',
          need_review: false,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'wholesale_id,source_tour_key' }) as any, 'wholesale_tour_mappings upsert (scraper)');

        await assertWrite(sb.from('raw_wholesale_imports').insert({
          wholesale_id: site.id,
          source_tour_key: sourceTourKey,
          source_type: 'scraper',
          payload: tour,
          payload_hash: shortHash(JSON.stringify(tour || {})),
          extraction_status: 'raw',
          need_review: false,
          imported_at: new Date().toISOString(),
        }) as any, 'raw_wholesale_imports insert (scraper)');

        if (parsedFromPdf) {
          await assertWrite(sb.from('raw_wholesale_imports').insert({
            wholesale_id: site.id,
            source_tour_key: sourceTourKey,
            source_type: 'scraper',
            payload: {
              extraction_source: 'pdf',
              pdf_url: pdfUrl || null,
              pdf_extraction: parsedFromPdf,
            },
            payload_hash: shortHash(JSON.stringify({
              pdf_url: pdfUrl || null,
              deposit: parsedFromPdf.deposit?.amount || null,
              single: parsedFromPdf.single?.amount || null,
            })),
            extraction_status: 'pdf_extracted',
            need_review: false,
            imported_at: new Date().toISOString(),
          }) as any, 'raw_wholesale_imports insert (scraper pricing extraction)');
        }

        let tourPeriods = periodsByTour[Number(tour.id)] || [];
        if (tourPeriods.length === 0 && sourceUrl) {
          const fallbackPeriods = await resolveSourcePeriodsFallback(site.id, sourceUrl);
          if (fallbackPeriods.length > 0) {
            const insertRows = fallbackPeriods.map((period, index) => ({
              tour_id: tour.id,
              start_date: period.start_date,
              end_date: period.end_date,
              price: period.price,
              seats_left: period.seats_left,
              status: period.status,
              raw_text: period.raw_text || `source_fallback_${site.id}_${index + 1}`,
            }));
            await assertWrite(
              sb.from('scraper_tour_periods').insert(insertRows) as any,
              `scraper_tour_periods insert fallback (${site.id})`,
            );
            const { data: reloadedPeriods } = await sb
              .from('scraper_tour_periods')
              .select('id, tour_id, start_date, end_date, price, seats_left, status, raw_text')
              .eq('tour_id', tour.id);
            tourPeriods = reloadedPeriods || [];
          }
        }
        if (tourPeriods.length === 0) {
          const fallback = await upsertScraperFallbackDeparture({
            canonicalTourId,
            wholesaleId: site.id,
            sourceTourKey,
            adultPrice: toNum(tour.price_from) || null,
            depositAmount: toNum(tour.deposit) || parsedFromPdf?.deposit?.amount || null,
            parsedFromPdf,
            fallbackDepartureDate: pdfText ? extractFirstDepartureDateFromText(pdfText) : null,
          });
          if (fallback?.sourceDepartureKey) expectedKeys.add(String(fallback.sourceDepartureKey));
        }

        for (const period of tourPeriods) {
          const sourceDepartureKey = String(period.id);
          expectedKeys.add(sourceDepartureKey);
          const departureRow = {
            canonical_tour_id: canonicalTourId,
            wholesale_id: site.id,
            source_departure_key: sourceDepartureKey,
            departure_date: asDate(period.start_date),
            return_date: asDate(period.end_date),
            status: String(period.status || 'AVAILABLE').toUpperCase(),
            need_review: !period.start_date,
            updated_at: new Date().toISOString(),
          };

          const { data: upsertedDepartureRows, error: depErr } = await sb
            .from('tour_departures')
            .upsert(departureRow, { onConflict: 'wholesale_id,source_departure_key' })
            .select('id')
            .limit(1);
          if (depErr || !upsertedDepartureRows?.[0]?.id) throw new Error(depErr?.message || 'departure upsert failed');

          const centralDepartureId = String(upsertedDepartureRows[0].id);
          const parsedFromText = parseScraperRawTextPrices(String(period.raw_text || ''));
          const parsedRawTextRich = extractPricingFromTextWithContext(String(period.raw_text || ''));
          const adultPrice =
            toNum(period.price) ||
            parsedFromText.adult ||
            parsedRawTextRich.adult?.amount ||
            parsedFromPdf?.adult?.amount ||
            toNum(tour.price_from) ||
            null;
          const childWithBedPrice =
            parsedFromText.childWithBed ||
            parsedRawTextRich.childWithBed?.amount ||
            parsedFromPdf?.childWithBed?.amount ||
            null;
          const childWithoutBedPrice =
            parsedFromText.childWithoutBed ||
            parsedRawTextRich.childWithoutBed?.amount ||
            parsedFromPdf?.childWithoutBed?.amount ||
            childWithBedPrice ||
            null;
          const infantPrice =
            parsedFromText.infant ||
            parsedRawTextRich.infant?.amount ||
            parsedFromPdf?.infant?.amount ||
            null;
          const singlePrice =
            parsedFromText.single ||
            parsedRawTextRich.single?.amount ||
            parsedFromPdf?.single?.amount ||
            null;
          const depositAmount =
            toNum(tour.deposit) ||
            parsedRawTextRich.deposit?.amount ||
            parsedFromPdf?.deposit?.amount ||
            null;
          const depositTypeFromPdf = parsedFromPdf?.depositType || 'unknown';
          const depositTypeFromRawText = parsedRawTextRich.depositType;
          const depositType =
            depositTypeFromRawText !== 'unknown'
              ? depositTypeFromRawText
              : depositTypeFromPdf && depositTypeFromPdf !== 'unknown'
                ? depositTypeFromPdf
                : depositAmount
                  ? 'per_person'
                  : 'unknown';
          const priceSourceTag = parsedFromPdf ? 'pdf' : 'scraper';

          const needReviewPrice = detectNeedReviewForPrices({
            adult_price: adultPrice,
            child_with_bed_price: childWithBedPrice,
            child_without_bed_price: childWithoutBedPrice,
            infant_price: infantPrice,
            single_supplement_price: singlePrice,
            deposit_amount: depositAmount,
            deposit_type: depositType,
            price_source: priceSourceTag,
          });

          await assertWrite(sb.from('tour_prices').upsert({
            departure_id: centralDepartureId,
            price_type: 'central',
            adult_price: adultPrice,
            child_with_bed_price: childWithBedPrice,
            child_without_bed_price: childWithoutBedPrice,
            infant_price: infantPrice,
            single_supplement_price: singlePrice,
            deposit_amount: depositAmount,
            deposit_type: depositType,
            currency: 'THB',
            price_source: priceSourceTag,
            extraction_status: 'normalized',
            need_review: needReviewPrice,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'departure_id,price_type' }) as any, 'tour_prices upsert (scraper)');

          const seatParsed = parseSeatSnapshotFromText(String(period.raw_text || ''));
          const seatAvailable = toNullableInt(period.seats_left) ?? seatParsed.available;
          const seatTotalFromParsed = seatParsed.total;
          const seatBookedFromParsed = seatParsed.booked;
          const seatTotal =
            seatTotalFromParsed !== null
              ? seatTotalFromParsed
              : seatAvailable !== null && seatBookedFromParsed !== null
                ? seatAvailable + seatBookedFromParsed
                : seatAvailable;
          const seatBooked =
            seatBookedFromParsed !== null
              ? seatBookedFromParsed
              : seatTotal !== null && seatAvailable !== null
                ? Math.max(seatTotal - seatAvailable, 0)
                : null;
          await assertWrite(sb.from('tour_seats').upsert({
            departure_id: centralDepartureId,
            seat_total: seatTotal,
            seat_available: seatAvailable,
            seat_booked: seatBooked,
            source: 'scraper',
            need_review: seatAvailable === null || seatTotal === null || seatBooked === null,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'departure_id' }) as any, 'tour_seats upsert (scraper)');

          if (pdfUrl) {
            await assertWrite(sb.from('tour_pdfs').upsert({
              canonical_tour_id: canonicalTourId,
              wholesale_id: site.id,
              departure_id: centralDepartureId,
              pdf_url: pdfUrl,
              extraction_status: parsedFromPdf ? 'normalized' : 'raw',
              need_review: false,
              is_active: true,
              updated_at: new Date().toISOString(),
            }, { onConflict: 'wholesale_id,canonical_tour_id,pdf_url' }) as any, 'tour_pdfs upsert (scraper)');
          }
        }

        expectedDepartureKeysByTour.set(canonicalTourId, expectedKeys);

        added += 1;
      } catch (error: any) {
        failed += 1;
        if (!firstErrorMessage) {
          firstErrorMessage = String(error?.message || error || 'unknown error');
        }
      }
    }

    for (const [canonicalTourId, expectedKeys] of expectedDepartureKeysByTour.entries()) {
      const prunedResult = await pruneStaleDeparturesForTour({
        wholesaleId: site.id,
        canonicalTourId,
        expectedDepartureKeys: Array.from(expectedKeys),
      });
      pruned += Number(prunedResult.deleted || 0);
    }

    await insertSyncLog({
      wholesaleId: site.id,
      syncType: 'scraper_normalize',
      status: failed > 0 ? 'PARTIAL' : 'SUCCESS',
      message:
        failed > 0 && firstErrorMessage
          ? `${site.name} normalized | pruned=${pruned} | first_error=${firstErrorMessage}`
          : `${site.name} normalized | pruned=${pruned}`,
      recordsAdded: added,
      recordsUpdated: updated,
      recordsFailed: failed,
    });
    try {
      await runWholesalerQualityValidation(site.id);
    } catch (qualityError: any) {
      await insertSyncLog({
        wholesaleId: site.id,
        syncType: 'quality_validation',
        status: 'FAILED',
        message: `quality validation failed: ${String(qualityError?.message || qualityError || 'unknown')}`,
        recordsAdded: 0,
        recordsUpdated: 0,
        recordsFailed: 1,
      });
    }
    try {
      await enqueuePdfExtractionJobs({
        wholesalerId: site.id,
        force: false,
        onlyMissingPricing: true,
        limit: Math.max(500, params.limit),
      });
    } catch (queueError: any) {
      await insertSyncLog({
        wholesaleId: site.id,
        syncType: 'pdf_queue_enqueue',
        status: 'FAILED',
        message: `pdf queue enqueue failed: ${String(queueError?.message || queueError || 'unknown')}`,
        recordsAdded: 0,
        recordsUpdated: 0,
        recordsFailed: 1,
      });
    }
    results.push({ wholesalerId: site.id, recordsAdded: added, recordsUpdated: updated, recordsFailed: failed });
  }

  return results;
}

async function pruneStaleDeparturesForTour(params: {
  wholesaleId: string;
  canonicalTourId: string;
  expectedDepartureKeys: string[];
}) {
  const sb = getSupabaseAdmin();
  const wholesaleId = String(params.wholesaleId || '').trim();
  const canonicalTourId = String(params.canonicalTourId || '').trim();
  if (!wholesaleId || !canonicalTourId) return { deleted: 0 };

  const expected = new Set(
    (params.expectedDepartureKeys || [])
      .map((value) => String(value || '').trim())
      .filter(Boolean),
  );
  if (expected.size === 0) return { deleted: 0 };

  const { data: departures, error } = await sb
    .from('tour_departures')
    .select('id, source_departure_key')
    .eq('wholesale_id', wholesaleId)
    .eq('canonical_tour_id', canonicalTourId)
    .limit(5000);
  if (error) throw new Error(`prune stale departures load failed: ${error.message}`);

  const staleIds = (departures || [])
    .filter((row: any) => !expected.has(String(row.source_departure_key || '').trim()))
    .map((row: any) => String(row.id || ''))
    .filter(Boolean);
  if (staleIds.length === 0) return { deleted: 0 };

  const { error: delErr } = await sb
    .from('tour_departures')
    .delete()
    .in('id', staleIds);
  if (delErr) throw new Error(`prune stale departures delete failed: ${delErr.message}`);
  return { deleted: staleIds.length };
}

async function upsertScraperFallbackDeparture(params: {
  canonicalTourId: string;
  wholesaleId: string;
  sourceTourKey: string;
  adultPrice: number | null;
  depositAmount: number | null;
  parsedFromPdf?: ExtractedPricingFromText | null;
  fallbackDepartureDate?: string | null;
}) {
  const sb = getSupabaseAdmin();
  const sourceDepartureKey = `fallback:${params.sourceTourKey}`;
  const { data: departureRows, error: depErr } = await sb
    .from('tour_departures')
    .upsert({
      canonical_tour_id: params.canonicalTourId,
      wholesale_id: params.wholesaleId,
      source_departure_key: sourceDepartureKey,
      departure_date: params.fallbackDepartureDate || null,
      return_date: null,
      status: 'AVAILABLE',
      need_review: true,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'wholesale_id,source_departure_key' })
    .select('id')
    .limit(1);
  if (depErr || !departureRows?.[0]?.id) throw new Error(depErr?.message || 'fallback departure upsert failed');

  const departureId = String(departureRows[0].id);
  const fallbackAdult = params.adultPrice || params.parsedFromPdf?.adult?.amount || null;
  const fallbackChildWithBed =
    params.parsedFromPdf?.childWithBed?.amount ||
    params.parsedFromPdf?.childWithoutBed?.amount ||
    fallbackAdult;
  const fallbackChildWithoutBed =
    params.parsedFromPdf?.childWithoutBed?.amount ||
    fallbackChildWithBed ||
    fallbackAdult;
  const fallbackInfant = params.parsedFromPdf?.infant?.amount || null;
  const fallbackSingle = params.parsedFromPdf?.single?.amount || null;
  const depositType =
    params.parsedFromPdf?.depositType && params.parsedFromPdf.depositType !== 'unknown'
      ? params.parsedFromPdf.depositType
      : params.depositAmount
        ? 'per_person'
        : 'unknown';
  await assertWrite(sb.from('tour_prices').upsert({
    departure_id: departureId,
    price_type: 'central',
    adult_price: fallbackAdult,
    child_with_bed_price: fallbackChildWithBed,
    child_without_bed_price: fallbackChildWithoutBed,
    infant_price: fallbackInfant,
    single_supplement_price: fallbackSingle,
    deposit_amount: params.depositAmount,
    deposit_type: depositType,
    currency: 'THB',
    price_source: params.parsedFromPdf ? 'pdf' : 'scraper',
    extraction_status: 'normalized',
    need_review: true,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'departure_id,price_type' }) as any, 'tour_prices upsert (fallback)');

  return {
    departureId,
    sourceDepartureKey,
  };
}

async function insertSyncLog(params: {
  wholesaleId: string;
  syncType: string;
  status: string;
  message: string;
  recordsAdded: number;
  recordsUpdated: number;
  recordsFailed: number;
}) {
  const sb = getSupabaseAdmin();
  await assertWrite(sb.from('sync_logs').insert({
    wholesale_id: params.wholesaleId,
    sync_type: params.syncType,
    status: params.status,
    message: params.message,
    records_added: params.recordsAdded,
    records_updated: params.recordsUpdated,
    records_failed: params.recordsFailed,
    created_at: new Date().toISOString(),
  }) as any, 'sync_logs insert');
}

export async function getDepartureCompletenessReport(options?: {
  wholesalerId?: string;
  onlyIncomplete?: boolean;
  limit?: number;
  offset?: number;
}) {
  const sb = getSupabaseAdmin();
  const wholesalerId = String(options?.wholesalerId || '').trim() || undefined;
  const onlyIncomplete = options?.onlyIncomplete !== false;
  const limit = Number.isFinite(Number(options?.limit)) ? Math.max(1, Number(options?.limit)) : 200;
  const offset = Number.isFinite(Number(options?.offset)) ? Math.max(0, Number(options?.offset)) : 0;

  const departures = await fetchAllPages<any>(
    (from, to) => {
      let query: any = sb
        .from('tour_departures')
        .select('id, canonical_tour_id, wholesale_id, source_departure_key, departure_date, return_date, updated_at')
        .order('updated_at', { ascending: false })
        .range(from, to);
      if (wholesalerId) query = query.eq('wholesale_id', wholesalerId);
      return query;
    },
    'load departures (completeness)',
  );

  const departureIds = (departures || []).map((row: any) => String(row.id || '')).filter(Boolean);
  if (departureIds.length === 0) return [] as DepartureCompletenessRow[];

  const canonicalIds = Array.from(new Set((departures || []).map((row: any) => String(row.canonical_tour_id || '')).filter(Boolean)));
  const [pricesRows, seatsRows, depPdfRows, tourPdfRows] = await Promise.all([
    fetchRowsByIdsChunked<any>({
      table: 'tour_prices',
      select: 'departure_id, adult_price, child_with_bed_price, child_without_bed_price, infant_price, single_supplement_price, deposit_amount, deposit_type, price_source, extraction_status, need_review, updated_at',
      idColumn: 'departure_id',
      ids: departureIds,
      context: 'load tour_prices (completeness)',
    }),
    fetchRowsByIdsChunked<any>({
      table: 'tour_seats',
      select: 'departure_id, seat_total, seat_available, seat_booked, updated_at',
      idColumn: 'departure_id',
      ids: departureIds,
      context: 'load tour_seats (completeness)',
    }),
    fetchRowsByIdsChunked<any>({
      table: 'tour_pdfs',
      select: 'departure_id, pdf_url',
      idColumn: 'departure_id',
      ids: departureIds,
      where: { is_active: true },
      context: 'load departure tour_pdfs (completeness)',
    }),
    (async () => {
      if (canonicalIds.length === 0) return [] as any[];
      const rows: any[] = [];
      for (let i = 0; i < canonicalIds.length; i += SUPABASE_IN_CHUNK_SIZE) {
        const chunk = canonicalIds.slice(i, i + SUPABASE_IN_CHUNK_SIZE);
        const res = await sb
          .from('tour_pdfs')
          .select('canonical_tour_id, wholesale_id, pdf_url')
          .in('canonical_tour_id', chunk)
          .eq('is_active', true);
        if (res.error) throw new Error(`load tour-level tour_pdfs (completeness): ${res.error.message}`);
        rows.push(...(res.data || []));
      }
      return rows;
    })(),
  ]);

  const priceByDeparture: Record<string, any> = {};
  (pricesRows || []).forEach((row: any) => {
    priceByDeparture[String(row.departure_id)] = row;
  });
  const seatByDeparture: Record<string, any> = {};
  (seatsRows || []).forEach((row: any) => {
    seatByDeparture[String(row.departure_id)] = row;
  });
  const pdfByDeparture: Record<string, string> = {};
  (depPdfRows || []).forEach((row: any) => {
    const depId = String(row.departure_id || '');
    if (depId && !pdfByDeparture[depId]) pdfByDeparture[depId] = String(row.pdf_url || '');
  });
  const pdfByTourWh: Record<string, string> = {};
  (tourPdfRows || []).forEach((row: any) => {
    const key = `${String(row.canonical_tour_id || '')}|${String(row.wholesale_id || '')}`;
    if (key && !pdfByTourWh[key]) pdfByTourWh[key] = String(row.pdf_url || '');
  });

  let rows: DepartureCompletenessRow[] = (departures || []).map((dep: any) => {
    const departureId = String(dep.id || '');
    const price = priceByDeparture[departureId] || {};
    const seat = seatByDeparture[departureId] || {};
    const fallbackPdf = pdfByTourWh[`${String(dep.canonical_tour_id || '')}|${String(dep.wholesale_id || '')}`] || '';
    const pdfUrl = String(pdfByDeparture[departureId] || fallbackPdf || '');

    const adultPrice = toNum(price.adult_price);
    const childWithBedPrice = toNum(price.child_with_bed_price);
    const childWithoutBedPrice = toNum(price.child_without_bed_price);
    const infantPrice = toNum(price.infant_price);
    const singlePrice = toNum(price.single_supplement_price);
    const depositAmount = toNum(price.deposit_amount);
    const depositType = normalizeDepositType(price.deposit_type);
    const seatTotal = seat?.seat_total === null || seat?.seat_total === undefined ? null : toNum(seat.seat_total);
    const seatAvailable = seat?.seat_available === null || seat?.seat_available === undefined ? null : toNum(seat.seat_available);
    const seatBooked =
      seat?.seat_booked === null || seat?.seat_booked === undefined
        ? (seatTotal !== null && seatAvailable !== null ? Math.max(seatTotal - seatAvailable, 0) : null)
        : toNum(seat.seat_booked);
    const missingFields = buildMissingFields({
      departureDate: dep.departure_date,
      adultPrice,
      childWithBedPrice,
      childWithoutBedPrice,
      singlePrice,
      depositAmount,
      depositType,
      seatTotal,
      seatAvailable,
      seatBooked,
      pdfUrl,
    });
    const hasDepartureDate = !!dep.departure_date;
    const isComplete = missingFields.length === 0;

    return {
      departure_id: departureId,
      wholesale_id: String(dep.wholesale_id || ''),
      canonical_tour_id: dep.canonical_tour_id ? String(dep.canonical_tour_id) : null,
      source_departure_key: String(dep.source_departure_key || ''),
      departure_date: dep.departure_date ? String(dep.departure_date) : null,
      return_date: dep.return_date ? String(dep.return_date) : null,
      has_departure_date: hasDepartureDate,
      has_adult_price: adultPrice > 0,
      has_child_with_bed_price: childWithBedPrice > 0,
      has_child_without_bed_price: childWithoutBedPrice > 0,
      has_infant_price: infantPrice > 0,
      has_single_supplement_price: singlePrice > 0,
      has_deposit_amount: depositAmount > 0,
      deposit_type: depositType,
      has_seat_available: seatAvailable !== null && seatAvailable !== undefined,
      has_pdf_url: !!pdfUrl,
      pdf_url: pdfUrl,
      missing_fields: missingFields,
      missing_count: missingFields.length,
      is_complete: isComplete,
      price_source: String(price.price_source || ''),
      price_extraction_status: String(price.extraction_status || ''),
      need_review: Boolean(price.need_review),
      updated_at: String(price.updated_at || dep.updated_at || ''),
    };
  });

  if (onlyIncomplete) {
    rows = rows.filter((row) => !row.is_complete);
  }
  rows.sort((a, b) => {
    if (b.missing_count !== a.missing_count) return b.missing_count - a.missing_count;
    return String(b.updated_at || '').localeCompare(String(a.updated_at || ''));
  });

  return rows.slice(offset, offset + limit);
}

export async function getCentralOverview(limit = 50) {
  const sb = getSupabaseAdmin();

  const [wholesalers, tours, mappings, departures, prices, seats, pdfs, recentLogs, qualityReportsRes, qualityIssuesRes, queuePending, queueProcessing, queueRetry, queueFailed] = await Promise.all([
    sb.from('wholesalers').select('*').order('name', { ascending: true }),
    sb.from('canonical_tours').select('id', { count: 'exact', head: true }),
    sb.from('wholesale_tour_mappings').select('id', { count: 'exact', head: true }),
    sb.from('tour_departures').select('id', { count: 'exact', head: true }),
    sb.from('tour_prices').select('id', { count: 'exact', head: true }),
    sb.from('tour_seats').select('id', { count: 'exact', head: true }),
    sb.from('tour_pdfs').select('id', { count: 'exact', head: true }),
    sb.from('sync_logs').select('*').order('created_at', { ascending: false }).limit(limit),
    sb.from('sync_quality_reports').select('*').order('generated_at', { ascending: false }).limit(500),
    sb.from('sync_quality_issues').select('*').eq('resolved', false).order('created_at', { ascending: false }).limit(limit),
    sb.from('pdf_extraction_jobs').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    sb.from('pdf_extraction_jobs').select('id', { count: 'exact', head: true }).eq('status', 'processing'),
    sb.from('pdf_extraction_jobs').select('id', { count: 'exact', head: true }).eq('status', 'retry'),
    sb.from('pdf_extraction_jobs').select('id', { count: 'exact', head: true }).eq('status', 'failed'),
  ]);

  const reviewQueues = await Promise.all([
    sb.from('canonical_tours').select('id, slug, title, updated_at').eq('need_review', true).limit(limit),
    sb.from('tour_prices').select('id, departure_id, need_review, extraction_status, updated_at').eq('need_review', true).limit(limit),
    sb.from('tour_seats').select('id, departure_id, need_review, updated_at').eq('need_review', true).limit(limit),
    sb.from('raw_wholesale_imports').select('id, wholesale_id, source_tour_key, extraction_status, need_review, imported_at').eq('need_review', true).order('imported_at', { ascending: false }).limit(limit),
  ]);

  const latestQualityByWholesaler: Record<string, any> = {};
  for (const row of qualityReportsRes.data || []) {
    const wholesaleId = String(row.wholesale_id || '');
    if (!wholesaleId || latestQualityByWholesaler[wholesaleId]) continue;
    latestQualityByWholesaler[wholesaleId] = row;
  }

  const qualitySummary = (wholesalers.data || []).map((wholesaler: any) => {
    const wid = String(wholesaler.id);
    const row = latestQualityByWholesaler[wid] || null;
    return {
      wholesale_id: wid,
      wholesale_name: String(wholesaler.name || wid),
      generated_at: row?.generated_at || null,
      status: row?.status || 'NO_REPORT',
      completeness_percent: Number(row?.completeness_percent || 0),
      total_departures: Number(row?.total_departures || 0),
      complete_departures: Number(row?.complete_departures || 0),
      missing_departure_count: Number(row?.missing_departure_count || 0),
      missing_adult_price_count: Number(row?.missing_adult_price_count || 0),
      missing_deposit_count: Number(row?.missing_deposit_count || 0),
      missing_seat_count: Number(row?.missing_seat_count || 0),
      missing_pdf_count: Number(row?.missing_pdf_count || 0),
      invalid_seat_count: Number(row?.invalid_seat_count || 0),
      report_id: row?.id || null,
    };
  });

  const incompleteDepartures = await getDepartureCompletenessReport({
    onlyIncomplete: true,
    limit: Math.max(50, Math.min(limit * 2, 200)),
    offset: 0,
  });

  return {
    summary: {
      wholesalers: wholesalers.data || [],
      canonicalTourCount: tours.count || 0,
      mappingCount: mappings.count || 0,
      departureCount: departures.count || 0,
      priceCount: prices.count || 0,
      seatCount: seats.count || 0,
      pdfCount: pdfs.count || 0,
    },
    review: {
      tours: reviewQueues[0].data || [],
      prices: reviewQueues[1].data || [],
      seats: reviewQueues[2].data || [],
      rawImports: reviewQueues[3].data || [],
    },
    quality: {
      summaries: qualitySummary,
      issues: qualityIssuesRes.data || [],
    },
    queue: {
      pending: queuePending.count || 0,
      processing: queueProcessing.count || 0,
      retry: queueRetry.count || 0,
      failed: queueFailed.count || 0,
    },
    completeness: {
      incompleteDepartures,
    },
    logs: recentLogs.data || [],
  };
}

export async function getCentralTourList(options?: {
  limit?: number;
  keyword?: string;
  country?: string;
  wholesalerId?: string;
}) {
  const sb = getSupabaseAdmin();
  const limit = options?.limit ?? 1000;
  const wholesalerId = String(options?.wholesalerId || '').trim() || undefined;
  const { data: tours, error } = await sb
    .from('canonical_tours')
    .select('id, slug, title, country, city, duration_days, duration_nights')
    .eq('is_published', true)
    .order('updated_at', { ascending: false })
    .limit(limit);

  if (error || !tours) return [];

  const canonicalIds = tours.map((tour: any) => tour.id);
  if (canonicalIds.length === 0) return [];

  let mappingsQuery = sb
    .from('wholesale_tour_mappings')
    .select('canonical_tour_id, wholesale_id, source_tour_code')
    .in('canonical_tour_id', canonicalIds);
  if (wholesalerId) {
    mappingsQuery = mappingsQuery.eq('wholesale_id', wholesalerId);
  }

  let departuresQuery = sb
    .from('tour_departures')
    .select('id, canonical_tour_id, wholesale_id, departure_date')
    .in('canonical_tour_id', canonicalIds);
  if (wholesalerId) {
    departuresQuery = departuresQuery.eq('wholesale_id', wholesalerId);
  }

  const [mappingsRes, departuresRes, wholesalersRes] = await Promise.all([
    mappingsQuery,
    departuresQuery,
    sb.from('wholesalers').select('id, name').eq('is_active', true),
  ]);

  const departureIds = (departuresRes.data || []).map((departure: any) => departure.id);
  const [pricesRes, seatsRes] = await Promise.all([
    departureIds.length > 0
      ? sb.from('tour_prices').select('departure_id, adult_price').eq('price_type', 'central').in('departure_id', departureIds)
      : Promise.resolve({ data: [] as any[] }),
    departureIds.length > 0 ? sb.from('tour_seats').select('departure_id, seat_available').in('departure_id', departureIds) : Promise.resolve({ data: [] as any[] }),
  ]);

  const mappingsByTour: Record<string, any[]> = {};
  (mappingsRes.data || []).forEach((mapping: any) => {
    if (!mappingsByTour[mapping.canonical_tour_id]) mappingsByTour[mapping.canonical_tour_id] = [];
    mappingsByTour[mapping.canonical_tour_id].push(mapping);
  });

  const departuresByTour: Record<string, any[]> = {};
  (departuresRes.data || []).forEach((departure: any) => {
    if (!departuresByTour[departure.canonical_tour_id]) departuresByTour[departure.canonical_tour_id] = [];
    departuresByTour[departure.canonical_tour_id].push(departure);
  });

  const wholesalerNameMap: Record<string, string> = {};
  (wholesalersRes.data || []).forEach((row: any) => {
    wholesalerNameMap[String(row.id)] = String(row.name || row.id);
  });

  const priceByDeparture: Record<string, number> = {};
  (pricesRes.data || []).forEach((price: any) => {
    const amount = toNum(price.adult_price);
    if (amount > 0 && (!priceByDeparture[price.departure_id] || amount < priceByDeparture[price.departure_id])) {
      priceByDeparture[price.departure_id] = amount;
    }
  });

  const seatByDeparture: Record<string, number> = {};
  (seatsRes.data || []).forEach((seat: any) => {
    const available = toNum(seat.seat_available);
    if (available >= 0) seatByDeparture[seat.departure_id] = available;
  });

  let rows = tours.map((tour: any) => {
    const tourMappings = mappingsByTour[tour.id] || [];
    if (wholesalerId && tourMappings.length === 0) return null;
    const tourDepartures = departuresByTour[tour.id] || [];
    const prices = tourDepartures.map((departure: any) => priceByDeparture[departure.id] || 0).filter((price: number) => price > 0);
    const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
    const nextDate = tourDepartures
      .map((departure: any) => departure.departure_date)
      .filter(Boolean)
      .sort()[0] || null;
    const totalSeatsAvailable = tourDepartures.reduce((sum: number, departure: any) => sum + (seatByDeparture[departure.id] || 0), 0);
    const firstMapping = tourMappings[0];

    return {
      id: tour.id,
      slug: tour.slug,
      code: firstMapping?.source_tour_code || '',
      title: tour.title,
      supplier: wholesalerNameMap[firstMapping?.wholesale_id] || firstMapping?.wholesale_id || 'multiple',
      country: tour.country || '',
      city: tour.city || '',
      durationDays: Number(tour.duration_days || 0),
      durationNights: Number(tour.duration_nights || 0),
      nextDeparture: nextDate || 'N/A',
      price: minPrice,
      availableSeats: totalSeatsAvailable,
      imageUrl: '',
      airline: '',
    };
  }).filter(Boolean) as any[];

  const keyword = String(options?.keyword || '').trim().toLowerCase();
  if (keyword) {
    rows = rows.filter((row) =>
      String(row.title || '').toLowerCase().includes(keyword) ||
      String(row.code || '').toLowerCase().includes(keyword) ||
      String(row.country || '').toLowerCase().includes(keyword),
    );
  }

  const country = String(options?.country || '').trim().toLowerCase();
  if (country) {
    rows = rows.filter((row) => String(row.country || '').toLowerCase().includes(country));
  }

  return rows;
}

export async function getCentralTourBySlug(slug: string) {
  const sb = getSupabaseAdmin();
  const { data: tours, error } = await sb
    .from('canonical_tours')
    .select('id, slug, title, country, city, duration_days, duration_nights, is_published')
    .eq('slug', slug)
    .limit(1);
  if (error || !tours?.length) return null;

  const tour = tours[0];
  const canonicalTourId = String(tour.id);

  const [mappingsRes, departuresRes, pdfsRes] = await Promise.all([
    sb.from('wholesale_tour_mappings').select('wholesale_id, source_tour_code, source_url').eq('canonical_tour_id', canonicalTourId),
    sb.from('tour_departures').select('id, wholesale_id, source_departure_key, departure_date, return_date, status').eq('canonical_tour_id', canonicalTourId).order('departure_date', { ascending: true }),
    sb.from('tour_pdfs').select('wholesale_id, departure_id, pdf_url, is_active').eq('canonical_tour_id', canonicalTourId).eq('is_active', true),
  ]);

  const departureIds = (departuresRes.data || []).map((departure: any) => departure.id);
  const [pricesRes, seatsRes, wholesalersRes] = await Promise.all([
    departureIds.length > 0
      ? sb.from('tour_prices').select('*').eq('price_type', 'central').in('departure_id', departureIds)
      : Promise.resolve({ data: [] as any[] }),
    departureIds.length > 0 ? sb.from('tour_seats').select('*').in('departure_id', departureIds) : Promise.resolve({ data: [] as any[] }),
    sb.from('wholesalers').select('id, name, source_type').eq('is_active', true),
  ]);

  const wholesalerNameMap: Record<string, string> = {};
  const wholesalerSourceTypeMap: Record<string, string> = {};
  (wholesalersRes.data || []).forEach((row: any) => {
    wholesalerNameMap[String(row.id)] = String(row.name || row.id);
    wholesalerSourceTypeMap[String(row.id)] = String(row.source_type || 'api');
  });

  const priceMap: Record<string, any> = {};
  (pricesRes.data || []).forEach((row: any) => {
    priceMap[String(row.departure_id)] = row;
  });

  const seatMap: Record<string, any> = {};
  (seatsRes.data || []).forEach((row: any) => {
    seatMap[String(row.departure_id)] = row;
  });

  const pdfByWholesaler: Record<string, string> = {};
  const pdfByDepartureId: Record<string, string> = {};
  (pdfsRes.data || []).forEach((row: any) => {
    const wholesaleId = String(row.wholesale_id || '');
    if (!wholesaleId) return;
    if (!pdfByWholesaler[wholesaleId]) {
      pdfByWholesaler[wholesaleId] = String(row.pdf_url || '');
    }
    const depId = String(row.departure_id || '');
    if (depId && !pdfByDepartureId[depId]) {
      pdfByDepartureId[depId] = String(row.pdf_url || '');
    }
  });

  const departures = (departuresRes.data || []).map((departure: any) => {
    const price = priceMap[String(departure.id)] || {};
    const seat = seatMap[String(departure.id)] || {};
    const totalSeats = toNullableInt(seat.seat_total);
    const remainingSeats = toNullableInt(seat.seat_available) ?? 0;
    const booked = totalSeats !== null ? Math.max(totalSeats - remainingSeats, 0) : null;

    return {
      id: String(departure.id),
      wholesaleId: String(departure.wholesale_id),
      wholesaleName: wholesalerNameMap[String(departure.wholesale_id)] || String(departure.wholesale_id),
      wholesaleSourceType: wholesalerSourceTypeMap[String(departure.wholesale_id)] || 'api',
      sourceDepartureKey: String(departure.source_departure_key || ''),
      startDate: departure.departure_date ? new Date(`${departure.departure_date}T00:00:00.000Z`).toISOString() : '',
      endDate: departure.return_date ? new Date(`${departure.return_date}T00:00:00.000Z`).toISOString() : '',
      priceAdult: toNum(price.adult_price),
      priceChildWithBed: toNum(price.child_with_bed_price),
      priceChildWithoutBed: toNum(price.child_without_bed_price),
      priceChild: toNum(price.child_with_bed_price || price.child_without_bed_price || price.adult_price),
      priceSingle: toNum(price.single_supplement_price),
      priceInfant: toNum(price.infant_price),
      deposit: toNum(price.deposit_amount),
      depositType: String(price.deposit_type || 'unknown'),
      pdfUrl: pdfByDepartureId[String(departure.id)] || pdfByWholesaler[String(departure.wholesale_id)] || '',
      totalSeats: totalSeats ?? undefined,
      booked: booked ?? undefined,
      remainingSeats,
      status: String(departure.status || 'AVAILABLE').toUpperCase(),
    };
  });

  const startingPriceCandidates = departures.map((departure: any) => toNum(departure.priceAdult)).filter((price: number) => price > 0);
  const startingPrice = startingPriceCandidates.length > 0 ? Math.min(...startingPriceCandidates) : 0;

  const mappings = mappingsRes.data || [];
  const firstMapping = mappings[0] || {};
  const firstWholesalerId = String(firstMapping.wholesale_id || mappings[0]?.wholesale_id || '');
  const defaultPdf = pdfByWholesaler[firstWholesalerId] || Object.values(pdfByWholesaler)[0] || '';
  const fallbackImage = 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1200';

  return {
    id: canonicalTourId,
    slug: String(tour.slug || ''),
    code: String(firstMapping.source_tour_code || ''),
    title: String(tour.title || ''),
    supplier: {
      id: firstWholesalerId,
      name: wholesalerNameMap[firstWholesalerId] || firstWholesalerId || 'Wholesale',
    },
    wholesalers: mappings.map((mapping: any) => ({
      id: String(mapping.wholesale_id),
      name: wholesalerNameMap[String(mapping.wholesale_id)] || String(mapping.wholesale_id),
      sourceType: wholesalerSourceTypeMap[String(mapping.wholesale_id)] || 'api',
      sourceTourCode: String(mapping.source_tour_code || ''),
      sourceUrl: String(mapping.source_url || ''),
      pdfUrl: pdfByWholesaler[String(mapping.wholesale_id)] || '',
    })),
    country: String(tour.country || ''),
    city: String(tour.city || ''),
    duration: { days: Number(tour.duration_days || 0), nights: Number(tour.duration_nights || 0) },
    images: [fallbackImage],
    price: { starting: startingPrice },
    status: tour.is_published ? 'PUBLISHED' : 'DRAFT',
    summary: '',
    highlights: [],
    flight: { airline: '', details: '' },
    hotel: { name: '', rating: 0, details: '' },
    meals: '',
    included: [],
    excluded: [],
    policies: { payment: '', cancellation: '' },
    pdfUrl: defaultPdf || undefined,
    itinerary: [],
    departures,
  };
}

export async function resolveCentralTourRouteBySourceCode(params: {
  sourceCode: string;
  wholesaleId?: string;
}) {
  const sourceCode = String(params.sourceCode || '').trim();
  if (!sourceCode) return null;

  const sb = getSupabaseAdmin();

  let mappingsQuery = sb
    .from('wholesale_tour_mappings')
    .select('canonical_tour_id, wholesale_id, source_tour_code, source_tour_key, updated_at')
    .order('updated_at', { ascending: false })
    .limit(200);

  if (params.wholesaleId) {
    mappingsQuery = mappingsQuery.eq('wholesale_id', params.wholesaleId);
  }

  let { data: mappings, error } = await mappingsQuery.ilike('source_tour_code', sourceCode);
  if (error) throw new Error(`[central-resolve] mapping by source_tour_code failed: ${error.message}`);

  if (!mappings || mappings.length === 0) {
    const byKey = await sb
      .from('wholesale_tour_mappings')
      .select('canonical_tour_id, wholesale_id, source_tour_code, source_tour_key, updated_at')
      .eq('source_tour_key', sourceCode)
      .order('updated_at', { ascending: false })
      .limit(200);
    if (byKey.error) throw new Error(`[central-resolve] mapping by source_tour_key failed: ${byKey.error.message}`);
    mappings = byKey.data || [];
  }

  if (!mappings || mappings.length === 0) return null;

  const canonicalIds = Array.from(
    new Set(mappings.map((mapping: any) => String(mapping.canonical_tour_id || '')).filter(Boolean)),
  );
  if (canonicalIds.length === 0) return null;

  const { data: tours, error: tourErr } = await sb
    .from('canonical_tours')
    .select('id, slug, is_published, updated_at')
    .in('id', canonicalIds);
  if (tourErr) throw new Error(`[central-resolve] canonical tour lookup failed: ${tourErr.message}`);

  const tourById: Record<string, any> = {};
  (tours || []).forEach((tour: any) => {
    tourById[String(tour.id)] = tour;
  });

  for (const mapping of mappings) {
    const tour = tourById[String(mapping.canonical_tour_id || '')];
    if (!tour || !tour.is_published || !tour.slug) continue;
    return {
      slug: String(tour.slug),
      canonicalTourId: String(tour.id),
      wholesaleId: String(mapping.wholesale_id || ''),
      sourceTourCode: String(mapping.source_tour_code || ''),
      sourceTourKey: String(mapping.source_tour_key || ''),
    };
  }

  return null;
}


