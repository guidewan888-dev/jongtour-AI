import { NextRequest, NextResponse } from 'next/server';
import { TalentService } from '@/services/core/TalentService';

// GET /api/admin/talents — List all talents
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const talents = await TalentService.listTalents({
      tier: searchParams.get('tier') || undefined,
      status: searchParams.get('status') || undefined,
      region: searchParams.get('region') || undefined,
      search: searchParams.get('q') || undefined,
    });
    return NextResponse.json({ success: true, data: talents });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/admin/talents — Create new talent  
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const talent = await TalentService.createTalent(body);
    return NextResponse.json({ success: true, data: talent });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
