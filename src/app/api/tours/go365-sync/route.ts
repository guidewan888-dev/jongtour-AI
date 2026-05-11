import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

const API_KEY = process.env.GO365_API_KEY || '';
const API_BASE = process.env.GO365_API_BASE || 'https://api.kaikongservice.com/api/v1';

// Country mapping: English → Thai
const COUNTRY_TH: Record<string, string> = {
  'Japan': 'ญี่ปุ่น', 'China': 'จีน', 'Taiwan': 'ไต้หวัน', 'Hong Kong': 'ฮ่องกง',
  'Vietnam': 'เวียดนาม', 'India': 'อินเดีย', 'Philippines': 'ฟิลิปปินส์',
  'Italy': 'อิตาลี', 'France': 'ฝรั่งเศส', 'Germany': 'เยอรมนี',
  'Switzerland': 'สวิตเซอร์แลนด์', 'Austria': 'ออสเตรีย', 'Spain': 'สเปน',
  'Netherlands': 'เนเธอร์แลนด์', 'Belgium': 'เบลเยียม', 'Czech Republic': 'เช็ก',
  'Hungary': 'ฮังการี', 'Portugal': 'โปรตุเกส', 'Norway': 'นอร์เวย์',
  'Sweden': 'สวีเดน', 'Finland': 'ฟินแลนด์', 'Denmark': 'เดนมาร์ก',
  'Scotland': 'สกอตแลนด์', 'Luxembourg': 'ลักเซมเบิร์ก', 'Liechtenstein': 'ลิกเตนสไตน์',
  'Slovakia': 'สโลวาเกีย', 'Estonia': 'เอสโตเนีย', 'Latvia': 'ลัตเวีย',
  'Lithuania': 'ลิทัวเนีย', 'Scandinavia': 'สแกนดิเนเวีย', 'Baltic': 'บอลติก',
  'Europe': 'ยุโรป', 'Asia': 'เอเชีย', 'Turkiye': 'ตุรกี', 'Georgia': 'จอร์เจีย',
  'Australia': 'ออสเตรเลีย', 'Africa': 'แอฟริกา', 'England': 'อังกฤษ',
  'Thailand': 'ไทย', 'Korea': 'เกาหลี', 'South Korea': 'เกาหลีใต้',
  'Singapore': 'สิงคโปร์', 'Malaysia': 'มาเลเซีย', 'Indonesia': 'อินโดนีเซีย',
  'Cambodia': 'กัมพูชา', 'Myanmar': 'พม่า', 'Laos': 'ลาว', 'Nepal': 'เนปาล',
  'Sri Lanka': 'ศรีลังกา', 'New Zealand': 'นิวซีแลนด์', 'Iceland': 'ไอซ์แลนด์',
  'United Kingdom': 'อังกฤษ', 'Greece': 'กรีซ', 'Croatia': 'โครเอเชีย',
  'Poland': 'โปแลนด์', 'Romania': 'โรมาเนีย', 'Bulgaria': 'บัลแกเรีย',
  'Morocco': 'โมร็อกโก', 'Egypt': 'อียิปต์', 'South Africa': 'แอฟริกาใต้',
  'Russia': 'รัสเซีย', 'Turkey': 'ตุรกี', 'Uzbekistan': 'อุซเบกิสถาน',
  'Kazakhstan': 'คาซัคสถาน', 'Jordan': 'จอร์แดน', 'Israel': 'อิสราเอล',
  'Bhutan': 'ภูฏาน', 'Mongolia': 'มองโกเลีย',
};

/**
 * POST to KaiKong API — MUST use POST method for pagination to work
 * GET only returns 20 results and ignores pagination parameters
 */
async function searchTours(page: number, limit: number): Promise<any> {
  const res = await fetch(`${API_BASE}/tours/search`, {
    method: 'POST',
    headers: {
      'x-api-key': API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ start_page: page, limit_page: limit }),
    signal: AbortSignal.timeout(30_000),
  });
  if (!res.ok) throw new Error(`KaiKong search ${res.status}`);
  const data = await res.json();
  if (data.status === false) throw new Error(data.error || 'Search API error');
  return data;
}

