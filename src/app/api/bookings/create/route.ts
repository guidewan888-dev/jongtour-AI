export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createCheckoutSession } from '@/lib/stripe';
import { validateRequest, createBookingSchema } from '@/lib/validators';
import { auditLog } from '@/lib/logger';

function generateBookingRef(): string {
  const prefix = 'JT';
  const date = new Date().toISOString().slice(2, 10).replace(/-/g, '');
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}${date}${rand}`;
}

function generatePaymentRef(): string {
  return `PAY-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
}

export async function POST(req: Request) {
  try {
    // 1. Validate input
    const body = await req.json();
    const validation = validateRequest(createBookingSchema, body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }
    const data = validation.data;

    // 2. Verify tour and departure exist
    const tour = await prisma.tour.findUnique({
      where: { id: data.tourId },
      select: { id: true, tourName: true, tourCode: true, supplierId: true },
    });
    if (!tour) {
      return NextResponse.json({ error: 'Tour not found' }, { status: 404 });
    }

    const departure = await prisma.departure.findUnique({
      where: { id: data.departureId },
      include: { prices: true },
    });
    if (!departure) {
      return NextResponse.json({ error: 'Departure not found' }, { status: 404 });
    }

    // 3. Calculate total from real prices
    const adultPrice = departure.prices?.find((p: any) => p.paxType === 'ADULT')?.sellingPrice || departure.prices?.[0]?.sellingPrice || 0;
    const childPrice = departure.prices?.find((p: any) => p.paxType === 'CHILD')?.sellingPrice || adultPrice;
    
    const childTitles = ['เด็กชาย', 'เด็กหญิง', 'Master', 'Miss'];
    const adults = data.travelers.filter((t: any) => !childTitles.includes(t.titleTh));
    const children = data.travelers.filter((t: any) => childTitles.includes(t.titleTh));
    
    const totalPrice = (adults.length * adultPrice) + (children.length * childPrice);

    // 4. Find or create customer
    let customer = await prisma.customer.findFirst({
      where: { email: data.contactEmail },
    });
    if (!customer) {
      const firstTraveler = data.travelers[0];
      customer = await prisma.customer.create({
        data: {
          email: data.contactEmail,
          firstName: firstTraveler.firstNameTh,
          lastName: firstTraveler.lastNameTh,
          phone: data.contactPhone || null,
          source: 'WEBSITE',
        },
      });
    }

    // 5. Create booking
    const bookingRef = generateBookingRef();
    const booking = await prisma.booking.create({
      data: {
        bookingRef,
        supplierId: tour.supplierId,
        customerId: customer.id,
        tourId: tour.id,
        departureId: departure.id,
        status: 'PENDING',
        bookingSource: 'ONLINE',
        totalPrice,
        // Create travelers
        travelers: {
          create: data.travelers.map((t: any, i: number) => ({
            paxType: childTitles.includes(t.titleTh) ? 'CHILD' : 'ADULT',
            title: t.titleTh,
            firstName: t.firstNameEn,
            lastName: t.lastNameEn,
            passportNo: t.passportNumber || null,
            dob: t.dateOfBirth ? new Date(t.dateOfBirth) : null,
          })),
        },
      },
    });

    // 6. Create Stripe Checkout Session
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://jongtour.com';
    const checkout = await createCheckoutSession({
      bookingId: booking.id,
      bookingNo: bookingRef,
      tourName: tour.tourName,
      customerEmail: data.contactEmail,
      amount: totalPrice,
      travelers: data.travelers.length,
      departureDate: departure.startDate.toISOString().slice(0, 10),
      successUrl: `${baseUrl}/account/bookings/${bookingRef}?payment=success`,
      cancelUrl: `${baseUrl}/account/bookings/${bookingRef}?payment=cancelled`,
    });

    // 7. Store Stripe reference
    await prisma.bookingExternalRef.create({
      data: {
        bookingId: booking.id,
        externalBookingId: checkout.sessionId,
        status: 'PENDING_PAYMENT',
        rawResponse: { sessionId: checkout.sessionId, url: checkout.url },
      },
    });

    // 8. Audit log
    await auditLog({
      action: 'BOOKING_CREATE',
      userId: customer.id,
      targetType: 'booking',
      targetId: booking.id,
      details: { bookingRef, tourId: tour.id, totalPrice, travelers: data.travelers.length },
    });

    return NextResponse.json({
      success: true,
      bookingRef,
      bookingId: booking.id,
      checkoutUrl: checkout.url,
      sessionId: checkout.sessionId,
    });

  } catch (error: any) {
    console.error('Booking create error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
