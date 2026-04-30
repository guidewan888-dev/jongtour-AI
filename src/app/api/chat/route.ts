import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const { message } = await request.json();
    const userMessage = message.toLowerCase();

    // 1. จำลอง AI ค้นหาคีย์เวิร์ดเพื่อดึงข้อมูลจาก Database
    let destinationFilter = "";
    
    if (userMessage.includes("ญี่ปุ่น") || userMessage.includes("japan")) destinationFilter = "Japan";
    else if (userMessage.includes("เกาหลี") || userMessage.includes("korea")) destinationFilter = "South Korea";
    else if (userMessage.includes("ยุโรป") || userMessage.includes("europe")) destinationFilter = "Europe";
    else if (userMessage.includes("ไต้หวัน") || userMessage.includes("taiwan")) destinationFilter = "Taiwan";

    // 2. ดึงข้อมูลจาก Supabase Database (ถ้ามีคีย์เวิร์ด)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://qterfftaebnoawnzkfgu.supabase.co";
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_SRwNSJ89mInda5FcuB1W2w_9IEJlSOI";
    const supabase = createClient(supabaseUrl, supabaseKey);

    let tours: any[] = [];
    if (destinationFilter) {
      const { data } = await supabase
        .from('Tour')
        .select('*')
        .eq('destination', destinationFilter)
        .limit(3);
      if (data) tours = data;
    } else if (userMessage.includes("แนะนำ") || userMessage.includes("ทัวร์ไหนดี")) {
      // ดึงทัวร์แนะนำแบบสุ่ม
      const { data } = await supabase
        .from('Tour')
        .select('*')
        .limit(3);
      if (data) tours = data;
    }

    // 3. จำลองข้อความตอบกลับของ AI (Generative Text)
    let aiReply = "สวัสดีครับ ผม Jongtour AI 😊 ยินดีที่ได้ให้บริการครับ\nคุณอยากไปเที่ยวประเทศไหน เดินทางช่วงเดือนอะไร หรือมีงบประมาณในใจเท่าไหร่ พิมพ์บอกผมได้เลยครับ!";
    
    if (tours.length > 0) {
      aiReply = `ว้าว! การไปเที่ยว **${destinationFilter || 'ทัวร์ยอดฮิต'}** เป็นไอเดียที่ยอดเยี่ยมมากครับ! 🎒✨\n\nผมได้ทำการสแกนแพ็กเกจทั้งหมดในระบบและพบทัวร์ที่ตรงกับความต้องการของคุณครับ ลองดูแพ็กเกจที่ผมคัดมาให้ด้านล่างนี้นะครับ หากสนใจตัวไหนเป็นพิเศษสามารถกดเข้าไปดูรายละเอียดหรือจองได้ทันทีครับ`;
    } else if (userMessage.length > 5 && !userMessage.includes("สวัสดี")) {
      aiReply = "ผมกำลังพยายามหาแพ็กเกจที่ตรงกับความต้องการของคุณอยู่ครับ แต่ดูเหมือนว่าตอนนี้อาจจะยังไม่มีแพ็กเกจที่ตรงแบบ 100% ลองเปลี่ยนเป็น 'แนะนำทัวร์ยุโรป' หรือ 'ทัวร์ญี่ปุ่น' ดูไหมครับ? 😊";
    }

    // 4. รอสัก 1.5 วินาทีเพื่อความสมจริงเหมือน AI กำลังคิด
    await new Promise((resolve) => setTimeout(resolve, 1500));

    return NextResponse.json({
      reply: aiReply,
      tours: tours // ส่งข้อมูลทัวร์จาก Database กลับไปแสดงผลเป็น Card
    });

  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json({ reply: "ขออภัยครับ ระบบ AI ขัดข้องชั่วคราว โปรดลองใหม่อีกครั้ง" }, { status: 500 });
  }
}