/**
 * GET for detail/period endpoints (these work fine with GET)
 */
async function fetchApi(endpoint: string): Promise<any> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: { 'x-api-key': API_KEY },
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) throw new Error(`KaiKong API ${res.status}`);
  const data = await res.json();
  if (data.status === false) throw new Error(data.error || 'API error');
  return data;
}

/**
 * Fetch detail+period for a batch of tours in parallel
 */
async function fetchBatchDetails(tourIds: number[]): Promise<Map<number, { detail: any; periods: any[] }>> {
  const results = new Map<number, { detail: any; periods: any[] }>();
  
  const promises = tourIds.map(async (tourId) => {
    let detail: any = {};
    let periods: any[] = [];
    try {
      const detailRes = await fetchApi(`/tours/detail/${tourId}`);
      detail = detailRes.data?.[0] || detailRes.data || {};
    } catch {}
    try {
      const periodRes = await fetchApi(`/tours/period/${tourId}`);
      periods = periodRes.data || [];
    } catch {}
    results.set(tourId, { detail, periods });
  });

  await Promise.all(promises);
  return results;
}

/**
 * POST /api/tours/go365-sync
 * Fetch all tours from Go365 KaiKong API and sync to scraper_tours + scraper_tour_periods
 * 
 * Key findings from API testing:
 * - GET /tours/search ignores pagination → always returns first 20 results
 * - POST /tours/search works correctly with {start_page, limit_page}
 * - start_page is 1-based (page 0 = page 1, duplicated)
 * - Max 50 results per page
 * - Total 232 tours across 5 pages
 */
