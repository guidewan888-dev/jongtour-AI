import { createHash } from 'crypto';
import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { enqueuePdfExtractionJobs, processPdfExtractionQueue } from '@/services/central-wholesale.service';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

const WHOLESALE_ID = 'SUP_GO365';

function getGo365Config() {
  return {
    apiKey: String(process.env.GO365_API_KEY || '').trim(),
    apiBase: String(process.env.GO365_API_BASE || 'https://api.kaikongservice.com/api/v1').trim(),
    apiLang: String(process.env.GO365_API_LANG || 'th').trim() || 'th',
  };
}

const COUNTRY_TH: Record<string, string> = {
  Japan: 'ญี่ปุ่น',
  China: 'จีน',
  Taiwan: 'ไต้หวัน',
  'Hong Kong': 'ฮ่องกง',
  Vietnam: 'เวียดนาม',
  Korea: 'เกาหลี',
  'South Korea': 'เกาหลีใต้',
  Singapore: 'สิงคโปร์',
  Malaysia: 'มาเลเซีย',
  Indonesia: 'อินโดนีเซีย',
  Italy: 'อิตาลี',
  France: 'ฝรั่งเศส',
  Germany: 'เยอรมนี',
  Switzerland: 'สวิตเซอร์แลนด์',
  Turkiye: 'ตุรกี',
  Turkey: 'ตุรกี',
  Georgia: 'จอร์เจีย',
  England: 'อังกฤษ',
  'United Kingdom': 'อังกฤษ',
};

const toNum = (value: any): number => {
  if (value === null || value === undefined || value === '') return 0;
  const parsed = Number(String(value).replace(/[^\d.-]/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
};

const slugify = (value: string): string =>
  String(value || '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

const shortHash = (value: string) => createHash('md5').update(value).digest('hex').slice(0, 8);

const asDate = (value: any): string | null => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
};

const normalizeStatus = (period: any): string => {
  const visible = Number(period?.period_visible || 0);
  return visible === 2 ? 'AVAILABLE' : 'FULL';
};

async function fetchTourListPage(params: {
  page: number;
  limit: number;
  visible?: string;
  tourIds?: Array<string | number>;
}): Promise<any> {
  const { apiKey, apiBase, apiLang } = getGo365Config();
  if (!apiKey) throw new Error('Missing GO365_API_KEY');

  const query = new URLSearchParams();
  query.set('start_page', String(params.page));
  query.set('limit_page', String(params.limit));
  query.set('visible', String(params.visible ?? '1'));
  if (Array.isArray(params.tourIds) && params.tourIds.length > 0) {
    query.set('tour_id', params.tourIds.map((value) => String(value)).join(','));
  }

  const res = await fetch(`${apiBase}/tours/list?${query.toString()}`, {
    method: 'GET',
    headers: {
      'x-api-key': apiKey,
      'x-accept-language': apiLang,
    },
    signal: AbortSignal.timeout(30_000),
  });
  if (!res.ok) throw new Error(`KaiKong list ${res.status}`);
  const data = await res.json();
  if (data.status === false) throw new Error(data.error || 'List API error');
  return data;
}

async function fetchTourSearchPage(params: {
  page: number;
  limit: number;
}): Promise<any> {
  const { apiKey, apiBase, apiLang } = getGo365Config();
  if (!apiKey) throw new Error('Missing GO365_API_KEY');

  const res = await fetch(`${apiBase}/tours/search`, {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'x-accept-language': apiLang,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      start_page: params.page,
      limit_page: params.limit,
    }),
    signal: AbortSignal.timeout(30_000),
  });
  if (!res.ok) throw new Error(`KaiKong search ${res.status}`);
  const data = await res.json();
  if (data.status === false) throw new Error(data.error || 'Search API error');
  return data;
}

