/**
 * Jongtour Document Service
 * Core engine for document generation, numbering, and delivery.
 * 
 * Rules:
 * - ห้ามออก receipt ถ้า payment ยังไม่ verified
 * - ห้ามออก voucher ถ้า booking ยังไม่ confirmed
 * - ห้ามใช้เลขเอกสารซ้ำ (atomic sequence)
 * - ลูกค้าเห็นเฉพาะเอกสารของตัวเอง
 * - ทุกการส่งต้องมี log
 * - ห้ามสร้างจาก mock data
 */

import { prisma } from '@/lib/prisma';
import { generateDocumentPdf, type DocumentData } from './pdfTemplates';

// ============================================================
// DOCUMENT TYPES
// ============================================================

export const DOC_TYPES = {
  QUOTATION: 'QT',
  INVOICE: 'INV',
  RECEIPT: 'RCP',
  VOUCHER: 'VCH',
  BOOKING_CONFIRMATION: 'BC',
  TAX_INVOICE: 'TI',
  WITHHOLDING_CERT: 'WHC',
  TRAVEL_APPOINTMENT: 'APP',
  PAYMENT_REMINDER: 'PM',
  TRAVELER_LIST: 'TR',
  SUPPLIER_CONFIRMATION: 'SC',
  PRIVATE_GROUP_PROPOSAL: 'PGP',
} as const;

export type DocType = keyof typeof DOC_TYPES;

// ============================================================
// SEQUENCE NUMBER GENERATOR (atomic, never duplicates)
// ============================================================

export async function generateSequenceNo(docType: string): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `${docType}-${year}-`;

  // Upsert + atomic increment
  const seq = await (prisma as any).documentSequence.upsert({
    where: { docType },
    create: { docType, prefix, lastNo: 1 },
    update: { lastNo: { increment: 1 } },
  });

  const nextNo = seq.lastNo;
  return `${prefix}${String(nextNo).padStart(5, '0')}`;
}

// ============================================================
// DOCUMENT GENERATORS
// ============================================================

export async function generateInvoice(bookingId: string, invoiceType: 'DEPOSIT' | 'BALANCE' | 'FULL' = 'DEPOSIT') {
  const booking = await prisma.booking.findUniqueOrThrow({
    where: { id: bookingId },
    include: {
      customer: true,
      tour: true,
      departure: true,
      payments: true,
    },
  });

  const depositPercent = 0.5;
  let amount: number;
  let description: string;

  if (invoiceType === 'DEPOSIT') {
    amount = Math.round(booking.totalPrice * depositPercent);
    description = `มัดจำ ${(depositPercent * 100).toFixed(0)}% — ${booking.tour.tourName}`;
  } else if (invoiceType === 'BALANCE') {
    const paidAmount = booking.payments
      .filter((p: any) => p.status === 'COMPLETED')
      .reduce((sum: number, p: any) => sum + p.amount, 0);
    amount = booking.totalPrice - paidAmount;
    description = `ยอดคงเหลือ — ${booking.tour.tourName}`;
  } else {
    amount = booking.totalPrice;
    description = `ชำระเต็มจำนวน — ${booking.tour.tourName}`;
  }

  const invoiceNo = await generateSequenceNo(DOC_TYPES.INVOICE);
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + (invoiceType === 'DEPOSIT' ? 3 : 7));

  const invoice = await prisma.invoice.create({
    data: {
      bookingId,
      invoiceNo,
      invoiceType,
      totalAmount: amount,
      description,
      dueDate,
    },
  });

  // Generate PDF
  const pdfUrl = await generateAndStorePdf('INVOICE', {
    documentNo: invoiceNo,
    invoiceType,
    booking,
    customer: booking.customer,
    tour: booking.tour,
    departure: booking.departure,
    amount,
    description,
    dueDate,
    issueDate: new Date(),
  });

  await prisma.invoice.update({
    where: { id: invoice.id },
    data: { pdfUrl },
  });

  return { ...invoice, pdfUrl };
}

