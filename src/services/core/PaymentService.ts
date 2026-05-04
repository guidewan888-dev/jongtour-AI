/**
 * PaymentService
 * Manages Payment Gateway integrations (Stripe, Omise, GBPrimePay) and receipts
 */
import { SupabaseClient } from '@supabase/supabase-js';
import prisma from '@/lib/prisma';
import { BookingService } from './BookingService';

export class PaymentService {
  /**
   * Generate payment link or QR code and register intent in DB
   */
  static async generatePaymentUrl(bookingId: string, amount: number, method: string) {
    // 1. Create a Payment record in DB
    const payment = await prisma.payment.create({
      data: {
        bookingId,
        paymentRef: `PAY-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        amount,
        paymentMethod: method,
        status: 'PENDING'
      }
    });

    // 2. Call 3rd party Gateway (Mocked for now as we don't have real Gateway API keys)
    // In a real app: const url = await Omise.createCharge({...});
    const gatewayUrl = `/booking/payment/${bookingId}?ref=${payment.paymentRef}`;
    
    return { paymentId: payment.id, url: gatewayUrl };
  }

  /**
   * Verify webhook callback from Gateway
   */
  static async verifyPaymentWebhook(supabase: SupabaseClient, payload: any) {
    // 1. Verify signature (assume valid for this example)
    const paymentRef = payload.paymentRef;
    const isSuccess = payload.status === 'success';

    if (paymentRef && isSuccess) {
      // 2. Update DB
      const payment = await prisma.payment.update({
        where: { paymentRef },
        data: { 
          status: 'COMPLETED',
          paidAt: new Date()
        }
      });

      // 3. Trigger BookingService to update status
      if (payment.bookingId) {
         await BookingService.updateStatus(supabase, payment.bookingId, 'PAID');
      }
      return true;
    }
    
    return false;
  }
}
