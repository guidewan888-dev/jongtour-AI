export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/documents/generate
 * Generate a document (Invoice, Receipt, Voucher, etc.)
 * 
 * Guards:
 * - ห้ามออก receipt ถ้า payment ยังไม่ verified
 * - ห้ามออก voucher ถ้า booking ยังไม่ confirmed
 * - ห้ามสร้างจาก mock data
 */
export async function POST(req: Request) {
  try {
    const { type, bookingId, paymentId, quotationId, invoiceType, deliverTo } = await req.json();

    if (!type) {
      return NextResponse.json({ success: false, error: 'Missing document type' }, { status: 400 });
    }

    const {
      generateInvoice, generateReceipt, generateVoucher,
      generateBookingConfirmation, generateTravelAppointment,
      generateTravelerList, generateSupplierConfirmation,
      generateQuotationPdf, generatePaymentReminder,
      deliverDocument,
    } = await import('@/services/documentService');

    let result: any;

    switch (type) {
      case 'INVOICE':
        if (!bookingId) return NextResponse.json({ success: false, error: 'Missing bookingId' }, { status: 400 });
        result = await generateInvoice(bookingId, invoiceType || 'DEPOSIT');
        break;

      case 'RECEIPT':
        if (!paymentId) return NextResponse.json({ success: false, error: 'Missing paymentId' }, { status: 400 });
        result = await generateReceipt(paymentId);
        break;

      case 'VOUCHER':
        if (!bookingId) return NextResponse.json({ success: false, error: 'Missing bookingId' }, { status: 400 });
        result = await generateVoucher(bookingId);
        break;

      case 'BOOKING_CONFIRMATION':
        if (!bookingId) return NextResponse.json({ success: false, error: 'Missing bookingId' }, { status: 400 });
        result = await generateBookingConfirmation(bookingId);
        break;

      case 'TRAVEL_APPOINTMENT':
        if (!bookingId) return NextResponse.json({ success: false, error: 'Missing bookingId' }, { status: 400 });
        result = await generateTravelAppointment(bookingId);
        break;

      case 'TRAVELER_LIST':
        if (!bookingId) return NextResponse.json({ success: false, error: 'Missing bookingId' }, { status: 400 });
        result = await generateTravelerList(bookingId);
        break;

      case 'SUPPLIER_CONFIRMATION':
        if (!bookingId) return NextResponse.json({ success: false, error: 'Missing bookingId' }, { status: 400 });
        result = await generateSupplierConfirmation(bookingId);
        break;

      case 'QUOTATION':
        if (!quotationId) return NextResponse.json({ success: false, error: 'Missing quotationId' }, { status: 400 });
        result = await generateQuotationPdf(quotationId);
        break;

      case 'PAYMENT_REMINDER':
        if (!bookingId) return NextResponse.json({ success: false, error: 'Missing bookingId' }, { status: 400 });
        result = await generatePaymentReminder(bookingId);
        break;

      default:
        return NextResponse.json({ success: false, error: `Unknown type: ${type}` }, { status: 400 });
    }

    // Auto-deliver if requested
    if (deliverTo && result?.pdfUrl) {
      const booking = bookingId ? await prisma.booking.findUnique({
        where: { id: bookingId },
        include: { customer: true },
      }) : null;
      const customerName = [booking?.customer?.firstName, booking?.customer?.lastName].filter(Boolean).join(' ').trim() || undefined;

      const deliveryResult = await deliverDocument({
        documentType: type,
        documentId: result.id || result.documentNo,
        documentNo: result.documentNo || result.invoiceNo || result.receiptNo || result.voucherNo || '',
        pdfUrl: result.pdfUrl,
        channels: deliverTo.channels || ['EMAIL'],
        recipientEmail: deliverTo.email || booking?.customer?.email,
        recipientLineUserId: deliverTo.lineUserId,
        customerName,
      });

      return NextResponse.json({ success: true, document: result, delivery: deliveryResult });
    }

    return NextResponse.json({ success: true, document: result });
  } catch (err: any) {
    console.error('[Doc Generate]', err);
    const isGuard = err.message?.startsWith('GUARD:');
    return NextResponse.json(
      { success: false, error: err.message },
      { status: isGuard ? 403 : 500 }
    );
  }
}