async function fetchApi(endpoint: string): Promise<any> {
  const { apiKey, apiBase, apiLang } = getGo365Config();
  if (!apiKey) throw new Error('Missing GO365_API_KEY');

  const res = await fetch(`${apiBase}${endpoint}`, {
    headers: {
      'x-api-key': apiKey,
      'x-accept-language': apiLang,
    },
    signal: AbortSignal.timeout(20_000),
  });
  if (!res.ok) throw new Error(`KaiKong API ${res.status}`);
  const data = await res.json();
  if (data.status === false) throw new Error(data.error || 'API error');
  return data;
}

function extractDepositFromText(text: string, priceFrom = 0): number {
  const clean = String(text || '');
  if (!clean) return 0;

  const amountPatterns = [
    /(?:deposit|down\s*payment|มัดจำ|เงินจอง)[^\d\n]{0,20}([\d,]{3,7})/i,
    /([\d,]{3,7})\s*(?:บาท|thb)\s*(?:deposit|down\s*payment|มัดจำ|เงินจอง)/i,
  ];

  for (const pattern of amountPatterns) {
    const match = clean.match(pattern);
    if (!match?.[1]) continue;
    const parsed = Number(match[1].replace(/[^\d]/g, ''));
    if (Number.isFinite(parsed) && parsed >= 500 && parsed <= 300000) {
      return Math.round(parsed);
    }
  }

  const percentMatch = clean.match(/(?:deposit|down\s*payment|มัดจำ)[^%\n]{0,40}?(\d{1,2})\s*%/i);
  if (percentMatch && priceFrom > 0) {
    const percent = Number(percentMatch[1]);
    if (Number.isFinite(percent) && percent > 0 && percent <= 100) {
      const fromPercent = Math.round((priceFrom * percent) / 100);
      if (fromPercent >= 500 && fromPercent <= 300000) return fromPercent;
    }
  }

  return 0;
}

function extractDepositFromApiPayload(detail: any, periods: any[]): number {
  const candidates: number[] = [];
  const pushCandidate = (value: any) => {
    const numeric = toNum(value);
    if (numeric < 500 || numeric > 300000) return;
    candidates.push(Math.round(numeric));
  };

  const scanObject = (obj: any) => {
    if (!obj || typeof obj !== 'object') return;
    for (const [key, value] of Object.entries(obj)) {
      if (!/deposit|booking.?fee|down.?payment/i.test(String(key))) continue;
      pushCandidate(value);
    }
  };

  scanObject(detail);
  periods.forEach((period) => scanObject(period));
  if (candidates.length === 0) return 0;
  return Math.min(...candidates);
}

function parseDuration(title: string): { days: number; nights: number } {
  const source = String(title || '');
  const en = source.match(/(\d+)\s*D\s*(\d+)\s*N/i);
  if (en) return { days: Number(en[1]), nights: Number(en[2]) };
  const th = source.match(/(\d+)\s*วัน\s*(\d+)\s*คืน/i);
  if (th) return { days: Number(th[1]), nights: Number(th[2]) };
  return { days: 0, nights: 0 };
}

function buildGo365DetailPeriodLookup(detail: any): Record<string, any> {
  const map: Record<string, any> = {};
  const normalizedDetail = Array.isArray(detail) ? (detail[0] || {}) : (detail || {});
  const rows = Array.isArray(normalizedDetail?.tour_period) ? normalizedDetail.tour_period : [];
  for (const row of rows) {
    const id = String(row?.period_id || '').trim();
    const code = String(row?.period_code || '').trim();
    if (id && !map[id]) map[id] = row;
    if (code && !map[code]) map[code] = row;
  }
  return map;
}

