// ─── Database Operations ────────────────────
// Uses Supabase client to upsert tours, periods, images, and track scrape runs

import { getSupabase } from './storage.js';
import type { TourData, ImageMeta, ScrapeStats } from '../types.js';

// ─── Scrape Run Tracking ────────────────────

export async function startRun(site: string): Promise<number> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('scraper_runs')
    .insert({ site, status: 'running' })
    .select('id')
    .single();

  if (error) throw new Error(`startRun: ${error.message}`);
  return data.id;
}

export async function finishRun(runId: number, stats: ScrapeStats): Promise<void> {
  const supabase = getSupabase();
  await supabase
    .from('scraper_runs')
    .update({
      finished_at: new Date().toISOString(),
      status: stats.error ? 'failed' : 'success',
      urls_found: stats.urlsFound,
      urls_scraped: stats.urlsScraped,
      urls_failed: stats.urlsFailed,
      images_saved: stats.imagesSaved,
      error_log: stats.error ?? null,
    })
    .eq('id', runId);
}

// ─── Tour Upsert ────────────────────────────

export async function upsertTour(
  site: string,
  tour: TourData,
  images: ImageMeta[],
): Promise<number> {
  const supabase = getSupabase();
  const gs25FallbackImageUrl =
    site === 'gs25' && images.length === 0 && Array.isArray(tour.imageUrls)
      ? (tour.imageUrls.find((url) => typeof url === 'string' && url.trim().length > 0)?.trim() || null)
      : null;

  const coverImageUrl = images.length > 0
    ? (() => {
        // 1. Prefer CloudFront image whose URL contains the tour code (= actual flyer for bestintl)
        const codeMatch = images.find(i =>
          /cloudfront/i.test(i.originalUrl) &&
          i.originalUrl.toLowerCase().includes(tour.tourCode.toLowerCase()) &&
          !/mobile\.png/i.test(i.originalUrl)
        );
        if (codeMatch) return codeMatch.publicUrl;
        // 2. Use first image — scrapers return the cover/hero image first
        //    (fallback to largest was wrong: shared template images are often larger than covers)
        return images[0].publicUrl;
      })()
    : gs25FallbackImageUrl;

  // 1. Upsert tour record
  const { data: tourRow, error } = await supabase
    .from('scraper_tours')
    .upsert(
      {
        site,
        tour_code: tour.tourCode,
        source_url: tour.sourceUrl,
        title: tour.title,
        country: tour.country,
        duration: tour.duration,
        price_from: tour.priceFrom,
        airline: tour.airline,
        description: tour.description,
        itinerary_html: tour.itineraryHtml,
        pdf_url: tour.pdfUrl,
        cover_image_url: coverImageUrl,
        last_scraped_at: new Date().toISOString(),
        is_active: true,
        deposit: tour.deposit ?? null,
        hotel_rating: tour.hotelRating ?? null,
        highlights: tour.highlights ?? null,
      },
      { onConflict: 'source_url' },
    )
    .select('id')
    .single();

  if (error) throw new Error(`upsertTour: ${error.message}`);
  const tourId = tourRow.id;

  // 2. Replace periods (delete old + insert new)
  await supabase.from('scraper_tour_periods').delete().eq('tour_id', tourId);

  if (tour.periods.length > 0) {
    const { error: pErr } = await supabase.from('scraper_tour_periods').insert(
      tour.periods.map((p) => ({
        tour_id: tourId,
        start_date: p.startDate ?? null,
        end_date: p.endDate ?? null,
        price: p.price ?? null,
        seats_left: p.seatsLeft ?? null,
        status: p.status ?? 'open',
        raw_text: p.rawText,
      })),
    );
    if (pErr) console.warn(`[db] periods for ${tour.tourCode}:`, pErr.message);
  }

  // 3. Upsert images (by tour_id + file_hash)
  if (images.length > 0) {
    const { error: iErr } = await supabase.from('scraper_tour_images').upsert(
      images.map((img, idx) => ({
        tour_id: tourId,
        original_url: img.originalUrl,
        storage_path: img.storagePath,
        public_url: img.publicUrl,
        file_hash: img.fileHash,
        width: img.width,
        height: img.height,
        file_size: img.fileSize,
        sort_order: idx,
      })),
      { onConflict: 'tour_id,file_hash' },
    );
    if (iErr) console.warn(`[db] images for ${tour.tourCode}:`, iErr.message);
  }

  return tourId;
}
