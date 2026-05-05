/**
 * AvailabilityService — Seat management, hold logic, and real-time checks
 */
import { prisma } from '@/lib/prisma';

export class AvailabilityService {

  /** Check availability for a departure */
  static async checkAvailability(departureId: string, requiredSeats: number = 1) {
    const departure = await prisma.departure.findUnique({
      where: { id: departureId },
      select: { id: true, remainingSeats: true, totalSeats: true, startDate: true, status: true },
    });

    if (!departure) return { available: false, reason: 'DEPARTURE_NOT_FOUND' };
    if (departure.status !== 'OPEN') return { available: false, reason: 'DEPARTURE_CLOSED' };
    if (departure.startDate < new Date()) return { available: false, reason: 'DEPARTURE_PAST' };
    if (departure.remainingSeats < requiredSeats) return { available: false, reason: 'INSUFFICIENT_SEATS', remaining: departure.remainingSeats };

    return {
      available: true,
      remaining: departure.remainingSeats,
      total: departure.totalSeats,
      fillRate: Math.round(((departure.totalSeats - departure.remainingSeats) / departure.totalSeats) * 100),
    };
  }

  /** Hold seats during checkout (30 min default) */
  static async holdSeats(departureId: string, seats: number, holdDurationMins: number = 30) {
    const check = await this.checkAvailability(departureId, seats);
    if (!check.available) return { success: false, reason: check.reason };

    // Decrement available seats
    const updated = await prisma.departure.update({
      where: { id: departureId },
      data: { remainingSeats: { decrement: seats } },
    });

    // Create hold record
    const holdId = `HOLD-${Date.now().toString(36).toUpperCase()}`;
    const expiresAt = new Date(Date.now() + holdDurationMins * 60 * 1000);

    // Store hold in metadata (or separate table if exists)
    try {
      await prisma.seatHold.create({
        data: { id: holdId, departureId, seats, expiresAt },
      });
    } catch {
      // If SeatHold model doesn't exist yet, just log
      console.log(`[Hold] ${holdId}: ${seats} seats for ${departureId} until ${expiresAt.toISOString()}`);
    }

    return { success: true, holdId, expiresAt, remainingAfter: updated.remainingSeats };
  }

  /** Release held seats (checkout abandoned or expired) */
  static async releaseHold(departureId: string, seats: number, holdId?: string) {
    await prisma.departure.update({
      where: { id: departureId },
      data: { remainingSeats: { increment: seats } },
    });

    if (holdId) {
      try {
        await prisma.seatHold.delete({ where: { id: holdId } });
      } catch {}
    }

    return { released: true, seats };
  }

  /** Confirm seats (convert hold to booking) */
  static async confirmSeats(departureId: string, seats: number, holdId?: string) {
    // Seats already decremented during hold, just remove the hold record
    if (holdId) {
      try {
        await prisma.seatHold.delete({ where: { id: holdId } });
      } catch {}
    }
    return { confirmed: true };
  }

  /** Get departure availability summary */
  static async getDeparturesSummary(tourId: string) {
    const departures = await prisma.departure.findMany({
      where: { tourId, startDate: { gte: new Date() }, status: 'OPEN' },
      include: { prices: { where: { paxType: 'ADULT' }, take: 1 } },
      orderBy: { startDate: 'asc' },
    });

    return departures.map(d => ({
      id: d.id,
      startDate: d.startDate,
      endDate: d.endDate,
      remaining: d.remainingSeats,
      total: d.totalSeats,
      fillRate: Math.round(((d.totalSeats - d.remainingSeats) / d.totalSeats) * 100),
      price: d.prices[0]?.sellingPrice || null,
      almostFull: d.remainingSeats <= 5,
      soldOut: d.remainingSeats <= 0,
    }));
  }

  /** Clean up expired holds (run via cron) */
  static async cleanExpiredHolds() {
    try {
      const expired = await prisma.seatHold.findMany({
        where: { expiresAt: { lt: new Date() } },
      });

      for (const hold of expired) {
        await this.releaseHold(hold.departureId, hold.seats, hold.id);
      }

      return { cleaned: expired.length };
    } catch {
      return { cleaned: 0 };
    }
  }
}