function extractGo365PricingFromRate(params: {
  period: any;
  detailPeriod: any;
  fallbackDeposit: number;
}): {
  adultPrice: number | null;
  childWithBedPrice: number | null;
  childWithoutBedPrice: number | null;
  infantPrice: number | null;
  singleSupplementPrice: number | null;
  depositAmount: number | null;
  depositType: 'per_person' | 'unknown';
} {
  const adultCandidates: number[] = [];
  const adultSingleCandidates: number[] = [];
  const childWithBedCandidates: number[] = [];
  const childWithoutBedCandidates: number[] = [];
  const infantCandidates: number[] = [];
  const depositCandidates: number[] = [];

  const rates = [
    ...(Array.isArray(params.detailPeriod?.period_rate) ? params.detailPeriod.period_rate : []),
    ...(Array.isArray(params.period?.period_rate) ? params.period.period_rate : []),
  ];
  for (const rate of rates) {
    const price = toNum(rate?.rate_price || rate?.rate_price_net || rate?.rate_price_on_ticket);
    const deposit = toNum(rate?.rate_deposit);
    if (deposit > 0) depositCandidates.push(deposit);
    if (!(price > 0)) continue;

    const title = [
      String(rate?.rate_title || ''),
      String(rate?.rate_categories_name || ''),
      String(rate?.rate_room_abbr || ''),
      String(rate?.rate_room_name || ''),
    ].join(' ').toLowerCase();

    const isInfant = /infant|ทารก/.test(title) || Number(rate?.rate_categories_id) === 3;
    const isChild = /child|เด็ก/.test(title) || Number(rate?.rate_categories_id) === 2;
    const isSingle = /single|sgl|พักเดี่ยว/.test(title) || Number(rate?.rate_room_type) === 1;
    const isNoBed = /no\s*bed|without\s*bed|ไม่มีเตียง|ไม่เสริมเตียง/.test(title);

    if (isInfant) {
      infantCandidates.push(price);
      continue;
    }
    if (isChild) {
      if (isNoBed) childWithoutBedCandidates.push(price);
      else childWithBedCandidates.push(price);
      continue;
    }

    if (isSingle) adultSingleCandidates.push(price);
    else adultCandidates.push(price);
  }

  const adultFallback = toNum(params.period?.period_price_start || params.period?.period_price_min || 0);
  const adultPrice = adultCandidates.length > 0 ? Math.min(...adultCandidates) : (adultFallback > 0 ? adultFallback : null);
  const adultSingle = adultSingleCandidates.length > 0 ? Math.min(...adultSingleCandidates) : null;

  const childFromPeriodTwn = toNum(params.detailPeriod?.period_rate_child_twn || params.period?.period_rate_child_twn);
  const childFromPeriodSgl = toNum(params.detailPeriod?.period_rate_child_sgl || params.period?.period_rate_child_sgl);
  const childWithBedPrice =
    childWithBedCandidates.length > 0 ? Math.min(...childWithBedCandidates) : (childFromPeriodTwn > 0 ? childFromPeriodTwn : null);
  const childWithoutBedPrice =
    childWithoutBedCandidates.length > 0
      ? Math.min(...childWithoutBedCandidates)
      : (childFromPeriodSgl > 0 ? childFromPeriodSgl : childWithBedPrice);

  const infantPrice = infantCandidates.length > 0 ? Math.min(...infantCandidates) : null;
  const singleSupplementPrice =
    adultSingle && adultPrice && adultSingle > adultPrice
      ? Math.max(adultSingle - adultPrice, 0)
      : null;

  const depositAmountFromRate = depositCandidates.length > 0 ? Math.min(...depositCandidates) : 0;
  const depositAmount = depositAmountFromRate > 0 ? depositAmountFromRate : (params.fallbackDeposit > 0 ? params.fallbackDeposit : null);

  return {
    adultPrice,
    childWithBedPrice,
    childWithoutBedPrice,
    infantPrice,
    singleSupplementPrice,
    depositAmount,
    depositType: depositAmount ? 'per_person' : 'unknown',
  };
}

