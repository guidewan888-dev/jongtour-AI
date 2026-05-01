import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  // Initialize Gemini at runtime to ensure latest environment variables are used
  const geminiApiKey = process.env.GEMINI_API_KEY;
  const isGeminiAvailable = !!geminiApiKey;
  const genAI = isGeminiAvailable ? new GoogleGenerativeAI(geminiApiKey) : null;

  try {
    const { message } = await request.json();
    const userMessage = message.trim();

    // Default criteria
    const searchCriteria = {
      keywords: [] as string[],
      maxPrice: null as number | null,
      isFire: false,
    };

    let geminiFailed = false;

    if (isGeminiAvailable && genAI) {
      try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const prompt = `
You are an intelligent travel agent parsing user travel queries.
Extract the travel intent from this user message: "${userMessage}"

Return ONLY a valid JSON object with these exact keys:
- "keywords": array of strings. Include destination countries, cities, or continents in THAI language (e.g., ["ญี่ปุ่น", "ยุโรป", "หน้าหนาว", "ฮอกไกโด"]). Leave empty if none found. Do NOT include generic words like "ทัวร์" or "ไปเที่ยว".
- "maxPrice": number or null. Extract any maximum budget mentioned. Convert shorthand like "3 หมื่น" to 30000.
- "isFire": boolean. true if the user is looking for last-minute deals (e.g., "ไฟไหม้", "โปรไฟไหม้").

DO NOT wrap the response in markdown blocks like \`\`\`json. Return JUST the raw JSON string.
`;
        const result = await model.generateContent(prompt);
        let text = result.response.text().trim();
        // Fallback cleanup in case model returns markdown block
        text = text.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        
        const parsed = JSON.parse(text);
        if (parsed.keywords && Array.isArray(parsed.keywords)) searchCriteria.keywords = parsed.keywords;
        if (typeof parsed.maxPrice === "number") searchCriteria.maxPrice = parsed.maxPrice;
        if (parsed.isFire === true) searchCriteria.isFire = true;
      } catch (e) {
        console.error("Failed to parse Gemini intent:", e);
        geminiFailed = true;
      }
    } 
    
    if (!isGeminiAvailable || !genAI || geminiFailed) {
      // Fallback Keyword Logic if no Gemini Key or if API throws 429 Limit Error
      const lower = userMessage.toLowerCase();
      // Comprehensive fallback list if Gemini is offline
      const commonDestinations = [
        "ญี่ปุ่น", "japan", "เกาหลี", "korea", "ยุโรป", "europe", "ไต้หวัน", "taiwan", 
        "ฮ่องกง", "hong kong", "จีน", "china", "สิงคโปร์", "singapore", "เวียดนาม", "vietnam", 
        "อังกฤษ", "england", "uk", "จอร์เจีย", "georgia", "สวิส", "switzerland", "ฝรั่งเศส", "france", 
        "อิตาลี", "italy", "มาเลเซีย", "malaysia", "พม่า", "myanmar", "ลาว", "laos", 
        "ตุรกี", "turkey", "ออสเตรเลีย", "australia", "นิวซีแลนด์", "new zealand", 
        "มัลดีฟส์", "maldives", "ดูไบ", "dubai", "อียิปต์", "egypt", "รัสเซีย", "russia",
        "ซาปา", "ดานัง", "บานาฮิลล์", "ฮอกไกโด", "โตเกียว", "โอซาก้า", "ฟูจิ", "โซล", "ปูซาน", "มาเก๊า"
      ];
      
      for (const dest of commonDestinations) {
        if (lower.includes(dest)) {
          searchCriteria.keywords.push(dest);
        }
      }

      if (lower.includes("ไฟไหม้")) searchCriteria.isFire = true;
      
      // Simple price extraction fallback
      const priceMatch = lower.match(/งบ\s*(\d+)\s*(หมื่น|พัน)?/);
      if (priceMatch) {
        let num = parseInt(priceMatch[1]);
        if (priceMatch[2] === "หมื่น") num *= 10000;
        if (priceMatch[2] === "พัน") num *= 1000;
        searchCriteria.maxPrice = num;
      }
    }

    // 2. Query Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://qterfftaebnoawnzkfgu.supabase.co";
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_SRwNSJ89mInda5FcuB1W2w_9IEJlSOI";
    const supabase = createClient(supabaseUrl, supabaseKey);

    let query = supabase.from('Tour').select('*, departures:TourDeparture(*)');

    if (searchCriteria.isFire) {
      query = query.or('title.ilike.*ไฟไหม้*,title.ilike.*โปรไฟไหม้*');
    }

    if (searchCriteria.keywords.length > 0) {
      const strictCountries = ["ยุโรป", "europe", "จีน", "china", "ญี่ปุ่น", "japan", "เกาหลี", "korea", "ไต้หวัน", "taiwan", "ฮ่องกง", "hong kong"];
      
      const orConditions = searchCriteria.keywords.map(kw => {
        if (strictCountries.includes(kw.toLowerCase())) {
          return `destination.ilike.*${kw}*`;
        }
        return `destination.ilike.*${kw}*,title.ilike.*${kw}*`;
      });
      
      query = query.or(orConditions.join(','));
    }

    // Always fetch some to sort
    query = query.order('createdAt', { ascending: false }).limit(20);

    const { data: rawTours, error } = await query;
    let tours = rawTours || [];

    // Local Max Price Filter
    if (searchCriteria.maxPrice && tours.length > 0) {
      tours = tours.filter(tour => tour.price <= searchCriteria.maxPrice!);
    }

    // Return max 4 for UI
    tours = tours.slice(0, 4);

    // 3. Generate natural response
    let aiReply = "";

    if (isGeminiAvailable && genAI && !geminiFailed) {
      try {
        const replyModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const tourTitles = tours.length > 0 ? tours.map(t => `- ${t.title} (ราคาเริ่มต้น ${t.price} บาท)`).join("\n") : "ไม่มีทัวร์ที่ตรงสเปก";
        
        const replyPrompt = `
You are จองทัวร์ AI (Jongtour AI), a friendly, enthusiastic, and professional Thai travel agent. Always refer to yourself as "จองทัวร์ AI".
The user said: "${userMessage}"
You searched the database and found ${tours.length} tours:
${tourTitles}

CRITICAL RULES:
1. You MUST ONLY talk about travel, tours, destinations, and Jongtour services. 
2. If the user asks about ANYTHING unrelated (politics, coding, general knowledge, cooking, etc.), politely decline to answer and steer the conversation back to travel (e.g., "ผมคือ จองทัวร์ AI ตอบได้เฉพาะเรื่องท่องเที่ยวนะครับ 😅 สนใจไปเที่ยวประเทศไหนบอกได้เลยครับ!").
3. If tours > 0: Excitedly present the found tours. Tell them to check the cards below.
4. If tours = 0: Apologize politely, suggest they adjust their budget or destination.
Use emojis naturally. DO NOT use markdown bold/italic formatting to keep it clean for the chat UI.
        `;
        const replyResult = await replyModel.generateContent(replyPrompt);
        aiReply = replyResult.response.text().trim();
      } catch (e) {
        console.error("Gemini reply generation failed", e);
      }
    }

    // Fallback if Gemini is not available or failed
    if (!aiReply) {
      if (searchCriteria.keywords.length === 0 && !searchCriteria.isFire && !searchCriteria.maxPrice) {
        // If no keywords matched, check if it's a general greeting or travel request
        const lower = userMessage.toLowerCase();
        const isGeneralTravel = lower.includes("แนะนำ") || lower.includes("เที่ยว") || lower.includes("ทัวร์") || lower.includes("ไปไหนดี");
        const isGreeting = lower.includes("สวัสดี") || lower.includes("หวัดดี") || lower === "hi" || lower === "hello";
        
        if (isGreeting) {
          aiReply = "สวัสดีครับ ผม จองทัวร์ AI 😊 คุณอยากไปเที่ยวประเทศไหน ช่วงเดือนอะไร หรือมีงบประมาณในใจเท่าไหร่ พิมพ์บอกผมได้เลยครับ!";
          tours = []; // Don't show tours for a simple greeting
        } else if (isGeneralTravel) {
          aiReply = `พบแล้วครับ! 🎉 ผมคัดแพ็กเกจ ทัวร์น่าสนใจ มาให้ ${tours.length} รายการ ลองเลือกดูรายละเอียดด้านล่างได้เลยครับ 👇`;
        } else {
          aiReply = "ผมเป็นผู้ช่วยจัดทริปของ จองทัวร์ ตอบได้เฉพาะเรื่องท่องเที่ยวนะครับ 😅 สนใจไปเที่ยวประเทศไหนบอกผมได้เลยครับ!";
          tours = []; // Don't show tours for off-topic questions
        }
      } else if (tours.length > 0) {
        const destName = searchCriteria.keywords.length > 0 ? searchCriteria.keywords.join(" และ ") : "ทัวร์น่าสนใจ";
        aiReply = `พบแล้วครับ! 🎉 ผมคัดแพ็กเกจ ${destName} ที่ตรงกับความต้องการของคุณมาให้ ${tours.length} รายการ${searchCriteria.maxPrice ? ` ในงบไม่เกิน ${searchCriteria.maxPrice.toLocaleString()} บาท` : ''} ลองเลือกดูรายละเอียดด้านล่างได้เลยครับ 👇`;
      } else {
        aiReply = `ต้องขออภัยด้วยครับ ตอนนี้ยังไม่มีแพ็กเกจทัวร์ ${searchCriteria.keywords.join(", ")} ${searchCriteria.maxPrice ? `ในงบ ${searchCriteria.maxPrice.toLocaleString()} บาท ` : ''}ที่เปิดรับจองในช่วงนี้ ลองเปลี่ยนจุดหมายหรือเพิ่มงบดูไหมครับ? 😊`;
      }
    }

    return NextResponse.json({
      reply: aiReply,
      tours: tours
    });

  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json({ reply: "ขออภัยครับ ระบบ AI ขัดข้องชั่วคราว โปรดลองใหม่อีกครั้ง 😅" }, { status: 500 });
  }
}
