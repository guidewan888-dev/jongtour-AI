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
 * POST to KaiKong API — MUST use POST method for pagination to work.
 * GET /tours/search ignores pagination and always returns first 20 results.
 */
async function searchTours(page: number, limit: number): Promise<any> {
  const res = await fetch(`${API_BASE}/tours/search`, {
    method: 'POST',
    headers: { 'x-api-key': API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ start_page: page, limit_page: limit }),
    signal: AbortSignal.timeout(30_000),
  });
  if (!res.ok) throw new Error(`KaiKong search ${res.status}`);
  const data = await res.json();
  if (data.status === false) throw new Error(data.error || 'Search API error');
  return data;
}

/** GET for detail/period endpoints */
async function fetchApi(endpoint: string): Promise<any> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: { 'x-api-key': API_KEY },
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new Error(`KaiKong API ${res.status}`);
  const data = await res.json();
  if (data.status === false) throw new Error(data.error || 'API error');
  return data;
}

function mapTourRow(tour: any, detail: any, periods: any[]) {
  const tourCode = tour.tour_code || `GO365-${tour.tour_id}`;
  
  // Country
  const countries = detail?.tour_country || tour.tour_country || [];
  const countryEn = countries[0]?.country_name_en || '';
  const countryTh = countries[0]?.country_name_th || COUNTRY_TH[countryEn] || countryEn;

  // Duration — match both English "8D 5N" and Thai "8 วัน 5 คืน"
  const title = tour.tour_name || '';
  let days = 0, nights = 0;
  const durEn = title.match(/(\d+)\s*D\s*(\d+)\s*N/i);
  const durTh = title.match(/(\d+)\s*วัน\s*(\d+)\s*คืน/);
  if (durEn) { days = parseInt(durEn[1]); nights = parseInt(durEn[2]); }
  else if (durTh) { days = parseInt(durTh[1]); nights = parseInt(durTh[2]); }
  const duration = days > 0 ? `${days} วัน ${nights} คืน` : '';

  // Airline — from search data or detail
  const airline = detail?.tour_flight?.[0]?.flight_airline_name ||
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
  const coverImage = detail?.tour_cover_image || tour.tour_cover_image || '';

  // Highlights — Go365 descriptions use " – " as separator between itinerary items
  const desc = detail?.tour_description || tour.tour_description || '';
  const rawItems = desc.includes(' – ') || desc.includes(' - ')
    ? desc.split(/\s[–-]\s/).map((l: string) => l.trim())
    : desc.split('\n').map((l: string) => l.trim());
  const highlights = rawItems
    .filter((l: string) => l.length > 5 && l.length < 500)
    .slice(0, 12);

  // PDF — check detail first, then fallback to search data (tour_file available in both)
  const pdfUrl = detail?.tour_file?.file_pdf || tour.tour_file?.file_pdf || '';

  return {
    site: 'go365',
    tour_code: tourCode,
    title: tour.tour_name || '',
    country: countryTh,
    duration,
    price_from: priceFrom,
    airline,
    cover_image_url: coverImage,
    source_url: `https://www.go365travel.com/tour-detail/${tour.tour_id}/${encodeURIComponent(tourCode)}`,
    pdf_url: pdfUrl,
    is_active: true,
    deposit,
    highlights,
    last_scraped_at: new Date().toISOString(),
  };
}

