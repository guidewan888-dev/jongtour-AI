import { NextRequest, NextResponse } from 'next/server';
import { PaymentService } from '@/services/core/PaymentService';

// POST /api/payments/slip — Upload slip
export async function POST(req: NextRequest) {
  try {
    const { paymentRef, slipUrl } = await req.json();
    if (!paymentRef || !slipUrl) return NextResponse.json({ error: 'paymentRef, slipUrl required' }, { status: 400 });
    const result = await PaymentService.uploadSlip(paymentRef, slipUrl);
    return NextResponse.json({ success: true, data: result });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
