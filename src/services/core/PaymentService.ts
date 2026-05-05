/**
 * PaymentService — Multi-gateway payment integration
 * Supports: PromptPay QR, Bank Transfer, Credit Card (Omise/Stripe)
 */
import { prisma } from '@/lib/prisma';
import { NotificationService } from './NotificationService';

const OMISE_SECRET = process.env.OMISE_SECRET_KEY || '';
const OMISE_PUBLIC = process.env.NEXT_PUBLIC_OMISE_PUBLIC_KEY || '';
const PROMPTPAY_ID = process.env.PROMPTPAY_ID || '0812345678'; // Phone or Tax ID
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://jongtour.com';

// ─── PromptPay QR Generator (EMVCo standard) ──────────
function crc16(data: string): string {
  let crc = 0xFFFF;
  for (let i = 0; i < data.length; i++) {
    crc ^= data.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
      crc &= 0xFFFF;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

function formatTLV(id: string, value: string): string {
  return id + value.length.toString().padStart(2, '0') + value;
}

export function generatePromptPayQRData(amount: number, ppId?: string): string {
  const id = ppId || PROMPTPAY_ID;
  const isPhone = id.length <= 13 && !id.includes('-');

  // Format phone: 0066812345678
  let aid: string;
  if (isPhone) {
    const phone = id.replace(/^0/, '66').replace(/-/g, '');
    aid = formatTLV('00', 'A000000677010111') + formatTLV('01', phone);
  } else {
    // Tax ID
    aid = formatTLV('00', 'A000000677010112') + formatTLV('02', id);
  }

  let payload = '';
  payload += formatTLV('00', '01'); // Payload Format Indicator
  payload += formatTLV('01', '12'); // Dynamic QR (one-time)
  payload += formatTLV('29', aid); // Merchant Account Info (PromptPay)
  payload += formatTLV('53', '764'); // Currency: THB
  payload += formatTLV('54', amount.toFixed(2)); // Amount
  payload += formatTLV('58', 'TH'); // Country
  payload += formatTLV('62', formatTLV('05', `JONGTOUR${Date.now().toString(36).slice(-4).toUpperCase()}`)); // Reference
  payload += '6304'; // CRC placeholder

  const checksum = crc16(payload);
  return payload + checksum;
}

// ─── Main Service ──────────────────────────────────────
export class PaymentService {

  /** Create payment intent and return appropriate response */
  static async createPayment(bookingId: string, amount: number, method: string) {
    const paymentRef = `PAY-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 9000 + 1000)}`;

    const payment = await prisma.payment.create({
      data: { bookingId, paymentRef, amount, paymentMethod: method, status: 'PENDING' },
    });

    let result: any = { paymentId: payment.id, paymentRef, method };

    switch (method) {
      case 'PROMPT_PAY': {
        const qrData = generatePromptPayQRData(amount);
        result.qrData = qrData;
        result.qrUrl = `https://promptpay.io/${PROMPTPAY_ID}/${amount.toFixed(2)}`;
        result.expiresIn = 900; // 15 min
        result.instructions = 'สแกน QR Code ด้วยแอปธนาคาร แล้วแนบสลิป';
        break;
      }
      case 'BANK_TRANSFER': {
        result.bankInfo = {
          bankName: 'ธนาคารกสิกรไทย (KBank)',
          accountNo: '123-4-56789-0',
          accountName: 'บจก. จองทัวร์',
          branch: 'สำนักงานใหญ่',
        };
        result.instructions = 'โอนเงินแล้วแนบสลิปในระบบ ภายใน 24 ชม.';
        break;
      }
      case 'CREDIT_CARD': {
        if (OMISE_SECRET) {
          // Real Omise charge
          const charge = await this.createOmiseCharge(amount, paymentRef);
          result.chargeId = charge.id;
          result.authorizeUri = charge.authorize_uri;
        } else {
          // Mock
          result.redirectUrl = `${SITE_URL}/book/payment/confirm?ref=${paymentRef}&mock=1`;
        }
        break;
      }
      case 'INSTALLMENT': {
        result.redirectUrl = `${SITE_URL}/book/payment/installment?ref=${paymentRef}`;
        result.plans = [
          { months: 3, monthlyAmount: Math.ceil(amount / 3), interest: 0 },
          { months: 6, monthlyAmount: Math.ceil(amount / 6), interest: 0 },
          { months: 10, monthlyAmount: Math.ceil(amount / 10), interest: 0 },
        ];
        break;
      }
    }

    return result;
  }

  /** Upload payment slip (bank transfer) */
  static async uploadSlip(paymentRef: string, slipUrl: string) {
    return prisma.payment.update({
      where: { paymentRef },
      data: { slipUrl, verificationStatus: 'UPLOADED' },
    });
  }

  /** Admin verify slip */
  static async verifySlip(paymentRef: string, approved: boolean, note?: string) {
    const payment = await prisma.payment.update({
      where: { paymentRef },
      data: {
        verificationStatus: approved ? 'VERIFIED' : 'REJECTED',
        status: approved ? 'COMPLETED' : 'FAILED',
        paidAt: approved ? new Date() : undefined,
      },
    });

    if (approved && payment.bookingId) {
      await prisma.booking.update({
        where: { id: payment.bookingId },
        data: { status: 'paid' },
      });

      // Send notification
      const booking = await prisma.booking.findUnique({
        where: { id: payment.bookingId },
        include: { customer: true, tour: true },
      });
      if (booking?.customer) {
        await NotificationService.paymentReceived(
          { email: booking.customer.email, lineId: booking.customer.lineId || undefined, id: booking.customer.id },
          { bookingRef: booking.bookingRef, amount: `฿${payment.amount.toLocaleString()}`, method: payment.paymentMethod }
        );
      }
    }

    return payment;
  }

  /** Process webhook from Omise/Stripe */
  static async processWebhook(provider: string, payload: any) {
    if (provider === 'omise') {
      const event = payload.data;
      if (event?.object === 'charge' && event.status === 'successful') {
        const paymentRef = event.metadata?.paymentRef;
        if (paymentRef) {
          const payment = await prisma.payment.update({
            where: { paymentRef },
            data: { status: 'COMPLETED', paidAt: new Date() },
          });
          if (payment.bookingId) {
            await prisma.booking.update({
              where: { id: payment.bookingId },
              data: { status: 'paid' },
            });
          }
          return { success: true, paymentRef };
        }
      }
    }
    return { success: false };
  }

  /** Omise charge creation */
  private static async createOmiseCharge(amount: number, paymentRef: string) {
    const res = await fetch('https://api.omise.co/charges', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(OMISE_SECRET + ':').toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amount * 100, // satang
        currency: 'thb',
        return_uri: `${SITE_URL}/book/payment/confirm?ref=${paymentRef}`,
        metadata: { paymentRef },
      }),
    });
    return res.json();
  }

  /** Get payment status */
  static async getPayment(paymentRef: string) {
    return prisma.payment.findUnique({
      where: { paymentRef },
      include: { booking: { select: { bookingRef: true, totalPrice: true, status: true } } },
    });
  }

  /** List payments (admin) */
  static async listPayments(filters?: { status?: string; method?: string; bookingId?: string }) {
    return prisma.payment.findMany({
      where: {
        ...(filters?.status && { status: filters.status }),
        ...(filters?.method && { paymentMethod: filters.method }),
        ...(filters?.bookingId && { bookingId: filters.bookingId }),
      },
      include: { booking: { select: { bookingRef: true, customer: { select: { firstName: true, lastName: true } } } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  /** Process refund */
  static async processRefund(bookingId: string, amount: number, reason: string) {
    const refundNo = `RF-${Date.now().toString(36).toUpperCase()}`;
    return prisma.refund.create({
      data: { bookingId, refundNo, amount, reason, status: 'PENDING' },
    });
  }
}
