/**
 * Jongtour PDF Templates
 * Uses jsPDF + Sarabun Thai font for server-side PDF generation.
 * All 13 document types supported.
 */

import jsPDF from 'jspdf';
import { registerThaiFont } from './thaiFontLoader';

export interface DocumentData {
  documentNo: string;
  [key: string]: any;
}

const BRAND = {
  name: 'Jongtour Co., Ltd.',
  nameTh: 'บริษัท จองทัวร์ จำกัด',
  address: '123/45 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110',
  phone: '02-XXX-XXXX',
  email: 'info@jongtour.com',
  website: 'https://jongtour.com',
  taxId: 'X-XXXX-XXXXX-XX-X',
  primaryColor: [30, 58, 95] as [number, number, number],
  accentColor: [245, 158, 11] as [number, number, number],
};

function createHeader(doc: jsPDF, title: string, docNo: string, issueDate: Date) {
  // Header bar
  doc.setFillColor(...BRAND.primaryColor);
  doc.rect(0, 0, 210, 35, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.text('Jongtour', 15, 18);

  doc.setFontSize(10);
  doc.text(BRAND.website, 15, 27);

  // Document info right
  doc.setFontSize(14);
  doc.text(title, 195, 15, { align: 'right' });
  doc.setFontSize(9);
  doc.text(`No: ${docNo}`, 195, 22, { align: 'right' });
  doc.text(`Date: ${issueDate.toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}`, 195, 29, { align: 'right' });

  doc.setTextColor(0, 0, 0);
  return 42;
}

function addCompanyInfo(doc: jsPDF, y: number) {
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text(BRAND.nameTh, 15, y);
  doc.text(BRAND.address, 15, y + 4);
  doc.text(`Tel: ${BRAND.phone} | Email: ${BRAND.email}`, 15, y + 8);
  doc.setTextColor(0, 0, 0);
  return y + 14;
}

function addCustomerInfo(doc: jsPDF, y: number, customer: any) {
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Bill To / Customer:', 15, y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(customer?.fullName || customer?.customerName || '-', 15, y + 6);
  if (customer?.email) doc.text(`Email: ${customer.email}`, 15, y + 11);
  if (customer?.phone) doc.text(`Phone: ${customer.phone}`, 15, y + 16);
  return y + 22;
}

function addTable(doc: jsPDF, y: number, headers: string[], rows: string[][], colWidths: number[]) {
  const startX = 15;
  const rowH = 7;

  // Header
  doc.setFillColor(240, 242, 245);
  doc.rect(startX, y, colWidths.reduce((a, b) => a + b, 0), rowH, 'F');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  let x = startX;
  headers.forEach((h, i) => {
    doc.text(h, x + 2, y + 5);
    x += colWidths[i];
  });
  y += rowH;

  // Rows
  doc.setFont('helvetica', 'normal');
  for (const row of rows) {
    x = startX;
    row.forEach((cell, i) => {
      doc.text(String(cell), x + 2, y + 5);
      x += colWidths[i];
    });
    doc.setDrawColor(230, 230, 230);
    doc.line(startX, y + rowH, startX + colWidths.reduce((a, b) => a + b, 0), y + rowH);
    y += rowH;
  }

  return y + 4;
}

function addFooter(doc: jsPDF) {
  const pageH = doc.internal.pageSize.height;
  doc.setFontSize(7);
  doc.setTextColor(150, 150, 150);
  doc.text(`${BRAND.name} | ${BRAND.website}`, 105, pageH - 10, { align: 'center' });
  doc.text('This document is computer-generated and valid without signature.', 105, pageH - 6, { align: 'center' });
}

function formatPrice(n: number): string {
  return n?.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00';
}

// ============================================================
// TEMPLATE: INVOICE
// ============================================================

async function generateInvoicePdf(data: DocumentData): Promise<string> {
  const doc = new jsPDF();
  await registerThaiFont(doc);
  const typeLabel = data.invoiceType === 'DEPOSIT' ? 'Invoice (Deposit/มัดจำ)' :
                    data.invoiceType === 'BALANCE' ? 'Invoice (Balance/ยอดคงเหลือ)' : 'Invoice';

  let y = createHeader(doc, typeLabel, data.documentNo, data.issueDate);
  y = addCompanyInfo(doc, y);
  y = addCustomerInfo(doc, y, data.customer);

  // Booking info
  doc.setFontSize(9);
  doc.text(`Booking Ref: ${data.booking?.bookingRef || '-'}`, 120, y - 16);
  doc.text(`Tour: ${data.tour?.tourName || '-'}`, 120, y - 11);
  if (data.departure?.startDate) {
    doc.text(`Departure: ${new Date(data.departure.startDate).toLocaleDateString('th-TH')}`, 120, y - 6);
  }

  // Items table
  y = addTable(doc, y, ['Description', 'Amount (THB)'], [
    [data.description || 'Tour Package', formatPrice(data.amount)],
  ], [130, 50]);

  // Total
  doc.setFillColor(...BRAND.accentColor);
  doc.rect(145, y, 50, 8, 'F');
  doc.setTextColor(30, 58, 95);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(`Total: ${formatPrice(data.amount)} THB`, 147, y + 6);

  // Due date
  y += 16;
  doc.setTextColor(200, 0, 0);
  doc.setFontSize(9);
  doc.text(`Due Date: ${data.dueDate ? new Date(data.dueDate).toLocaleDateString('th-TH') : '-'}`, 15, y);

  // Payment info
  y += 10;
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Payment Methods:', 15, y);
  doc.text('- Bank Transfer / PromptPay', 15, y + 5);
  doc.text('- Credit/Debit Card via Stripe', 15, y + 10);
  doc.text(`- Online: ${BRAND.website}/account/payments`, 15, y + 15);

  addFooter(doc);
  return doc.output('datauristring').split(',')[1]; // base64
}

// ============================================================
// TEMPLATE: RECEIPT
// ============================================================

async function generateReceiptPdf(data: DocumentData): Promise<string> {
  const doc = new jsPDF();
  await registerThaiFont(doc);
  let y = createHeader(doc, 'Receipt / ใบเสร็จรับเงิน', data.documentNo, data.issueDate);
  y = addCompanyInfo(doc, y);
  y = addCustomerInfo(doc, y, data.customer);

  y = addTable(doc, y,
    ['Description', 'Payment Method', 'Amount (THB)'],
    [[
      `Payment for ${data.tour?.tourName || 'Tour'}`,
      data.payment?.paymentMethod || '-',
      formatPrice(data.amount),
    ]],
    [90, 40, 50]
  );

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(`Received: ${formatPrice(data.amount)} THB`, 145, y + 4);

  if (data.payment?.paidAt) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(`Paid At: ${new Date(data.payment.paidAt).toLocaleString('th-TH')}`, 15, y + 12);
  }

  addFooter(doc);
  return doc.output('datauristring').split(',')[1];
}

