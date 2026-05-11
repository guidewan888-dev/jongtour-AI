import { NextResponse } from 'next/server';
import { getWholesaleStatusData } from '@/lib/wholesale-sync';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/sync-logs
 * Returns real sync log data from ApiSyncLog table.
 */
export async function GET() {
  try {
    const { recentLogs } = await getWholesaleStatusData();
    const logs = recentLogs.slice(0, 200).map((log) => ({
      id: log.id,
      supplierId: log.supplierId,
      supplierName: log.supplier,
      type: log.type === 'api' ? 'FULL_SYNC' : 'SCRAPER_SYNC',
      status: log.status,
      recordsAdded: Number(log.records || 0),
      recordsUpdated: Number(log.recordsUpdated || 0),
      errorMessage: log.error || null,
      createdAt: log.time,
      source: log.type,
    }));
    return NextResponse.json({ logs });
  } catch (e: any) {
    return NextResponse.json({ logs: [], error: e.message }, { status: 500 });
  }
}
