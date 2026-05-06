import { NextRequest, NextResponse } from 'next/server';
import { TourService } from '@/services/core/TourService';

export const dynamic = 'force-dynamic';

/**
 * GET /api/search?q=ทัวร์ญี่ปุ่น&mode=keyword
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
    const mode = searchParams.get('mode') || 'keyword';

    if (!q && !country) {
      return NextResponse.json({ error: 'Query or country required' }, { status: 400 });
    }

    // Always use keyword search for reliability
    const results = await TourService.searchTours({
      keyword: q || undefined,
      country,
      minPrice,
      maxPrice,
      duration,
      page,
      limit: 20,
    });

    return NextResponse.json({ success: true, query: q, ...results, mode });
  } catch (err: any) {
    console.error('[Search API Error]', err);
    return NextResponse.json({ error: err.message || 'Search failed' }, { status: 500 });
  }
}