/**
 * POST /api/tours/go365-sync
 * 
 * Strategy: 2-phase sync to fit within 300s Vercel timeout
 * Phase 1: Fetch all tours from search API (fast, ~5s for 232 tours)
 * Phase 2: Upsert to DB using search data (skip detail/period for speed)
 * Phase 3: Fetch periods in parallel batches for recent tours
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
  let periodsAdded = 0;
  const errors: string[] = [];
  const startTime = Date.now();

  try {
    // ═══ Phase 1: Fetch ALL tours via paginated POST search ═══
    const PAGE_SIZE = 50;
    const allTours: any[] = [];
    const seenIds = new Set<number>();

    for (let page = 1; page <= 20; page++) { // Safety max 20 pages
      const res = await searchTours(page, PAGE_SIZE);
      if (page === 1) console.log(`[Go365 Sync] Total: ${res.count} tours`);
      
      const tours = res.data || [];
      let newCount = 0;
      for (const tour of tours) {
        if (!seenIds.has(tour.tour_id)) {
          seenIds.add(tour.tour_id);
          allTours.push(tour);
          newCount++;
        }
      }
      if (newCount === 0) break; // API wraps around — stop
      await new Promise(r => setTimeout(r, 50));
    }
    console.log(`[Go365 Sync] Fetched ${allTours.length} unique tours in ${Date.now() - startTime}ms`);

    // ═══ Phase 2: Bulk upsert tour rows from search data ═══
    // Build tour rows from search data (no detail/period API calls needed)
    const tourRows = allTours.map(tour => mapTourRow(tour, null, []));

    // Upsert in chunks of 50
    const CHUNK_SIZE = 50;
    for (let i = 0; i < tourRows.length; i += CHUNK_SIZE) {
      const chunk = tourRows.slice(i, i + CHUNK_SIZE);
      const { error } = await supabase
        .from('scraper_tours')
        .upsert(chunk, { onConflict: 'site,tour_code' });
      
      if (error) {
        console.error(`[Go365 Sync] Upsert error chunk ${i}:`, error.message);
        // Fallback: insert one by one
        for (const row of chunk) {
          try {
            const { data: existing } = await supabase
              .from('scraper_tours')
              .select('id')
              .eq('site', 'go365')
              .eq('tour_code', row.tour_code)
              .single();

            if (existing) {
              await supabase.from('scraper_tours').update(row).eq('id', existing.id);
            } else {
              await supabase.from('scraper_tours').insert(row);
            }
            synced++;
          } catch (e: any) {
            failed++;
            errors.push(`${row.tour_code}: ${e.message}`);
          }
        }
      } else {
        synced += chunk.length;
      }
    }
    console.log(`[Go365 Sync] Phase 2 done: ${synced} tours upserted in ${Date.now() - startTime}ms`);

    // ═══ Phase 3: Fetch periods for tours (parallel batches) ═══
    // Get DB IDs for all tours
    const { data: dbTours } = await supabase
      .from('scraper_tours')
      .select('id, tour_code')
      .eq('site', 'go365');

    if (dbTours && dbTours.length > 0) {
      const codeToId = new Map(dbTours.map(t => [t.tour_code, t.id]));
      
      // Map tour_code to tour_id for API calls  
      const tourCodeToApiId = new Map(allTours.map(t => [t.tour_code || `GO365-${t.tour_id}`, t.tour_id]));

      // Process periods in batches of 15 (parallel)
      const PERIOD_BATCH = 15;
      const timeLimit = 250_000; // Stop 50s before timeout

      for (let i = 0; i < allTours.length; i += PERIOD_BATCH) {
        if (Date.now() - startTime > timeLimit) {
          console.log(`[Go365 Sync] Time limit reached, stopping period fetch at ${i}/${allTours.length}`);
          break;
        }

        const batch = allTours.slice(i, i + PERIOD_BATCH);
        
        const periodPromises = batch.map(async (tour) => {
          const tourCode = tour.tour_code || `GO365-${tour.tour_id}`;
          const dbId = codeToId.get(tourCode);
          if (!dbId) return;

          try {
            const periodRes = await fetchApi(`/tours/period/${tour.tour_id}`);
            const periods = periodRes.data || [];
            if (periods.length === 0) return;

            // Delete old periods
            await supabase.from('scraper_tour_periods').delete().eq('tour_id', dbId);

            // Insert new periods
            const periodRows = periods.map((p: any) => ({
              tour_id: dbId,
              start_date: p.period_date || null,
              end_date: p.period_back || null,
              price: p.period_price_start || p.period_price_min || 0,
              seats_left: p.period_available || 0,
              status: p.period_visible === 2 ? 'open' : 'closed',
              raw_text: `${p.period_date || ''} - ${p.period_back || ''} | ${p.period_price_start || 0}฿`,
            }));

            await supabase.from('scraper_tour_periods').insert(periodRows);
            periodsAdded += periodRows.length;

            // Update tour price from periods
            const prices = periods.map((p: any) => p.period_price_start || 0).filter((p: number) => p > 0);
            if (prices.length > 0) {
              const minPrice = Math.min(...prices);
              let deposit = 0;
              if (minPrice < 20000) deposit = 5000;
              else if (minPrice < 50000) deposit = 10000;
              else if (minPrice < 100000) deposit = 15000;
              else deposit = 20000;
              
              await supabase.from('scraper_tours').update({ 
                price_from: minPrice,
                deposit 
              }).eq('id', dbId);
            }
          } catch {}
        });

        await Promise.all(periodPromises);
      }
    }

    console.log(`[Go365 Sync] Phase 3 done: ${periodsAdded} periods in ${Date.now() - startTime}ms`);
  } catch (e: any) {
    return NextResponse.json({ error: e.message, synced, failed }, { status: 500 });
  }

  const totalTime = Math.round((Date.now() - startTime) / 1000);
  console.log(`[Go365 Sync] Complete: ${synced} tours, ${periodsAdded} periods, ${failed} failed, ${totalTime}s`);
  
  return NextResponse.json({
    success: true,
    message: `Go365 sync สำเร็จ! ${synced} โปรแกรม, ${periodsAdded} วันเดินทาง`,
    synced,
    periodsAdded,
    failed,
    timeSeconds: totalTime,
    errors: errors.slice(0, 10),
  });
}
