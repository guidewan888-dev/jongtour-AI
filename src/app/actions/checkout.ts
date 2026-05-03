"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function submitCheckout(formData: FormData) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "กรุณาเข้าสู่ระบบก่อนทำการจอง" };
  }

  const dbUser = await prisma.user.findUnique({
    where: { email: user.email || "" }
  });

  if (!dbUser) {
    return { success: false, error: "ไม่พบข้อมูลผู้ใช้ในระบบ" };
  }

  const departureId = formData.get("departureId") as string;
  const pax = parseInt(formData.get("pax") as string) || 1;
  const adults = parseInt(formData.get("adults") as string) || 1;
  const children = parseInt(formData.get("children") as string) || 0;
  const paymentType = formData.get("paymentType") as string || "full";
  const totalPrice = parseFloat(formData.get("totalPrice") as string) || 0;
  
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const phone = formData.get("phone") as string;
  const email = formData.get("email") as string; // From form or user fallback
  
  if (!departureId) {
    return { success: false, error: "กรุณาเลือกรอบเดินทาง" };
  }

  let newBookingId = "";

  try {
    // 1. Transaction to Check Seats and Create Booking
    await prisma.$transaction(async (tx) => {
      // Lock departure to check seats
      const departure = await tx.departure.findUnique({
        where: { id: departureId }
      });

      if (!departure || departure.remainingSeats < pax) {
        throw new Error("NOT_ENOUGH_SEATS");
      }

      // Deduct seats (Seat Lock Mechanism)
      await tx.departure.update({
        where: { id: departureId },
        data: { remainingSeats: { decrement: pax } }
      });

      // Find or create customer based on logged in user's email or form email
      const targetEmail = email || user.email || "";
      let customer = await tx.customer.findFirst({ where: { email: targetEmail } });
      if (!customer) {
        customer = await tx.customer.create({
          data: {
            firstName: firstName,
            lastName: lastName,
            email: targetEmail,
            phone: phone,
          }
        });
      }

      // Generate booking ref
      const bookingRef = `B2C-${new Date().getFullYear()}${String(new Date().getMonth()+1).padStart(2,'0')}-${Math.floor(Math.random()*10000)}`;
      
      // Create Booking
      const booking = await tx.booking.create({
        data: {
          bookingRef,
          departureId,
          customerId: customer.id,
          status: "PENDING",
          paxAdult: adults,
          paxChild: children,
          totalPrice,
          paymentStatus: "UNPAID",
          wholesaleType: "API", 
          wholesaleStatus: "PENDING"
        }
      });
      newBookingId = booking.id;

      // Create Lead Traveler
      await tx.bookingTraveler.create({
        data: {
          bookingId: booking.id,
          firstName,
          lastName,
          title: "Mr.", // simplistic
          paxType: "ADULT"
        }
      });

      // Create dummy records for remaining passengers so they can be filled later
      for (let i = 1; i < pax; i++) {
        await tx.bookingTraveler.create({
          data: {
            bookingId: booking.id,
            firstName: `Traveler`,
            lastName: `${i+1}`,
            title: "Mr.",
            paxType: i >= adults ? "CHILD_WITH_BED" : "ADULT"
          }
        });
      }
    });

  } catch (error: any) {
    console.error("Booking Error:", error);
    if (error.message === "NOT_ENOUGH_SEATS") {
      return { success: false, error: "ที่นั่งในรอบเดินทางนี้ไม่เพียงพอ หรือเต็มแล้ว กรุณาเลือกรอบเดินทางอื่น" };
    }
    return { success: false, error: "เกิดข้อผิดพลาดในการบันทึกข้อมูลการจอง" };
  }

  // Success -> Returns ID to let Client Component redirect to Payment Page
  return { success: true, bookingId: newBookingId };
}
