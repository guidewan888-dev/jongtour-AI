import { NextResponse } from 'next/server';
import { getCentralTourList } from '@/services/central-wholesale.service';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const apiCache = new Map<string, { data: any; ts: number }>();
const CACHE_TTL = 60_000;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get('q') || undefined;
    const country = searchParams.get('country') || undefined;
    const wholesalerId = searchParams.get('wholesalerId') || undefined;
    const limit = parseInt(searchParams.get('limit') || '1000', 10);
    const safeLimit = Number.isFinite(limit) ? Math.max(1, Math.min(limit, 3000)) : 1000;

    const cacheKey = `${keyword || ''}|${country || ''}|${wholesalerId || ''}|${safeLimit}`;
    const cached = apiCache.get(cacheKey);
    if (cached && Date.now() - cached.ts < CACHE_TTL) {
      return NextResponse.json(cached.data, {
        headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
      });
    }

    const tours = await getCentralTourList({
      limit: safeLimit,
      keyword,
      country,
      wholesalerId,
    });

    const result = { tours, total: tours.length };
    apiCache.set(cacheKey, { data: result, ts: Date.now() });
    if (apiCache.size > 100) {
      let oldestKey: string | null = null;
      let oldestTs = Number.POSITIVE_INFINITY;
      apiCache.forEach((value, key) => {
        if (value.ts < oldestTs) {
          oldestTs = value.ts;
          oldestKey = key;
        }
      });
      if (oldestKey) apiCache.delete(oldestKey);
    }

    return NextResponse.json(result, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
    });
  } catch (error: any) {
    console.error('[API /tours/list] failed:', error);
    return NextResponse.json({ tours: [], total: 0, error: error?.message || 'Failed to load tours' }, { status: 500 });
  }
}
