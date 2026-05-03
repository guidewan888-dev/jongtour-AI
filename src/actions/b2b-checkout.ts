"use server";

import { createClient } from "@supabase/supabase-js";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function submitB2BBooking(formData: FormData) {
  const departureId = formData.get("departureId") as string;
  const agentId = formData.get("agentId") as string;
  const paxCount = parseInt(formData.get("paxCount") as string);
  const totalPrice = parseFloat(formData.get("totalPrice") as string);
  const contactName = formData.get("contactName") as string;
  const contactEmail = formData.get("contactEmail") as string;
  const contactPhone = formData.get("contactPhone") as string;

  // Extract passengers
  const travelers = [];
  for (let i = 0; i < paxCount; i++) {
    travelers.push({
      firstName: formData.get(`pax_${i}_firstName`) as string,
      lastName: formData.get(`pax_${i}_lastName`) as string,
      passportNo: formData.get(`pax_${i}_passportNo`) as string,
      paxType: formData.get(`pax_${i}_type`) as string || "ADULT",
      title: "Mr." // Simplification
    });
  }

  // 1. Transaction to check remaining seats and create booking
  // We use Prisma for complex transactions
  let newBookingId = "";
  try {
    await prisma.$transaction(async (tx) => {
      // Lock departure to check seats
      const departure = await tx.departure.findUnique({
        where: { id: departureId }
      });

      if (!departure || departure.remainingSeats < paxCount) {
        throw new Error("NOT_ENOUGH_SEATS");
      }

      // Deduct seats
      await tx.departure.update({
        where: { id: departureId },
        data: { remainingSeats: { decrement: paxCount } }
      });

      // Find or create customer
      let customer = await tx.customer.findFirst({ where: { email: contactEmail } });
      if (!customer) {
        customer = await tx.customer.create({
          data: {
            firstName: contactName.split(' ')[0],
            lastName: contactName.split(' ').slice(1).join(' ') || '-',
            email: contactEmail,
            phone: contactPhone,
          }
        });
      }

      // Create Booking
      const bookingRef = `B2B-${new Date().getFullYear()}${String(new Date().getMonth()+1).padStart(2,'0')}-${Math.floor(Math.random()*10000)}`;
      
      const booking = await tx.booking.create({
        data: {
          bookingRef,
          departureId,
          customerId: customer.id,
          agentId,
          status: "PENDING",
          paxAdult: paxCount,
          totalPrice,
          paymentStatus: "UNPAID",
          wholesaleType: "API", // Assumption
          wholesaleStatus: "PENDING"
        }
      });
      newBookingId = booking.id;

      // Create Travelers
      for (const t of travelers) {
        await tx.bookingTraveler.create({
          data: {
            bookingId: booking.id,
            ...t
          }
        });
      }
    });
  } catch (error: any) {
    console.error("Booking Error:", error);
    if (error.message === "NOT_ENOUGH_SEATS") {
      redirect(`/b2b/tours?error=seats_full`);
    }
    throw error;
  }

  // Success -> Redirect to success page
  redirect(`/b2b/checkout/success/${newBookingId}`);
}
