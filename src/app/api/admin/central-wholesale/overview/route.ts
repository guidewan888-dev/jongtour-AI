import { NextResponse } from 'next/server';
import { getCentralOverview } from '@/services/central-wholesale.service';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Number(searchParams.get('limit') || 50);
    const data = await getCentralOverview(Number.isFinite(limit) ? Math.max(1, Math.min(limit, 200)) : 50);
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to load overview' }, { status: 500 });
  }
}
