import { NextResponse } from 'next/server';
import { getTourBySlug } from '@/services/tour.service';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * GET /api/tours/[slug]
 * Returns full tour detail from Supabase REST API.
 */
export async function GET(
  _request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const tour = await getTourBySlug(params.slug);

    if (!tour) {
      return NextResponse.json({ error: 'Tour not found' }, { status: 404 });
    }

    return NextResponse.json({ tour }, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
    });
  } catch (e: any) {
    console.error(`[API /tours/${params.slug}]`, e.message);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