async function upsertGo365TourToCentral(params: {
  sb: ReturnType<typeof getSupabaseAdmin>;
  searchTour: any;
  detail: any;
  periods: any[];
}) {
  const { sb, searchTour, detail, periods } = params;
  const tourCode = String(searchTour.tour_code || `GO365-${searchTour.tour_id}`);
  const sourceTourKey = tourCode;

  const title = String(searchTour.tour_name || detail?.tour_name || sourceTourKey).trim();
  const countries = detail?.tour_country || searchTour.tour_country || [];
  const countryEn = String(countries?.[0]?.country_name_en || '').trim();
  const country = countryEn ? (COUNTRY_TH[countryEn] || countryEn) : '';
  const duration = parseDuration(title);

  const canonicalKey = `api:${WHOLESALE_ID}:${sourceTourKey}`;
  const canonicalSlug = `${slugify(title).slice(0, 80) || 'tour'}-${shortHash(canonicalKey)}`;

  const { data: canonicalRows, error: canonicalErr } = await sb
    .from('canonical_tours')
    .upsert({
      canonical_key: canonicalKey,
      slug: canonicalSlug,
      title,
      country,
      city: null,
      duration_days: duration.days,
      duration_nights: duration.nights,
      is_published: true,
      need_review: false,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'canonical_key' })
    .select('id')
    .limit(1);

  if (canonicalErr || !canonicalRows?.[0]?.id) {
    throw new Error(canonicalErr?.message || 'canonical_tours upsert failed');
  }

  const canonicalTourId = String(canonicalRows[0].id);
  const sourceUrl = `https://www.go365travel.com/tour-detail/${searchTour.tour_id}/${encodeURIComponent(tourCode)}`;

  const { error: mapErr } = await sb.from('wholesale_tour_mappings').upsert({
    canonical_tour_id: canonicalTourId,
    wholesale_id: WHOLESALE_ID,
    source_tour_key: sourceTourKey,
    source_tour_code: tourCode,
    source_url: sourceUrl,
    status: 'active',
    need_review: false,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'wholesale_id,source_tour_key' });
  if (mapErr) throw new Error(`mapping upsert failed: ${mapErr.message}`);

  const descText = String(detail?.tour_description || searchTour?.tour_description || '');
  const priceFromTour = toNum(searchTour.tour_price_start);
  const prices = periods.map((period) => toNum(period.period_price_start || period.period_price_min)).filter((p) => p > 0);
  const minPrice = prices.length > 0 ? Math.min(...prices) : priceFromTour;

  let deposit = extractDepositFromApiPayload(detail, periods);
  if (!deposit) deposit = extractDepositFromText(descText, minPrice);

  const pdfUrl = String(detail?.tour_file?.file_pdf || searchTour?.tour_file?.file_pdf || '').trim();

  await sb.from('raw_wholesale_imports').insert({
    wholesale_id: WHOLESALE_ID,
    source_tour_key: sourceTourKey,
    source_type: 'api',
    payload: {
      search_tour: searchTour,
      detail,
      periods,
    },
    payload_hash: shortHash(JSON.stringify({
      tour_id: searchTour.tour_id,
      periods: periods.length,
      price: minPrice,
      deposit,
      pdf_url: pdfUrl,
    })),
    extraction_status: 'normalized',
    need_review: false,
    imported_at: new Date().toISOString(),
  });

  const periodRows = periods.length > 0
    ? periods
    : [{
        period_id: `tour-${searchTour.tour_id}`,
        period_date: null,
        period_back: null,
        period_price_start: minPrice || 0,
        period_available: null,
        period_visible: 2,
      }];
  const detailPeriodLookup = buildGo365DetailPeriodLookup(detail || {});

  const expectedDepartureKeys = new Set<string>();

  for (const period of periodRows) {
    const sourceDepartureKey = String(period.period_id || `${searchTour.tour_id}:${period.period_date || 'na'}`);
    expectedDepartureKeys.add(sourceDepartureKey);
    const departureDate = asDate(period.period_date);
    const returnDate = asDate(period.period_back);

    const { data: departureRows, error: depErr } = await sb
      .from('tour_departures')
      .upsert({
        canonical_tour_id: canonicalTourId,
        wholesale_id: WHOLESALE_ID,
        source_departure_key: sourceDepartureKey,
        departure_date: departureDate,
        return_date: returnDate,
        status: normalizeStatus(period),
        need_review: !departureDate,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'wholesale_id,source_departure_key' })
      .select('id')
      .limit(1);

    if (depErr || !departureRows?.[0]?.id) throw new Error(depErr?.message || 'departure upsert failed');
    const departureId = String(departureRows[0].id);

    const detailPeriod = detailPeriodLookup[String(period.period_id || '')] || detailPeriodLookup[String(period.period_code || '')] || null;
    const pricing = extractGo365PricingFromRate({
      period,
      detailPeriod,
      fallbackDeposit: deposit,
    });
    const adultPrice = pricing.adultPrice || toNum(period.period_price_start || period.period_price_min || minPrice) || null;
    const seatAvailableRaw = period.period_available ?? detailPeriod?.period_available;
    const seatTotalRaw = period.period_total ?? detailPeriod?.period_total ?? period.period_quota ?? detailPeriod?.period_quota;
    const seatAvailable = seatAvailableRaw === null || seatAvailableRaw === undefined ? null : Math.max(0, Math.floor(toNum(seatAvailableRaw)));
    const seatTotalCandidate = seatTotalRaw === null || seatTotalRaw === undefined ? null : Math.max(0, Math.floor(toNum(seatTotalRaw)));
    const seatTotal = seatTotalCandidate !== null ? seatTotalCandidate : (seatAvailable !== null ? seatAvailable : null);
    const seatBooked = seatTotal !== null && seatAvailable !== null ? Math.max(seatTotal - seatAvailable, 0) : null;

    const { error: priceErr } = await sb.from('tour_prices').upsert({
      departure_id: departureId,
      price_type: 'central',
      adult_price: adultPrice && adultPrice > 0 ? adultPrice : null,
      child_with_bed_price: pricing.childWithBedPrice,
      child_without_bed_price: pricing.childWithoutBedPrice,
      infant_price: pricing.infantPrice,
      single_supplement_price: pricing.singleSupplementPrice,
      deposit_amount: pricing.depositAmount,
      deposit_type: pricing.depositType,
      currency: 'THB',
      price_source: 'go365_api',
      extraction_status: 'normalized',
      need_review: !(adultPrice && adultPrice > 0 && pricing.depositAmount && pricing.depositAmount > 0),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'departure_id,price_type' });
    if (priceErr) throw new Error(`price upsert failed: ${priceErr.message}`);

    const { error: seatErr } = await sb.from('tour_seats').upsert({
      departure_id: departureId,
      seat_total: seatTotal,
      seat_available: seatAvailable,
      seat_booked: seatBooked,
      source: 'go365_api',
      need_review: seatAvailable === null || seatTotal === null || seatBooked === null,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'departure_id' });
    if (seatErr) throw new Error(`seat upsert failed: ${seatErr.message}`);

    if (pdfUrl) {
      const { error: pdfErr } = await sb.from('tour_pdfs').upsert({
        canonical_tour_id: canonicalTourId,
        wholesale_id: WHOLESALE_ID,
        departure_id: departureId,
        pdf_url: pdfUrl,
        extraction_status: 'raw',
        need_review: false,
        is_active: true,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'wholesale_id,canonical_tour_id,pdf_url' });
      if (pdfErr) throw new Error(`pdf upsert failed: ${pdfErr.message}`);
    }
  }

  return {
    canonicalTourId,
    expectedDepartureKeys: Array.from(expectedDepartureKeys),
    hasPeriods: periods.length > 0,
    periodCount: periods.length,
  };
}

