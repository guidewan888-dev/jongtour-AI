export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { AvailabilityService } from '@/services/core/AvailabilityService';

/**
 * GET /api/cron/cleanup-holds — Release expired seat holds
 * Run every 5 minutes via Vercel Cron
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await AvailabilityService.cleanExpiredHolds();
    console.log(`[Cron] Cleaned ${result.cleaned} expired holds`);
    return NextResponse.json({ success: true, ...result });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
