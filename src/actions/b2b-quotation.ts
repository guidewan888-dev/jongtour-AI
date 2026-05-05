"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export async function createQuotation(formData: FormData) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "กรุณาเข้าสู่ระบบ" };
  }

  // Use Prisma instead of raw Supabase for data integrity
  const dbUser = await prisma.user.findFirst({
    where: { email: user.email || '' },
    include: { agent: true },
  });

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

    const quotation = await prisma.quotation.create({
      data: {
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
        status: "ACTIVE",
      },
    });

    return { success: true, quotationId: quotation.id };
  } catch (error: any) {
    console.error("Quotation Creation Error:", error);
    return { success: false, error: "เกิดข้อผิดพลาดในการสร้างใบเสนอราคา" };
  }
}
