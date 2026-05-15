import { NextResponse } from 'next/server';
import { SyncManager, AdapterFactory } from '@/services/suppliers/core/SyncManager';
import { LetgoAdapter } from '@/services/suppliers/adapters/LetgoAdapter';
import { TourFactoryAdapter } from '@/services/suppliers/adapters/TourFactoryAdapter';
import { CheckinAdapter } from '@/services/suppliers/adapters/CheckinAdapter';
import { Go365Adapter } from '@/services/suppliers/adapters/Go365Adapter';
import { prisma } from '@/lib/prisma';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { resolveSupplierForSync } from '@/lib/wholesale-sync';
import { syncCentralWholesale } from '@/services/central-wholesale.service';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

// Register adapters
AdapterFactory.register(new LetgoAdapter());
AdapterFactory.register(new TourFactoryAdapter());
AdapterFactory.register(new CheckinAdapter());
AdapterFactory.register(new Go365Adapter());

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

    const resolved = await resolveSupplierForSync(supplierId);
    if (!resolved) {
      return NextResponse.json(
        { success: false, message: `Unsupported supplierId: ${supplierId}` },
        { status: 400 }
      );
    }

    const adapterSupplierId = resolved.adapterSupplierId;
    const supplierDbId = resolved.supplierDbId;

    const startTime = new Date();
    const syncManager = new SyncManager();
    await syncManager.syncSupplierTours(adapterSupplierId);
    let centralResult: any = null;
    let go365CentralSync: any = null;
    if (adapterSupplierId === 'SUP_GO365') {
      const { POST: runGo365DirectSync } = await import('@/app/api/tours/go365-sync/route');
      const req = new Request('http://localhost/api/tours/go365-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pageSize: 50,
          maxPages: 50,
          concurrency: 6,
          runPdfWorker: true,
        }),
      });
      const res = await runGo365DirectSync(req);
      go365CentralSync = await res.json();
      if (!res.ok || !go365CentralSync?.success) {
        throw new Error(go365CentralSync?.error || 'SUP_GO365 direct central sync failed');
      }
    } else {
      centralResult = await syncCentralWholesale({
        wholesalerId: adapterSupplierId,
        includeApi: true,
        includeScraper: false,
        limitPerSource: 5000,
      });
    }
    const endTime = new Date();
    const duration = Math.round((endTime.getTime() - startTime.getTime()) / 1000);

    // Get latest ApiSyncLog to find record count
    const supabase = getSupabaseAdmin();

    const { data: latestLog } = await supabase
      .from('ApiSyncLog')
      .select('id, status, recordsAdded')
      .eq('supplierId', adapterSupplierId)
      .order('createdAt', { ascending: false })
      .limit(1)
      .single();

    const recordCount = latestLog?.recordsAdded || 0;
    const syncStatus = latestLog?.status === 'SUCCESS' ? 'SUCCESS' : 'FAILED';
    const successRecords = syncStatus === 'SUCCESS' ? recordCount : 0;
    const failedRecords = syncStatus === 'FAILED' ? Math.max(1, recordCount) : 0;

    // Write to SupplierSyncLog via Prisma (same table the admin pages read from)
    try {
      await prisma.supplierSyncLog.create({
        data: {
          supplierId: supplierDbId,
          syncType: 'FULL',
          status: syncStatus,
          startedAt: startTime,
          finishedAt: endTime,
          totalRecords: recordCount,
          successRecords,
          failedRecords,
        },
      });
    } catch (logErr: any) {
      console.error('[Admin Sync] Failed to write SupplierSyncLog:', logErr.message);
    }

    if (syncStatus !== 'SUCCESS') {
      return NextResponse.json(
        {
          success: false,
          message: `Sync failed (${duration}s)`,
          recordCount,
          duration,
          syncedAt: endTime.toISOString(),
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Sync สำเร็จ! ${recordCount} โปรแกรม (${duration}s)`,
      recordCount,
      centralNormalized: centralResult,
      go365CentralSync,
      duration,
      syncedAt: endTime.toISOString(),
    });
  } catch (error: any) {
    console.error('[Admin Sync]', error.message);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
