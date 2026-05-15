import { NextResponse } from 'next/server';
import { enqueuePdfExtractionJobs } from '@/services/central-wholesale.service';

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

export async function POST(req: Request) {
  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const wholesalerId = String(body.wholesalerId || '').trim() || undefined;
    const force = Boolean(body.force);
    const onlyMissingPricing = body.onlyMissingPricing !== false;
    const limit = Number(body.limit || 5000);

    const result = await enqueuePdfExtractionJobs({
      wholesalerId,
      force,
      onlyMissingPricing,
      limit: Number.isFinite(limit) ? Math.max(1, limit) : 5000,
    });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'enqueue failed' },
      { status: 500 },
    );
  }
}

