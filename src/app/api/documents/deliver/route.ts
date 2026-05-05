export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/documents/deliver
 * Send document via Email and/or LINE
 */
export async function POST(req: Request) {
  try {
    const { documentType, documentId, documentNo, pdfUrl, channels, recipientEmail, recipientLineUserId, customerName } = await req.json();

    if (!documentType || !pdfUrl || !channels?.length) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const { deliverDocument } = await import('@/services/documentService');

    const result = await deliverDocument({
      documentType,
      documentId: documentId || documentNo,
      documentNo: documentNo || '',
      pdfUrl,
      channels,
      recipientEmail,
      recipientLineUserId,
      customerName,
    });

    return NextResponse.json({ success: true, delivery: result });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

/**
 * GET /api/documents/deliver
 * Get delivery logs for a document
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const documentId = searchParams.get('documentId');
    const status = searchParams.get('status');

    const where: any = {};
    if (documentId) where.documentId = documentId;
    if (status) where.status = status;

    const logs = await (prisma as any).documentDeliveryLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({ success: true, data: logs });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
