import { NextResponse } from 'next/server';
import { SyncManager, AdapterFactory } from '@/services/suppliers/core/SyncManager';
import { LetgoAdapter } from '@/services/suppliers/adapters/LetgoAdapter';
import { TourFactoryAdapter } from '@/services/suppliers/adapters/TourFactoryAdapter';
import { CheckinAdapter } from '@/services/suppliers/adapters/CheckinAdapter';
import { createClient } from '@supabase/supabase-js';

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

    const start = Date.now();
    const syncManager = new SyncManager();
    await syncManager.syncSupplierTours(supplierId);
    const duration = Math.round((Date.now() - start) / 1000);

    // Query latest sync log to get record count
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

    // Also write to supplierSyncLog (the table the admin dashboard reads)
    const { data: supplier } = await supabase
      .from('suppliers')
      .select('id')
      .eq('id', supplierId)
      .single();

    if (supplier) {
      await supabase.from('supplierSyncLog').insert({
        supplierId: supplier.id,
        syncType: 'MANUAL',
        status: latestLog?.status === 'SUCCESS' ? 'SUCCESS' : 'PARTIAL',
        totalRecords: recordCount,
        successRecords: recordCount,
        durationMs: duration * 1000,
        startedAt: new Date(Date.now() - duration * 1000).toISOString(),
        finishedAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      message: `Sync สำเร็จ! ${recordCount} โปรแกรม`,
      recordCount,
      duration,
      syncedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[Admin Sync]', error.message);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
