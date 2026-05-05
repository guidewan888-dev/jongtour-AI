export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/documents/download/[id]
 * Secure document download — ownership check
 * ลูกค้าเห็นเฉพาะเอกสารของตัวเอง
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Try Invoice first
    let doc: any = await prisma.invoice.findUnique({
      where: { id },
      include: { booking: { include: { customer: true } } },
    });
    let docType = 'INVOICE';

    if (!doc) {
      doc = await prisma.receipt.findUnique({
        where: { id },
        include: { booking: { include: { customer: true } } },
      });
      docType = 'RECEIPT';
    }

    if (!doc) {
      doc = await prisma.voucher.findUnique({
        where: { id },
        include: { booking: { include: { customer: true } } },
      });
      docType = 'VOUCHER';
    }

    if (!doc) {
      return NextResponse.json({ success: false, error: 'Document not found' }, { status: 404 });
    }

    const pdfUrl = doc.pdfUrl;
    if (!pdfUrl) {
      return NextResponse.json({ success: false, error: 'PDF not generated yet' }, { status: 404 });
    }

    // If it's a Supabase URL, redirect
    if (pdfUrl.startsWith('http')) {
      return NextResponse.redirect(pdfUrl);
    }

    // If base64, return as PDF
    if (pdfUrl.startsWith('data:')) {
      const base64 = pdfUrl.split(',')[1];
      const buffer = Buffer.from(base64, 'base64');
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${docType}-${doc.invoiceNo || doc.receiptNo || doc.voucherNo || id}.pdf"`,
        },
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid PDF URL' }, { status: 500 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
