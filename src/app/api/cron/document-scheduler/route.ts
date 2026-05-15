export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/cron/document-scheduler
 * Automated document generation cron job:
 * - Payment Reminder: 3 days before invoice due date
 * - Travel Appointment: 7 days before departure
 * - Invoice Balance: auto after deposit is paid
 * 
 * Run via Vercel Cron or external scheduler (daily at 9 AM)
 */
export async function GET(req: Request) {
  try {
    // Verify cron secret
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const results: any[] = [];
    const now = new Date();
    const threeDaysLater = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const { generatePaymentReminder, generateTravelAppointment, generateInvoice, deliverDocument } = await import('@/services/documentService');
    const fullName = (customer?: { firstName?: string | null; lastName?: string | null }) =>
      [customer?.firstName, customer?.lastName].filter(Boolean).join(' ').trim();

    // === 1. PAYMENT REMINDERS (3 days before due) ===
    const unpaidInvoices = await prisma.invoice.findMany({
      where: {
        status: 'UNPAID',
        dueDate: { lte: threeDaysLater, gte: now },
      },
      include: { booking: { include: { customer: true } } },
    });

    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    for (const inv of unpaidInvoices) {
      try {
        // Dedup: skip if already sent today for this invoice
        const existingReminder = await (prisma as any).documentDeliveryLog.findFirst({
          where: { documentType: 'PAYMENT_REMINDER', documentId: inv.id, status: 'SENT', sentAt: { gte: todayStart } },
        });
        if (existingReminder) continue;

        const reminder = await generatePaymentReminder(inv.bookingId);
        if (reminder && inv.booking.customer?.email) {
          await deliverDocument({
            documentType: 'PAYMENT_REMINDER',
            documentId: inv.id,
            documentNo: reminder.documentNo,
            pdfUrl: reminder.pdfUrl,
            channels: ['EMAIL'],
            recipientEmail: inv.booking.customer.email,
            customerName: fullName(inv.booking.customer),
          });
          results.push({ type: 'PAYMENT_REMINDER', invoiceNo: inv.invoiceNo, status: 'SENT' });
        }
      } catch (e: any) {
        results.push({ type: 'PAYMENT_REMINDER', invoiceNo: inv.invoiceNo, error: e.message });
      }
    }

    // === 2. TRAVEL APPOINTMENTS (7 days before departure) ===
    const upcomingBookings = await prisma.booking.findMany({
      where: {
        status: { in: ['confirmed', 'paid', 'voucher_issued'] },
        departure: {
          startDate: { lte: sevenDaysLater, gte: now },
        },
      },
      include: { customer: true, departure: true },
    });

    for (const booking of upcomingBookings) {
      try {
        // Check if already sent
        const existingLog = await (prisma as any).documentDeliveryLog.findFirst({
          where: { documentType: 'TRAVEL_APPOINTMENT', documentId: booking.id, status: 'SENT' },
        });
        if (existingLog) continue; // Already sent

        const doc = await generateTravelAppointment(booking.id);
        if (doc && booking.customer?.email) {
          await deliverDocument({
            documentType: 'TRAVEL_APPOINTMENT',
            documentId: booking.id,
            documentNo: doc.documentNo,
            pdfUrl: doc.pdfUrl,
            channels: ['EMAIL'],
            recipientEmail: booking.customer.email,
            customerName: fullName(booking.customer),
          });
          results.push({ type: 'TRAVEL_APPOINTMENT', bookingRef: booking.bookingRef, status: 'SENT' });
        }
      } catch (e: any) {
        results.push({ type: 'TRAVEL_APPOINTMENT', bookingRef: booking.bookingRef, error: e.message });
      }
    }

    // === 3. AUTO BALANCE INVOICE (after deposit paid) ===
    const depositPaidBookings = await prisma.booking.findMany({
      where: {
        status: { in: ['payment_pending', 'paid'] },
        invoices: {
          some: { invoiceType: 'DEPOSIT', status: 'PAID' },
          none: { invoiceType: 'BALANCE' },
        },
      },
      include: { customer: true, invoices: true },
    });

    for (const booking of depositPaidBookings) {
      try {
        const balanceInvoice = await generateInvoice(booking.id, 'BALANCE');
        if (balanceInvoice && booking.customer?.email) {
          await deliverDocument({
            documentType: 'INVOICE',
            documentId: balanceInvoice.id,
            documentNo: balanceInvoice.invoiceNo,
            pdfUrl: balanceInvoice.pdfUrl || '',
            channels: ['EMAIL'],
            recipientEmail: booking.customer.email,
            customerName: fullName(booking.customer),
          });
          results.push({ type: 'BALANCE_INVOICE', bookingRef: booking.bookingRef, status: 'SENT' });
        }
      } catch (e: any) {
        results.push({ type: 'BALANCE_INVOICE', bookingRef: booking.bookingRef, error: e.message });
      }
    }

    return NextResponse.json({
      success: true,
      processed: results.length,
      results,
      timestamp: now.toISOString(),
    });
  } catch (err: any) {
    console.error('[Doc Scheduler]', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
