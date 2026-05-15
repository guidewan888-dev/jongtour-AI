"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { NotificationService } from "@/services/core/NotificationService";

export async function submitB2BBooking(formData: FormData) {
  const departureId = formData.get("departureId") as string;
  const agentId = formData.get("agentId") as string;
  const paxCount = parseInt(formData.get("paxCount") as string);
  const totalPrice = parseFloat(formData.get("totalPrice") as string);
  const contactName = formData.get("contactName") as string;
  const contactEmail = formData.get("contactEmail") as string;
  const contactPhone = formData.get("contactPhone") as string;

  // Extract passengers
  const travelers: Array<{
    firstName: string;
    lastName: string;
    passportNo: string;
    paxType: string;
    title: string;
  }> = [];
  for (let i = 0; i < paxCount; i++) {
    travelers.push({
      firstName: formData.get(`pax_${i}_firstName`) as string,
      lastName: formData.get(`pax_${i}_lastName`) as string,
      passportNo: formData.get(`pax_${i}_passportNo`) as string,
      paxType: formData.get(`pax_${i}_type`) as string || "ADULT",
      title: "Mr.",
    });
  }

  try {
    // Use Prisma transaction for atomicity
    const booking = await prisma.$transaction(async (tx) => {
      // 1. Check remaining seats
      const departure = await tx.departure.findUnique({
        where: { id: departureId },
        select: { remainingSeats: true, totalSeats: true, status: true, tourId: true, supplierId: true },
      });

      if (!departure || departure.remainingSeats < paxCount) {
        throw new Error("NOT_ENOUGH_SEATS");
      }

      // 2. Check Agent Credit Limit
      const agent = await tx.agent.findUnique({
        where: { id: agentId },
        select: { creditLimit: true, companyName: true },
      });

      if (!agent) throw new Error("AGENT_NOT_FOUND");

      // Calculate Outstanding Balance
      const unpaidBookings = await tx.booking.findMany({
        where: { agentId, status: { in: ['PENDING', 'DEPOSIT_PAID'] } },
        select: { totalPrice: true },
      });

      const outstandingBalance = unpaidBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
      if (outstandingBalance + totalPrice > (agent.creditLimit || 0)) {
        throw new Error("INSUFFICIENT_CREDIT_LIMIT");
      }

      // 3. Find or create customer
      let customer = await tx.customer.findFirst({ where: { email: contactEmail } });
      if (!customer) {
        customer = await tx.customer.create({
          data: {
            firstName: contactName.split(' ')[0],
            lastName: contactName.split(' ').slice(1).join(' ') || '-',
            email: contactEmail,
            phone: contactPhone,
          },
        });
      }

      // 4. Create Booking
      const bookingRef = `B2B-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${Math.floor(Math.random() * 10000)}`;

      const newBooking = await tx.booking.create({
        data: {
          bookingRef,
          supplierId: departure.supplierId,
          departureId,
          tourId: departure.tourId,
          customerId: customer.id,
          agentId,
          status: "PENDING",
          bookingSource: "AGENT",
          totalPrice,
        },
      });

      // 5. Create Travelers
      await tx.bookingTraveler.createMany({
        data: travelers.map(t => ({ bookingId: newBooking.id, ...t })),
      });

      // 6. Deduct seats atomically
      await tx.departure.update({
        where: { id: departureId },
        data: { remainingSeats: { decrement: paxCount } },
      });

      return newBooking;
    });

    // Post-transaction: notifications (non-blocking)
    NotificationService.adminAlert(
      `New B2B Booking: ${booking.bookingRef} — ${paxCount} pax, ฿${totalPrice.toLocaleString()}`,
      'INFO'
    ).catch(() => {});

    return redirect(`/b2b/checkout/success/${booking.id}`);

  } catch (error: any) {
    console.error("B2B Checkout Error:", error);
    if (error.message === "NOT_ENOUGH_SEATS") {
      redirect(`/b2b/tours?error=seats_full`);
    } else if (error.message === "INSUFFICIENT_CREDIT_LIMIT") {
      redirect(`/b2b/tours?error=insufficient_credit`);
    } else if (error.digest?.includes('NEXT_REDIRECT')) {
      throw error; // Allow Next.js redirect
    } else {
      throw error;
    }
  }
}
