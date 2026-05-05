import { NextRequest, NextResponse } from 'next/server';
import { PricingService } from '@/services/core/PricingService';

// POST /api/bookings/coupon — Apply coupon code
export async function POST(req: NextRequest) {
  try {
    const { code, amount } = await req.json();
    if (!code || !amount) return NextResponse.json({ error: 'code and amount required' }, { status: 400 });

    const result = await PricingService.applyCoupon(code, amount);
    return NextResponse.json({ success: true, data: result });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
