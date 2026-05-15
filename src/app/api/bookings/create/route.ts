export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createCheckoutSession } from '@/lib/stripe';
import { validateRequest, createBookingSchema } from '@/lib/validators';
import { auditLog } from '@/lib/logger';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

class ApiError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

function generateBookingRef(): string {
  const prefix = 'JT';
  const date = new Date().toISOString().slice(2, 10).replace(/-/g, '');
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}${date}${rand}`;
}

const CHILD_TITLES = new Set(['Master', 'Miss']);

function normalizeTitle(title: string | null | undefined): string {
  return String(title || '').trim().replace(/\.$/, '');
}

function normalizePaxType(title: string | null | undefined): 'ADULT' | 'CHILD' {
  const normalized = normalizeTitle(title);
  return CHILD_TITLES.has(normalized) ? 'CHILD' : 'ADULT';
}

function amountOrZero(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

type CentralPriceRow = {
  adult_price: number | null;
  child_with_bed_price: number | null;
  child_without_bed_price: number | null;
  infant_price: number | null;
  single_supplement_price: number | null;
  deposit_amount: number | null;
  deposit_type: string | null;
  price_source?: string | null;
};

type RequestedCounts = {
  adultCount: number;
  childWithBedCount: number;
  childWithoutBedCount: number;
  infantCount: number;
  singleRoomCount: number;
  seatCount: number;
  travelerCountForDeposit: number;
};

function normalizeRequestedCounts(params: {
  travelers: Array<{ titleTh: string }>;
  adultCount?: number;
  childWithBedCount?: number;
  childWithoutBedCount?: number;
  infantCount?: number;
  singleRoomCount?: number;
  wantsSingleRoom?: boolean;
  pricingMeta?: {
    adultCount?: number;
    childWithBedCount?: number;
    childWithoutBedCount?: number;
    infantCount?: number;
    singleRoomCount?: number;
  };
}): RequestedCounts {
  const derivedAdults = params.travelers.filter((traveler) => normalizePaxType(traveler.titleTh) === 'ADULT').length;
  const derivedChildren = params.travelers.length - derivedAdults;
  const directAdult = params.adultCount;
  const directChildWithBed = params.childWithBedCount;
  const directChildWithoutBed = params.childWithoutBedCount;
  const directInfant = params.infantCount;
  const directSingle = params.singleRoomCount;

  const adultCount = Math.max(0, Math.floor(Number(directAdult ?? params.pricingMeta?.adultCount ?? derivedAdults)));
  const childWithBedCount = Math.max(0, Math.floor(Number(directChildWithBed ?? params.pricingMeta?.childWithBedCount ?? derivedChildren)));
  const childWithoutBedCount = Math.max(0, Math.floor(Number(directChildWithoutBed ?? params.pricingMeta?.childWithoutBedCount ?? 0)));
  const infantCount = Math.max(0, Math.floor(Number(directInfant ?? params.pricingMeta?.infantCount ?? 0)));
  let singleRoomCount = Math.max(0, Math.floor(Number(directSingle ?? params.pricingMeta?.singleRoomCount ?? 0)));
  if (!singleRoomCount && params.wantsSingleRoom) {
    singleRoomCount = 1;
  }
  const seatCount = adultCount + childWithBedCount + childWithoutBedCount + infantCount;
  const travelerCountForDeposit = adultCount + childWithBedCount + childWithoutBedCount + infantCount;

  return {
    adultCount,
    childWithBedCount,
    childWithoutBedCount,
    infantCount,
    singleRoomCount,
    seatCount,
    travelerCountForDeposit,
  };
}

async function resolveLegacyIdsFromCentral(params: { tourId: string; departureId: string }) {
  const sb = getSupabaseAdmin();

  const [{ data: depRows, error: depError }, { data: wholesalerRows }] = await Promise.all([
    sb
      .from('tour_departures')
      .select('id, canonical_tour_id, wholesale_id, source_departure_key')
      .eq('id', params.departureId)
      .limit(1),
    sb.from('wholesalers').select('id, source_type').eq('is_active', true),
  ]);

  if (depError || !depRows?.length) {
    return null;
  }
  const centralDeparture = depRows[0];
  if (String(centralDeparture.canonical_tour_id) !== params.tourId) {
    throw new ApiError('Departure does not belong to selected tour', 400);
  }

  const wholesalerSourceTypeMap: Record<string, string> = {};
  (wholesalerRows || []).forEach((row: any) => {
    wholesalerSourceTypeMap[String(row.id)] = String(row.source_type || 'api');
  });

  const wholesaleId = String(centralDeparture.wholesale_id || '');
  const sourceType = wholesalerSourceTypeMap[wholesaleId] || 'api';
  if (sourceType !== 'api' || !wholesaleId.startsWith('SUP_')) {
    throw new ApiError('Booking online for this wholesaler is not available yet', 400);
  }

  const { data: mapRows, error: mapError } = await sb
    .from('wholesale_tour_mappings')
    .select('source_tour_key')
    .eq('canonical_tour_id', params.tourId)
    .eq('wholesale_id', wholesaleId)
    .limit(1);

  if (mapError || !mapRows?.length) {
    throw new ApiError('Tour mapping not found for selected wholesaler', 400);
  }

  const sourceTourKey = String(mapRows[0].source_tour_key || '');
  const sourceDepartureKey = String(centralDeparture.source_departure_key || '');
  if (!sourceTourKey || !sourceDepartureKey) {
    throw new ApiError('Incomplete mapping for selected departure', 400);
  }

  const [{ data: centralPriceRows }, { data: centralSeatRows }, { data: depPdfRows }, { data: tourPdfRows }] = await Promise.all([
    sb.from('tour_prices').select('*').eq('departure_id', params.departureId).limit(1),
    sb.from('tour_seats').select('*').eq('departure_id', params.departureId).limit(1),
    sb.from('tour_pdfs').select('pdf_url').eq('departure_id', params.departureId).eq('is_active', true).limit(1),
    sb.from('tour_pdfs')
      .select('pdf_url')
      .eq('canonical_tour_id', params.tourId)
      .eq('wholesale_id', wholesaleId)
      .eq('is_active', true)
      .limit(1),
  ]);

  const centralPrice = (centralPriceRows?.[0] || null) as CentralPriceRow | null;
  const centralSeat = centralSeatRows?.[0] || null;
  const centralPdfUrl = String(depPdfRows?.[0]?.pdf_url || tourPdfRows?.[0]?.pdf_url || '');

  return {
    wholesaleId,
    centralTourId: params.tourId,
    centralDepartureId: params.departureId,
    sourceTourKey,
    sourceDepartureKey,
    centralPrice,
    centralSeat,
    centralPdfUrl,
  };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validation = validateRequest(createBookingSchema, body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }
    const data = validation.data;
    const requestedPaymentType = data.paymentType || 'FULL';
    const isDeferredBooking = requestedPaymentType === 'LATER';

    const requestedCounts = normalizeRequestedCounts({
      travelers: data.travelers,
      adultCount: data.adultCount,
      childWithBedCount: data.childWithBedCount,
      childWithoutBedCount: data.childWithoutBedCount,
      infantCount: data.infantCount,
      singleRoomCount: data.singleRoomCount,
      wantsSingleRoom: data.wantsSingleRoom,
      pricingMeta: data.pricingMeta,
    });

    const requestedTravelerCount = requestedCounts.seatCount > 0 ? requestedCounts.seatCount : data.travelers.length;
    if (requestedTravelerCount <= 0) {
      return NextResponse.json({ error: 'At least 1 traveler is required' }, { status: 400 });
    }

    const bookingPayload = await prisma.$transaction(async (tx) => {
      let requestedTourId = data.tourId;
      let requestedDepartureId = data.departureId;
      let centralPrice: CentralPriceRow | null = null;
      let centralSeat: any = null;
      let centralPdfUrl = '';
      let centralTourId: string | null = null;
      let centralDepartureId: string | null = null;

      let tour = await tx.tour.findUnique({
        where: { id: requestedTourId },
        select: {
          id: true,
          tourName: true,
          tourCode: true,
          supplierId: true,
        },
      });
      if (!tour) {
        const resolved = await resolveLegacyIdsFromCentral({ tourId: data.tourId, departureId: data.departureId });
        if (!resolved) {
          throw new ApiError('Tour not found', 404);
        }

        const mappedTour = await tx.tour.findFirst({
          where: {
            supplierId: resolved.wholesaleId,
            externalTourId: resolved.sourceTourKey,
          },
          select: {
            id: true,
            tourName: true,
            tourCode: true,
            supplierId: true,
          },
        });
        if (!mappedTour) {
          throw new ApiError('Mapped tour not found in booking system', 404);
        }

        const mappedDeparture = await tx.departure.findFirst({
          where: {
            tourId: mappedTour.id,
            externalDepartureId: resolved.sourceDepartureKey,
          },
          select: { id: true },
        });
        if (!mappedDeparture) {
          throw new ApiError('Mapped departure not found in booking system', 404);
        }

        requestedTourId = mappedTour.id;
        requestedDepartureId = mappedDeparture.id;
        centralPrice = resolved.centralPrice;
        centralSeat = resolved.centralSeat;
        centralPdfUrl = resolved.centralPdfUrl || '';
        centralTourId = resolved.centralTourId || null;
        centralDepartureId = resolved.centralDepartureId || null;
        tour = mappedTour;
      }

      const departure = await tx.departure.findUnique({
        where: { id: requestedDepartureId },
        select: {
          id: true,
          tourId: true,
          supplierId: true,
          startDate: true,
          endDate: true,
          status: true,
          remainingSeats: true,
          prices: {
            select: {
              paxType: true,
              sellingPrice: true,
              netPrice: true,
            },
          },
        },
      });

      if (!departure) {
        throw new ApiError('Departure not found', 404);
      }
      if (departure.tourId !== tour.id) {
        throw new ApiError('Departure does not belong to selected tour', 400);
      }
      if (departure.supplierId !== tour.supplierId) {
        throw new ApiError('Departure does not belong to selected wholesale', 400);
      }
      if (data.wholesaleId && String(data.wholesaleId) !== String(tour.supplierId)) {
        throw new ApiError('Selected wholesale does not match departure wholesale', 400);
      }

      const depStatus = String(departure.status || '').toUpperCase();
      if (departure.startDate < new Date()) {
        throw new ApiError('Departure date is in the past', 400);
      }
      if (depStatus === 'FULL' || depStatus === 'CANCELLED') {
        throw new ApiError('Selected departure is not bookable', 400);
      }

      // Central data guard for online payment flows.
      // Deferred bookings (LATER) can continue and be handled by staff.
      if (centralTourId && centralDepartureId) {
        const centralAdultPrice = Number(centralPrice?.adult_price ?? NaN);
        if (!isDeferredBooking && (!Number.isFinite(centralAdultPrice) || centralAdultPrice <= 0)) {
          throw new ApiError('Central pricing is incomplete: adult price missing', 400);
        }

        const rawSeatAvailable = (centralSeat as any)?.seat_available;
        const hasCentralSeat = rawSeatAvailable !== null && rawSeatAvailable !== undefined && Number.isFinite(Number(rawSeatAvailable));
        if (!isDeferredBooking && !hasCentralSeat) {
          throw new ApiError('Central seat data is incomplete: seat availability missing', 400);
        }

        const centralAvailableSeats = Number(rawSeatAvailable);
        if (!isDeferredBooking && hasCentralSeat && centralAvailableSeats < requestedTravelerCount) {
          throw new ApiError('Insufficient seats from central availability', 409);
        }

        if (!isDeferredBooking && data.pdfUrl && centralPdfUrl) {
          const requestedPdf = String(data.pdfUrl || '').trim();
          if (requestedPdf && requestedPdf !== centralPdfUrl) {
            throw new ApiError('Selected PDF does not match central pricing source', 400);
          }
        }
      }

      const seatUpdated = await tx.departure.updateMany({
        where: {
          id: departure.id,
          remainingSeats: { gte: requestedTravelerCount },
          status: { in: ['AVAILABLE', 'ON_REQUEST', 'OPEN'] },
        },
        data: {
          remainingSeats: { decrement: requestedTravelerCount },
        },
      });

      if (seatUpdated.count === 0) {
        throw new ApiError('Insufficient seats for this departure', 409);
      }

      const priceByType: Record<string, number> = {};
      let fallbackPrimary = 0;
      for (const price of departure.prices || []) {
        const paxType = String(price.paxType || '').toUpperCase();
        const selling = amountOrZero(price.sellingPrice);
        if (!selling) continue;
        if (!priceByType[paxType] || selling < priceByType[paxType]) {
          priceByType[paxType] = selling;
        }
        if (!['CHILD', 'INFANT', 'SINGLE_SUPP', 'DEPOSIT'].includes(paxType)) {
          if (!fallbackPrimary || selling < fallbackPrimary) {
            fallbackPrimary = selling;
          }
        }
      }

      const adultPrice = amountOrZero(centralPrice?.adult_price) || priceByType.ADULT || fallbackPrimary;
      if (!adultPrice) {
        throw new ApiError('No valid price for selected departure', 400);
      }
      const childWithBedPrice =
        amountOrZero(centralPrice?.child_with_bed_price) ||
        amountOrZero(centralPrice?.child_without_bed_price) ||
        priceByType.CHILD ||
        adultPrice;
      const childWithoutBedPrice =
        amountOrZero(centralPrice?.child_without_bed_price) ||
        amountOrZero(centralPrice?.child_with_bed_price) ||
        priceByType.CHILD ||
        adultPrice;
      const infantPrice = amountOrZero(centralPrice?.infant_price) || priceByType.INFANT || 0;
      const singleSupplementPrice = amountOrZero(centralPrice?.single_supplement_price) || priceByType.SINGLE_SUPP || 0;
      const depositAmount = amountOrZero(centralPrice?.deposit_amount) || priceByType.DEPOSIT || 0;
      const depositType = String(centralPrice?.deposit_type || (depositAmount > 0 ? 'per_person' : 'unknown'));
      if (!isDeferredBooking && requestedPaymentType === 'DEPOSIT' && depositType === 'unknown') {
        throw new ApiError('กรุณาติดต่อเจ้าหน้าที่เพื่อตรวจสอบเงินมัดจำ', 400);
      }

      const normalizedEmail = String(data.contactEmail || '').trim().toLowerCase();
      let customer = await tx.customer.findFirst({ where: { email: normalizedEmail } });
      if (!customer) {
        const firstTraveler = data.travelers[0];
        customer = await tx.customer.create({
          data: {
            email: normalizedEmail,
            firstName: firstTraveler.firstNameTh || firstTraveler.firstNameEn,
            lastName: firstTraveler.lastNameTh || firstTraveler.lastNameEn,
            phone: data.contactPhone || '-',
            leadSource: 'ORGANIC',
          },
        });
      }

      const totalPrice =
        (adultPrice * requestedCounts.adultCount) +
        (childWithBedPrice * requestedCounts.childWithBedCount) +
        (childWithoutBedPrice * requestedCounts.childWithoutBedCount) +
        (infantPrice * requestedCounts.infantCount) +
        (singleSupplementPrice * requestedCounts.singleRoomCount);

      const totalDeposit =
        depositAmount <= 0
          ? 0
          : depositType === 'per_booking'
            ? depositAmount
            : depositAmount * requestedCounts.travelerCountForDeposit;
      const balanceDue = Math.max(totalPrice - totalDeposit, 0);
      const amountToCharge =
        requestedPaymentType === 'LATER'
          ? 0
          : requestedPaymentType === 'DEPOSIT' && totalDeposit > 0
            ? totalDeposit
            : totalPrice;

      const bookingRef = generateBookingRef();
      const booking = await tx.booking.create({
        data: {
          bookingRef,
          supplierId: tour.supplierId,
          customerId: customer.id,
          tourId: requestedTourId,
          departureId: requestedDepartureId,
          centralTourId: centralTourId || null,
          centralDepartureId: centralDepartureId || null,
          seatSnapshot: centralSeat || null,
          pdfUrl: centralPdfUrl || null,
          status: 'PENDING',
          bookingSource: 'ONLINE',
          totalPrice,
          travelers: {
            create: data.travelers.map((traveler) => ({
              paxType: normalizePaxType(traveler.titleTh),
              title: normalizeTitle(traveler.titleTh),
              firstName: traveler.firstNameEn,
              lastName: traveler.lastNameEn,
              passportNo: traveler.passportNumber || null,
              dob: traveler.dateOfBirth ? new Date(traveler.dateOfBirth) : null,
            })),
          },
        },
      });

      await tx.priceSnapshot.createMany({
        data: [
          { bookingId: booking.id, paxType: 'ADULT', sellingPrice: adultPrice, netPrice: adultPrice, currency: 'THB' },
          { bookingId: booking.id, paxType: 'CHILD', sellingPrice: childWithBedPrice, netPrice: childWithBedPrice, currency: 'THB' },
          ...(childWithoutBedPrice > 0 ? [{ bookingId: booking.id, paxType: 'CHILD_NO_BED', sellingPrice: childWithoutBedPrice, netPrice: childWithoutBedPrice, currency: 'THB' }] : []),
          ...(infantPrice > 0 ? [{ bookingId: booking.id, paxType: 'INFANT', sellingPrice: infantPrice, netPrice: infantPrice, currency: 'THB' }] : []),
          ...(singleSupplementPrice > 0 ? [{ bookingId: booking.id, paxType: 'SINGLE_SUPP', sellingPrice: singleSupplementPrice, netPrice: singleSupplementPrice, currency: 'THB' }] : []),
          ...(depositAmount > 0 ? [{ bookingId: booking.id, paxType: 'DEPOSIT', sellingPrice: depositAmount, netPrice: depositAmount, currency: 'THB' }] : []),
        ],
      });

      await tx.bookingCentralSnapshot.upsert({
        where: { bookingId: booking.id },
        update: {
          centralTourId: centralTourId || null,
          centralDepartureId: centralDepartureId || null,
          wholesaleId: tour.supplierId || null,
          priceSnapshot: {
            ...(centralPrice as any || {}),
            adult_price: adultPrice,
            child_with_bed_price: childWithBedPrice,
            child_without_bed_price: childWithoutBedPrice,
            infant_price: infantPrice,
            single_supplement_price: singleSupplementPrice,
            deposit_amount: depositAmount,
            deposit_type: depositType,
            deposit_total: totalDeposit,
            total_price: totalPrice,
            balance_due: balanceDue,
            price_source: String((centralPrice as any)?.price_source || 'central'),
            pdf_url: centralPdfUrl || null,
          } as any,
          seatSnapshot: centralSeat as any,
          pdfUrl: centralPdfUrl || null,
        },
        create: {
          bookingId: booking.id,
          centralTourId: centralTourId || null,
          centralDepartureId: centralDepartureId || null,
          wholesaleId: tour.supplierId || null,
          priceSnapshot: {
            ...(centralPrice as any || {}),
            adult_price: adultPrice,
            child_with_bed_price: childWithBedPrice,
            child_without_bed_price: childWithoutBedPrice,
            infant_price: infantPrice,
            single_supplement_price: singleSupplementPrice,
            deposit_amount: depositAmount,
            deposit_type: depositType,
            deposit_total: totalDeposit,
            total_price: totalPrice,
            balance_due: balanceDue,
            price_source: String((centralPrice as any)?.price_source || 'central'),
            pdf_url: centralPdfUrl || null,
          } as any,
          seatSnapshot: centralSeat as any,
          pdfUrl: centralPdfUrl || null,
        },
      });

      return {
        booking,
        bookingRef,
        tour,
        departure,
        customer,
        totalPrice,
        totalDeposit,
        amountToCharge,
        travelerCount: requestedTravelerCount,
        pricing: {
          adultPrice,
          childWithBedPrice,
          childWithoutBedPrice,
          infantPrice,
          singleSupplementPrice,
          depositAmount,
          depositType,
          depositTotal: totalDeposit,
          balanceDue,
          priceSource: String((centralPrice as any)?.price_source || 'central'),
          pdfUrl: centralPdfUrl || data.pdfUrl || null,
          counts: requestedCounts,
        },
        centralSnapshot: {
          centralTourId,
          centralDepartureId,
          wholesaleId: tour.supplierId,
          priceSnapshot: centralPrice,
          seatSnapshot: centralSeat,
          pdfUrl: centralPdfUrl,
        },
      };
    });

    const {
      booking,
      bookingRef,
      tour,
      departure,
      customer,
      totalPrice,
      totalDeposit,
      amountToCharge,
      travelerCount,
      pricing,
      centralSnapshot,
    } = bookingPayload;

    let checkoutUrl: string | null = null;
    let sessionId: string | null = null;

    if (amountToCharge > 0 && requestedPaymentType !== 'LATER') {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://jongtour.com';
      const checkout = await createCheckoutSession({
        bookingId: booking.id,
        bookingNo: bookingRef,
        tourName: tour.tourName,
        customerEmail: customer.email,
        amount: amountToCharge,
        travelers: travelerCount,
        departureDate: departure.startDate.toISOString().slice(0, 10),
        successUrl: `${baseUrl}/account/bookings/${bookingRef}?payment=success`,
        cancelUrl: `${baseUrl}/account/bookings/${bookingRef}?payment=cancelled`,
      });

      checkoutUrl = checkout.url;
      sessionId = checkout.sessionId;

      await prisma.bookingExternalRef.create({
        data: {
          bookingId: booking.id,
          externalBookingId: checkout.sessionId,
          status: 'PENDING_PAYMENT',
          rawResponse: { sessionId: checkout.sessionId, url: checkout.url },
        },
      });
    }

    await auditLog({
      action: 'BOOKING_CREATE',
      userId: customer.id,
      targetType: 'booking',
      targetId: booking.id,
      details: {
        bookingRef,
        tourId: tour.id,
        departureId: departure.id,
        supplierId: tour.supplierId,
        travelers: travelerCount,
        totalPrice,
        totalDeposit,
        amountToCharge,
        pricing,
        centralSnapshot,
        paymentType: requestedPaymentType,
      },
    });

    return NextResponse.json({
      success: true,
      bookingRef,
      bookingId: booking.id,
      checkoutUrl,
      sessionId,
      totals: {
        totalPrice,
        totalDeposit,
        amountToCharge,
        balanceDue: pricing.balanceDue,
        balanceDueAfterPayment: Math.max(totalPrice - (requestedPaymentType === 'DEPOSIT' ? amountToCharge : 0), 0),
      },
      pricing,
      centralSnapshot,
    });
  } catch (error: any) {
    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error('Booking create error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}





