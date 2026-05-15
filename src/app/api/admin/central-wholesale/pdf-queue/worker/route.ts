import { NextResponse } from 'next/server';
import { processPdfExtractionQueue } from '@/services/central-wholesale.service';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

export async function POST(req: Request) {
  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const wholesalerId = String(body.wholesalerId || '').trim() || undefined;
    const batchSize = Number(body.batchSize || 20);
    const maxRuntimeMs = Number(body.maxRuntimeMs || 240000);

    const result = await processPdfExtractionQueue({
      wholesalerId,
      batchSize: Number.isFinite(batchSize) ? Math.max(1, batchSize) : 20,
      maxRuntimeMs: Number.isFinite(maxRuntimeMs) ? Math.max(1000, maxRuntimeMs) : 240000,
    });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'worker failed' },
      { status: 500 },
    );
  }
}

