import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ข้อมูลสำหรับเชื่อมต่อ API ของ Zego
const ZEGO_API_URL = "https://www.zegoapi.com/v1.5"; // Base URL
const ZEGO_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2OWYwM2JlODQzMWFmMmU0ODY5NWY0YjAiLCJpYXQiOjE3Nzc0NjY1NTd9.8rDXA9ryZ8TRxgATTV2GiergoWzMRwISODxLg-f48cw";

export async function POST(request: Request) {
  try {
    // 1. บันทึกประวัติการ Sync ลงใน Database (เริ่มต้น)
    const syncLog = await prisma.apiSyncLog.create({
      data: {
        providerName: "Zego",
        status: "RUNNING",
        recordsAdded: 0,
        recordsUpdated: 0,
      },
    });

    // -------------------------------------------------------------
    // [รอข้อมูลจาก Zego API Document]
    // ปัจจุบันเรายังไม่ทราบ Endpoint ย่อยที่ใช้ดึงข้อมูล เช่น /tours, /products
    // ตรงนี้คือ Code จำลองโครงสร้างการดึงข้อมูลและบันทึกลง Database
    // -------------------------------------------------------------
    
    // const response = await fetch(`${ZEGO_API_URL}/[ENDPOINT_ที่ถูกต้อง]`, {
    //   method: "GET",
    //   headers: {
    //     "Authorization": `Bearer ${ZEGO_TOKEN}`,
    //     "Content-Type": "application/json"
    //   }
    // });
    
    // if (!response.ok) throw new Error("Failed to fetch from Zego API");
    // const data = await response.json();
    
    /* 
    2. โครงสร้างการวนลูปเพื่อบันทึกทัวร์ (Mockup Flow)
    let added = 0;
    let updated = 0;

    for (const item of data.tours) {
       // ตรวจสอบว่ามีทัวร์นี้ในระบบแล้วหรือยัง
       const existingTour = await prisma.tour.findUnique({ where: { wholesaleId: item.id } });

       if (existingTour) {
           await prisma.tour.update({
             where: { id: existingTour.id },
             data: { price: item.price, stock: item.available_seats }
           });
           updated++;
       } else {
           await prisma.tour.create({
             data: {
                wholesaleId: item.id,
                title: item.name,
                destination: item.country,
                durationDays: item.days,
                durationNights: item.nights,
                price: item.price,
                // ... ข้อมูลอื่นๆ
             }
           });
           added++;
       }
    }
    */

    // จำลองผลลัพธ์ว่า Sync สำเร็จ
    const mockAdded = 15;
    const mockUpdated = 5;

    // 3. อัปเดตสถานะ Sync ว่าเสร็จสมบูรณ์
    await prisma.apiSyncLog.update({
      where: { id: syncLog.id },
      data: {
        status: "SUCCESS",
        recordsAdded: mockAdded,
        recordsUpdated: mockUpdated,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Sync completed successfully (Mock Mode)",
      data: {
        added: mockAdded,
        updated: mockUpdated,
      }
    });

  } catch (error: any) {
    console.error("Zego Sync Error:", error);
    
    // กรณีมี Error ให้บันทึกสถานะ FAILED
    await prisma.apiSyncLog.create({
      data: {
        providerName: "Zego",
        status: "FAILED",
        errorMessage: error.message || "Unknown error occurred",
        recordsAdded: 0,
        recordsUpdated: 0,
      },
    });

    return NextResponse.json(
      { success: false, message: "Sync failed", error: error.message },
      { status: 500 }
    );
  }
}
