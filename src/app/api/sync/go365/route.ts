import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { createClient } from "@supabase/supabase-js";

// ข้อมูลสำหรับเชื่อมต่อ API ของ Go365 (เตรียมพร้อมรอข้อมูลจริง)
const GO365_API_URL = process.env.GO365_API_URL || "https://api.go365.example.com";
const GO365_TOKEN = process.env.GO365_API_TOKEN || "";

// Admin key is required for bypass RLS and insert/upsert
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://qterfftaebnoawnzkfgu.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_SRwNSJ89mInda5FcuB1W2w_9IEJlSOI";

const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: Request) {
  try {
    // 1. บันทึกประวัติการ Sync ของ Go365 ลงใน Database
    const { data: syncLog } = await supabase.from('ApiSyncLog').insert({
      providerName: "Go365",
      status: "RUNNING",
      recordsAdded: 0,
      recordsUpdated: 0,
    }).select().single();

    // -------------------------------------------------------------
    // [รอข้อมูลจาก Go365 API Document]
    // -------------------------------------------------------------
    
    // const response = await fetch(`${GO365_API_URL}/[ENDPOINT]`, {
    //   headers: { "Authorization": `Bearer ${GO365_TOKEN}` }
    // });
    
    // ... ลอจิกจัดการข้อมูลเหมือนกับ Zego ...

    // จำลองผลลัพธ์ว่า Sync สำเร็จ
    const mockAdded = 10;
    const mockUpdated = 2;

    if (syncLog) {
      await supabase.from('ApiSyncLog').update({
        status: "SUCCESS",
        recordsAdded: mockAdded,
        recordsUpdated: mockUpdated,
      }).eq('id', syncLog.id);
    }

    return NextResponse.json({
      success: true,
      message: "Go365 Sync completed successfully (Mock Mode)",
      data: {
        added: mockAdded,
        updated: mockUpdated,
      }
    });

  } catch (error: any) {
    console.error("Go365 Sync Error:", error);
    
    await supabase.from('ApiSyncLog').insert({
      providerName: "Go365",
      status: "FAILED",
      errorMessage: error.message || "Unknown error occurred",
      recordsAdded: 0,
      recordsUpdated: 0,
    });

    return NextResponse.json({ success: false, message: "Sync failed", error: error.message }, { status: 500 });
  }
}
