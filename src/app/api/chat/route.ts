import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import OpenAI from "openai";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  // Initialize OpenAI at runtime to ensure latest environment variables are used
  const openaiApiKey = process.env.OPENAI_API_KEY;
  const isOpenAIAvailable = !!openaiApiKey;
  const openai = isOpenAIAvailable ? new OpenAI({ apiKey: openaiApiKey }) : null;

  try {
    const { message = "", chatHistory = [], image } = await request.json();
    const userMessage = message.trim();
    const userImage = image; // base64 string

    // Check if user is logged in for personalization
    const cookieStore = await cookies();
    const supabaseUserClient = createServerClient(cookieStore);
    const { data: { user } } = await supabaseUserClient.auth.getUser();
    let userName = "คุณลูกค้า";
    if (user && user.user_metadata?.full_name) {
      userName = `คุณ ${user.user_metadata.full_name.split(" ")[0]}`;
    }

    // Default criteria
    const searchCriteria = {
      keywords: [] as string[],
      maxPrice: null as number | null,
      isFire: false,
      source: null as string | null,
      days: null as number | null,
      airline: null as string | null,
      month: null as string | null,
    };

    let isFitRequest = false;
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
- "isFire": boolean. true if the user is looking for last-minute deals (e.g., "ไฟไหม้", "โปรไฟไหม้").
- "wholesale": string or null. Extract wholesale tour company names if mentioned (e.g. "Let's go", "Check in", "Go 365", "Tour Factory"). DO NOT put wholesale names in "keywords".
- "days": number or null. Extract the EXACT number of days requested (e.g. "3 วัน" -> 3).
- "airline": string or null. Extract the specific airline requested (e.g. "การบินไทย", "แอร์เอเชีย", "TG", "XJ").
- "month": string or null. Extract the month requested in English (e.g. "เมษา", "เมษายน", "สงกรานต์" -> "April").
- "isFitRequest": boolean. true if the user wants a private tour, custom itinerary, or F.I.T. (e.g., "จัดทัวร์ส่วนตัว", "ไปกันเอง", "ช่วยจัดทริปให้หน่อย").`
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
        if (typeof parsed.days === "number") searchCriteria.days = parsed.days;
        if (typeof parsed.airline === "string") searchCriteria.airline = parsed.airline;
        if (typeof parsed.month === "string") searchCriteria.month = parsed.month;
        if (parsed.isFitRequest === true) isFitRequest = true;
        
        if (parsed.wholesale) {
          const w = parsed.wholesale.toLowerCase();
          if (w.includes("let") || w.includes("lego")) searchCriteria.source = "API_ZEGO";
          else if (w.includes("check")) searchCriteria.source = "CHECKIN";
          else if (w.includes("365")) searchCriteria.source = "API_GO365";
          else if (w.includes("factory")) searchCriteria.source = "TOUR_FACTORY";
        }
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

    let matchedTourIds: string[] = [];
    let isSemanticSearch = false;

    // Perform Semantic Search (RAG) if OpenAI is available and query is somewhat descriptive
    if (openai && userMessage.length > 5) {
      try {
        const embedResponse = await openai.embeddings.create({
          model: "text-embedding-3-small",
          input: userMessage.replace(/\n/g, " "),
          encoding_format: "float",
        });

        const query_embedding = embedResponse.data[0].embedding;

        const { data: matches, error: matchError } = await supabase.rpc('match_tours', {
          query_embedding,
          match_threshold: 0.25, // 0.25 threshold (can be adjusted)
          match_count: 8
        });

        if (!matchError && matches && matches.length > 0) {
          matchedTourIds = matches.map((m: any) => m.id);
          isSemanticSearch = true;
          // Merge semantic keywords for highlighting/context
          if (searchCriteria.keywords.length === 0) {
            searchCriteria.keywords = ["ทัวร์ที่ตรงกับความต้องการของคุณ"];
          }
        }
      } catch (err) {
        console.error("Semantic search failed:", err);
      }
    }

    let query = supabase.from('Tour').select('*, departures:TourDeparture(*)');

    if (searchCriteria.isFire) {
      query = query.or('title.ilike.*ไฟไหม้*,title.ilike.*โปรไฟไหม้*');
    }

    if (searchCriteria.keywords.length > 0 && !isSemanticSearch) {
      const strictCountries = ["ยุโรป", "europe", "จีน", "china", "ญี่ปุ่น", "japan", "เกาหลี", "korea", "ไต้หวัน", "taiwan", "ฮ่องกง", "hong kong"];
      
      const orConditions = searchCriteria.keywords.map(kw => {
        if (strictCountries.includes(kw.toLowerCase())) {
          return `destination.ilike.*${kw}*`;
        }
        return `destination.ilike.*${kw}*,title.ilike.*${kw}*`;
      });
      
      query = query.or(orConditions.join(','));
    }

    // Apply semantic search results if available
    if (isSemanticSearch && matchedTourIds.length > 0) {
      query = query.in('id', matchedTourIds);
    }

    if (searchCriteria.source) {
      query = query.eq('source', searchCriteria.source);
    }
    
    if (searchCriteria.days) {
      query = query.eq('days', searchCriteria.days);
    }
    
    if (searchCriteria.airline) {
      query = query.ilike('airline', `%${searchCriteria.airline}%`);
    }

    // Always fetch some to sort
    query = query.order('createdAt', { ascending: false }).limit(30);

    const { data: rawTours, error } = await query;
    let tours = rawTours || [];

    // Re-order by semantic similarity if RAG was used
    if (isSemanticSearch && matchedTourIds.length > 0) {
      tours.sort((a, b) => matchedTourIds.indexOf(a.id) - matchedTourIds.indexOf(b.id));
    }

    // Local Filters
    if (searchCriteria.maxPrice && tours.length > 0) {
      tours = tours.filter(tour => tour.price <= searchCriteria.maxPrice!);
    }

    if (searchCriteria.month && tours.length > 0) {
      const targetMonth = searchCriteria.month.toLowerCase();
      const monthMap: Record<string, string[]> = {
        "january": ["ม.ค.", "มกรา", "jan"],
        "february": ["ก.พ.", "กุมภา", "feb"],
        "march": ["มี.ค.", "มีนา", "mar"],
        "april": ["เม.ย.", "เมษา", "สงกรานต์", "apr"],
        "may": ["พ.ค.", "พฤษภา", "may"],
        "june": ["มิ.ย.", "มิถุนา", "jun"],
        "july": ["ก.ค.", "กรกฎา", "jul"],
        "august": ["ส.ค.", "สิงหา", "aug"],
        "september": ["ก.ย.", "กันยา", "sep"],
        "october": ["ต.ค.", "ตุลา", "oct"],
        "november": ["พ.ย.", "พฤศจิกา", "nov"],
        "december": ["ธ.ค.", "ธันวา", "dec", "ปีใหม่"]
      };
      
      const aliases = monthMap[targetMonth] || [targetMonth];
      
      tours = tours.filter(tour => {
        const textToSearch = (tour.periodText || "") + " " + (tour.departures?.map((d:any)=>d.dateText).join(" ") || "");
        return aliases.some(alias => textToSearch.toLowerCase().includes(alias));
      });
    }

    // Return max 4 for UI
    tours = tours.slice(0, 4);

    let customItinerary = null;
    if (isOpenAIAvailable && openai && isFitRequest) {
      try {
        const fitResponse = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: "You are an expert travel agent. The user wants a custom private tour (F.I.T). Generate a detailed day-by-day itinerary based on their request. Return ONLY JSON matching this format: { \"title\": \"Trip Name\", \"estimatedPrice\": \"Price (e.g. 45000 THB)\", \"days\": [{ \"day\": 1, \"title\": \"Day Title\", \"detail\": \"Day details\" }] }" },
            { role: "user", content: userMessage }
          ]
        });
        customItinerary = JSON.parse(fitResponse.choices[0].message.content || "null");
      } catch (e) {
        console.error("FIT Generation Error:", e);
      }
    }

    // 3. Generate natural response
    let aiReply = "";

    if (isOpenAIAvailable && openai && !aiFailed) {
      try {
        const tourTitles = tours.length > 0 ? tours.map(t => {
          const deps = (t.departures || []).slice(0, 3).map((d: any) => d.dateText).join(", ");
          return `- โค้ดทัวร์: ${t.code}
- ชื่อแพ็กเกจ: ${t.title}
- สายการบิน: ${t.airline || "ไม่ระบุ"}
- ระยะเวลา: ${t.days || "-"} วัน ${t.nights || "-"} คืน
- ราคาเริ่มต้น: ${t.price} บาท
- วันเดินทาง: ${deps || t.periodText || "ดูรายละเอียดในเว็บ"}
- โฮลเซลล์: ${t.source === 'API_ZEGO' ? "Let's Go" : t.source === 'CHECKIN' ? "Check In Tour" : t.source === 'API_GO365' ? "GO 365" : t.source === 'TOUR_FACTORY' ? "Tour Factory" : t.source}
- ไฮไลท์โปรแกรม: ${t.highlight ? t.highlight.substring(0, 150) + "..." : "ไม่ระบุ"}`;
        }).join("\n\n") : "ไม่มีทัวร์ที่ตรงสเปก";
        
        const systemPromptContent = customItinerary 
          ? `You are จองทัวร์ AI (Jongtour AI), an incredibly enthusiastic, persuasive, and funny Thai travel agent! Your goal is to make the user excited to book tours. Use humor, excitement, and a bit of friendly Thai slang. Always refer to yourself as "จองทัวร์ AI".
The user you are talking to is named "${userName}". Greet them by name naturally in the conversation!
You have successfully generated a Custom Private Tour Itinerary (F.I.T) for the user. Excitedly present it and tell them to check the interactive planner card below. Do not repeat the day-by-day details in your text response, just build hype! 
Suggest exactly 3 short follow-up questions at the end like: __CHIPS__["อยากจองเลย", "ขอปรับแผนวันที่ 2", "ราคารวมวีซ่าไหม"]` 
          : `You are จองทัวร์ AI (Jongtour AI), an incredibly enthusiastic, persuasive, and funny Thai travel agent! Your goal is to make the user excited to book tours. Use humor, excitement, and a bit of friendly Thai slang. Always refer to yourself as "จองทัวร์ AI".
The user you are talking to is named "${userName}". Greet them by name naturally in the conversation!
You searched the database based on the latest query and found ${tours.length} tours:
${tourTitles}

CRITICAL RULES:
1. You MUST ONLY talk about travel, tours, destinations, and Jongtour services. (Note: Let's Go, Check In Tour, GO 365, and Tour Factory are our trusted wholesale partners).
2. If the user asks about ANYTHING unrelated (politics, coding, general knowledge, etc.), politely decline to answer. HOWEVER, questions about airlines, tour codes, travel dates, and wholesale companies ARE travel-related and you MUST answer them using the provided tour data! Do NOT decline these.
3. If the user uploaded an image of a competitor's tour program: Act like an expert travel agent. Analyze the highlights in the image. Then, present our similar tours (if any) and enthusiastically persuade the user that our packages are better, cheaper, or have better service! If tours = 0, say we have customized trips available.
4. If tours > 0: Excitedly and persuasively present the found tours. Tell them to check the cards below. Highlight the airlines or dates if the user asked. Make it sound like a deal they can't miss!
5. If tours = 0 and no image uploaded: Apologize playfully, suggest they adjust their budget or destination.
6. Suggest exactly 3 short, helpful follow-up questions the user can ask next. Put them at the VERY END of your response in this exact format on a new line:
__CHIPS__["question 1", "question 2", "question 3"]
Use emojis naturally. DO NOT use markdown bold/italic formatting to keep it clean for the chat UI.`;

        const response = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: systemPromptContent
            },
            ...(chatHistory.slice(-6).map((m: any) => ({ 
              role: m.role === 'ai' ? 'assistant' : 'user', 
              content: m.content 
            }))),
            { 
              role: "user", 
              content: userImage ? [
                { type: "text", text: userMessage || "ช่วยวิเคราะห์รูปโปรแกรมทัวร์นี้หน่อยครับ และเทียบกับของ จองทัวร์ ให้ที" },
                { type: "image_url", image_url: { url: userImage } }
              ] : userMessage 
            }
          ],
          stream: true,
        });

        const encoder = new TextEncoder();
        
        const stream = new ReadableStream({
          async start(controller) {
            // Send tours data or custom itinerary first
            if (customItinerary) {
              const dataStr = JSON.stringify({ type: 'custom_itinerary', itinerary: customItinerary });
              controller.enqueue(encoder.encode(`__DATA__${dataStr}__DATA__\n`));
            } else {
              const dataStr = JSON.stringify({ type: 'tours_data', tours });
              controller.enqueue(encoder.encode(`__DATA__${dataStr}__DATA__\n`));
            }
            
            try {
              for await (const chunk of response) {
                const text = chunk.choices[0]?.delta?.content || "";
                if (text) {
                  controller.enqueue(encoder.encode(text));
                }
              }
            } catch (e) {
              console.error("Stream error", e);
            } finally {
              controller.close();
            }
          }
        });

        return new Response(stream, {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
          },
        });
        
      } catch (e) {
        console.error("OpenAI reply generation failed", e);
      }
    }

    // Fallback if AI is not available or failed
    if (!aiReply) {
      if (searchCriteria.keywords.length === 0 && !searchCriteria.isFire && !searchCriteria.maxPrice && !userImage) {
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

    // Since we return a stream now, this fallback block will only execute if AI completely failed before streaming
    return NextResponse.json({ reply: aiReply, tours: tours });
    
  } catch (error) {
    console.error("AI Chat Error:", error);
    return NextResponse.json({ reply: "ขออภัย ระบบขัดข้อง 😅", tours: [] }, { status: 500 });
  }
}
