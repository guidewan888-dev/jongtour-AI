"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export async function updateTravelerDocument(travelerId: string, documentType: "passport" | "visa", fileUrl: string) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    
    // Check if user is logged in
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { error: "Unauthorized" };
    }

    // Verify that the traveler belongs to a booking owned by this user (or if user is ADMIN)
    const { data: dbUser } = await supabase
      .from('User')
      .select('*')
      .eq('email', user.email || '')
      .single();
    if (!dbUser) return { error: "User not found" };

    const { data: traveler } = await supabase
      .from('Traveler')
      .select('*, booking:Booking(*)')
      .eq('id', travelerId)
      .single();

    if (!traveler) return { error: "Traveler not found" };

    if (dbUser.role !== "ADMIN" && traveler.booking.userId !== dbUser.id) {
      return { error: "Unauthorized to update this document" };
    }

    // Update the record
    const updateData = documentType === "passport" 
      ? { passportFileUrl: fileUrl }
      : { visaFileUrl: fileUrl };

    const { data: updatedTraveler, error } = await supabase
      .from('Traveler')
      .update(updateData)
      .eq('id', travelerId)
      .select()
      .single();

    if (error) throw error;

    return { success: true, data: updatedTraveler };
  } catch (error: any) {
    console.error("Failed to update traveler document:", error);
    return { error: error.message || "Something went wrong" };
  }
}
