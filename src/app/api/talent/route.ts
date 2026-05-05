import { NextRequest, NextResponse } from 'next/server';
import { TalentService } from '@/services/core/TalentService';

/**
 * GET /api/talent — List talents (directory)
 * POST /api/talent — Submit guide request
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tier = searchParams.get('tier') || undefined;
    const region = searchParams.get('region') || undefined;
    const search = searchParams.get('q') || undefined;

    const talents = await TalentService.listTalents({ tier, region, search, status: 'ACTIVE' });

    return NextResponse.json({
      success: true,
      disclaimer: "การ request ไกด์เป็นแบบ best-effort ไม่รับประกันว่าจะได้ไกด์ท่านที่เลือก",
      data: talents,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { talentId, bookingId, bookingType, travelDate, daysCount, paxCount, language, message, backupTalentId } = body;

    if (!talentId || !bookingType || !travelDate) {
      return NextResponse.json({ error: 'Missing required fields: talentId, bookingType, travelDate' }, { status: 400 });
    }

    // Check availability
    const endDate = new Date(travelDate);
    endDate.setDate(endDate.getDate() + (daysCount || 1));
    const { available, conflicts } = await TalentService.checkAvailability(talentId, new Date(travelDate), endDate);

    // Create request (even if not available — admin will review)
    const request = await TalentService.createRequest({
      talentId,
      bookingId,
      bookingType,
      travelDate: new Date(travelDate),
      daysCount: daysCount || 1,
      paxCount: paxCount || 1,
      language: language || 'TH',
      message,
      backupTalentId,
    });

    return NextResponse.json({
      success: true,
      data: {
        requestId: request.id,
        requestRef: request.requestRef,
        status: request.status,
        talentAvailable: available,
        conflictCount: conflicts.length,
        disclaimer: 'ไม่รับประกันว่าจะได้ไกด์ท่านที่เลือก — admin จะแจ้งผลภายใน 24 ชม.',
        sla: '24h',
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
