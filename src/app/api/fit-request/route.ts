import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import OpenAI from "openai";
import { calculateFitPrice } from "@/services/pricingEngine";

const prisma = new PrismaClient();
export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      serviceType, 
      name, 
      email, 
      phone, 
      pax, 
      startDate, 
      endDate, 
      country, 
      cities,
      includeFlights,
      includeHotels,
      includeMeals,
      includeTransport,
      includeGuide,
      includeInsurance,
      hotelStars
    } = body;

    // Calculate duration
    const start = new Date(startDate);
    const end = new Date(endDate);
    const durationDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);

    // Save Lead to Database
    let fitRequest;
    try {
      fitRequest = await prisma.fitRequest.create({
        data: {
          serviceType,
          name,
          email: email || null,
          phone: phone || null,
          pax: Number(pax) || 1,
          startDate: start,
          endDate: end,
          durationDays,
          country,
          cities,
          includeFlights: includeFlights ?? true,
          includeHotels: includeHotels ?? true,
          includeMeals: includeMeals ?? true,
          includeTransport: includeTransport ?? true,
          includeGuide: includeGuide ?? true,
          includeInsurance: includeInsurance ?? true,
          hotelStars: Number(hotelStars) || 3,
          status: "PENDING"
        }
      });
    } catch (dbError) {
      console.error("Failed to save FIT request to DB:", dbError);
      // Continue anyway so the user gets their itinerary
    }

    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      return NextResponse.json({ error: "OpenAI API Key not configured" }, { status: 500 });
    }

    const openai = new OpenAI({ apiKey: openaiApiKey });

    let inclusionDetails = "";
    if (serviceType === "FULL_SERVICE") {
      inclusionDetails = `
      กรุณารวมบริการเหล่านี้ในแพ็กเกจ:
      1. ตั๋วเครื่องบิน (Recommended Flights)
      2. โรงแรมระดับ ${hotelStars || 3} ดาว
      3. อาหารครบทุกมื้อ
      4. รถบัส/รถตู้พร้อมคนขับ
      5. หัวหน้าทัวร์จากไทย
      6. ประกันการเดินทาง
      `;
    } else {
      const selected = [];
      if (includeFlights) selected.push("ตั๋วเครื่องบิน");
      if (includeHotels) selected.push(`โรงแรมระดับ ${hotelStars || 3} ดาว`);
      if (includeMeals) selected.push("อาหารครบทุกมื้อ");
      if (includeTransport) selected.push("รถบัส/รถตู้พร้อมคนขับ");
      if (includeGuide) selected.push("หัวหน้าทัวร์จากไทย");
      if (includeInsurance) selected.push("ประกันการเดินทาง");

      inclusionDetails = `
      กรุณารวมเฉพาะบริการที่ลูกค้าระบุไว้ดังนี้:
      ${selected.map((s, i) => `${i+1}. ${s}`).join("\\n")}
      หากไม่ได้เลือกบริการไหน ห้ามนำมาคิดราคารวม
      `;
    }

    const isFullService = serviceType === "FULL_SERVICE";
    const pricingData = await calculateFitPrice({
      country,
      pax: Number(pax) || 1,
      durationDays,
      hotelStars: Number(hotelStars) || 3,
      includeFlights: isFullService || includeFlights,
      includeHotels: isFullService || includeHotels,
      includeTransport: isFullService || includeTransport,
      includeGuide: isFullService || includeGuide,
      includeInsurance: isFullService || includeInsurance,
    });
    
    console.log("[Pricing Engine] Cost Breakdown:", JSON.stringify(pricingData.breakdownPerPax, null, 2));

    const systemPrompt = `คุณคือผู้เชี่ยวชาญด้านการจัดทริปทัวร์ส่วนตัว (F.I.T. Tour Expert)
หน้าที่ของคุณคือออกแบบโปรแกรมการเดินทาง (Itinerary) ตามข้อมูลที่ลูกค้าให้มา

ข้อมูลทริป:
- ประเทศ: ${country}
- เมืองที่อยากไป: ${cities}
- จำนวนวัน: ${durationDays} วัน
- จำนวนผู้เดินทาง: ${pax} คน
- ประเภทบริการ: ${serviceType === "FULL_SERVICE" ? "Full Service (จัดเต็ม)" : "A La Carte (เลือกบริการเอง)"}

${inclusionDetails}

กฎการสร้าง JSON:
1. "title": ตั้งชื่อทริปให้น่าสนใจ (ภาษาไทย)
2. "estimatedPrice": ให้ประเมินราคารวมทั้งหมดตามบริการที่รวมไว้ เป็นเงินบาท โดยให้บังคับใช้ราคาขายจริงที่คำนวณมาแล้วคือ "${pricingData.sellingPricePerPax.toLocaleString()} THB/ท่าน" เท่านั้น (ห้ามประเมินเองเด็ดขาด) พร้อมวงเล็บต่อท้ายว่า "(ราคาโดยประมาณจากระบบอ้างอิง)"
**สำคัญมาก: ทัวร์ส่วนตัว (Private Tour) มีต้นทุนการจัดการที่สูงกว่าปกติ ราคา ${pricingData.sellingPricePerPax.toLocaleString()} THB/ท่าน นี้ได้รวมค่าตั๋ว ค่าโรงแรม ค่าอาหาร ค่ารถ ค่าไกด์ และบวกกำไร 20% เรียบร้อยแล้ว ให้ใช้ตัวเลขนี้ในการเสนอราคาเลย**
3. "days": สร้างแผนการเดินทางแบบรายวันให้ครบ ${durationDays} วัน 
4. "inclusions": สรุปรายการที่รวมในราคา (ภาษาไทย) แบบสั้นๆ เช่น ["ตั๋วเครื่องบินไป-กลับ", "โรงแรม 3 ดาว", ...]
5. "exclusions": คุณต้องใส่ข้อความฮาร์ดโค้ดเหล่านี้ลงไปเป๊ะๆ:
  [
    "ค่าทิป: ทิปไกด์ท้องถิ่น คนขับรถ และหัวหน้าทัวร์จากไทย",
    "ค่าใช้จ่ายส่วนตัว: ค่าซักรีด, ค่าโทรศัพท์, ค่ามินิบาร์ในห้องพัก, ค่าเครื่องดื่มแอลกอฮอล์",
    "ภาษีและค่าธรรมเนียม: ภาษีมูลค่าเพิ่ม 7% และภาษีหัก ณ ที่จ่าย 3% (หากต้องการใบกำกับภาษี)",
    "ค่าธรรมเนียมอื่นๆ: ค่าทำหนังสือเดินทาง (Passport), ค่าทำวีซ่า (สำหรับประเทศที่ไม่ได้รับการยกเว้น)",
    "ค่าใช้จ่ายหน้างาน/ตัวเลือกเสริม (Option Tour): ค่าเข้าชมสถานที่ท่องเที่ยวที่ไม่ได้ระบุในโปรแกรม, กิจกรรมเสริม",
    "ค่าห้องพักเดี่ยว: สำหรับผู้เดินทางคนเดียวที่ไม่ต้องการแชร์ห้องกับผู้อื่น (พักเดี่ยว)"
  ]

สำคัญมาก: ส่งคืนเฉพาะ JSON เท่านั้น ไม่มีข้อความอื่นปน
รูปแบบ JSON ที่ต้องการ:
{
  "title": "string",
  "estimatedPrice": "string",
  "hotelStars": ${hotelStars || 3},
  "days": [
    {
      "day": number,
      "title": "string",
      "detail": "string",
      "meals": {
        "breakfast": boolean,
        "lunch": boolean,
        "dinner": boolean
      },
      "hotel": "string (ชื่อโรงแรม ${hotelStars || 3} ดาว หรือ ระบุว่า '-' หากไม่มีการพัก)",
      "imagePrompt": "string (A short ENGLISH phrase describing the main tourist attraction of this day, optimized for AI image generation. e.g. 'A beautiful photography of Mount Fuji in spring'. If flight day, use 'A commercial airplane flying in the sky')"
    }
  ],
  "inclusions": ["string"],
  "exclusions": ["string"]
}
You MUST write the entire JSON values in THAI language.
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    let content = response.choices[0].message.content || "{}";
    content = content.replace(/```json/gi, "").replace(/```/g, "").trim();
    const itinerary = JSON.parse(content);

    return NextResponse.json({ success: true, itinerary });

  } catch (error) {
    console.error("FIT Request Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
