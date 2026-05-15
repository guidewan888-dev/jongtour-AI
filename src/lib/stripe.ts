import Stripe from 'stripe';

// ============================================================
// STRIPE CLIENT — Lazy initialization for build safety
// ============================================================

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error('STRIPE_SECRET_KEY is not set');
    _stripe = new Stripe(key, { apiVersion: '2026-04-22.dahlia' });
  }
  return _stripe;
}

// ============================================================
// CHECKOUT SESSION
// ============================================================

export interface CreateCheckoutParams {
  bookingId: string;
  bookingNo: string;
  tourName: string;
  customerEmail: string;
  amount: number; // in THB (e.g. 28900)
  travelers: number;
  departureDate: string;
  successUrl: string;
  cancelUrl: string;
}

export async function createCheckoutSession(params: CreateCheckoutParams): Promise<{ sessionId: string; url: string }> {
  const stripe = getStripe();

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card', 'promptpay'],
    mode: 'payment',
    customer_email: params.customerEmail,
    line_items: [
      {
        price_data: {
          currency: 'thb',
          product_data: {
            name: params.tourName,
            description: `${params.travelers} ผู้เดินทาง • วันที่ ${params.departureDate}`,
          },
          unit_amount: Math.round(params.amount * 100), // Stripe uses smallest unit (satang)
        },
        quantity: 1,
      },
    ],
    metadata: {
      bookingId: params.bookingId,
      bookingNo: params.bookingNo,
    },
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    locale: 'th',
    expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // 30 min expiry
  });

  return {
    sessionId: session.id,
    url: session.url || '',
  };
}

// ============================================================
// WEBHOOK SIGNATURE VERIFICATION
// ============================================================

export function constructWebhookEvent(body: string, signature: string): Stripe.Event {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) throw new Error('STRIPE_WEBHOOK_SECRET is not set');

  return stripe.webhooks.constructEvent(body, signature, webhookSecret);
}

// ============================================================
// REFUND
// ============================================================

export async function createRefund(paymentIntentId: string, amount?: number): Promise<Stripe.Refund> {
  const stripe = getStripe();
  return stripe.refunds.create({
    payment_intent: paymentIntentId,
    amount: amount ? Math.round(amount * 100) : undefined, // full refund if no amount
  });
}
