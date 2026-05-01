"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";

export async function submitCheckout(formData: FormData) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "กรุณาเข้าสู่ระบบก่อนทำการจอง" };
  }

  const { data: dbUser } = await supabase
    .from('User')
    .select('*')
    .eq('email', user.email || '')
    .single();

  if (!dbUser) {
    return { success: false, error: "ไม่พบข้อมูลผู้ใช้ในระบบ" };
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
    return { success: false, error: "กรุณาเลือกรอบเดินทาง" };
  }

  // Fetch departure to check if it exists
  const { data: departure } = await supabase
    .from('TourDeparture')
    .select('id')
    .eq('id', departureId)
    .single();

  if (!departure) {
    return { success: false, error: "ไม่พบข้อมูลรอบเดินทางที่เลือก" };
  }

  // Create booking
  const bookingId = randomUUID();
  const { data: booking, error: bookingError } = await supabase
    .from('Booking')
    .insert({
      id: bookingId,
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
    console.error("Booking Creation Error:", bookingError);
    return { success: false, error: "เกิดข้อผิดพลาดในการบันทึกข้อมูลการจอง: " + bookingError.message };
  }

  // Create travelers (lead traveler)
  await supabase
    .from('Traveler')
    .insert({
      id: randomUUID(),
      bookingId: booking.id,
      name: `${firstName} ${lastName}`
    });

  // Add dummy travelers for remaining pax
  for (let i = 1; i < pax; i++) {
    await supabase
      .from('Traveler')
      .insert({
        id: randomUUID(),
        bookingId: booking.id,
        name: `Traveler ${i + 1}`
      });
  }

  return { success: true, bookingId: booking.id };
}
