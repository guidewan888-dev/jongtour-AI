import { NextResponse } from 'next/server';
import { getWholesaleStatusData } from '@/lib/wholesale-sync';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/wholesale-status
 * Unified status for ALL wholesalers (both API-based and scraper-based)
 */
export async function GET() {
  try {
    const data = await getWholesaleStatusData();
    return NextResponse.json(data);
  } catch (e: any) {
    console.error('[wholesale-status]', e.message);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
