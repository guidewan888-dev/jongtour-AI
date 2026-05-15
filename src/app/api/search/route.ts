import { NextRequest, NextResponse } from 'next/server';
import { getCentralTourList } from '@/services/central-wholesale.service';

export const dynamic = 'force-dynamic';

/**
 * GET /api/search?q=...&mode=keyword
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q') || '';
    const country = searchParams.get('country') || undefined;
    const minPrice = searchParams.get('min') ? Number(searchParams.get('min')) : undefined;
    const maxPrice = searchParams.get('max') ? Number(searchParams.get('max')) : undefined;
    const duration = searchParams.get('duration') ? Number(searchParams.get('duration')) : undefined;
    const page = Number(searchParams.get('page') || '1');
    const limit = Number(searchParams.get('limit') || '20');
    const mode = searchParams.get('mode') || 'keyword';

    if (!q && !country) {
      return NextResponse.json({ error: 'Query or country required' }, { status: 400 });
    }

    const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
    const safeLimit = Number.isFinite(limit) ? Math.max(1, Math.min(Math.floor(limit), 100)) : 20;

    const centralRows = await getCentralTourList({
      keyword: q || undefined,
      country,
      limit: 3000,
    });

    let filtered = centralRows.filter((row: any) => {
      const price = Number(row.price || 0);
      const durationDays = Number(row.durationDays || 0);

      if (minPrice !== undefined && Number.isFinite(minPrice) && price > 0 && price < minPrice) return false;
      if (maxPrice !== undefined && Number.isFinite(maxPrice) && price > 0 && price > maxPrice) return false;
      if (duration !== undefined && Number.isFinite(duration) && duration > 0 && durationDays !== duration) return false;
      return true;
    });

    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / safeLimit));
    const clampedPage = Math.min(safePage, totalPages);
    const start = (clampedPage - 1) * safeLimit;
    filtered = filtered.slice(start, start + safeLimit);

    const tours = filtered.map((row: any) => ({
      id: String(row.id),
      tourCode: String(row.code || ''),
      tourName: String(row.title || ''),
      slug: String(row.slug || ''),
      durationDays: Number(row.durationDays || 0),
      durationNights: Number(row.durationNights || 0),
      coverImage: row.imageUrl || null,
      supplier: String(row.supplier || ''),
      startingPrice: Number(row.price || 0) || null,
      nextDeparture: row.nextDeparture && row.nextDeparture !== 'N/A' ? row.nextDeparture : null,
      remainingSeats: Number(row.availableSeats || 0),
      departureCount: 0,
    }));

    return NextResponse.json({
      success: true,
      query: q,
      mode,
      tours,
      pagination: {
        page: clampedPage,
        limit: safeLimit,
        total,
        totalPages,
      },
    });
  } catch (err: any) {
    console.error('[Search API Error]', err);
    return NextResponse.json({ error: err.message || 'Search failed' }, { status: 500 });
  }
}