// ============================================================
// TEMPLATE: VOUCHER
// ============================================================

async function generateVoucherPdf(data: DocumentData): Promise<string> {
  const doc = new jsPDF();
  await registerThaiFont(doc);
  let y = createHeader(doc, 'Travel Voucher', data.documentNo, data.issueDate);
  y = addCompanyInfo(doc, y);
  y = addCustomerInfo(doc, y, data.customer);

  // Tour info
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(data.tour?.tourName || '-', 15, y);
  y += 8;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  if (data.departure?.startDate) doc.text(`Departure: ${new Date(data.departure.startDate).toLocaleDateString('th-TH')}`, 15, y);
  if (data.departure?.endDate) doc.text(`Return: ${new Date(data.departure.endDate).toLocaleDateString('th-TH')}`, 110, y);
  y += 6;
  doc.text(`Booking Ref: ${data.booking?.bookingRef || '-'}`, 15, y);
  y += 10;

  // Traveler list
  if (data.travelers?.length) {
    y = addTable(doc, y,
      ['#', 'Name', 'Passport'],
      data.travelers.map((t: any, i: number) => [
        String(i + 1),
        `${t.firstName || ''} ${t.lastName || ''}`.trim() || '-',
        t.passportNo || '-',
      ]),
      [15, 100, 65]
    );
  }

  // Important notes
  y += 6;
  doc.setFillColor(255, 249, 235);
  doc.rect(15, y, 180, 20, 'F');
  doc.setFontSize(8);
  doc.text('Important: Please bring this voucher and valid passport on the day of departure.', 20, y + 6);
  doc.text('กรุณานำ Voucher นี้และหนังสือเดินทางมาแสดงในวันเดินทาง', 20, y + 12);

  addFooter(doc);
  return doc.output('datauristring').split(',')[1];
}

