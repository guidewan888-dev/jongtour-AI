"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function submitCheckout(formData: FormData) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { data: dbUser } = await supabase
    .from('User')
    .select('*')
    .eq('email', user.email || '')
    .single();

  if (!dbUser) {
    throw new Error("User not found in DB");
  }

  const tourId = formData.get("tourId") as string;
  const departureId = formData.get("departureId") as string;
  const pax = parseInt(formData.get("pax") as string) || 1;
  const adults = parseInt(formData.get("adults") as string) || 1;
  const children = parseInt(formData.get("children") as string) || 0;
  const singleRooms = parseInt(formData.get("singleRooms") as string) || 0;
  const paymentType = formData.get("paymentType") as string || "full";
  const totalPrice = parseFloat(formData.get("totalPrice") as string) || 0;
  const depositAmount = parseFloat(formData.get("totalDeposit") as string) || 0;
  
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const phone = formData.get("phone") as string;
  
  if (!departureId) {
    throw new Error("Please select a departure date");
  }

  // Fetch departure to check if it exists
  const { data: departure } = await supabase
    .from('TourDeparture')
    .select('id')
    .eq('id', departureId)
    .single();

  if (!departure) {
    throw new Error("Departure not found");
  }

  // Create booking
  const { data: booking, error: bookingError } = await supabase
    .from('Booking')
    .insert({
      userId: dbUser.id,
      departureId,
      status: 'PENDING',
      totalPrice,
      contactName: `${firstName} ${lastName}`,
      contactPhone: phone,
      pax,
      adults,
      children,
      singleRooms,
      paymentType,
      depositAmount: paymentType === 'deposit' ? depositAmount : null
    })
    .select()
    .single();

  if (bookingError) {
    throw new Error("Failed to create booking: " + bookingError.message);
  }

  // Create travelers (lead traveler)
  await supabase
    .from('Traveler')
    .insert({
      bookingId: booking.id,
      name: `${firstName} ${lastName}`,
      isLead: true
    });

  // Add dummy travelers for remaining pax
  for (let i = 1; i < pax; i++) {
    await supabase
      .from('Traveler')
      .insert({
        bookingId: booking.id,
        name: `Traveler ${i + 1}`,
        isLead: false
      });
  }

  redirect(`/payment/${booking.id}`);
}
