import { NextRequest, NextResponse } from 'next/server';
import { ReportService } from '@/services/core/ReportService';

export const dynamic = 'force-dynamic';

// GET /api/admin/reports?type=dashboard|revenue|tours|payments|affiliates|talents|trend|visa
export async function GET(req: NextRequest) {
  try {
    const type = new URL(req.url).searchParams.get('type') || 'dashboard';
    const from = new URL(req.url).searchParams.get('from');
    const to = new URL(req.url).searchParams.get('to');
    const dateFrom = from ? new Date(from) : undefined;
    const dateTo = to ? new Date(to) : undefined;

    let data: any;

    switch (type) {
      case 'dashboard':
        data = await ReportService.getDashboardKPIs(dateFrom, dateTo);
        break;
      case 'revenue':
        data = await ReportService.getRevenueBySource(dateFrom, dateTo);
        break;
      case 'tours':
        data = await ReportService.getTopTours();
        break;
      case 'payments':
        data = await ReportService.getPaymentMethods();
        break;
      case 'affiliates':
        data = await ReportService.getAffiliateReport();
        break;
      case 'talents':
        data = await ReportService.getTalentReport();
        break;
      case 'trend':
        data = await ReportService.getMonthlyRevenueTrend();
        break;
      case 'visa':
        data = await ReportService.getVisaReport();
        break;
      default:
        return NextResponse.json({ error: 'Invalid report type' }, { status: 400 });
    }

    return NextResponse.json({ success: true, type, data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
