export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/suppliers
 * List all suppliers (for dropdown selectors)
 */
export async function GET() {
  try {
    const suppliers = await prisma.supplier.findMany({
      select: {
        id: true,
        canonicalName: true,
        displayName: true,
        status: true,
        bookingMethod: true,
      },
      orderBy: { displayName: 'asc' },
    });
    return NextResponse.json({ success: true, data: suppliers });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
