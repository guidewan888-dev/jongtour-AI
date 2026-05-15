export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { LinkValidationService } from '@/services/core/LinkValidationService';

export async function POST(req: Request) {
  try {
    const mode = new URL(req.url).searchParams.get('mode') || 'critical';
    const result =
      mode === 'full'
        ? await LinkValidationService.fullAudit()
        : await LinkValidationService.scanCriticalPages();

    return NextResponse.json({ success: true, mode, result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