async function pruneGo365StaleDepartures(params: {
  sb: ReturnType<typeof getSupabaseAdmin>;
  canonicalTourId: string;
  expectedDepartureKeys: string[];
}) {
  const { sb, canonicalTourId, expectedDepartureKeys } = params;
  if (!canonicalTourId) return { deleted: 0 };
  const expected = new Set((expectedDepartureKeys || []).map((value) => String(value || '').trim()).filter(Boolean));
  if (expected.size === 0) return { deleted: 0 };

  const { data: departures, error } = await sb
    .from('tour_departures')
    .select('id, source_departure_key')
    .eq('wholesale_id', WHOLESALE_ID)
    .eq('canonical_tour_id', canonicalTourId)
    .limit(5000);
  if (error) throw new Error(`prune load departures failed: ${error.message}`);

  const staleIds = (departures || [])
    .filter((row: any) => !expected.has(String(row.source_departure_key || '').trim()))
    .map((row: any) => String(row.id || ''))
    .filter(Boolean);
  if (staleIds.length === 0) return { deleted: 0 };

  const { error: delErr } = await sb
    .from('tour_departures')
    .delete()
    .in('id', staleIds);
  if (delErr) throw new Error(`prune stale departures failed: ${delErr.message}`);
  return { deleted: staleIds.length };
}

