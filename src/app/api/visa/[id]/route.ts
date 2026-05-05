export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/visa/[id] — Get visa application detail
 * PATCH /api/visa/[id] — Update status (admin)
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const visa = await (prisma as any).visaApplication.findUniqueOrThrow({
      where: { id },
      include: { customer: true },
    });
    return NextResponse.json({ success: true, data: visa });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 404 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await req.json();
    const { status, adminNotes, rejectionReason, reviewedBy } = body;

    const updateData: any = { updatedAt: new Date() };
    if (status) updateData.status = status;
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes;
    if (rejectionReason !== undefined) updateData.rejectionReason = rejectionReason;
    if (reviewedBy) updateData.reviewedBy = reviewedBy;
    if (['APPROVED', 'REJECTED'].includes(status)) updateData.reviewedAt = new Date();

    const visa = await (prisma as any).visaApplication.update({
      where: { id },
      data: updateData,
    });

    // Notify customer on status change
    if (status && visa.customerId) {
      try {
        const customer = await prisma.customer.findUnique({ where: { id: visa.customerId } });
        if (customer?.email) {
          const { sendNotificationEmail } = await import('@/lib/email');
          const statusLabel = status === 'APPROVED' ? '✅ อนุมัติ' : status === 'REJECTED' ? '❌ ไม่อนุมัติ' : `📋 ${status}`;
          await sendNotificationEmail({
            to: customer.email,
            subject: `🛂 Visa ${visa.country} — ${statusLabel}`,
            title: `🛂 Visa ${visa.country}`,
            body: `สถานะวีซ่า ${visa.country} ของคุณอัปเดตเป็น: ${statusLabel}${rejectionReason ? `\nเหตุผล: ${rejectionReason}` : ''}`,
          });
        }
      } catch {}
    }

    return NextResponse.json({ success: true, data: visa });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