// ============================================================
// TEMPLATE: BOOKING CONFIRMATION
// ============================================================

async function generateBookingConfirmationPdf(data: DocumentData): Promise<string> {
  const doc = new jsPDF();
  await registerThaiFont(doc);
  let y = createHeader(doc, 'Booking Confirmation', data.documentNo, data.issueDate);
  y = addCompanyInfo(doc, y);
  y = addCustomerInfo(doc, y, data.customer);

  y = addTable(doc, y,
    ['Item', 'Details'],
    [
      ['Tour', data.tour?.tourName || '-'],
      ['Booking Ref', data.booking?.bookingRef || '-'],
      ['Departure', data.departure?.startDate ? new Date(data.departure.startDate).toLocaleDateString('th-TH') : '-'],
      ['Travelers', String(data.travelers?.length || 0)],
      ['Total Price', `${formatPrice(data.booking?.totalPrice || 0)} THB`],
      ['Status', 'CONFIRMED'],
    ],
    [50, 130]
  );

  addFooter(doc);
  return doc.output('datauristring').split(',')[1];
}

// ============================================================
// TEMPLATE: TRAVEL APPOINTMENT (ใบนัดหมายการเดินทาง)
// ============================================================

async function generateTravelAppointmentPdf(data: DocumentData): Promise<string> {
  const doc = new jsPDF();
  await registerThaiFont(doc);
  let y = createHeader(doc, 'Travel Appointment / ใบนัดหมายการเดินทาง', data.documentNo, data.issueDate);
  y = addCompanyInfo(doc, y);
  y = addCustomerInfo(doc, y, data.customer);

  y = addTable(doc, y,
    ['Item', 'Details'],
    [
      ['Tour', data.tour?.tourName || '-'],
      ['Departure Date', data.departure?.startDate ? new Date(data.departure.startDate).toLocaleDateString('th-TH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '-'],
      ['Meeting Point', 'Suvarnabhumi Airport (BKK) — Check-in Counter'],
      ['Meeting Time', '05:00 AM (3 hours before departure)'],
      ['Emergency Contact', `Jongtour: ${BRAND.phone}`],
    ],
    [50, 130]
  );

  y += 6;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Checklist / สิ่งที่ต้องเตรียม:', 15, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  ['Passport (valid 6+ months)', 'Travel Voucher (printed)', 'Travel Insurance', 'Medications / Personal Items', 'Thai Baht / Foreign Currency'].forEach((item, i) => {
    doc.rect(15, y + (i * 5) - 1, 3, 3);
    doc.text(item, 20, y + (i * 5) + 1.5);
  });

  addFooter(doc);
  return doc.output('datauristring').split(',')[1];
}

// ============================================================
// TEMPLATE: TRAVELER LIST
// ============================================================

