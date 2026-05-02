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
    let { 
      serviceType = "FULL_SERVICE", 
      name = "AI Prompt User", 
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
      hotelStars,
      prompt // NEW: Natural language prompt
    } = body;

    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      return NextResponse.json({ error: "OpenAI API Key not configured" }, { status: 500 });
    }
    const openai = new OpenAI({ apiKey: openaiApiKey });

    let finalDurationDays = 3;

    // AI Natural Language Extraction if prompt is provided
    if (prompt) {
      const extractPrompt = `
      คุณเป็น AI แยกข้อมูลการท่องเที่ยว (Travel Entity Extractor)
      จากข้อความความต้องการของลูกค้าต่อไปนี้ ให้ดึงข้อมูลออกมาเป็น JSON
      ข้อความ: "${prompt}"
      
      รูปแบบ JSON:
      {
        "country": "ประเทศที่ไป (ถ้าไม่ระบุให้ใส่ 'ญี่ปุ่น')",
        "cities": "เมืองที่ไป (ถ้ามี)",
        "durationDays": "จำนวนวัน (ตัวเลขเท่านั้น, ค่าเริ่มต้น 3)",
        "pax": "จำนวนคน (ตัวเลขเท่านั้น, ค่าเริ่มต้น 2)",
        "hotelStars": "ระดับดาวโรงแรม (3, 4, หรือ 5, ค่าเริ่มต้น 3)"
      }
      `;
      const extractRes = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [{ role: "system", content: extractPrompt }],
        temperature: 0
      });
      const extracted = JSON.parse(extractRes.choices[0].message.content || "{}");
      
      country = extracted.country || "ญี่ปุ่น";
      cities = extracted.cities || "";
      pax = Number(extracted.pax) || 2;
      hotelStars = Number(extracted.hotelStars) || 3;
      finalDurationDays = Number(extracted.durationDays) || 3;
      
      if (!startDate) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 30); // Default to 1 month from now
        startDate = tomorrow.toISOString().split('T')[0];
      }
    } else {
      // Normal form processing
      pax = Number(pax) || 1;
      hotelStars = Number(hotelStars) || 3;
    }

    // Calculate dates
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date(start);
    if (!endDate && prompt) {
        end.setDate(start.getDate() + finalDurationDays - 1);
    }
    finalDurationDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);

    // Default inclusions
    includeFlights = includeFlights ?? true;
    includeHotels = includeHotels ?? true;
    includeMeals = includeMeals ?? true;
    includeTransport = includeTransport ?? true;
    includeGuide = includeGuide ?? true;
    includeInsurance = includeInsurance ?? true;

    // Save Lead to Database
    let fitRequest;
    try {
      fitRequest = await prisma.fitRequest.create({
        data: {
          serviceType,
          name,
          email: email || null,
          phone: phone || null,
          pax,
          startDate: start,
          endDate: end,
          durationDays: finalDurationDays,
          country,
          cities,
          includeFlights,
          includeHotels,
          includeMeals,
          includeTransport,
          includeGuide,
          includeInsurance,
          hotelStars,
          status: "PENDING"
        }
      });
    } catch (dbError) {
      console.error("Failed to save FIT request to DB:", dbError);
    }

    let inclusionDetails = "";
    if (serviceType === "FULL_SERVICE") {
      inclusionDetails = `
      กรุณารวมบริการเหล่านี้ในแพ็กเกจ:
      1. ตั๋วเครื่องบิน (Recommended Flights)
      2. โรงแรมระดับ ${hotelStars} ดาว
      3. อาหารครบทุกมื้อ
      4. รถบัส/รถตู้พร้อมคนขับ
      5. หัวหน้าทัวร์จากไทย
      6. ประกันการเดินทาง
      `;
    } else {
      const selected = [];
      if (includeFlights) selected.push("ตั๋วเครื่องบิน");
      if (includeHotels) selected.push(`โรงแรมระดับ ${hotelStars} ดาว`);
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
      pax,
      durationDays: finalDurationDays,
      hotelStars,
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
- เมืองที่อยากไป: ${cities || '-'}
- จำนวนวัน: ${finalDurationDays} วัน
- จำนวนผู้เดินทาง: ${pax} คน
- ประเภทบริการ: ${serviceType === "FULL_SERVICE" ? "Full Service (จัดเต็ม)" : "A La Carte (เลือกบริการเอง)"}

${prompt ? `ความต้องการพิเศษเพิ่มเติมจากลูกค้า: "${prompt}"` : ""}

${inclusionDetails}

กฎการสร้าง JSON:
1. "title": ตั้งชื่อทริปให้น่าสนใจ (ภาษาไทย)
2. "marketingHeadline": สโลแกนสั้นๆ ดึงดูดใจ
3. "highlights": อาเรย์ของจุดเด่นทริป 3 ข้อสั้นๆ
4. "estimatedPrice": ประเมินราคารวมเป็นเงินบาท โดยบังคับใช้ราคา "${pricingData.sellingPricePerPax.toLocaleString()} THB/ท่าน" เท่านั้น พร้อมวงเล็บ "(ราคาโดยประมาณจากระบบอ้างอิง)"
5. "days": แผนการเดินทางรายวัน ${finalDurationDays} วัน 
6. "inclusions" และ "exclusions" สรุปให้ครบถ้วน

IMPORTANT: "exclusions" MUST BE EXACTLY this array:
  [
    "ค่าทิป: ทิปไกด์ท้องถิ่น คนขับรถ และหัวหน้าทัวร์จากไทย",
    "ค่าใช้จ่ายส่วนตัว: ค่าซักรีด, ค่าโทรศัพท์, ค่ามินิบาร์ในห้องพัก, ค่าเครื่องดื่มแอลกอฮอล์",
    "ภาษีและค่าธรรมเนียม: ภาษีมูลค่าเพิ่ม 7% และภาษีหัก ณ ที่จ่าย 3% (หากต้องการใบกำกับภาษี)",
    "ค่าธรรมเนียมอื่นๆ: ค่าทำหนังสือเดินทาง (Passport), ค่าทำวีซ่า (สำหรับประเทศที่ไม่ได้รับการยกเว้น)",
    "ค่าใช้จ่ายหน้างาน/ตัวเลือกเสริม (Option Tour): ค่าเข้าชมสถานที่ท่องเที่ยวที่ไม่ได้ระบุในโปรแกรม, กิจกรรมเสริม",
    "ค่าห้องพักเดี่ยว: สำหรับผู้เดินทางคนเดียวที่ไม่ต้องการแชร์ห้องกับผู้อื่น (พักเดี่ยว)"
  ]

รูปแบบ JSON:
{
  "title": "string",
  "marketingHeadline": "string",
  "highlights": ["string"],
  "estimatedPrice": "string",
  "hotelStars": ${hotelStars},
  "days": [
    {
      "day": number,
      "title": "string",
      "detail": "string",
      "meals": {"breakfast": boolean,"lunch": boolean,"dinner": boolean},
      "hotel": "string",
      "imagePrompt": "string (A short ENGLISH phrase describing the main tourist attraction of this day, optimized for AI image generation.)"
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
      max_tokens: 2500
    });

    let content = response.choices[0].message.content || "{}";
    content = content.replace(/```json/gi, "").replace(/```/g, "").trim();
    const itinerary = JSON.parse(content);

    // Provide default cover image prompt from day 1 if not generated
    if (!itinerary.coverImagePrompt && itinerary.days?.length > 0) {
      itinerary.coverImagePrompt = itinerary.days[0].imagePrompt;
    }

    return NextResponse.json({ success: true, itinerary });

  } catch (error) {
    console.error("FIT Request Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
