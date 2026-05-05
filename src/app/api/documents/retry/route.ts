export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';

/**
 * POST /api/documents/retry
 * Retry a failed document delivery
 */
export async function POST(req: Request) {
  try {
    const { logId } = await req.json();

    if (!logId) {
      return NextResponse.json({ success: false, error: 'Missing logId' }, { status: 400 });
    }

    const { retryFailedDelivery } = await import('@/services/documentService');
    const result = await retryFailedDelivery(logId);

    return NextResponse.json({ success: true, result });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