export async function generateReceipt(paymentId: string) {
  const payment = await (prisma as any).payment.findUniqueOrThrow({
    where: { id: paymentId },
    include: {
      booking: { include: { customer: true, tour: true } },
    },
  });

  // GUARD: ห้ามออก receipt ถ้า payment ยังไม่ verified
  if (payment.verificationStatus !== 'VERIFIED' && payment.status !== 'COMPLETED') {
    throw new Error('GUARD: Cannot generate receipt — payment not verified');
  }

  const receiptNo = await generateSequenceNo(DOC_TYPES.RECEIPT);

  const receipt = await prisma.receipt.create({
    data: {
      bookingId: payment.bookingId,
      receiptNo,
      amount: payment.amount,
    },
  });

  const pdfUrl = await generateAndStorePdf('RECEIPT', {
    documentNo: receiptNo,
    payment,
    booking: payment.booking,
    customer: payment.booking.customer,
    tour: payment.booking.tour,
    amount: payment.amount,
    issueDate: new Date(),
  });

  await prisma.receipt.update({
    where: { id: receipt.id },
    data: { pdfUrl },
  });

  return { ...receipt, pdfUrl };
}

export async function generateVoucher(bookingId: string) {
  const booking = await prisma.booking.findUniqueOrThrow({
    where: { id: bookingId },
    include: {
      customer: true,
      tour: true,
      departure: true,
      travelers: true,
    },
  });

  // GUARD: ห้ามออก voucher ถ้า booking ยังไม่ confirmed
  if (!['confirmed', 'paid', 'voucher_issued', 'completed'].includes(booking.status)) {
    throw new Error('GUARD: Cannot generate voucher — booking not confirmed');
  }

  const voucherNo = await generateSequenceNo(DOC_TYPES.VOUCHER);

  const voucher = await prisma.voucher.create({
    data: {
      bookingId,
      voucherNo,
    },
  });

  const pdfUrl = await generateAndStorePdf('VOUCHER', {
    documentNo: voucherNo,
    booking,
    customer: booking.customer,
    tour: booking.tour,
    departure: booking.departure,
    travelers: booking.travelers,
    issueDate: new Date(),
  });

  await prisma.voucher.update({
    where: { id: voucher.id },
    data: { pdfUrl },
  });

  // Update booking status
  await prisma.booking.update({
    where: { id: bookingId },
    data: { status: 'voucher_issued' },
  });

  return { ...voucher, pdfUrl };
}

export async function generateBookingConfirmation(bookingId: string) {
  const booking = await prisma.booking.findUniqueOrThrow({
    where: { id: bookingId },
    include: { customer: true, tour: true, departure: true, travelers: true },
  });

  const docNo = await generateSequenceNo(DOC_TYPES.BOOKING_CONFIRMATION);
  const pdfUrl = await generateAndStorePdf('BOOKING_CONFIRMATION', {
    documentNo: docNo,
    booking, customer: booking.customer, tour: booking.tour,
    departure: booking.departure, travelers: booking.travelers,
    issueDate: new Date(),
  });

  return { documentNo: docNo, pdfUrl, bookingRef: booking.bookingRef };
}

export async function generateTravelAppointment(bookingId: string) {
  const booking = await prisma.booking.findUniqueOrThrow({
    where: { id: bookingId },
    include: { customer: true, tour: true, departure: true, travelers: true },
  });

  const docNo = await generateSequenceNo(DOC_TYPES.TRAVEL_APPOINTMENT);
  const pdfUrl = await generateAndStorePdf('TRAVEL_APPOINTMENT', {
    documentNo: docNo,
    booking, customer: booking.customer, tour: booking.tour,
    departure: booking.departure, travelers: booking.travelers,
    issueDate: new Date(),
  });

  return { documentNo: docNo, pdfUrl };
}

export async function generateTravelerList(bookingId: string) {
  const booking = await prisma.booking.findUniqueOrThrow({
    where: { id: bookingId },
    include: { customer: true, tour: true, departure: true, travelers: true },
  });

  const docNo = await generateSequenceNo(DOC_TYPES.TRAVELER_LIST);
  const pdfUrl = await generateAndStorePdf('TRAVELER_LIST', {
    documentNo: docNo,
    booking, tour: booking.tour, departure: booking.departure,
    travelers: booking.travelers, issueDate: new Date(),
  });

  return { documentNo: docNo, pdfUrl };
}