export async function POST() {
  if (!API_KEY) {
    return NextResponse.json({ error: 'Missing GO365_API_KEY' }, { status: 500 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  let synced = 0;
  let failed = 0;
  const errors: string[] = [];

  try {
    // 1. Fetch all tours using POST with 1-based pagination
    const PAGE_SIZE = 50;
    const first = await searchTours(1, PAGE_SIZE);
    const total = first.count || 0;
    const totalPages = Math.ceil(total / PAGE_SIZE);
    console.log(`[Go365 Sync] Total tours: ${total}, Pages: ${totalPages}`);

    const allTours: any[] = [];
    const seenIds = new Set<number>();

    for (let page = 1; page <= totalPages + 1; page++) {
      const res = await searchTours(page, PAGE_SIZE);
      const tours = res.data || [];
      
      // Deduplicate — API may return overlapping data
      let newCount = 0;
      for (const tour of tours) {
        if (!seenIds.has(tour.tour_id)) {
          seenIds.add(tour.tour_id);
          allTours.push(tour);
          newCount++;
        }
      }

      console.log(`[Go365 Sync] Page ${page}: ${tours.length} items, ${newCount} new, cumulative: ${allTours.length}`);

      // Stop if no new tours (API wraps around)
      if (newCount === 0) break;
      await new Promise(r => setTimeout(r, 100));
    }

    console.log(`[Go365 Sync] Fetched ${allTours.length} unique tours from API`);

    // 2. Process tours in batches with parallel detail+period fetching
    const BATCH_SIZE = 10; // Parallel detail+period per batch
    
    for (let i = 0; i < allTours.length; i += BATCH_SIZE) {
      const batch = allTours.slice(i, i + BATCH_SIZE);
      const tourIds = batch.map(t => t.tour_id);
      
      // Fetch detail+period for entire batch in parallel
      const details = await fetchBatchDetails(tourIds);

      for (const tour of batch) {
        try {
          const tourId = tour.tour_id;
          const tourCode = tour.tour_code || `GO365-${tourId}`;
          const { detail, periods } = details.get(tourId) || { detail: {}, periods: [] };

          // Country
          const countries = detail.tour_country || tour.tour_country || [];
          const countryEn = countries[0]?.country_name_en || '';
          const countryTh = countries[0]?.country_name_th || COUNTRY_TH[countryEn] || countryEn;

          // Duration
          const durMatch = (tour.tour_name || '').match(/(\d+)\s*D\s*(\d+)\s*N/i);
          const days = durMatch ? parseInt(durMatch[1]) : 0;
          const nights = durMatch ? parseInt(durMatch[2]) : 0;
          const duration = days > 0 ? `${days} วัน ${nights} คืน` : '';

          // Airline
          const airline = detail.tour_flight?.[0]?.flight_airline_name ||
                          tour.tour_airline?.airline_name || '';

          // Price
          const prices = periods.map((p: any) => p.period_price_start || p.period_price_min || 0).filter((p: number) => p > 0);
          const priceFrom = prices.length > 0 ? Math.min(...prices) : (tour.tour_price_start || 0);

          // Deposit
          let deposit = 0;
          if (priceFrom > 0) {
            if (priceFrom < 20000) deposit = 5000;
            else if (priceFrom < 50000) deposit = 10000;
            else if (priceFrom < 100000) deposit = 15000;
            else deposit = 20000;
          }

          // Images
          const coverImage = detail.tour_cover_image || tour.tour_cover_image || '';

          // Highlights
          const desc = detail.tour_description || tour.tour_description || '';
          const highlights = desc
            .split('\n')
            .map((l: string) => l.trim())
            .filter((l: string) => l.length > 5)
            .slice(0, 10);

          // PDF
          const pdfUrl = detail.tour_file?.file_pdf || '';

          // Source URL
          const sourceUrl = `https://www.go365travel.com/tour-detail/${tourId}/${encodeURIComponent(tourCode)}`;

          // 3. Upsert scraper_tours
          const { data: existing } = await supabase
            .from('scraper_tours')
            .select('id')
            .eq('site', 'go365')
            .eq('tour_code', tourCode)
            .limit(1)
            .single();

          const tourRow = {
            site: 'go365',
            tour_code: tourCode,
            title: tour.tour_name || '',
            country: countryTh,
            duration,
            price_from: priceFrom,
            airline,
            cover_image_url: coverImage,
            source_url: sourceUrl,
            pdf_url: pdfUrl,
            is_active: true,
            deposit,
            highlights,
            last_scraped_at: new Date().toISOString(),
          };

          let tourDbId: number;
          if (existing) {
            await supabase
              .from('scraper_tours')
              .update(tourRow)
              .eq('id', existing.id);
            tourDbId = existing.id;
          } else {
            const { data: inserted } = await supabase
              .from('scraper_tours')
              .insert(tourRow)
              .select('id')
              .single();
            tourDbId = inserted?.id || 0;
          }

          // 4. Upsert periods
          if (tourDbId && periods.length > 0) {
            await supabase
              .from('scraper_tour_periods')
              .delete()
              .eq('tour_id', tourDbId);

            const periodRows = periods.map((p: any) => ({
              tour_id: tourDbId,
              start_date: p.period_date || null,
              end_date: p.period_back || null,
              price: p.period_price_start || p.period_price_min || 0,
              seats_left: p.period_available || 0,
              status: p.period_visible === 2 ? 'open' : 'closed',
              raw_text: `${p.period_date || ''} - ${p.period_back || ''} | ${p.period_price_start || 0}฿`,
            }));

            await supabase
              .from('scraper_tour_periods')
              .insert(periodRows);
          }

          synced++;
          if (synced % 50 === 0) {
            console.log(`[Go365 Sync] Progress: ${synced}/${allTours.length}`);
          }
        } catch (e: any) {
          failed++;
          errors.push(`Tour ${tour.tour_id}: ${e.message}`);
        }
      }

      // Small delay between batches
      await new Promise(r => setTimeout(r, 50));
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message, synced, failed }, { status: 500 });
  }

  console.log(`[Go365 Sync] Complete: ${synced} synced, ${failed} failed`);
  return NextResponse.json({
    success: true,
    message: `Go365 sync สำเร็จ! ${synced} โปรแกรม`,
    synced,
    failed,
    errors: errors.slice(0, 10),
  });
}