async function generateTravelerListPdf(data: DocumentData): Promise<string> {
  const doc = new jsPDF('landscape');
  await registerThaiFont(doc);
  let y = 15;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`Traveler List — ${data.tour?.tourName || ''}`, 15, y);
  y += 6;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Document No: ${data.documentNo} | Departure: ${data.departure?.startDate ? new Date(data.departure.startDate).toLocaleDateString('th-TH') : '-'}`, 15, y);
  y += 8;

  if (data.travelers?.length) {
    y = addTable(doc, y,
      ['#', 'Title', 'First Name', 'Last Name', 'DOB', 'Passport No', 'Nationality', 'Phone'],
      data.travelers.map((t: any, i: number) => [
        String(i + 1), t.title || '-', t.firstName || '-', t.lastName || '-',
        t.dateOfBirth ? new Date(t.dateOfBirth).toLocaleDateString('en-GB') : '-',
        t.passportNo || '-', t.nationality || '-', t.phone || '-',
      ]),
      [10, 20, 40, 40, 30, 40, 30, 50]
    );
  }

  addFooter(doc);
  return doc.output('datauristring').split(',')[1];
}

// ============================================================
// TEMPLATE: SUPPLIER CONFIRMATION
// ============================================================

async function generateSupplierConfirmationPdf(data: DocumentData): Promise<string> {
  const doc = new jsPDF();
  await registerThaiFont(doc);
  let y = createHeader(doc, 'Supplier Booking Confirmation', data.documentNo, data.issueDate);
  y = addCompanyInfo(doc, y);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`To: ${data.supplier?.displayName || data.supplier?.name || '-'}`, 15, y);
  y += 10;

  y = addTable(doc, y,
    ['Item', 'Details'],
    [
      ['Tour', data.tour?.tourName || '-'],
      ['Departure', data.departure?.startDate ? new Date(data.departure.startDate).toLocaleDateString('th-TH') : '-'],
      ['Passengers', String(data.travelers?.length || 0)],
      ['Booking Ref', data.booking?.bookingRef || '-'],
    ],
    [50, 130]
  );

  if (data.travelers?.length) {
    y += 4;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Passenger List:', 15, y);
    y += 4;
    y = addTable(doc, y,
      ['#', 'Name', 'Passport'],
      data.travelers.map((t: any, i: number) => [String(i + 1), `${t.firstName || ''} ${t.lastName || ''}`, t.passportNo || '-']),
      [15, 100, 65]
    );
  }

  addFooter(doc);
  return doc.output('datauristring').split(',')[1];
}

// ============================================================
// TEMPLATE: QUOTATION
// ============================================================

async function generateQuotationPdf(data: DocumentData): Promise<string> {
  const doc = new jsPDF();
  await registerThaiFont(doc);
  let y = createHeader(doc, 'Quotation / ใบเสนอราคา', data.documentNo, data.issueDate);
  y = addCompanyInfo(doc, y);

  doc.setFontSize(10);
  doc.text(`Customer: ${data.quotation?.customerName || '-'}`, 15, y);
  if (data.quotation?.customerEmail) doc.text(`Email: ${data.quotation.customerEmail}`, 120, y);
  y += 8;

  y = addTable(doc, y,
    ['Description', 'Pax', 'Unit Price', 'Total (THB)'],
    [[
      data.tour?.tourName || 'Tour Package',
      `Adult: ${data.quotation?.paxAdult || 0}, Child: ${data.quotation?.paxChild || 0}`,
      formatPrice((data.quotation?.totalSellingPrice || 0) / Math.max(data.quotation?.paxAdult || 1, 1)),
      formatPrice(data.quotation?.totalSellingPrice || 0),
    ]],
    [70, 40, 35, 35]
  );

  doc.setFont('helvetica', 'bold');
  doc.text(`Grand Total: ${formatPrice(data.quotation?.totalSellingPrice || 0)} THB`, 145, y + 4);

  y += 14;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(200, 0, 0);
  doc.text(`Valid Until: ${data.quotation?.validUntil ? new Date(data.quotation.validUntil).toLocaleDateString('th-TH') : '-'}`, 15, y);

  addFooter(doc);
  return doc.output('datauristring').split(',')[1];
}

// ============================================================
// TEMPLATE: PRIVATE GROUP PROPOSAL
// ============================================================

async function generatePrivateGroupProposalPdf(data: DocumentData): Promise<string> {
  const doc = new jsPDF();
  await registerThaiFont(doc);
  let y = createHeader(doc, 'Private Group Proposal', data.documentNo, data.issueDate);
  y = addCompanyInfo(doc, y);

  y = addTable(doc, y,
    ['Item', 'Details'],
    [
      ['Customer', data.customerName || '-'],
      ['Destination', data.destination || '-'],
      ['Travelers', `${data.pax || 0} pax`],
      ['Duration', data.duration || '-'],
      ['Estimated Price/Pax', `${formatPrice(data.estimatedPrice || 0)} THB`],
      ['Total Estimated', `${formatPrice((data.estimatedPrice || 0) * (data.pax || 0))} THB`],
    ],
    [60, 120]
  );

  if (data.notes) {
    y += 6;
    doc.setFontSize(8);
    doc.text(`Notes: ${data.notes}`, 15, y);
  }

  y += 10;
  doc.setFontSize(8);
  doc.setTextColor(150, 0, 0);
  doc.text('* This is an estimated price. Final price may vary based on airline, hotel, and season.', 15, y);

  addFooter(doc);
  return doc.output('datauristring').split(',')[1];
}

// ============================================================
// TEMPLATE: PAYMENT REMINDER
// ============================================================

async function generatePaymentReminderPdf(data: DocumentData): Promise<string> {
  const doc = new jsPDF();
  await registerThaiFont(doc);
  let y = createHeader(doc, 'Payment Reminder / แจ้งเตือนชำระเงิน', data.documentNo, data.issueDate);
  y = addCompanyInfo(doc, y);
  y = addCustomerInfo(doc, y, data.customer);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(200, 0, 0);
  doc.text('กรุณาชำระเงินก่อนวันครบกำหนด', 15, y);
  doc.setTextColor(0, 0, 0);
  y += 8;

  if (data.invoices?.length) {
    y = addTable(doc, y,
      ['Invoice No', 'Type', 'Amount (THB)', 'Due Date'],
      data.invoices.map((inv: any) => [
        inv.invoiceNo, inv.invoiceType || 'DEPOSIT',
        formatPrice(inv.totalAmount),
        new Date(inv.dueDate).toLocaleDateString('th-TH'),
      ]),
      [50, 35, 45, 50]
    );
  }

  y += 6;
  doc.setFontSize(8);
  doc.text(`Pay online: ${BRAND.website}/account/payments`, 15, y);

  addFooter(doc);
  return doc.output('datauristring').split(',')[1];
}

// ============================================================
// DISPATCHER
// ============================================================

export async function generateDocumentPdf(docType: string, data: DocumentData): Promise<string> {
  switch (docType) {
    case 'INVOICE': return generateInvoicePdf(data);
    case 'RECEIPT': return generateReceiptPdf(data);
    case 'VOUCHER': return generateVoucherPdf(data);
    case 'BOOKING_CONFIRMATION': return generateBookingConfirmationPdf(data);
    case 'TRAVEL_APPOINTMENT': return generateTravelAppointmentPdf(data);
    case 'TRAVELER_LIST': return generateTravelerListPdf(data);
    case 'SUPPLIER_CONFIRMATION': return generateSupplierConfirmationPdf(data);
    case 'QUOTATION': return generateQuotationPdf(data);
    case 'PRIVATE_GROUP_PROPOSAL': return generatePrivateGroupProposalPdf(data);
    case 'PAYMENT_REMINDER': return generatePaymentReminderPdf(data);
    case 'TAX_INVOICE': return generateInvoicePdf({ ...data, documentNo: data.documentNo });
    case 'WITHHOLDING_CERT': return generateReceiptPdf({ ...data });
    default: throw new Error(`Unknown document type: ${docType}`);
  }
}
