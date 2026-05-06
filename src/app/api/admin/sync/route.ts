export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { SyncManager, AdapterFactory } from '@/services/suppliers/core/SyncManager';
import { LetgoAdapter } from '@/services/suppliers/adapters/LetgoAdapter';
import { TourFactoryAdapter } from '@/services/suppliers/adapters/TourFactoryAdapter';
import { CheckinAdapter } from '@/services/suppliers/adapters/CheckinAdapter';

// Register adapters here (in a real app, this might happen at startup or inside a registry file)
AdapterFactory.register(new LetgoAdapter());
AdapterFactory.register(new TourFactoryAdapter());
AdapterFactory.register(new CheckinAdapter());

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supplierId = body.supplierId;

    if (!supplierId) {
      return NextResponse.json(
        { success: false, message: 'supplierId is required' },
        { status: 400 }
      );
    }

    // Initialize SyncManager
    const syncManager = new SyncManager();

    // Since this can be a long-running process, in Serverless (Vercel) we shouldn't await it
    // if it takes more than 10-60s. For this MVP/Mock, we await it directly.
    // In production, consider sending to a queue (like SQS, BullMQ) or Vercel Inngest.
    
    // Fire and forget (optional approach)
    // syncManager.syncSupplierTours(supplierId).catch(console.error);
    
    // For MVP, wait for it so we know it worked
    await syncManager.syncSupplierTours(supplierId);

    // Trigger background embedding generation for RAG (Deep Semantic Search)
    const host = request.headers.get("host");
    const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
    fetch(`${protocol}://${host}/api/admin/generate-embeddings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ limit: 100 })
    }).catch(e => console.error("Failed to trigger generate-embeddings:", e));

    return NextResponse.json({
      success: true,
      message: `Sync job completed for supplier ${supplierId}`
    });

  } catch (error: any) {
    console.error('API /admin/sync error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ success: false, message: 'Missing Supabase environment variables' }, { status: 500 });
    }
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: logs, error } = await supabase
      .from('ApiSyncLog')
      .select('*')
      .order('createdAt', { ascending: false })
      .limit(20);

    if (error) throw error;
    
    return NextResponse.json({ success: true, logs });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

