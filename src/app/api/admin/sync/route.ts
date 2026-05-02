import { NextResponse } from 'next/server';
import { SyncManager, AdapterFactory } from '@/services/suppliers/core/SyncManager';
import { LetgoAdapter } from '@/services/suppliers/adapters/LetgoAdapter';

// Register adapters here (in a real app, this might happen at startup or inside a registry file)
AdapterFactory.register(new LetgoAdapter());

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
    const { PrismaClient } = await import('@prisma/client');
    const db = new PrismaClient();
    const logs = await db.apiSyncLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20
    });
    await db.$disconnect();
    
    return NextResponse.json({ success: true, logs });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
