"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export async function createQuotation(formData: FormData) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "กรุณาเข้าสู่ระบบ" };
  }

  const { data: dbUser } = await supabase
    .from('users')
    .select('*, agent:agents(*)')
    .eq('email', user.email || '')
    .single();

  if (!dbUser || !dbUser.agent) {
    return { success: false, error: "สิทธิ์การเข้าถึงไม่ถูกต้อง" };
  }

  const departureId = formData.get("departureId") as string;
  const customerName = formData.get("customerName") as string;
  const customerEmail = formData.get("customerEmail") as string;
  const paxAdult = parseInt(formData.get("paxAdult") as string) || 1;
  const paxChild = parseInt(formData.get("paxChild") as string) || 0;
  const totalSellingPrice = parseFloat(formData.get("totalSellingPrice") as string) || 0;
  const netPriceEstimate = parseFloat(formData.get("netPriceEstimate") as string) || 0;
  const notes = formData.get("notes") as string;
  
  if (!departureId || !customerName || totalSellingPrice <= 0) {
    return { success: false, error: "กรุณากรอกข้อมูลให้ครบถ้วนและระบุราคาขายที่ถูกต้อง" };
  }

  try {
    const quotationRef = `QT-${new Date().getFullYear()}${String(new Date().getMonth()+1).padStart(2,'0')}-${Math.floor(Math.random()*10000)}`;
    
    // Valid for 7 days
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + 7);

    const { data: quotation, error } = await supabase
      .from('quotations')
      .insert({
        quotationRef,
        agentId: dbUser.agent.id,
        departureId,
        customerName,
        customerEmail,
        paxAdult,
        paxChild,
        totalSellingPrice,
        netPriceEstimate,
        notes,
        validUntil,
        status: "ACTIVE"
      })
      .select('id')
      .single();

    if (error || !quotation) {
      throw new Error("Failed to insert quotation: " + error?.message);
    }

    return { success: true, quotationId: quotation.id };
  } catch (error: any) {
    console.error("Quotation Creation Error:", error);
    return { success: false, error: "เกิดข้อผิดพลาดในการสร้างใบเสนอราคา" };
  }
}
