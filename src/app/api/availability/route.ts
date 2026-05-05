import { NextRequest, NextResponse } from 'next/server';
import { AvailabilityService } from '@/services/core/AvailabilityService';

export const dynamic = 'force-dynamic';

// GET /api/availability?departureId=xxx&seats=2
export async function GET(req: NextRequest) {
  try {
    const departureId = new URL(req.url).searchParams.get('departureId');
    const seats = Number(new URL(req.url).searchParams.get('seats') || '1');

    if (!departureId) return NextResponse.json({ error: 'departureId required' }, { status: 400 });

    const result = await AvailabilityService.checkAvailability(departureId, seats);
    return NextResponse.json({ success: true, ...result });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/availability — Hold seats
export async function POST(req: NextRequest) {
  try {
    const { departureId, seats, holdMinutes } = await req.json();
    if (!departureId) return NextResponse.json({ error: 'departureId required' }, { status: 400 });

    const result = await AvailabilityService.holdSeats(departureId, seats || 1, holdMinutes || 30);
    return NextResponse.json({ success: true, ...result });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
