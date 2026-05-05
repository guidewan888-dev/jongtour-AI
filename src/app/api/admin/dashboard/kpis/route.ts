import { NextRequest, NextResponse } from 'next/server';
import { AffiliateService } from '@/services/core/AffiliateService';
import { TalentService } from '@/services/core/TalentService';

/**
 * GET /api/admin/dashboard/kpis — Combined dashboard KPIs
 */
export async function GET() {
  try {
    const [affiliateKpis, talentKpis] = await Promise.all([
      AffiliateService.getDashboardKpis(),
      TalentService.getDashboardKpis(),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        affiliate: affiliateKpis,
        talent: talentKpis,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