export async function generateSupplierConfirmation(bookingId: string) {
  const booking = await prisma.booking.findUniqueOrThrow({
    where: { id: bookingId },
    include: { customer: true, tour: true, departure: true, supplier: true, travelers: true },
  });

  const docNo = await generateSequenceNo(DOC_TYPES.SUPPLIER_CONFIRMATION);
  const pdfUrl = await generateAndStorePdf('SUPPLIER_CONFIRMATION', {
    documentNo: docNo,
    booking, tour: booking.tour, departure: booking.departure,
    supplier: booking.supplier, travelers: booking.travelers,
    issueDate: new Date(),
  });

  return { documentNo: docNo, pdfUrl };
}

export async function generateQuotationPdf(quotationId: string) {
  const quotation = await prisma.quotation.findUniqueOrThrow({
    where: { id: quotationId },
    include: { departure: { include: { tour: true, prices: true } } },
  });

  const docNo = quotation.quotationRef;
  const pdfUrl = await generateAndStorePdf('QUOTATION', {
    documentNo: docNo,
    quotation,
    tour: quotation.departure.tour,
    departure: quotation.departure,
    issueDate: new Date(),
  });

  return { documentNo: docNo, pdfUrl };
}

export async function generatePrivateGroupProposal(data: {
  customerName: string;
  destination: string;
  pax: number;
  duration: string;
  estimatedPrice: number;
  notes?: string;
}) {
  const docNo = await generateSequenceNo(DOC_TYPES.PRIVATE_GROUP_PROPOSAL);
  const pdfUrl = await generateAndStorePdf('PRIVATE_GROUP_PROPOSAL', {
    documentNo: docNo,
    ...data,
    issueDate: new Date(),
  });

  return { documentNo: docNo, pdfUrl };
}

export async function generatePaymentReminder(bookingId: string) {
  const booking = await prisma.booking.findUniqueOrThrow({
    where: { id: bookingId },
    include: { customer: true, tour: true, invoices: true },
  });

  const unpaidInvoices = (booking as any).invoices?.filter((inv: any) => inv.status === 'UNPAID') || [];
  if (unpaidInvoices.length === 0) return null;

  const docNo = await generateSequenceNo(DOC_TYPES.PAYMENT_REMINDER);
  const pdfUrl = await generateAndStorePdf('PAYMENT_REMINDER', {
    documentNo: docNo,
    booking, customer: booking.customer, tour: booking.tour,
    invoices: unpaidInvoices, issueDate: new Date(),
  });

  return { documentNo: docNo, pdfUrl, unpaidInvoices };
}

// ============================================================
// PDF GENERATION + STORAGE
// ============================================================

async function generateAndStorePdf(docType: string, data: DocumentData): Promise<string> {
  const pdfBase64 = await generateDocumentPdf(docType, data);

  // Store in Supabase Storage
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    const fileName = `documents/${docType.toLowerCase()}/${data.documentNo.replace(/\//g, '-')}.pdf`;
    const buffer = Buffer.from(pdfBase64, 'base64');

    const { data: uploadData, error } = await supabase.storage
      .from('jongtour-docs')
      .upload(fileName, buffer, {
        contentType: 'application/pdf',
        upsert: true,
      });

    if (error) {
      console.error(`[DocService] Storage upload error:`, error);
      return `data:application/pdf;base64,${pdfBase64}`;
    }

    const { data: urlData } = supabase.storage
      .from('jongtour-docs')
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  } catch (err) {
    console.error('[DocService] Storage fallback to base64:', err);
    return `data:application/pdf;base64,${pdfBase64}`;
  }
}

// ============================================================
// DELIVERY
// ============================================================

