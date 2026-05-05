import { NextRequest, NextResponse } from 'next/server';
import { AffiliateService } from '@/services/core/AffiliateService';

/**
 * GET /api/affiliate/track?ref=XXX — Track affiliate click
 * POST /api/affiliate/calculate-commission — Calculate commission for a booking
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const ref = searchParams.get('ref');
    const coupon = searchParams.get('coupon');

    if (!ref && !coupon) {
      return NextResponse.json({ error: 'ref or coupon required' }, { status: 400 });
    }

    // Track click
    const affiliates = await AffiliateService.listAffiliates({
      search: ref || coupon || '',
    });

    if (affiliates.length === 0) {
      return NextResponse.json({ error: 'Invalid referral code' }, { status: 404 });
    }

    const affiliate = affiliates[0];
    await AffiliateService.trackClick({
      affiliate: { connect: { id: affiliate.id } },
      referralCode: ref || affiliate.referralCode,
      couponCode: coupon,
      sourceUrl: searchParams.get('source') || undefined,
      landingUrl: searchParams.get('landing') || undefined,
    });

    return NextResponse.json({
      success: true,
      affiliateId: affiliate.id,
      cookieDays: affiliate.cookieDays,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { affiliateId, bookingValue, productType } = body;

    if (!affiliateId || !bookingValue || !productType) {
      return NextResponse.json({ error: 'affiliateId, bookingValue, productType required' }, { status: 400 });
    }

    const result = await AffiliateService.calculateCommission(affiliateId, bookingValue, productType);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
