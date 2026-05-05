import { NextRequest, NextResponse } from 'next/server';
import { CRMService } from '@/services/core/CRMService';

export const dynamic = 'force-dynamic';

// POST /api/leads — Capture new lead
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { source, name, phone, email, lineId, interest, tourId, message } = body;

    if (!name) return NextResponse.json({ error: 'name required' }, { status: 400 });

    const result = await CRMService.captureLead(source || 'WEB', {
      name, phone, email, lineId, interest, tourId, message,
    });

    return NextResponse.json({ success: true, data: result });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// GET /api/leads — List leads (for admin/sales)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || undefined;
    const source = searchParams.get('source') || undefined;

    const leads = await CRMService.getLeads({ status, source });
    return NextResponse.json({ success: true, data: leads });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
