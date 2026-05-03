"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

export async function updateBookingStatus(formData: FormData) {
  const bookingId = formData.get("bookingId") as string;
  const status = formData.get("status") as string;

  if (!bookingId || !status) return;

  const supabaseServer = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );

  // Update Booking Status
  await supabaseServer
    .from("bookings")
    .update({ status })
    .eq("id", bookingId);

  // If status is CONFIRMED, also mark payments as COMPLETED (simplified for this MVP)
  if (status === "CONFIRMED") {
    await supabaseServer
      .from("payments")
      .update({ status: "COMPLETED" })
      .eq("bookingId", bookingId)
      .eq("status", "PENDING"); // Only update pending payments
  }

  // If status is CANCELLED, we could add logic here to release the seat back to departures

  revalidatePath("/admin/bookings");
  revalidatePath(`/admin/bookings/${bookingId}`);
}
