"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/**
 * Server Action: Update booking status with notification wiring
 */
export async function updateBookingStatus(formData: FormData) {
  const bookingId = formData.get("bookingId") as string;
  const status = formData.get("status") as string;

  if (!bookingId || !status) return;

  // Update booking
  const booking = await prisma.booking.update({
    where: { id: bookingId },
    data: { status },
    include: { customer: true, tour: true },
  });

  // If CONFIRMED → mark pending payments as COMPLETED + notify
  if (status === "CONFIRMED") {
    await prisma.payment.updateMany({
      where: { bookingId, status: "PENDING" },
      data: { status: "COMPLETED" },
    });

    // Notify customer
    if (booking.customer) {
      try {
        const { NotificationService } = await import("@/services/core/NotificationService");
        await NotificationService.bookingConfirmed(
          { email: booking.customer.email, lineId: booking.customer.lineId || undefined, id: booking.customer.id },
          {
            bookingRef: booking.bookingRef,
            tourName: booking.tour?.tourName || "Tour",
            date: booking.createdAt.toLocaleDateString("th-TH"),
            pax: 1,
            total: `฿${booking.totalPrice.toLocaleString()}`,
          }
        );
      } catch {}
    }
  }

  // If CANCELLED → release seats + notify
  if (status === "CANCELLED" && booking.departureId) {
    try {
      const { AvailabilityService } = await import("@/services/core/AvailabilityService");
      await AvailabilityService.releaseHold(booking.departureId, 1);
    } catch {}

    if (booking.customer) {
      try {
        const { NotificationService } = await import("@/services/core/NotificationService");
        await NotificationService.adminAlert(
          `Booking ${booking.bookingRef} cancelled for ${booking.customer.firstName}`,
          "WARNING"
        );
      } catch {}
    }
  }

  revalidatePath("/bookings");
  revalidatePath(`/bookings/${bookingId}`);
}

/**
 * Server Action: Add note to booking
 */
export async function addBookingNote(formData: FormData) {
  const bookingId = formData.get("bookingId") as string;
  const note = formData.get("note") as string;

  if (!bookingId || !note) return;

  await prisma.booking.update({
    where: { id: bookingId },
    data: { internalNote: note },
  });

  revalidatePath(`/bookings/${bookingId}`);
}

/**
 * Server Action: Assign booking to operation staff
 */
export async function assignBookingStaff(formData: FormData) {
  const bookingId = formData.get("bookingId") as string;
  const staffId = formData.get("staffId") as string;

  if (!bookingId || !staffId) return;

  await prisma.booking.update({
    where: { id: bookingId },
    data: { assignedToId: staffId },
  });

  revalidatePath("/bookings");
  revalidatePath(`/bookings/${bookingId}`);
}
