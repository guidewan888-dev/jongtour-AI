import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import OpenAI from "openai";
import { type NextRequest } from "next/server";
import { calculateFitPrice } from "@/services/pricingEngine";

export const maxDuration = 60; // Increase Vercel timeout for slow AI generation
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const openaiApiKey = process.env.OPENAI_API_KEY;
  const isOpenAIAvailable = !!openaiApiKey;
  const openai = isOpenAIAvailable ? new OpenAI({ apiKey: openaiApiKey }) : null;

  try {
    const { message = "", chatHistory = [], image } = await request.json();
    const userMessage = message.trim();
    const userImage = image; // base64 string

    const cookieStore = await cookies();
    const supabaseUserClient = createServerClient(cookieStore);
    const { data: { user } } = await supabaseUserClient.auth.getUser();
    let userName = "คุณลูกค้า";
    if (user && user.user_metadata?.full_name) {
      userName = `คุณ ${user.user_metadata.full_name.split(" ")[0]}`;
    }

    if (!isOpenAIAvailable || !openai) {
      return NextResponse.json({ reply: "ขออภัย ระบบ AI ไม่พร้อมใช้งาน 😅", tours: [] }, { status: 500 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://qterfftaebnoawnzkfgu.supabase.co";
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_SRwNSJ89mInda5FcuB1W2w_9IEJlSOI";
    const supabase = createClient(supabaseUrl, supabaseKey);

    const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
      {
        type: "function",
        function: {
          name: "search_wholesale_tours",
          description: "Search for ready-made wholesale tours in the database. Use when user asks for standard packages, specific countries, or budgets.",
          parameters: {
            type: "object",
            properties: {
              destination: { type: "string", description: "Target country or city in Thai (e.g., 'ญี่ปุ่น', 'สวิส', 'โอซาก้า'). Leave empty if not specified." },
              maxPrice: { type: "number", description: "Maximum budget per pax in THB" },
              isLastMinute: { type: "boolean", description: "True if user wants fire sale tours ('โปรไฟไหม้')" },
              month: { type: "string", description: "Month name in English (e.g. 'April', 'December')" },
            }
          }
        }
      },
      {
        type: "function",
        function: {
          name: "calculate_fit_price",
          description: "Calculate exact pricing and generate a custom private tour itinerary (F.I.T / กรุ๊ปเหมา / จัดทริป). Use ONLY when user explicitly wants a private or customized trip.",
          parameters: {
            type: "object",
            properties: {
              country: { type: "string", description: "Target country (e.g. 'ญี่ปุ่น')" },
              pax: { type: "number", description: "Number of travelers" },
              durationDays: { type: "number", description: "Duration in days" }
            },
            required: ["country", "pax", "durationDays"]
          }
        }
      }
    ];

    const systemPromptContent = `You are จองทัวร์ AI (Jongtour AI), an incredibly enthusiastic and persuasive Thai travel agent. Your goal is to make the user excited to book tours. Use humor, excitement, and a bit of friendly Thai slang. Always refer to yourself as "จองทัวร์ AI".
The user is named "${userName}". Greet them naturally!

CRITICAL RULES:
1. If the user asks for a tour package, CALL the 'search_wholesale_tours' tool.
2. If the user asks for a private tour (จัดทริป, ไปกันเอง, กรุ๊ปเหมา), CALL the 'calculate_fit_price' tool.
3. If the user asks about ANYTHING unrelated to travel, politely decline to answer.
4. When you get tool results, enthusiastically present the tours or custom itinerary. DO NOT list day-by-day details of FIT in text, just hype the price and tell them to check the card.
5. If search_wholesale_tours returns tours, tell the user to check the interactive cards below. Highlight the best ones.
6. Suggest exactly 3 short follow-up questions at the end in this format:
__CHIPS__["question 1", "question 2", "question 3"]`;

    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: "system", content: systemPromptContent },
      ...(chatHistory.slice(-6).map((m: any) => ({ role: m.role === 'ai' ? 'assistant' : 'user', content: m.content })) as OpenAI.Chat.Completions.ChatCompletionMessageParam[]),
    ];

    if (userImage) {
      messages.push({ role: "user", content: [
        { type: "text", text: userMessage || "ช่วยวิเคราะห์รูปโปรแกรมทัวร์นี้หน่อยครับ และเทียบกับของบริษัทให้ที" },
        { type: "image_url", image_url: { url: userImage } }
      ]});
    } else {
      messages.push({ role: "user", content: userMessage });
    }

    const initialResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      tools,
      tool_choice: "auto",
    });

    const initialMessage = initialResponse.choices[0].message;
    let tours: any[] = [];
    let customItinerary: any = null;
    let shouldStreamSecondPass = false;

    if (initialMessage.tool_calls && initialMessage.tool_calls.length > 0) {
      messages.push(initialMessage);
      shouldStreamSecondPass = true;

      for (const toolCall of initialMessage.tool_calls) {
        if (toolCall.type !== "function") continue;
        
        if (toolCall.function.name === "search_wholesale_tours") {
          const args = JSON.parse(toolCall.function.arguments);
          let query = supabase.from('Tour').select('*, departures:TourDeparture(*)');
          
          if (args.isLastMinute) {
            const today = new Date();
            const next30Days = new Date();
            next30Days.setDate(today.getDate() + 30);
            query = supabase.from('Tour').select('*, departures:TourDeparture!inner(*)').gte('departures.startDate', today.toISOString()).lte('departures.startDate', next30Days.toISOString());
          }

          if (args.destination) {
            query = query.or(`title.ilike.%${args.destination}%,description.ilike.%${args.destination}%,destination.ilike.%${args.destination}%`);
          }
          if (args.maxPrice) {
            query = query.lte('price', args.maxPrice);
          }
          query = query.order('createdAt', { ascending: false }).limit(60);

          const { data: rawTours } = await query;
          tours = rawTours || [];
          tours = tours.sort(() => 0.5 - Math.random());
          if (args.month) {
            const m = args.month.toLowerCase();
            const map: any = { 
              "january": ["ม.ค.", "มกรา", "jan"], "february": ["ก.พ.", "กุมภา", "feb"],
              "march": ["มี.ค.", "มีนา", "mar"], "april": ["เม.ย.", "เมษา", "สงกรานต์", "apr"],
              "may": ["พ.ค.", "พฤษภา", "may"], "june": ["มิ.ย.", "มิถุนา", "jun"],
              "july": ["ก.ค.", "กรกฎา", "jul"], "august": ["ส.ค.", "สิงหา", "aug"],
              "september": ["ก.ย.", "กันยา", "sep"], "october": ["ต.ค.", "ตุลา", "oct"],
              "november": ["พ.ย.", "พฤศจิกา", "nov"], "december": ["ธ.ค.", "ธันวา", "dec", "ปีใหม่"]
            };
            const aliases = map[m] || [m];
            tours = tours.filter(tour => aliases.some((a:string) => ((tour.periodText||"")+" "+(tour.departures?.map((d:any)=>d.dateText).join(" ")||"")).toLowerCase().includes(a)));
          }
          
          tours = tours.slice(0, 4);

          messages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: JSON.stringify({ 
              tours_found: tours.length, 
              tours_summary: tours.map(t => ({ title: t.title, price: t.price, code: t.code, destination: t.destination })) 
            })
          });
        } else if (toolCall.function.name === "calculate_fit_price") {
          const args = JSON.parse(toolCall.function.arguments);
          const pricingData = await calculateFitPrice({
            country: args.country,
            pax: args.pax,
            durationDays: args.durationDays,
            hotelStars: args.hotelStars || 3,
            includeFlights: true,
            includeHotels: true,
            includeTransport: true,
            includeGuide: true,
            includeInsurance: true,
          });

          const fitPrompt = `You are an expert travel agent. Generate a detailed day-by-day itinerary for a private tour to ${args.country} for ${args.durationDays} days. You MUST write the entire itinerary in THAI language. Return ONLY JSON matching this format: { "title": "Trip Name", "marketingHeadline": "A catchy promotional Thai headline for this trip", "highlights": ["Highlight 1", "Highlight 2", "Highlight 3"], "durationText": "${args.durationDays} วัน ${args.durationDays - 1} คืน", "airlineCode": "2-letter IATA airline code suitable for this trip (e.g. TG, XJ, EK, SQ)", "coverImagePrompt": "A short English phrase describing a stunning wide landscape cover image for this trip", "estimatedPrice": "${pricingData.sellingPricePerPax.toLocaleString()} THB/ท่าน", "days": [{ "day": 1, "title": "Day Title", "detail": "Day details", "meals": { "breakfast": true, "lunch": false, "dinner": true }, "hotel": "Hotel Name or -", "imagePrompt": "A short English phrase describing the main attraction", "coordinates": { "lat": 13.7563, "lng": 100.5018 } }] }`;
          
          const fitRes = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            response_format: { type: "json_object" },
            messages: [{ role: "system", content: fitPrompt }]
          });
          
          let content = fitRes.choices[0].message.content || "null";
          content = content.replace(/```json/gi, "").replace(/```/g, "").trim();
          customItinerary = JSON.parse(content);

          messages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: JSON.stringify({ 
              success: true, 
              calculated_price_per_pax: pricingData.sellingPricePerPax, 
              total_pax: args.pax,
              itinerary_generated: true
            })
          });
        }
      }
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        // Send data block first for the UI to render cards
        if (customItinerary) {
          controller.enqueue(encoder.encode(`__DATA__${JSON.stringify({ type: 'custom_itinerary', itinerary: customItinerary })}__DATA__\n`));
        } else {
          // Always send tours_data (even if empty) to satisfy the frontend parser which expects __DATA__ block before rendering text
          controller.enqueue(encoder.encode(`__DATA__${JSON.stringify({ type: 'tours_data', tours })}__DATA__\n`));
        }

        if (shouldStreamSecondPass) {
          const streamResponse = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages,
            stream: true,
          });
          try {
            for await (const chunk of streamResponse) {
              const text = chunk.choices[0]?.delta?.content || "";
              if (text) controller.enqueue(encoder.encode(text));
            }
          } catch (e) {
            console.error("Stream error", e);
          }
        } else {
          // If no tool calls, simulate streaming the initial text response to ensure UI updates smoothly
          if (initialMessage.content) {
            const chunkSize = 5;
            for (let i = 0; i < initialMessage.content.length; i += chunkSize) {
              controller.enqueue(encoder.encode(initialMessage.content.slice(i, i + chunkSize)));
              await new Promise(r => setTimeout(r, 10));
            }
          }
        }
        controller.close();
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error("AI Chat Error:", error);
    return NextResponse.json({ reply: "ขออภัย ระบบขัดข้อง 😅", tours: [] }, { status: 500 });
  }
}
