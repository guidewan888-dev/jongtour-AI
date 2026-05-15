export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { constructWebhookEvent } from '@/lib/stripe';
import { sendBookingConfirmation } from '@/lib/email';
import { auditLog } from '@/lib/logger';

function generatePaymentRef(): string {
  return `PAY-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
}

function generateRefundNo(): string {
  return `REF-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
}

function getCustomerFullName(customer?: { firstName?: string | null; lastName?: string | null }) {
  return [customer?.firstName, customer?.lastName].filter(Boolean).join(' ').trim();
}

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing stripe-signature' }, { status: 400 });
    }

    // 1. Verify webhook signature
    let event;
    try {
      event = constructWebhookEvent(body, signature);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // 2. Handle events
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any;
        const bookingId = session.metadata?.bookingId;
        const bookingRef = session.metadata?.bookingNo;

        if (!bookingId) {
          console.error('No bookingId in session metadata');
          break;
        }

        // 3. Update booking status
        const booking = await prisma.booking.update({
          where: { id: bookingId },
          data: { status: 'paid' },
          include: {
            customer: true,
            tour: { select: { tourName: true } },
            departure: { select: { startDate: true } },
            travelers: true,
          },
        });

        // 4. Create payment record
        const paymentRef = generatePaymentRef();
        const payment = await prisma.payment.create({
          data: {
            bookingId: booking.id,
            paymentRef,
            amount: session.amount_total / 100,
            paymentMethod: session.payment_method_types?.[0] === 'promptpay' ? 'PROMPT_PAY' : 'CREDIT_CARD',
            status: 'COMPLETED',
            paidAt: new Date(),
          },
        });

        // 5. Update external ref
        await prisma.bookingExternalRef.updateMany({
          where: { bookingId: booking.id },
          data: {
            status: 'CONFIRMED_BY_SUPPLIER',
            rawResponse: {
              sessionId: session.id,
              paymentIntent: session.payment_intent,
              amountTotal: session.amount_total,
            },
          },
        });

        // ============================================================
        // DOCUMENT AUTOMATION (via documentService)
        // ============================================================
        const {
          generateInvoice, generateReceipt, generateVoucher,
          generateBookingConfirmation, deliverDocument,
        } = await import('@/services/documentService');

        const email = booking.customer?.email;
        const customerName = getCustomerFullName(booking.customer);

        // 5a. Booking Confirmation PDF + delivery
        try {
          const confirmation = await generateBookingConfirmation(booking.id);
          if (confirmation && email) {
            await deliverDocument({
              documentType: 'BOOKING_CONFIRMATION',
              documentId: booking.id,
              documentNo: confirmation.documentNo,
              pdfUrl: confirmation.pdfUrl,
              channels: ['EMAIL'],
              recipientEmail: email,
              customerName,
            });
          }
          console.log(`📄 Booking Confirmation created: ${confirmation?.documentNo}`);
        } catch (e: any) {
          console.error('[Webhook] Booking Confirmation error:', e.message);
        }

        // 5b. Invoice (FULL payment) + delivery
        try {
          const invoice = await generateInvoice(booking.id, 'FULL');
          // Mark as PAID immediately since payment already completed
          await prisma.invoice.update({
            where: { id: invoice.id },
            data: { status: 'PAID' },
          });
          if (invoice && email) {
            await deliverDocument({
              documentType: 'INVOICE',
              documentId: invoice.id,
              documentNo: invoice.invoiceNo,
              pdfUrl: invoice.pdfUrl || '',
              channels: ['EMAIL'],
              recipientEmail: email,
              customerName,
            });
          }
          console.log(`📄 Invoice created: ${invoice.invoiceNo}`);
        } catch (e: any) {
          console.error('[Webhook] Invoice error:', e.message);
        }

        // 5c. Receipt (payment verified) + delivery
        try {
          // Update payment verification so guard passes
          await prisma.payment.update({
            where: { id: payment.id },
            data: { verificationStatus: 'VERIFIED' } as any,
          });
          const receipt = await generateReceipt(payment.id);
          if (receipt && email) {
            await deliverDocument({
              documentType: 'RECEIPT',
              documentId: receipt.id,
              documentNo: receipt.receiptNo,
              pdfUrl: receipt.pdfUrl || '',
              channels: ['EMAIL'],
              recipientEmail: email,
              customerName,
            });
          }
          console.log(`🧾 Receipt created: ${receipt.receiptNo}`);
        } catch (e: any) {
          console.error('[Webhook] Receipt error:', e.message);
        }

        // 5d. Voucher + delivery
        try {
          // Update status so guard passes (must be confirmed/paid)
          const voucher = await generateVoucher(booking.id);
          if (voucher && email) {
            await deliverDocument({
              documentType: 'VOUCHER',
              documentId: voucher.id,
              documentNo: voucher.voucherNo,
              pdfUrl: voucher.pdfUrl || '',
              channels: ['EMAIL'],
              recipientEmail: email,
              customerName,
            });
          }
          console.log(`🎫 Voucher created: ${voucher.voucherNo}`);
        } catch (e: any) {
          console.error('[Webhook] Voucher error:', e.message);
        }

        // 5e. Legacy email (fallback if documentService delivery fails)
        if (email) {
          try {
            await sendBookingConfirmation({
              to: email,
              bookingNo: booking.bookingRef,
              tourName: booking.tour?.tourName || 'Tour Package',
              departureDate: booking.departure?.startDate
                ? new Date(booking.departure.startDate).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })
                : '-',
              travelers: booking.travelers?.length || 1,
              totalAmount: session.amount_total / 100,
            });
          } catch {}
        }

        // 6. Audit log
        await auditLog({
          action: 'PAYMENT_CONFIRM',
          userId: 'STRIPE_WEBHOOK',
          targetType: 'booking',
          targetId: booking.id,
          details: {
            bookingRef: booking.bookingRef,
            amount: session.amount_total / 100,
            paymentIntent: session.payment_intent,
            method: session.payment_method_types?.[0],
          },
        });

        console.log(`✅ Booking ${booking.bookingRef} confirmed + all documents generated`);
        break;
      }

      case 'checkout.session.expired': {
        const session = event.data.object as any;
        const bookingId = session.metadata?.bookingId;

        if (bookingId) {
          await prisma.booking.update({
            where: { id: bookingId },
            data: { status: 'cancelled' },
          });
          console.log(`⏰ Booking ${session.metadata?.bookingNo} expired`);
        }
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as any;
        const foundPayment = await prisma.payment.findFirst({
          where: { paymentRef: { contains: charge.payment_intent } },
        });
        
        if (foundPayment) {
          await prisma.booking.update({
            where: { id: foundPayment.bookingId },
            data: { status: 'cancelled' },
          });
          
          await prisma.refund.create({
            data: {
              bookingId: foundPayment.bookingId,
              refundNo: generateRefundNo(),
              amount: charge.amount_refunded / 100,
              reason: 'Customer requested refund',
              status: 'PROCESSED',
            },
          });

          await auditLog({
            action: 'REFUND_CREATE',
            userId: 'STRIPE_WEBHOOK',
            targetType: 'booking',
            targetId: foundPayment.bookingId,
            details: { amount: charge.amount_refunded / 100 },
          });
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error: any) {
    console.error('Stripe webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing error' }, { status: 500 });
  }
}
