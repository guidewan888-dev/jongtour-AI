import { NextResponse } from 'next/server';
import { SyncManager, AdapterFactory } from '@/services/suppliers/core/SyncManager';
import { LetgoAdapter } from '@/services/suppliers/adapters/LetgoAdapter';
import { TourFactoryAdapter } from '@/services/suppliers/adapters/TourFactoryAdapter';
import { CheckinAdapter } from '@/services/suppliers/adapters/CheckinAdapter';
import { Go365Adapter } from '@/services/suppliers/adapters/Go365Adapter';

export const dynamic = 'force-dynamic';

// Register adapters
AdapterFactory.register(new LetgoAdapter());
AdapterFactory.register(new TourFactoryAdapter());
AdapterFactory.register(new CheckinAdapter());
AdapterFactory.register(new Go365Adapter());

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
    
    // Check if auto-sync is enabled for this supplier
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ success: false, message: 'Missing Supabase environment variables' }, { status: 500 });
    }
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: credential } = await supabase
      .from('SupplierApiCredential')
      .select('isActive')
      .eq('supplierId', supplierId)
      .single();

    // Default to true if not explicitly disabled
    const isActive = credential ? credential.isActive : true;

    if (!isActive) {
      console.log(`[Cron] Auto-sync is DISABLED for ${supplierId}. Skipping.`);
      return NextResponse.json({
        success: true,
        message: `Auto-sync is disabled for ${supplierId}. Skipped.`
      });
    }

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
