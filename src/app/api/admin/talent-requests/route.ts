import { NextRequest, NextResponse } from 'next/server';
import { TalentService } from '@/services/core/TalentService';

// GET /api/admin/talent-requests — List all talent requests
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const requests = await TalentService.listRequests({
      status: searchParams.get('status') || undefined,
      talentId: searchParams.get('talentId') || undefined,
    });
    return NextResponse.json({ success: true, data: requests });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/admin/talent-requests — Update request status (admin action)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { requestId, action, premium, surcharge, discount, note, assignedTalentId } = body;

    if (!requestId || !action) {
      return NextResponse.json({ error: 'requestId and action required' }, { status: 400 });
    }

    let result;

    switch (action) {
      case 'CONFIRM':
        // Set pricing if provided
        if (premium !== undefined) {
          await TalentService.setPricingOverride(requestId, premium || 0, surcharge || 0, discount || 0, note);
        }
        result = await TalentService.updateRequestStatus(requestId, 'CONFIRMED', {
          assignedTalentId,
        });
        break;

      case 'NOTIFY_TALENT':
        result = await TalentService.updateRequestStatus(requestId, 'TALENT_NOTIFIED');
        break;

      case 'OFFER_ALTERNATIVES':
        result = await TalentService.updateRequestStatus(requestId, 'ALTERNATIVE_OFFERED', {
          adminNote: note,
        });
        break;

      case 'AUTO_ASSIGN':
        result = await TalentService.updateRequestStatus(requestId, 'AUTO_ASSIGNED', {
          assignedTalentId,
          adminNote: note,
        });
        break;

      case 'CANCEL':
        result = await TalentService.updateRequestStatus(requestId, 'FULL_CANCEL', {
          cancelReason: note,
          refundAmount: premium || 0,
        });
        break;

      case 'COMPLETE':
        result = await TalentService.updateRequestStatus(requestId, 'COMPLETED');
        break;

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: result });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
