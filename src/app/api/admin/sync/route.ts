import { NextResponse } from 'next/server';
import { SyncManager, AdapterFactory } from '@/services/suppliers/core/SyncManager';
import { LetgoAdapter } from '@/services/suppliers/adapters/LetgoAdapter';
import { TourFactoryAdapter } from '@/services/suppliers/adapters/TourFactoryAdapter';
import { CheckinAdapter } from '@/services/suppliers/adapters/CheckinAdapter';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

// Register adapters
AdapterFactory.register(new LetgoAdapter());
AdapterFactory.register(new TourFactoryAdapter());
AdapterFactory.register(new CheckinAdapter());

/**
 * POST /api/admin/sync — Manual sync trigger from admin dashboard
 * Body: { supplierId: "SUP_LETGO" }
 */
export async function POST(request: Request) {
  try {
    const { supplierId } = await request.json();

    if (!supplierId) {
      return NextResponse.json({ success: false, message: 'supplierId is required' }, { status: 400 });
    }

    const syncManager = new SyncManager();
    await syncManager.syncSupplierTours(supplierId);

    return NextResponse.json({
      success: true,
      message: `Sync completed for ${supplierId}`,
      syncedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[Admin Sync]', error.message);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
