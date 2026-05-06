import { NextResponse } from 'next/server';
import { getTourList } from '@/services/tour.service';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * GET /api/tours/list?q=keyword&country=จีน&limit=50
 * Returns published tours from Supabase REST API.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get('q') || undefined;
    const country = searchParams.get('country') || undefined;
    const limit = parseInt(searchParams.get('limit') || '1000', 10);

    const tours = await getTourList({ keyword, country, limit });

    return NextResponse.json({ tours }, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
    });
  } catch (e: any) {
    console.error('[API /tours/list]', e.message);
    return NextResponse.json({ tours: [], error: e.message }, { status: 500 });
  }
}
