export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * PATCH /api/careers/[id] — Admin update application (status, interview, notes)
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await req.json();
    const { status, interviewDate, interviewNotes, adminNotes, reviewedBy } = body;

    const updateData: any = { updatedAt: new Date() };
    if (status) updateData.status = status;
    if (interviewDate) updateData.interviewDate = new Date(interviewDate);
    if (interviewNotes !== undefined) updateData.interviewNotes = interviewNotes;
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes;
    if (reviewedBy) updateData.reviewedBy = reviewedBy;

    const app = await (prisma as any).guideApplication.update({
      where: { id },
      data: updateData,
    });

    // Notify applicant
    if (status) {
      try {
        const { sendNotificationEmail } = await import('@/lib/email');
        const statusMsg: Record<string, string> = {
          SCREENING: 'เรากำลังตรวจสอบใบสมัครของคุณ',
          INTERVIEW_SCHEDULED: `เราขอนัดสัมภาษณ์คุณในวันที่ ${interviewDate ? new Date(interviewDate).toLocaleDateString('th-TH') : 'จะแจ้งภายหลัง'}`,
          ACCEPTED: '🎉 ยินดีด้วย! คุณผ่านการคัดเลือก เราจะติดต่อกลับเพื่อเริ่มงาน',
          REJECTED: 'ขอบคุณที่สนใจ แต่เราขอสงวนสิทธิ์ในครั้งนี้',
        };
        if (statusMsg[status]) {
          await sendNotificationEmail({
            to: app.email,
            subject: `👤 Jongtour — อัปเดตสถานะใบสมัคร`,
            title: '👤 อัปเดตสถานะใบสมัคร',
            body: `สวัสดีคุณ${app.fullName}\n\n${statusMsg[status]}\n\nทีมงาน Jongtour`,
          });
        }
      } catch {}
    }

    return NextResponse.json({ success: true, data: app });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
