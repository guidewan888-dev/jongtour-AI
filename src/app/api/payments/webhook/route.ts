import { NextRequest, NextResponse } from 'next/server';
import { PaymentService } from '@/services/core/PaymentService';

// POST /api/payments/webhook — Omise/Stripe webhook
export async function POST(req: NextRequest) {
  try {
    const provider = new URL(req.url).searchParams.get('provider') || 'omise';
    const payload = await req.json();
    const result = await PaymentService.processWebhook(provider, payload);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
