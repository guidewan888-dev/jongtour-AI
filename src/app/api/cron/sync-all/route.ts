import { NextResponse } from 'next/server';
import { SyncManager, AdapterFactory } from '@/services/suppliers/core/SyncManager';
import { LetgoAdapter } from '@/services/suppliers/adapters/LetgoAdapter';
import { TourFactoryAdapter } from '@/services/suppliers/adapters/TourFactoryAdapter';
import { CheckinAdapter } from '@/services/suppliers/adapters/CheckinAdapter';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes for Vercel Pro

// Register adapters
AdapterFactory.register(new LetgoAdapter());
AdapterFactory.register(new TourFactoryAdapter());
AdapterFactory.register(new CheckinAdapter());

// All supplier IDs to sync
const SUPPLIER_IDS = ['SUP_LETGO', 'SUP_CHECKIN', 'SUP_TOURFACTORY'];

/**
 * GET /api/cron/sync-all
 * Syncs ALL suppliers sequentially. Called by Vercel Cron every hour.
 */
export async function GET(request: Request) {
  // Check authorization for Vercel Cron
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const results: { supplierId: string; status: string; message: string; duration: number }[] = [];

  for (const supplierId of SUPPLIER_IDS) {
    const start = Date.now();
    try {
      // Check if auto-sync is enabled
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      const { data: credential } = await supabase
        .from('SupplierApiCredential')
        .select('isActive')
        .eq('supplierId', supplierId)
        .single();

      const isActive = credential ? credential.isActive : true;

      if (!isActive) {
        results.push({
          supplierId,
          status: 'skipped',
          message: 'Auto-sync disabled',
          duration: Date.now() - start,
        });
        continue;
      }

      const syncManager = new SyncManager();
      await syncManager.syncSupplierTours(supplierId);

      results.push({
        supplierId,
        status: 'success',
        message: 'Sync completed',
        duration: Date.now() - start,
      });
    } catch (error: any) {
      console.error(`[Cron sync-all] Error for ${supplierId}:`, error.message);
      results.push({
        supplierId,
        status: 'error',
        message: error.message,
        duration: Date.now() - start,
      });
    }
  }

  console.log('[Cron sync-all] Results:', JSON.stringify(results));

  return NextResponse.json({
    success: true,
    syncedAt: new Date().toISOString(),
    results,
  });
}