export async function POST(req: Request) {
  const { apiKey } = getGo365Config();
  if (!apiKey) {
    return NextResponse.json({ error: 'Missing GO365_API_KEY' }, { status: 500 });
  }

  const sb = getSupabaseAdmin();
  const errors: string[] = [];
  let fetchedTours = 0;
  let syncedTours = 0;
  let syncedDepartures = 0;
  let failedTours = 0;
  let prunedDepartures = 0;
  const startedAt = Date.now();

  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const pageSize = Number.isFinite(Number(body.pageSize)) ? Math.max(20, Math.min(Number(body.pageSize), 100)) : 50;
    const maxPages = Number.isFinite(Number(body.maxPages)) ? Math.max(1, Math.min(Number(body.maxPages), 50)) : 20;
    const concurrency = Number.isFinite(Number(body.concurrency)) ? Math.max(1, Math.min(Number(body.concurrency), 8)) : 6;
    const runPdfWorker = body.runPdfWorker !== false;
    const useListEndpoint = body.useListEndpoint === true;

    await sb.from('wholesalers').upsert({
      id: WHOLESALE_ID,
      name: 'Go365 Travel',
      source_type: 'api',
      is_active: true,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' });

    const allTours: any[] = [];
    const seen = new Set<number>();
    const expectedKeysByCanonical = new Map<string, Set<string>>();

    const visible = body.visible === undefined || body.visible === null ? '1' : String(body.visible);
    const tourIds = Array.isArray(body.tourIds) ? body.tourIds : undefined;

    for (let page = 1; page <= maxPages; page += 1) {
      let result: any;
      if (useListEndpoint) {
        try {
          result = await fetchTourListPage({
            page,
            limit: pageSize,
            visible,
            tourIds,
          });
        } catch (error: any) {
          errors.push(`list fallback page ${page}: ${String(error?.message || error || 'unknown')}`);
          result = await fetchTourSearchPage({
            page,
            limit: pageSize,
          });
        }
      } else {
        result = await fetchTourSearchPage({
          page,
          limit: pageSize,
        });
      }

      const sourceRows = Array.isArray(result?.data)
        ? result.data
        : (Array.isArray(result?.data?.rows) ? result.data.rows : []);
      const rows = Array.isArray(tourIds) && tourIds.length > 0
        ? sourceRows.filter((row: any) => tourIds.some((id: any) => String(id) === String(row?.tour_id)))
        : sourceRows;
      let added = 0;
      for (const row of rows) {
        const tourId = Number(row?.tour_id);
        if (!Number.isFinite(tourId)) continue;
        if (seen.has(tourId)) continue;
        seen.add(tourId);
        allTours.push(row);
        added += 1;
      }
      if (added === 0) break;
      await new Promise((resolve) => setTimeout(resolve, 50));
    }

    fetchedTours = allTours.length;

    for (let i = 0; i < allTours.length; i += concurrency) {
      const batch = allTours.slice(i, i + concurrency);
      const tasks = batch.map(async (searchTour) => {
        const tourId = Number(searchTour?.tour_id);
        const tourCode = String(searchTour?.tour_code || `GO365-${tourId}`);
        try {
          const [detailRes, periodsRes] = await Promise.allSettled([
            fetchApi(`/tours/detail/${tourId}`),
            fetchApi(`/tours/period/${tourId}`),
          ]);

          const detail = detailRes.status === 'fulfilled'
            ? (detailRes.value?.data?.[0] || detailRes.value?.data || null)
            : null;
          const periods = periodsRes.status === 'fulfilled' && Array.isArray(periodsRes.value?.data)
            ? periodsRes.value.data
            : [];

          const normalized = await upsertGo365TourToCentral({
            sb,
            searchTour,
            detail,
            periods,
          });

          const canonicalId = String((normalized as any).canonicalTourId || '').trim();
          if (canonicalId) {
            const existing = expectedKeysByCanonical.get(canonicalId) || new Set<string>();
            for (const key of (normalized as any).expectedDepartureKeys || []) {
              const normalizedKey = String(key || '').trim();
              if (normalizedKey) existing.add(normalizedKey);
            }
            expectedKeysByCanonical.set(canonicalId, existing);
          }

          syncedTours += 1;
          syncedDepartures += normalized.hasPeriods ? normalized.periodCount : 1;
        } catch (error: any) {
          failedTours += 1;
          errors.push(`${tourCode}: ${String(error?.message || error || 'unknown error')}`);
        }
      });

      await Promise.all(tasks);

      if (Date.now() - startedAt > 280_000) {
        errors.push('Stopped early due to runtime budget');
        break;
      }
    }

    for (const [canonicalTourId, expectedKeys] of expectedKeysByCanonical.entries()) {
      const pruned = await pruneGo365StaleDepartures({
        sb,
        canonicalTourId,
        expectedDepartureKeys: Array.from(expectedKeys),
      });
      prunedDepartures += Number(pruned.deleted || 0);
    }

    await sb.from('sync_logs').insert({
      wholesale_id: WHOLESALE_ID,
      sync_type: 'go365_api_direct_to_central_v2',
      status: failedTours > 0 ? (syncedTours > 0 ? 'PARTIAL' : 'FAILED') : 'SUCCESS',
      message: `fetched=${fetchedTours}, synced_tours=${syncedTours}, synced_departures=${syncedDepartures}, pruned=${prunedDepartures}, failed=${failedTours}`,
      records_added: syncedTours,
      records_updated: 0,
      records_failed: failedTours,
      created_at: new Date().toISOString(),
    });

    let pdfWorker: any = null;
    if (runPdfWorker) {
      await enqueuePdfExtractionJobs({
        wholesalerId: WHOLESALE_ID,
        force: false,
        onlyMissingPricing: true,
        limit: Math.max(500, fetchedTours * 5),
      });

      pdfWorker = await processPdfExtractionQueue({
        wholesalerId: WHOLESALE_ID,
        batchSize: 50,
        maxRuntimeMs: 180_000,
      });
    }

    return NextResponse.json({
      success: true,
      mode: 'direct_to_central',
      fetchedTours,
      syncedTours,
      syncedDepartures,
      prunedDepartures,
      failedTours,
      durationSeconds: Math.round((Date.now() - startedAt) / 1000),
      errors: errors.slice(0, 30),
      pdfWorker,
    });
  } catch (error: any) {
    await sb.from('sync_logs').insert({
      wholesale_id: WHOLESALE_ID,
      sync_type: 'go365_api_direct_to_central_v2',
      status: 'FAILED',
      message: String(error?.message || error || 'unknown error'),
      records_added: syncedTours,
      records_updated: 0,
      records_failed: failedTours + 1,
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({
      success: false,
      error: error?.message || 'go365 sync failed',
      fetchedTours,
      syncedTours,
      syncedDepartures,
      prunedDepartures,
      failedTours,
      errors: errors.slice(0, 30),
    }, { status: 500 });
  }
}
