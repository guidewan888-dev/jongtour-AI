/**
 * BookingService
 * Core logic for creating, updating, and managing booking lifecycles
 */
import { SupabaseClient } from '@supabase/supabase-js';
import prisma from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';

export class BookingService {
  /**
   * Create a new booking (requires locked availability and price snapshot)
   */
  static async createBooking(supabase: SupabaseClient, payload: {
    userId: string,
    tourId: string,
    departureId: string,
    paxData: any,
    priceSnapshot: any,
    source: string // B2C, B2B, CRM
  }) {
    // Check if departure exists
    const departure = await prisma.departure.findUnique({
      where: { id: payload.departureId },
      include: { tour: true }
    });

    if (!departure) {
      throw new Error("Departure not found");
    }

    // Generate Booking Ref
    const bookingRef = `BOK-${new Date().getFullYear().toString().substring(2)}${(new Date().getMonth() + 1).toString().padStart(2, '0')}-${uuidv4().substring(0, 5).toUpperCase()}`;

    // Get customer profile
    let customer = await prisma.customer.findFirst({
      where: { userId: payload.userId }
    });

    if (!customer) {
       // Create dummy customer if not exist, in real app we'd collect this in checkout
       const user = await supabase.auth.admin.getUserById(payload.userId).catch(() => null);
       customer = await prisma.customer.create({
         data: {
           userId: payload.userId,
           firstName: 'User',
           lastName: payload.userId.substring(0, 5),
           email: user?.data?.user?.email || `user_${payload.userId}@example.com`,
           phone: '-'
         }
       });
    }

    // Calculate total price based on pax
    const paxCount = Array.isArray(payload.paxData) ? payload.paxData.length : 1;
    const totalPrice = (payload.priceSnapshot?.sellingPrice || departure.prices?.[0]?.sellingPrice || 0) * paxCount;

    // Create Booking
    const booking = await prisma.booking.create({
      data: {
        bookingRef,
        supplierId: departure.supplierId,
        tourId: payload.tourId,
        departureId: payload.departureId,
        customerId: customer.id,
        bookingSource: payload.source || 'ONLINE',
        status: 'PENDING_PAYMENT',
        totalPrice: totalPrice,
        totalNetPrice: payload.priceSnapshot?.netPrice ? payload.priceSnapshot.netPrice * paxCount : null
      }
    });

    return { bookingId: booking.bookingRef, status: booking.status, id: booking.id };
  }

  /**
   * Update booking status (e.g. PENDING -> CONFIRMED)
   */
  static async updateStatus(supabase: SupabaseClient, bookingId: string, status: string) {
    const updated = await prisma.booking.updateMany({
      where: {
        OR: [
          { id: bookingId },
          { bookingRef: bookingId }
        ]
      },
      data: { status }
    });
    
    return updated.count > 0;
  }
}
