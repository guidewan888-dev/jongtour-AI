export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/careers/apply — Submit guide/tour leader application
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { fullName, email, phone, lineId, position, languages, experience, destinations, licenseNo } = body;

    if (!fullName || !email || !phone || !position) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check duplicate
    const existing = await (prisma as any).guideApplication.findFirst({
      where: { email, status: { notIn: ['REJECTED'] } },
    });
    if (existing) {
      return NextResponse.json({ error: 'You already have an active application' }, { status: 409 });
    }

    const app = await (prisma as any).guideApplication.create({
      data: {
        fullName,
        email,
        phone,
        lineId: lineId || null,
        position,
        languages: languages || ['Thai'],
        experience: experience || null,
        destinations: destinations || null,
        licenseNo: licenseNo || null,
        status: 'NEW',
      },
    });

    try {
      const { sendNotificationEmail } = await import('@/lib/email');
      await sendNotificationEmail({
        to: process.env.ADMIN_EMAIL || 'admin@jongtour.com',
        subject: `👤 New Guide Application — ${fullName} (${position})`,
        title: '👤 New Guide Application',
        body: `Name: ${fullName}\nPosition: ${position}\nEmail: ${email}\nPhone: ${phone}\nLanguages: ${JSON.stringify(languages)}`,
      });
    } catch {}

    return NextResponse.json({ success: true, data: { id: app.id, status: app.status } });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * GET /api/careers/apply?email=xxx — Check application status by email
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 });

    const apps = await (prisma as any).guideApplication.findMany({
      where: { email },
      orderBy: { createdAt: 'desc' },
      select: { id: true, fullName: true, position: true, status: true, interviewDate: true, createdAt: true },
    });

    return NextResponse.json({ success: true, data: apps });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
