import { NextResponse } from 'next/server';
import { SyncManager, AdapterFactory } from '@/services/suppliers/core/SyncManager';
import { LetgoAdapter } from '@/services/suppliers/adapters/LetgoAdapter';
import { TourFactoryAdapter } from '@/services/suppliers/adapters/TourFactoryAdapter';
import { CheckinAdapter } from '@/services/suppliers/adapters/CheckinAdapter';

export const dynamic = 'force-dynamic';

// Register adapters
AdapterFactory.register(new LetgoAdapter());
AdapterFactory.register(new TourFactoryAdapter());
AdapterFactory.register(new CheckinAdapter());

export async function GET(request: Request) {
  // Check authorization for Vercel Cron
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const supplierId = searchParams.get('supplierId');

  if (!supplierId) {
    return NextResponse.json({ success: false, message: 'supplierId query parameter is required' }, { status: 400 });
  }

  try {
    const syncManager = new SyncManager();
    
    // Fire and wait for the sync to complete
    await syncManager.syncSupplierTours(supplierId);

    return NextResponse.json({
      success: true,
      message: `Cron sync completed successfully for ${supplierId}`
    });
  } catch (error: any) {
    console.error(`Cron Sync Error for ${supplierId}:`, error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