export async function deliverDocument(params: {
  documentType: string;
  documentId: string;
  documentNo: string;
  pdfUrl: string;
  channels: ('EMAIL' | 'LINE')[];
  recipientEmail?: string;
  recipientLineUserId?: string;
  customerName?: string;
}) {
  const results = [];

  for (const channel of params.channels) {
    const recipient = channel === 'EMAIL' ? params.recipientEmail : params.recipientLineUserId;
    if (!recipient) continue;

    // Create delivery log
    const log = await (prisma as any).documentDeliveryLog.create({
      data: {
        documentType: params.documentType,
        documentId: params.documentId,
        documentNo: params.documentNo,
        channel,
        recipient,
        status: 'PENDING',
      },
    });

    try {
      if (channel === 'EMAIL') {
        const { sendDocumentEmail } = await import('@/lib/email');
        await sendDocumentEmail({
          to: recipient,
          documentType: params.documentType,
          documentNo: params.documentNo,
          customerName: params.customerName || '',
          pdfUrl: params.pdfUrl,
        });
      } else if (channel === 'LINE') {
        const { sendLineDocument } = await import('@/lib/lineDelivery');
        await sendLineDocument(
          recipient,
          params.documentType,
          params.documentNo,
          params.pdfUrl,
        );
      }

      await (prisma as any).documentDeliveryLog.update({
        where: { id: log.id },
        data: { status: 'SENT', sentAt: new Date() },
      });

      results.push({ channel, status: 'SENT', logId: log.id });
    } catch (err: any) {
      await (prisma as any).documentDeliveryLog.update({
        where: { id: log.id },
        data: { status: 'FAILED', errorMessage: err.message },
      });

      results.push({ channel, status: 'FAILED', error: err.message, logId: log.id });
    }
  }

  return results;
}

export async function retryFailedDelivery(logId: string) {
  const log = await (prisma as any).documentDeliveryLog.findUniqueOrThrow({
    where: { id: logId },
  });

  if (log.status !== 'FAILED') {
    throw new Error('Can only retry FAILED deliveries');
  }

  if (log.retryCount >= 3) {
    throw new Error('Max retries exceeded');
  }

  await (prisma as any).documentDeliveryLog.update({
    where: { id: logId },
    data: { retryCount: { increment: 1 }, status: 'PENDING' },
  });

  // Re-deliver
  return deliverDocument({
    documentType: log.documentType,
    documentId: log.documentId,
    documentNo: log.documentNo || '',
    pdfUrl: '', // Will need to re-fetch
    channels: [log.channel as 'EMAIL' | 'LINE'],
    recipientEmail: log.channel === 'EMAIL' ? log.recipient : undefined,
    recipientLineUserId: log.channel === 'LINE' ? log.recipient : undefined,
  });
}

// ============================================================
// CUSTOMER PORTAL (ownership-filtered)
// ============================================================

export async function getCustomerDocuments(customerId: string) {
  const customer = await prisma.customer.findUniqueOrThrow({
    where: { id: customerId },
  });

  const bookings = await prisma.booking.findMany({
    where: { customerId },
    include: {
      invoices: true,
      receipts: true,
      vouchers: true,
      tour: { select: { tourName: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const documents: any[] = [];

  for (const booking of bookings) {
    for (const inv of booking.invoices) {
      documents.push({
        type: 'INVOICE',
        documentNo: inv.invoiceNo,
        description: (inv as any).description || `Invoice — ${booking.tour.tourName}`,
        status: inv.status,
        pdfUrl: (inv as any).pdfUrl,
        createdAt: inv.createdAt,
        bookingRef: booking.bookingRef,
      });
    }
    for (const rcp of booking.receipts) {
      documents.push({
        type: 'RECEIPT',
        documentNo: rcp.receiptNo,
        description: `Receipt — ${booking.tour.tourName}`,
        pdfUrl: rcp.pdfUrl,
        createdAt: rcp.createdAt,
        bookingRef: booking.bookingRef,
      });
    }
    for (const vch of booking.vouchers) {
      documents.push({
        type: 'VOUCHER',
        documentNo: vch.voucherNo,
        description: `Voucher — ${booking.tour.tourName}`,
        status: vch.status,
        pdfUrl: vch.pdfUrl,
        createdAt: vch.createdAt,
        bookingRef: booking.bookingRef,
      });
    }
  }

  return documents.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}
