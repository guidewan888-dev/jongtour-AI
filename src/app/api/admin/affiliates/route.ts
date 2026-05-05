import { NextRequest, NextResponse } from 'next/server';
import { AffiliateService } from '@/services/core/AffiliateService';

// GET /api/admin/affiliates — List all affiliates
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const affiliates = await AffiliateService.listAffiliates({
      type: searchParams.get('type') || undefined,
      tier: searchParams.get('tier') || undefined,
      status: searchParams.get('status') || undefined,
      search: searchParams.get('q') || undefined,
    });
    return NextResponse.json({ success: true, data: affiliates });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/admin/affiliates — Create new affiliate
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const affiliate = await AffiliateService.createAffiliate(body);
    return NextResponse.json({ success: true, data: affiliate });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
