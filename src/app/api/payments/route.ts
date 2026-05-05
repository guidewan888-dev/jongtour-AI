import { NextRequest, NextResponse } from 'next/server';
import { PaymentService } from '@/services/core/PaymentService';

// POST /api/payments — Create payment
export async function POST(req: NextRequest) {
  try {
    const { bookingId, amount, method } = await req.json();
    if (!bookingId || !amount || !method) {
      return NextResponse.json({ error: 'bookingId, amount, method required' }, { status: 400 });
    }
    const result = await PaymentService.createPayment(bookingId, amount, method);
    return NextResponse.json({ success: true, data: result });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// GET /api/payments?ref=xxx — Get payment status
export async function GET(req: NextRequest) {
  try {
    const ref = new URL(req.url).searchParams.get('ref');
    if (!ref) return NextResponse.json({ error: 'ref required' }, { status: 400 });
    const payment = await PaymentService.getPayment(ref);
    if (!payment) return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: payment });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
