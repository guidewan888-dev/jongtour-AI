export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';
import { NotificationService } from '@/services/core/NotificationService';

/**
 * POST /api/visa/apply — Submit visa application
 * GET /api/visa/apply — Get customer's visa applications
 */
export async function POST(req: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const customer = await prisma.customer.findFirst({ where: { email: user.email } });
    if (!customer) return NextResponse.json({ error: 'Customer not found' }, { status: 404 });

    const body = await req.json();
    const { country, visaType, applicantName, passportNo, travelDate, returnDate, bookingId, notes } = body;

    if (!country || !applicantName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const visa = await prisma.visaApplication.create({
      data: {
        customerId: customer.id,
        bookingId: bookingId || null,
        country,
        visaType: visaType || 'TOURIST',
        applicantName,
        passportNo: passportNo || null,
        travelDate: travelDate ? new Date(travelDate) : null,
        returnDate: returnDate ? new Date(returnDate) : null,
        notes: notes || null,
        status: 'SUBMITTED',
        submittedAt: new Date(),
      },
    });

    // Notify admin via NotificationService
    await NotificationService.adminAlert(
      `New Visa Application: ${applicantName} → ${country} (${visaType || 'TOURIST'})`,
      'INFO'
    );

    // Notify customer
    await NotificationService.visaStatusUpdate(
      { email: customer.email, lineId: customer.lineId || undefined, id: customer.id },
      { country, status: 'SUBMITTED', note: 'คำขอวีซ่าถูกส่งเรียบร้อย อยู่ระหว่างดำเนินการ' }
    );

    return NextResponse.json({ success: true, data: visa });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const customer = await prisma.customer.findFirst({ where: { email: user.email } });
    if (!customer) return NextResponse.json({ error: 'Customer not found' }, { status: 404 });

    const visas = await prisma.visaApplication.findMany({
      where: { customerId: customer.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: visas });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
