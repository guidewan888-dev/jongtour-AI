import { NextResponse } from 'next/server';
import { SyncManager, AdapterFactory } from '@/services/suppliers/core/SyncManager';
import { LetgoAdapter } from '@/services/suppliers/adapters/LetgoAdapter';
import { TourFactoryAdapter } from '@/services/suppliers/adapters/TourFactoryAdapter';
import { CheckinAdapter } from '@/services/suppliers/adapters/CheckinAdapter';
import { Go365Adapter } from '@/services/suppliers/adapters/Go365Adapter';
import { prisma } from '@/lib/prisma';
import { createClient } from '@supabase/supabase-js';

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

    const startTime = new Date();
    const syncManager = new SyncManager();
    await syncManager.syncSupplierTours(supplierId);
    const endTime = new Date();
    const duration = Math.round((endTime.getTime() - startTime.getTime()) / 1000);

    // Get latest ApiSyncLog to find record count
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: latestLog } = await supabase
      .from('ApiSyncLog')
      .select('id, status, recordsAdded')
      .eq('supplierId', supplierId)
      .order('createdAt', { ascending: false })
      .limit(1)
      .single();

    const recordCount = latestLog?.recordsAdded || 0;
    const syncStatus = latestLog?.status === 'SUCCESS' ? 'SUCCESS' : 'FAILED';

    // Write to SupplierSyncLog via Prisma (same table the admin pages read from)
    try {
      await prisma.supplierSyncLog.create({
        data: {
          supplierId,
          syncType: 'FULL',
          status: syncStatus,
          startedAt: startTime,
          finishedAt: endTime,
          totalRecords: recordCount,
          successRecords: recordCount,
          failedRecords: 0,
        },
      });
    } catch (logErr: any) {
      console.error('[Admin Sync] Failed to write SupplierSyncLog:', logErr.message);
    }

    return NextResponse.json({
      success: true,
      message: `Sync สำเร็จ! ${recordCount} โปรแกรม (${duration}s)`,
      recordCount,
      duration,
      syncedAt: endTime.toISOString(),
    });
  } catch (error: any) {
    console.error('[Admin Sync]', error.message);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
