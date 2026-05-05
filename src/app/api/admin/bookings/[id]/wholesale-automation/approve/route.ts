export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auditLog } from '@/lib/logger';
import crypto from 'crypto';

/**
 * POST /api/admin/bookings/[id]/wholesale-automation/approve
 * Admin approves submission — generates one-time approval token
 * submit_wholesale_booking ต้อง require admin_approval_token
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: bookingId } = await params;
  try {
    const { sessionId, approvedBy } = await req.json();

    if (!sessionId || !approvedBy) {
      return NextResponse.json({ success: false, error: 'Missing sessionId or approvedBy' }, { status: 400 });
    }

    const session = await (prisma as any).wholesaleRpaSession.findUniqueOrThrow({
      where: { id: sessionId },
    });

    if (session.status !== 'WAITING_ADMIN_APPROVAL') {
      return NextResponse.json({
        success: false,
        error: `Session is ${session.status} — can only approve when WAITING_ADMIN_APPROVAL`,
      }, { status: 400 });
    }

    // Generate one-time approval token (expires in 10 min)
    const approvalToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await (prisma as any).wholesaleRpaSession.update({
      where: { id: sessionId },
      data: {
        adminApprovedBy: approvedBy,
        adminApprovedAt: new Date(),
        // Store token in errorMessage field temporarily (will be cleared after submit)
        errorMessage: JSON.stringify({ approvalToken, tokenExpiry: tokenExpiry.toISOString() }),
      },
    });

    // Log approval action
    await (prisma as any).wholesaleRpaAction.create({
      data: {
        sessionId,
        bookingId,
        actionType: 'ADMIN_APPROVE',
        actionStatus: 'SUCCESS',
        inputSummary: `Approved by ${approvedBy}`,
      },
    });

    await auditLog({
      action: 'RPA_ADMIN_APPROVE',
      userId: approvedBy,
      targetType: 'wholesale_rpa_session',
      targetId: sessionId,
      details: { bookingId, tokenExpiry: tokenExpiry.toISOString() },
    });

    return NextResponse.json({
      success: true,
      approvalToken,
      tokenExpiry: tokenExpiry.toISOString(),
      message: 'Approval granted — use this token to submit within 10 minutes',
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
