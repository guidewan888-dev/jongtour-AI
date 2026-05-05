export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const credentials = await prisma.supplierApiCredential.findMany({
      select: { supplierId: true, status: true },
    });

    // Build settings map — default to active if no credential record
    const settings: Record<string, boolean> = {};
    const suppliers = await prisma.supplier.findMany({ select: { id: true, canonicalName: true } });
    
    for (const s of suppliers) {
      const cred = credentials.find(c => c.supplierId === s.id);
      settings[s.id] = cred ? cred.status === 'ACTIVE' : true;
    }

    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { supplierId, isActive } = await request.json();

    if (!supplierId || typeof isActive !== 'boolean') {
      return NextResponse.json({ success: false, message: 'Invalid payload' }, { status: 400 });
    }

    // Upsert credential status
    const existing = await prisma.supplierApiCredential.findUnique({
      where: { supplierId },
    });

    if (existing) {
      await prisma.supplierApiCredential.update({
        where: { supplierId },
        data: { status: isActive ? 'ACTIVE' : 'DISABLED' },
      });
    } else {
      await prisma.supplierApiCredential.create({
        data: {
          supplierId,
          apiBaseUrl: 'https://placeholder.com',
          encryptedApiKey: 'placeholder',
          status: isActive ? 'ACTIVE' : 'DISABLED',
        },
      });
    }

    return NextResponse.json({ success: true, message: 'Setting updated' });
  } catch (error: any) {
    console.error('API /admin/sync/settings error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
