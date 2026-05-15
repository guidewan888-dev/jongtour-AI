import { NextRequest, NextResponse } from 'next/server';
import { getCentralTourBySlug, resolveCentralTourRouteBySourceCode } from '@/services/central-wholesale.service';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
  request: NextRequest,
  { params }: { params: { code: string } },
) {
  try {
    const code = decodeURIComponent(String(params.code || '')).trim();
    const wholesaleId = String(request.nextUrl.searchParams.get('wholesale') || '').trim() || undefined;
    if (!code) {
      return NextResponse.json({ error: 'Missing source code' }, { status: 400 });
    }

    const resolved = await resolveCentralTourRouteBySourceCode({ sourceCode: code, wholesaleId });
    if (!resolved) {
      return NextResponse.json({ error: 'Tour not found in central system' }, { status: 404 });
    }

    const tour = await getCentralTourBySlug(resolved.slug);
    if (!tour) {
      return NextResponse.json({ error: 'Tour detail not found in central system' }, { status: 404 });
    }

    return NextResponse.json({
      tour,
      redirectTo: `/tour/${resolved.slug}`,
      resolved,
    });
  } catch (error: any) {
    console.error('[API /tours/scraper/[code]] failed:', error);
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status: 500 });
  }
}
