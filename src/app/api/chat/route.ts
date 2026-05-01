import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  // Initialize OpenAI at runtime to ensure latest environment variables are used
  const openaiApiKey = process.env.OPENAI_API_KEY;
  const isOpenAIAvailable = !!openaiApiKey;
  const openai = isOpenAIAvailable ? new OpenAI({ apiKey: openaiApiKey }) : null;

  try {
    const { message, chatHistory = [] } = await request.json();
    const userMessage = message.trim();

    // Default criteria
    const searchCriteria = {
      keywords: [] as string[],
      maxPrice: null as number | null,
      isFire: false,
    };

    let aiFailed = false;

    if (isOpenAIAvailable && openai) {
      try {
        const response = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          response_format: { type: "json_object" },
          messages: [
            {
              role: "system",
              content: `You are an intelligent travel agent parsing user travel queries.
Extract the travel intent from the latest user message, taking into account the conversation history.
Return ONLY a JSON object with these exact keys:
- "keywords": array of strings. Include destination countries, cities, or continents in THAI language (e.g., ["ญี่ปุ่น", "ยุโรป", "หน้าหนาว", "ฮอกไกโด"]). Leave empty if none found. Do NOT include generic words like "ทัวร์" or "ไปเที่ยว".
- "maxPrice": number or null. Extract any maximum budget mentioned. Convert shorthand like "3 หมื่น" to 30000.
- "isFire": boolean. true if the user is looking for last-minute deals (e.g., "ไฟไหม้", "โปรไฟไหม้").`
            },
            ...(chatHistory.slice(-6).map((m: any) => ({ 
              role: m.role === 'ai' ? 'assistant' : 'user', 
              content: m.content 
            }))),
            { role: "user", content: userMessage }
          ]
        });
        
        const text = response.choices[0].message.content || "{}";
        const parsed = JSON.parse(text);
        if (parsed.keywords && Array.isArray(parsed.keywords)) searchCriteria.keywords = parsed.keywords;
        if (typeof parsed.maxPrice === "number") searchCriteria.maxPrice = parsed.maxPrice;
        if (parsed.isFire === true) searchCriteria.isFire = true;
      } catch (e) {
        console.error("Failed to parse OpenAI intent:", e);
        aiFailed = true;
      }
    } 
    
    if (!isOpenAIAvailable || !openai || aiFailed) {
      // Fallback Keyword Logic if no OpenAI Key or if API throws error
      const lower = userMessage.toLowerCase();
      // Comprehensive fallback list if Gemini is offline
      const commonDestinations = [
        "ญี่ปุ่น", "japan", "เกาหลี", "korea", "ยุโรป", "europe", "ไต้หวัน", "taiwan", 
        "ฮ่องกง", "hong kong", "จีน", "china", "สิงคโปร์", "singapore", "เวียดนาม", "vietnam", 
        "อังกฤษ", "england", "uk", "ลอนดอน", "london", "แมนเชสเตอร์", "manchester", 
        "จอร์เจีย", "georgia", "สวิส", "switzerland", "ฝรั่งเศส", "france", "ปารีส", "paris",
        "อิตาลี", "italy", "โรม", "rome", "มิลาน", "milan", "มาเลเซีย", "malaysia", 
        "พม่า", "myanmar", "ลาว", "laos", "ตุรกี", "turkey", "ออสเตรเลีย", "australia", 
        "นิวซีแลนด์", "new zealand", "มัลดีฟส์", "maldives", "ดูไบ", "dubai", "อียิปต์", "egypt", 
        "รัสเซีย", "russia", "มอสโก", "moscow", "ซาปา", "ดานัง", "บานาฮิลล์", "ฮอกไกโด", 
        "โตเกียว", "โอซาก้า", "ฟูจิ", "โซล", "ปูซาน", "มาเก๊า", "อเมริกา", "usa"
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

    if (isOpenAIAvailable && openai && !aiFailed) {
      try {
        const tourTitles = tours.length > 0 ? tours.map(t => `- ${t.title} (ราคาเริ่มต้น ${t.price} บาท)`).join("\n") : "ไม่มีทัวร์ที่ตรงสเปก";
        
        const response = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: `You are จองทัวร์ AI (Jongtour AI), a friendly, enthusiastic, and professional Thai travel agent. Always refer to yourself as "จองทัวร์ AI".
You searched the database based on the latest query and found ${tours.length} tours:
${tourTitles}

CRITICAL RULES:
1. You MUST ONLY talk about travel, tours, destinations, and Jongtour services. 
2. If the user asks about ANYTHING unrelated (politics, coding, general knowledge, cooking, etc.), politely decline to answer and steer the conversation back to travel (e.g., "ผมคือ จองทัวร์ AI ตอบได้เฉพาะเรื่องท่องเที่ยวนะครับ 😅 สนใจไปเที่ยวประเทศไหนบอกได้เลยครับ!").
3. If tours > 0: Excitedly present the found tours. Tell them to check the cards below.
4. If tours = 0: Apologize politely, suggest they adjust their budget or destination.
Use emojis naturally. DO NOT use markdown bold/italic formatting to keep it clean for the chat UI.`
            },
            ...(chatHistory.slice(-6).map((m: any) => ({ 
              role: m.role === 'ai' ? 'assistant' : 'user', 
              content: m.content 
            }))),
            { role: "user", content: userMessage }
          ]
        });
        
        aiReply = response.choices[0].message.content?.trim() || "";
      } catch (e) {
        console.error("OpenAI reply generation failed", e);
      }
    }

    // Fallback if AI is not available or failed
    if (!aiReply) {
      if (searchCriteria.keywords.length === 0 && !searchCriteria.isFire && !searchCriteria.maxPrice) {
        // If no keywords matched, check if it's a general greeting or travel request
        const lower = userMessage.toLowerCase();
        const genericQueries = ["แนะนำทัวร์", "ไปเที่ยวไหนดี", "มีทัวร์อะไรบ้าง", "ทัวร์น่าสนใจ", "อยากไปเที่ยว", "มีโปรอะไรบ้าง", "มีโปรไหม"];
        const isGenericRequest = genericQueries.some(q => lower.includes(q)) && lower.length < 30;
        const isGreeting = lower.includes("สวัสดี") || lower.includes("หวัดดี") || lower === "hi" || lower === "hello";
        
        if (isGreeting) {
          aiReply = "สวัสดีครับ ผม จองทัวร์ AI 😊 คุณอยากไปเที่ยวประเทศไหน ช่วงเดือนอะไร หรือมีงบประมาณในใจเท่าไหร่ พิมพ์บอกผมได้เลยครับ!";
          tours = []; // Don't show tours for a simple greeting
        } else if (isGenericRequest) {
          aiReply = `พบแล้วครับ! 🎉 ผมคัดแพ็กเกจ ทัวร์ยอดฮิต มาให้ ${tours.length} รายการ ลองเลือกดูรายละเอียดด้านล่างได้เลยครับ 👇`;
        } else if (lower.includes("ทัวร์") || lower.includes("เที่ยว") || lower.includes("ไป")) {
          // They asked for a specific tour (e.g. "ทัวร์ดูบอล") but we didn't recognize the destination
          aiReply = "ขออภัยด้วยครับ ตอนนี้ผมสามารถค้นหาทัวร์ได้จาก 'ชื่อประเทศ' หรือ 'เมือง' เป็นหลักครับ 😅 รบกวนคุณลูกค้าระบุชื่อประเทศที่สนใจ เช่น 'ทัวร์ยุโรป' หรือ 'ไปญี่ปุ่น' ให้ผมหน่อยนะครับ 🙏";
          tours = []; // Don't show random tours
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
