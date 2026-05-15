import { NextResponse } from 'next/server';
import { getDepartureCompletenessReport } from '@/services/central-wholesale.service';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const wholesalerId = String(searchParams.get('wholesalerId') || '').trim() || undefined;
    const onlyIncomplete = searchParams.get('onlyIncomplete') !== 'false';
    const limit = Number(searchParams.get('limit') || 200);
    const offset = Number(searchParams.get('offset') || 0);

    const rows = await getDepartureCompletenessReport({
      wholesalerId,
      onlyIncomplete,
      limit: Number.isFinite(limit) ? Math.max(1, Math.min(limit, 2000)) : 200,
      offset: Number.isFinite(offset) ? Math.max(0, offset) : 0,
    });

    return NextResponse.json({
      success: true,
      rows,
      count: rows.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to load completeness report' },
      { status: 500 },
    );
  }
}

