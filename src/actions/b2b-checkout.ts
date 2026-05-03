"use server";

import { createClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

export async function submitB2BBooking(formData: FormData) {
  const departureId = formData.get("departureId") as string;
  const agentId = formData.get("agentId") as string;
  const paxCount = parseInt(formData.get("paxCount") as string);
  const totalPrice = parseFloat(formData.get("totalPrice") as string);
  const contactName = formData.get("contactName") as string;
  const contactEmail = formData.get("contactEmail") as string;
  const contactPhone = formData.get("contactPhone") as string;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // Need service role to bypass RLS and perform secure DB operations
  );

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

  try {
    // 1. Check remaining seats
    const { data: departure, error: depError } = await supabase
      .from('departures')
      .select('remainingSeats')
      .eq('id', departureId)
      .single();

    if (depError || !departure || departure.remainingSeats < paxCount) {
      throw new Error("NOT_ENOUGH_SEATS");
    }

    // 2. Check Agent Credit Limit
    const { data: agent } = await supabase
      .from('agents')
      .select('creditLimit')
      .eq('id', agentId)
      .single();

    if (!agent) throw new Error("AGENT_NOT_FOUND");
    
    // Calculate Outstanding Balance
    const { data: unpaidBookings } = await supabase
      .from('bookings')
      .select('totalPrice')
      .eq('agentId', agentId)
      .in('status', ['PENDING', 'DEPOSIT_PAID']);

    const outstandingBalance = unpaidBookings?.reduce((sum, b) => sum + (b.totalPrice || 0), 0) || 0;
    
    if (outstandingBalance + totalPrice > agent.creditLimit) {
      throw new Error("INSUFFICIENT_CREDIT_LIMIT");
    }

    // 3. Find or create customer
    let { data: customer } = await supabase
      .from('customers')
      .select('id')
      .eq('email', contactEmail)
      .single();

    if (!customer) {
      const { data: newCustomer } = await supabase
        .from('customers')
        .insert({
          firstName: contactName.split(' ')[0],
          lastName: contactName.split(' ').slice(1).join(' ') || '-',
          email: contactEmail,
          phone: contactPhone,
        })
        .select('id')
        .single();
      customer = newCustomer;
    }

    // 4. Create Booking
    const bookingRef = `B2B-${new Date().getFullYear()}${String(new Date().getMonth()+1).padStart(2,'0')}-${Math.floor(Math.random()*10000)}`;
    
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        bookingRef,
        departureId,
        customerId: customer?.id,
        agentId,
        status: "PENDING",
        paxAdult: paxCount,
        totalPrice,
        paymentStatus: "UNPAID",
        wholesaleType: "API", 
        wholesaleStatus: "PENDING"
      })
      .select('id')
      .single();

    if (bookingError || !booking) throw new Error("FAILED_TO_CREATE_BOOKING");

    // 5. Create Travelers
    const travelersToInsert = travelers.map(t => ({
      bookingId: booking.id,
      ...t
    }));
    await supabase.from('booking_travelers').insert(travelersToInsert);

    // 6. Deduct seats from departure
    // Technically, this should be an RPC for safety, but we do it manually for prototype
    await supabase
      .from('departures')
      .update({ remainingSeats: departure.remainingSeats - paxCount })
      .eq('id', departureId);

    // Redirect on success
    return redirect(`/b2b/checkout/success/${booking.id}`);

  } catch (error: any) {
    console.error("B2B Checkout Error:", error);
    if (error.message === "NOT_ENOUGH_SEATS") {
      redirect(`/b2b/tours?error=seats_full`);
    } else if (error.message === "INSUFFICIENT_CREDIT_LIMIT") {
      redirect(`/b2b/tours?error=insufficient_credit`);
    } else {
      // Allow next steps or throw to a generic error page
      throw error;
    }
  }
}
