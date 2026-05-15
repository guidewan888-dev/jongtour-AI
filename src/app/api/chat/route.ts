import { NextResponse } from "next/server";
import { aiRealDataFilter } from '@/lib/filters/realDataFilter';
import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import OpenAI from "openai";
import { type NextRequest } from "next/server";
import { calculateFitPrice } from "@/services/pricingEngine";
import { getSystemPrompt } from "@/services/ai/prompts";
import { getActivePrompt } from "@/services/ai/promptService";
import { extractIntent } from "@/services/ai/intentExtractor";
import { searchTours, formatTourSummary } from "@/services/ai/tourSearchService";
import { runQualityChecker } from "@/services/ai/qualityChecker";
import { processUserImage, getSearchAgentPrompt } from "@/services/ai/ocrExtractor";
import { tools } from "@/services/ai/toolsConfig";
import { wholesaleTools, isWholesaleTool, executeWholesaleTool } from "@/services/ai/wholesaleTools";
import { checkSensitiveCase, validateAiOutput } from "@/services/ai/guardrails";
import { checkRateLimit, getClientId } from "@/lib/rateLimit";
import { extractUsage, mergeUsage, type TokenUsage } from "@/lib/tokenTracker";
import { createChatCompletionSafe } from "@/lib/aiRetry";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  // === RATE LIMITING (#1) ===
  const clientId = getClientId(request);
  const rateCheck = checkRateLimit(`chat:${clientId}`, { maxRequests: 10, windowMs: 60_000 });
  if (!rateCheck.allowed) {
    return NextResponse.json(
      { reply: "ขออภัยครับ คุณส่งข้อความเร็วเกินไป กรุณารอสักครู่แล้วลองใหม่ 🙏", tours: [] },
      { status: 429, headers: { 'X-RateLimit-Remaining': '0', 'X-RateLimit-Reset': String(rateCheck.resetAt) } }
    );
  }

  const openaiApiKey = process.env.OPENAI_API_KEY;
  const isOpenAIAvailable = !!openaiApiKey;
  const openai = isOpenAIAvailable ? new OpenAI({ apiKey: openaiApiKey }) : null;
  let totalUsage: TokenUsage = { promptTokens: 0, completionTokens: 0, totalTokens: 0, estimatedCostUsd: 0, model: 'gpt-4o-mini' };

  try {
    const { message = "", chatHistory = [], image } = await request.json();
    const userMessage = message.trim();
    const userImage = image; // base64 string

    let userName = "คุณลูกค้า";
    let crmContext = "";
    let user: any = null;
    
    // Auth is OPTIONAL — chat must work for anonymous users too
    try {
      const cookieStore = await cookies();
      const supabaseUserClient = createServerClient(cookieStore);
      const { data } = await supabaseUserClient.auth.getUser();
      user = data?.user || null;
      
      if (user && user.user_metadata?.full_name) {
        userName = `คุณ ${user.user_metadata.full_name.split(" ")[0]}`;
      }
      
      // AI CRM (User Profiling)
      if (user) {
        const { prisma } = await import("@/lib/prisma");
        try {
          let userProfile = await prisma.userProfile.findUnique({ where: { userId: user.id } });
          if (!userProfile) {
            userProfile = await prisma.userProfile.create({ data: { userId: user.id, preferences: {} } });
          }
          
          if (userProfile && userProfile.preferences && Object.keys(userProfile.preferences).length > 0) {
            crmContext = `\n\n[CRM DATA: คุณมีข้อมูลความชอบของลูกค้ารายนี้จากประวัติเก่า: ${JSON.stringify(userProfile.preferences)} โปรดนำข้อมูลเหล่านี้มาช่วยในการสนทนาและปิดการขายอย่างแนบเนียน]`;
          }
        } catch (err) {
          console.error("CRM Fetch Error:", err);
        }
      }
    } catch (authError) {
      console.warn("[Chat API] Auth/CRM skipped (Supabase client unavailable):", (authError as any)?.message?.substring(0, 100));
    }

    if (!isOpenAIAvailable || !openai) {
      return NextResponse.json({ reply: "ขออภัย ระบบ AI ไม่พร้อมใช้งาน 😅", tours: [] }, { status: 500 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SB_SERVICE_KEY;
    const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;
    if (!supabase) {
      console.warn("[Chat API] Supabase client not created - URL or Key missing. Vector search disabled.");
    }

    // STEP 0: Sensitive Case Guardrail
    const sensitiveCheck = checkSensitiveCase(userMessage);
    if (sensitiveCheck.isSensitive) {
      return NextResponse.json({ reply: sensitiveCheck.reason, tours: [] });
    }

    // STEP 1: Intent Extraction (Supplier Alias Matching)
    const { extracted: intentExtracted, shouldReturnEarly, earlyReturnMessage } = await extractIntent(openai, userMessage);
    
    if (shouldReturnEarly) {
      return NextResponse.json({ reply: earlyReturnMessage, tours: [] });
    }

    // STEP 1.5: Deep Semantic Search (RAG)
    let semanticMatchedTourIds: string[] = [];
    if (supabase && openai && userMessage.length > 8) {
      try {
        const embedResponse = await openai.embeddings.create({
          model: "text-embedding-3-small",
          input: userMessage.replace(/\n/g, " "),
          encoding_format: "float",
        });
        const query_embedding = embedResponse.data[0].embedding;
        const { data: matches, error: matchError } = await supabase.rpc('match_tours', {
          query_embedding,
          match_threshold: 0.25,
          match_count: 10
        });
        if (!matchError && matches && matches.length > 0) {
          semanticMatchedTourIds = matches.map((m: any) => m.id);
          console.log(`[RAG] Found ${semanticMatchedTourIds.length} matches from DB`);
        } else {
          console.log(`[RAG] Found 0 matches. Error:`, matchError);
        }
      } catch (err) {
        console.error("Semantic search failed:", err);
      }
    }

    // Prepare Messages History
    const dynamicSystemPromptRaw = await getActivePrompt("BOOKING_ASSISTANT_SYSTEM_PROMPT");
    const dynamicSystemPrompt = dynamicSystemPromptRaw + `\n\nCURRENT DATE AND TIME: ${new Date().toISOString()}`;
    const salesStrategyPrompt = await getActivePrompt("SALES_RESPONSE_STRATEGY");
    const fullSystemPrompt = getSystemPrompt() + "\n\n" + dynamicSystemPrompt + "\n\n" + salesStrategyPrompt + crmContext;

    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: "system", content: fullSystemPrompt },
      ...(chatHistory.slice(-15).filter((m: any) => !(m.role === 'ai' && (m.content.includes("ไม่สามารถ") || m.content.includes("ขอโทษครับ")))).map((m: any) => {
        let content = m.content;
        if (m.role === 'ai' && m.tours && m.tours.length > 0) {
          const toursContext = m.tours.map((t:any) => {
            const deps = t.departures ? t.departures.filter((d: any) => new Date(d.startDate) >= new Date()).sort((a: any, b: any) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()).slice(0, 5).map((d: any) => `${new Date(d.startDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })} ถึง ${new Date(d.endDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })} (ว่าง ${d.remainingSeats} ที่)`).join(', ') : 'ไม่มีข้อมูล';
            return `[รหัส: ${t.code}, ชื่อ: ${t.title}, วันเดินทางที่ว่าง: ${deps}]`;
          }).join('\n');
          content += `\n\n[System Note: The following tours were shown to the user in this message:\n${toursContext}]`;
        }
        return { role: m.role === 'ai' ? 'assistant' : 'user', content };
      }) as OpenAI.Chat.Completions.ChatCompletionMessageParam[]),
    ];

    let processedUserMessage = userMessage;
    let forceTool = false;
    let extractedDataForSearch: any = null;

    // STEP 2: OCR Vision processing (if image is uploaded)
    if (userImage) {
      forceTool = true;
      try {
        extractedDataForSearch = await processUserImage(openai, userImage, userMessage);
        
        if (extractedDataForSearch) {
          if (extractedDataForSearch.internal_flow === "tour_extraction") {
             const code = extractedDataForSearch.tour_identity?.tour_code?.value;
             const dest = extractedDataForSearch.destination?.country || extractedDataForSearch.destination?.city;
             const price = extractedDataForSearch.pricing?.[0]?.amount;
             const deps = extractedDataForSearch.departure_dates?.map((d: any) => `${d.start_date} ถึง ${d.end_date}`).join(", ");
             const air = extractedDataForSearch.airline?.value;

             if (extractedDataForSearch.next_action?.should_ask_user) {
                 const q = extractedDataForSearch.next_action?.question_to_user || "ภาพไม่ชัดเจน รบกวนขอข้อมูลเพิ่มเติมครับ";
                 processedUserMessage = `[System Note: AI Vision อ่านภาพแล้วพบว่าข้อมูลไม่ชัดเจน ให้คุณตอบลูกค้าด้วยคำถามนี้: "${q}"]`;
                 forceTool = false;
             } else {
                 let extractedText = `จุดหมายปลายทาง: ${dest || 'ไม่ระบุ'}\nรหัสทัวร์: ${code || 'ไม่ระบุ'}\nราคา: ${price || 'ไม่ระบุ'}\nวันเดินทาง: ${deps || 'ไม่ระบุ'}\nสายการบิน: ${air || 'ไม่ระบุ'}`;
                 const userIntent = userMessage ? `\nข้อความจากลูกค้า: "${userMessage}"` : "";
                 processedUserMessage = `ผู้ใช้ส่งรูปภาพโปรแกรมทัวร์มาและระบบสกัดข้อมูลได้ดังนี้:\n${extractedText}${userIntent}\n\nจงเรียกใช้เครื่องมือค้นหา (search_tours) ทันทีเพื่อตรวจสอบว่ามีโปรแกรมนี้ในระบบหรือไม่ แล้วสรุปให้ลูกค้าฟัง`;
             }
          } 
          else if (extractedDataForSearch.internal_flow === "visual_destination") {
             const dest = extractedDataForSearch.visual_destination?.landmark || extractedDataForSearch.visual_destination?.city || extractedDataForSearch.visual_destination?.country;
             const aiReply = extractedDataForSearch.customer_reply;
             
             if (extractedDataForSearch.search_intent?.should_search_tours) {
                 processedUserMessage = `ผู้ใช้ส่งรูปสถานที่ท่องเที่ยวมา ระบบวิเคราะห์ว่าเป็น: ${dest}\n\nจงค้นหาทัวร์ (search_tours) ไปยัง ${dest} และนำเสนอให้ลูกค้าน่าสนใจครับ`;
             } else {
                 processedUserMessage = `[System Note: ระบบ Vision วิเคราะห์รูปสถานที่แล้ว แต่ยังขาดข้อมูลวันเดินทางหรือจำนวนคน ให้คุณนำข้อความนี้ไปคุยกับลูกค้า: "${aiReply || 'สถานที่นี้สวยมากครับ สนใจไปช่วงไหนครับ?'}"]`;
                 forceTool = false;
             }
          }
          else {
             // Document flow or unknown
             processedUserMessage = `[System Note: ผู้ใช้ส่งรูปภาพเอกสารมา ระบบจำแนกได้ว่าคือ: ${extractedDataForSearch.intent?.file_category} โปรดตอบกลับลูกค้าอย่างสุภาพ หรือถ้าเป็นเอกสารการจองให้บอกว่าจะส่งให้แอดมินตรวจสอบ]`;
             forceTool = false;
          }
        } else {
           processedUserMessage = `[System Note: Vision API Failed or Returned Empty. Reply to the user that the image could not be read clearly and ask them to provide more details.]`;
           forceTool = false;
        }
      } catch (e) {
        console.error("OCR Error", e);
        processedUserMessage = `[System Note: Vision API Encountered an Error. Reply to the user that there was a technical error reading the image.]`;
        forceTool = false;
      }
    } else {
      if (intentExtracted) {
        if (intentExtracted.intent === "search_tour") {
          forceTool = true;
        }
        messages.push({
          role: "system",
          content: `คุณคือ AI Search Agent สำหรับระบบค้นหาทัวร์
search_intent: ${JSON.stringify(intentExtracted)}

คำสั่งสำคัญ: 
1. ถ้า search_intent.supplier_filter_required = true คุณต้องดึงข้อมูลผ่าน search_tours โดยบังคับใช้ strict_filters.supplier_id เสมอ ห้ามแสดง Supplier อื่นเด็ดขาด
2. ถ้า search_intent.destination เป็น null ให้คุณดูจากบริบทการสนทนา (Chat History) ว่าลูกค้ากำลังคุยถึงประเทศหรือเมืองไหน แล้วนำมาใส่เป็นพารามิเตอร์ destination ในการเรียก search_tours`
        });
      }
    }

    messages.push({ role: "user", content: processedUserMessage });

    const initialResponse = await createChatCompletionSafe(openai, {
      model: "gpt-4o-mini", 
      temperature: 0.1,
      messages,
      tools: [...tools, ...wholesaleTools],
      tool_choice: forceTool ? { type: "function", function: { name: "search_tours" } } : "auto",
    });
    totalUsage = mergeUsage(totalUsage, extractUsage(initialResponse));

    const initialMessage = initialResponse.choices[0].message;
    let tours: any[] = [];
    let customItinerary: any = null;
    let shouldStreamSecondPass = false;

    if (initialMessage.tool_calls && initialMessage.tool_calls.length > 0) {
      messages.push(initialMessage);
      shouldStreamSecondPass = true;

      for (const toolCall of initialMessage.tool_calls) {
        if (toolCall.type !== "function") continue;
        
        if (toolCall.function.name === "search_tours") {
          const args = JSON.parse(toolCall.function.arguments);
          if (userImage) args.userImage = true;
          
          const searchResult = await searchTours(args, intentExtracted, semanticMatchedTourIds);
          tours = searchResult.tours;
          
          messages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: JSON.stringify({ 
              tours_found: tours.length, 
              STRICT_INSTRUCTION: searchResult.strictInstruction || undefined,
              GUARDRAIL: "ห้ามแต่งรหัสทัวร์ขึ้นมาเองเด็ดขาด อนุญาตให้สร้างลิงก์จองทัวร์เฉพาะจากรายการที่แสดงใน tours_summary เท่านั้น หากไม่พบทัวร์ให้ตอบว่าไม่มี",
              tours_summary: formatTourSummary(tours)
            })
          });

          // AI Search Agent (Only for image uploads)
          if (userImage && extractedDataForSearch) {
             messages.push({ role: "system", content: getSearchAgentPrompt(extractedDataForSearch) });
             const secondRes = await createChatCompletionSafe(openai, { model: "gpt-4o-mini", messages, tools, tool_choice: "auto" });
             totalUsage = mergeUsage(totalUsage, extractUsage(secondRes));
             const secondMsg = secondRes.choices[0].message;
             if (secondMsg.tool_calls && secondMsg.tool_calls.length > 0) {
                messages.push(secondMsg);
                for (const tc of secondMsg.tool_calls) {
                  if (tc.type !== "function") continue;
                  if (tc.function.name === "get_tour_detail" || tc.function.name === "check_availability") {
                    const tArgs = JSON.parse(tc.function.arguments);
                    let tData = await (await import("@/lib/prisma")).prisma.tour.findFirst({
                      where: { tourCode: tArgs.tourCode },
                      include: { departures: { include: { prices: true } }, destinations: true }
                    });
                    const highlights = tData?.destinations?.map((d: any) => d.country).join(', ') || 'N/A';
                    messages.push({ role: "tool", tool_call_id: tc.id, content: JSON.stringify(tData ? { code: tData.tourCode, title: tData.tourName, highlights, departures: tData.departures } : { error: "Tour not found" }) });
                  } else {
                    messages.push({ role: "tool", tool_call_id: tc.id, content: "{ \"status\": \"Tool executed but skipped deep logic for OCR flow\" }" });
                  }
                }
             }
          }
        } 
        else if (toolCall.function.name === "resolve_supplier_alias") {
          const args = JSON.parse(toolCall.function.arguments);
          const { supplierMaster } = await import('@/services/ai/supplierConfig');
          const match = supplierMaster.find(s => s.aliases.some(a => a.toLowerCase().includes(args.supplier_text.toLowerCase())) || s.canonical_name.includes(args.supplier_text.toLowerCase()));
          messages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: JSON.stringify(match ? { supplier_id: match.supplier_id, canonical_name: match.canonical_name } : { error: "Supplier not found" })
          });
        }
        else if (toolCall.function.name === "get_tour_detail" || toolCall.function.name === "check_availability" || toolCall.function.name === "get_latest_price" || toolCall.function.name === "get_booking_link") {
          const args = JSON.parse(toolCall.function.arguments);
          const tid = args.tour_id || args.tourCode;
          const { prisma } = await import("@/lib/prisma");
          let tData = await prisma.tour.findFirst({
            where: { OR: [{ id: tid }, { tourCode: tid }] },
            include: { departures: { where: { startDate: { gte: new Date() } }, orderBy: { startDate: 'asc' }, include: { prices: true } }, destinations: true }
          });
          
          if (!tData) {
            messages.push({ role: "tool", tool_call_id: toolCall.id, content: JSON.stringify({ error: "Tour not found in database. Please ask user for clarification or search_tours again." }) });
          } else {
             if (toolCall.function.name === "get_tour_detail") {
               const tourHighlights = (tData as any)?.destinations?.map((d: any) => `${d.country}${d.city ? '/' + d.city : ''}`).join(', ') || 'N/A';
               messages.push({ role: "tool", tool_call_id: toolCall.id, content: JSON.stringify({ code: tData.tourCode, title: tData.tourName, highlights: tourHighlights, duration: `${tData.durationDays}D${tData.durationNights}N`, destinations: (tData as any)?.destinations?.map((d: any) => d.country), departures: tData.departures.slice(0, 5).map((d: any) => ({ id: d.id, startDate: d.startDate, endDate: d.endDate, seats: d.remainingSeats, status: d.status, prices: d.prices?.map((p: any) => ({ paxType: p.paxType, price: p.sellingPrice })) })) }) });
             } else if (toolCall.function.name === "check_availability") {
               const dep = args.departure_id ? tData.departures.find((d: any) => d.id === args.departure_id) : null;
               if (dep) {
                 messages.push({ role: "tool", tool_call_id: toolCall.id, content: JSON.stringify({ tourCode: tData.tourCode, departureDate: dep.startDate, availableSeats: dep.remainingSeats, status: dep.status }) });
               } else {
                 messages.push({ role: "tool", tool_call_id: toolCall.id, content: JSON.stringify({ tourCode: tData.tourCode, all_departures: tData.departures.map((d: any) => ({ id: d.id, date: d.startDate, seats: d.remainingSeats })) }) });
               }
             } else if (toolCall.function.name === "get_latest_price") {
               const dep = args.departure_id ? tData.departures.find((d: any) => d.id === args.departure_id) : (tData.departures[0] || null);
               if (dep && dep.prices && dep.prices.length > 0) {
                 messages.push({ role: "tool", tool_call_id: toolCall.id, content: JSON.stringify({ tourCode: tData.tourCode, basePrice: dep.prices[0].sellingPrice, currency: 'THB' }) });
               } else {
                 messages.push({ role: "tool", tool_call_id: toolCall.id, content: JSON.stringify({ error: "Price not found for this departure." }) });
               }
             } else if (toolCall.function.name === "get_booking_link") {
               const bookUrl = `https://jongtour.com/checkout?tourCode=${tData.tourCode}${args.departure_id ? '&departure=' + args.departure_id : ''}`;
               messages.push({ role: "tool", tool_call_id: toolCall.id, content: JSON.stringify({ booking_url: bookUrl, message: "บอกลูกค้าว่าสามารถคลิกลิงก์นี้เพื่อดำเนินการจองและชำระเงินได้เลย" }) });
             }
          }
        }
        // === get_departure_dates ===
        else if (toolCall.function.name === "get_departure_dates") {
          const args = JSON.parse(toolCall.function.arguments);
          const tid = args.tour_id || args.tourCode;
          const { prisma } = await import("@/lib/prisma");
          const tour = await prisma.tour.findFirst({
            where: { OR: [{ id: tid }, { tourCode: tid }] },
            include: {
              departures: {
                where: {
                  ...(args.available_only ? { remainingSeats: { gt: 0 }, status: 'AVAILABLE' } : {}),
                  ...(args.date_from ? { startDate: { gte: new Date(args.date_from) } } : { startDate: { gte: new Date() } }),
                  ...(args.date_to ? { startDate: { lte: new Date(args.date_to) } } : {}),
                },
                orderBy: { startDate: 'asc' },
                include: { prices: true },
              },
            },
          });
          if (!tour) {
            messages.push({ role: "tool", tool_call_id: toolCall.id, content: JSON.stringify({ error: "Tour not found" }) });
          } else {
            messages.push({ role: "tool", tool_call_id: toolCall.id, content: JSON.stringify({
              tourCode: tour.tourCode,
              tourName: tour.tourName,
              total_departures: tour.departures.length,
              departures: tour.departures.map((d: any) => ({
                id: d.id,
                startDate: d.startDate,
                endDate: d.endDate,
                remainingSeats: d.remainingSeats,
                totalSeats: d.totalSeats,
                status: d.status,
                prices: d.prices?.map((p: any) => ({ paxType: p.paxType, price: p.sellingPrice })),
              })),
            }) });
          }
        }
        // === compare_tours ===
        else if (toolCall.function.name === "compare_tours") {
          const args = JSON.parse(toolCall.function.arguments);
          const tourIds = args.tour_ids || [];
          const { prisma } = await import("@/lib/prisma");
          const toursData = await prisma.tour.findMany({
            where: { OR: tourIds.map((tid: string) => ({ OR: [{ id: tid }, { tourCode: tid }] })) },
            include: {
              departures: { where: { startDate: { gte: new Date() } }, orderBy: { startDate: 'asc' }, take: 5, include: { prices: true } },
              destinations: true,
              supplier: { select: { displayName: true, canonicalName: true } },
            },
          });
          const comparison = toursData.map((t: any) => {
            const lowestPrice = t.departures.length > 0 ? Math.min(...t.departures.flatMap((d: any) => d.prices?.filter((p: any) => p.paxType === 'ADULT').map((p: any) => p.sellingPrice) || [0])) : 0;
            return {
              code: t.tourCode,
              name: t.tourName,
              duration: `${t.durationDays}D${t.durationNights}N`,
              destinations: t.destinations?.map((d: any) => d.country).join(', '),
              supplier: t.supplier?.displayName,
              lowestPrice,
              nextDeparture: t.departures[0] ? { date: t.departures[0].startDate, seats: t.departures[0].remainingSeats } : null,
              totalDepartures: t.departures.length,
            };
          });
          messages.push({ role: "tool", tool_call_id: toolCall.id, content: JSON.stringify({
            comparison,
            instruction: "เปรียบเทียบทัวร์ให้ลูกค้าเป็นตาราง: ราคา, ระยะเวลา, จุดหมาย, สายการบิน, วันเดินทางที่ใกล้สุด แนะนำตัวเลือกที่เหมาะสมที่สุด",
          }) });
        }
        // === create_lead ===
        else if (toolCall.function.name === "create_lead") {
          const args = JSON.parse(toolCall.function.arguments);
          const { prisma } = await import("@/lib/prisma");
          try {
            const lead = await prisma.lead.create({
              data: {
                customerName: args.customer_name || userName || "Unknown",
                contactInfo: args.phone || args.line_id || args.email || "AI_CHAT",
                source: "AI_CHAT",
                status: "NEW",
                estimatedValue: args.pax && args.pax > 0 ? args.pax * 25000 : null,
              }
            });
            // Log activity
            await prisma.leadActivity.create({
              data: { leadId: lead.id, type: "CHAT", note: `AI สร้าง Lead อัตโนมัติ — จุดหมาย: ${args.destination || 'ไม่ระบุ'}, ช่วง: ${args.travel_date || 'ไม่ระบุ'}, ${args.pax || '?'} คน\nข้อความ: ${args.message || userMessage}` }
            });

            // === LEAD NOTIFICATION (#5) — Email Sales Team ===
            try {
              const { sendAiLeadNotification } = await import("@/lib/email");
              await sendAiLeadNotification({
                leadId: lead.id,
                customerName: args.customer_name || userName || "ลูกค้า AI",
                contactInfo: args.phone || args.line_id || args.email || "AI_CHAT",
                destination: args.destination,
                travelDate: args.travel_date,
                pax: args.pax,
                message: args.message || userMessage,
              });
            } catch (emailErr) { console.error("[Lead Email] Failed:", emailErr); }

            messages.push({ role: "tool", tool_call_id: toolCall.id, content: JSON.stringify({ success: true, leadId: lead.id, message: "สร้าง Lead สำเร็จ ให้แจ้งลูกค้าว่าจะมีเจ้าหน้าที่ติดต่อกลับภายใน 30 นาที" }) });
          } catch (err) {
            messages.push({ role: "tool", tool_call_id: toolCall.id, content: JSON.stringify({ success: false, error: "DB Error" }) });
          }
        }
        else if (toolCall.function.name === "ask_human_support") {
          const args = JSON.parse(toolCall.function.arguments);
          messages.push({ role: "tool", tool_call_id: toolCall.id, content: JSON.stringify({ success: true, message: "แจ้งลูกค้าว่าระบบกำลังส่งเรื่องให้เจ้าหน้าที่แอดมิน กรุณารอสักครู่" }) });
        }
        else if (toolCall.function.name === "calculate_fit_price") {
          const args = JSON.parse(toolCall.function.arguments);
          const pricingData = await calculateFitPrice({
            country: args.country,
            pax: args.pax,
            durationDays: args.durationDays,
            hotelStars: 3,
            includeFlights: true,
            includeHotels: true,
            includeTransport: true,
            includeGuide: true,
            includeInsurance: true
          });
          
          customItinerary = {
            id: `fit-${Date.now()}`,
            title: `Private Tour ${args.country} ${args.durationDays} Days`,
            price: pricingData.sellingPricePerPax,
            destination: args.country,
            itineraryData: pricingData
          };

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
        else if (toolCall.function.name === "update_user_preferences") {
          const args = JSON.parse(toolCall.function.arguments);
          if (user) {
            const { prisma } = await import("@/lib/prisma");
            try {
              const profile = await prisma.userProfile.findUnique({ where: { userId: user.id } });
              const currentPrefs = (profile?.preferences as any) || {};
              currentPrefs[args.key] = args.value;
              await prisma.userProfile.update({
                where: { userId: user.id },
                data: { preferences: currentPrefs }
              });
              messages.push({
                role: "tool",
                tool_call_id: toolCall.id,
                content: JSON.stringify({ success: true, message: `CRM updated: ${args.key} = ${args.value}` })
              });
            } catch (err) {
              messages.push({
                role: "tool",
                tool_call_id: toolCall.id,
                content: JSON.stringify({ success: false, error: "DB Error" })
              });
            }
          } else {
            messages.push({
              role: "tool",
              tool_call_id: toolCall.id,
              content: JSON.stringify({ success: false, error: "User not logged in" })
            });
          }
        }
        else if (toolCall.function.name === "compare_fit_vs_group") {
          const args = JSON.parse(toolCall.function.arguments);
          try {
            // Calculate real estimated F.I.T. costs
            const fitCost = await calculateFitPrice({
              country: args.destination,
              pax: 1, // Calculate per pax for comparison
              durationDays: args.durationDays,
              hotelStars: 3,
              includeFlights: true,
              includeHotels: true,
              includeTransport: true,
              includeGuide: false,
              includeInsurance: false
            });
            
            const flightCost = fitCost.breakdownPerPax.cache.flight;
            const hotelCost = fitCost.breakdownPerPax.cache.hotel;
            const totalFitCost = fitCost.sellingPricePerPax;
            
            messages.push({
              role: "tool",
              tool_call_id: toolCall.id,
              content: JSON.stringify({ 
                success: true, 
                message: `ราคาตั๋วเครื่องบินไปกลับ (เฉลี่ย): ${flightCost.toLocaleString()} บาท, ราคาโรงแรม (เฉลี่ย): ${hotelCost.toLocaleString()} บาท, รวมต้นทุนไปเองเบื้องต้น (ไม่รวมกิน/เดินทาง): ${totalFitCost.toLocaleString()} บาท/ท่าน ให้เซลส์ใช้ข้อมูลนี้เปรียบเทียบความคุ้มค่าให้ลูกค้าฟังทันที`
              })
            });
          } catch (err) {
            messages.push({
              role: "tool",
              tool_call_id: toolCall.id,
              content: JSON.stringify({ success: false, error: "ไม่สามารถดึงราคากลางได้ในขณะนี้ ให้เสนอราคาทัวร์ปกติไปก่อน" })
            });
          }
        }
        else if (toolCall.function.name === "prepare_rpa_booking" || isWholesaleTool(toolCall.function.name)) {
          const args = JSON.parse(toolCall.function.arguments);
          try {
            const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
            const result = await executeWholesaleTool(
              toolCall.function.name === 'prepare_rpa_booking' ? 'start_wholesale_rpa_session' : toolCall.function.name,
              toolCall.function.name === 'prepare_rpa_booking' ? { booking_id: args.bookingId, started_by: 'AI' } : args,
              baseUrl
            );
            messages.push({
              role: "tool",
              tool_call_id: toolCall.id,
              content: result,
            });
          } catch (err: any) {
            console.error("Wholesale Tool Error:", err);
            messages.push({
              role: "tool",
              tool_call_id: toolCall.id,
              content: JSON.stringify({ success: false, error: err.message || 'Wholesale tool execution failed' })
            });
          }
        }
        else if (toolCall.function.name === "get_booking_link") {
          const args = JSON.parse(toolCall.function.arguments);
          const domain = process.env.NEXT_PUBLIC_SITE_URL || "https://jongtour.com";
          const tid = args.tour_id || args.tourCode || "UNKNOWN";
          const did = args.departure_id || args.departureId || "UNKNOWN";
          const bookingUrl = `${domain}/booking/checkout/${tid}/${did}`;
          messages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: JSON.stringify({ success: true, booking_link: bookingUrl, message: `บอกลูกค้าว่า "สามารถคลิกที่ลิงก์นี้เพื่อดำเนินการจองได้เลยครับ: ${bookingUrl}"` })
          });
        }
        // (duplicate create_lead removed — handled by primary Prisma handler above)
        else if (toolCall.function.name === "create_quotation_draft" || toolCall.function.name === "create_quotation") {
          const args = JSON.parse(toolCall.function.arguments);
          const { prisma } = await import("@/lib/prisma");
          try {
            const tid = args.tour_id;
            const tour = tid ? await prisma.tour.findFirst({
              where: { OR: [{ id: tid }, { tourCode: tid }] },
              include: { departures: { where: args.departure_id ? { id: args.departure_id } : { startDate: { gte: new Date() } }, orderBy: { startDate: 'asc' }, take: 1, include: { prices: true } } }
            }) : null;

            const dep = tour?.departures[0];
            const defaultAgent = await prisma.agent.findFirst({ select: { id: true } });
            if (!dep || !defaultAgent?.id) {
              throw new Error('Cannot create quotation: missing departure or agent');
            }
            const adultPrice = dep?.prices?.find((p: any) => p.paxType === 'ADULT')?.sellingPrice || 0;
            const totalPrice = adultPrice * (args.pax_adult || args.pax || 1);

            const quotation = await prisma.quotation.create({
              data: {
                quotationRef: `QT-AI-${Date.now().toString(36).toUpperCase()}`,
                agentId: defaultAgent.id,
                departureId: dep.id,
                customerName: args.customer_name || userName || "ลูกค้า AI",
                customerEmail: args.customer_email || null,
                paxAdult: args.pax_adult || args.pax || 1,
                paxChild: args.pax_child || 0,
                totalSellingPrice: totalPrice,
                status: "ACTIVE",
                notes: args.notes || `AI Generated — ${tour?.tourName || 'Custom Tour'}`,
                validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
              }
            });
            messages.push({
              role: "tool",
              tool_call_id: toolCall.id,
              content: JSON.stringify({ success: true, quotationRef: quotation.quotationRef, tourName: tour?.tourName, totalPrice, validUntil: quotation.validUntil, message: "ใบเสนอราคาถูกสร้างแล้ว แจ้งลูกค้าว่าเจ้าหน้าที่จะส่งใบเสนอราคาอย่างเป็นทางการทางอีเมล" })
            });
          } catch (err) {
            console.error("Quotation Error:", err);
            messages.push({ role: "tool", tool_call_id: toolCall.id, content: JSON.stringify({ success: false, error: "ไม่สามารถสร้างใบเสนอราคาได้" }) });
          }
        }
        else if (toolCall.function.name === "create_private_group_itinerary" || toolCall.function.name === "estimate_private_group_price") {
          const args = JSON.parse(toolCall.function.arguments);
          try {
            const hotelStars = args.hotel_level === '5 Star' ? 5 : args.hotel_level === '4 Star' ? 4 : 3;
            const serviceMultiplier = args.service_level === 'Luxury' ? 1.6 : args.service_level === 'Premium' ? 1.3 : 1.0;
            const fitCost = await calculateFitPrice({
              country: args.destination,
              pax: args.pax || 10,
              durationDays: args.duration_days || 3,
              hotelStars,
              includeFlights: args.include_airfare ?? true,
              includeHotels: true,
              includeTransport: true,
              includeGuide: true,
              includeInsurance: true
            });
            const adjustedPrice = Math.round(fitCost.sellingPricePerPax * serviceMultiplier);
            messages.push({
              role: "tool",
              tool_call_id: toolCall.id,
              content: JSON.stringify({
                success: true,
                estimated_price_per_pax: adjustedPrice,
                total_pax: args.pax || 10,
                total_estimated: adjustedPrice * (args.pax || 10),
                assumptions: {
                  hotel: `${hotelStars} Star`,
                  service: args.service_level || 'Standard',
                  airfare_included: args.include_airfare ?? true,
                  duration: `${args.duration_days || 3} วัน`,
                  note: "ราคานี้เป็นประมาณการเบื้องต้นเท่านั้น ราคาจริงอาจเปลี่ยนแปลงตามสายการบิน ช่วงเวลา และโรงแรมที่เลือก"
                },
                instruction: "แจ้งลูกค้าว่านี่คือราคาประมาณการเบื้องต้น พร้อมแจ้ง assumptions ทุกข้อ และแนะนำให้สร้าง Lead เพื่อให้เจ้าหน้าที่จัดทำใบเสนอราคาจริง"
              })
            });
          } catch (err) {
             messages.push({ role: "tool", tool_call_id: toolCall.id, content: JSON.stringify({ error: "ไม่สามารถคำนวณราคาประมาณการได้ แนะนำให้ลูกค้าติดต่อเจ้าหน้าที่" }) });
          }
        }
        else if (toolCall.function.name === "ask_human_support") {
          const args = JSON.parse(toolCall.function.arguments);
          try {
            const { prisma } = await import("@/lib/prisma");
            await (prisma as any).aiReviewQueue.create({
              data: {
                customerMessage: args.customer_message || userMessage,
                reason: args.reason || "AI requested human support",
                priority: args.priority || "HIGH",
              }
            });
          } catch (e) { console.error("Review Queue Error:", e); }
          
          messages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: JSON.stringify({ success: true, message: "เจ้าหน้าที่ได้รับแจ้งเรื่องแล้ว จะรีบติดต่อกลับโดยเร็วที่สุด แจ้งลูกค้าว่ากรุณารอสักครู่" })
          });
        }
        else {
          console.warn(`[AI] Unknown tool called: ${toolCall.function.name}`);
          messages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: JSON.stringify({ success: true, message: "Tool executed" })
          });
        }
      }
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        if (customItinerary) {
          controller.enqueue(encoder.encode(`__DATA__${JSON.stringify({ type: 'custom_itinerary', itinerary: customItinerary })}__DATA__\n`));
        } else {
          controller.enqueue(encoder.encode(`__DATA__${JSON.stringify({ type: 'tours_data', tours })}__DATA__\n`));
        }

        let finalAiResponseToLog = "";

        if (shouldStreamSecondPass) {
          if (intentExtracted?.supplier_filter_required && intentExtracted?.matched_supplier?.supplier_id) {
            // Quality Checker Pipeline (No Stream, buffer and validate)
            const fullResponse = await createChatCompletionSafe(openai, {
              model: "gpt-4o-mini",
              temperature: 0.1,
              messages,
            });
            totalUsage = mergeUsage(totalUsage, extractUsage(fullResponse));
            let finalOutputText = fullResponse.choices[0]?.message?.content || "";
            
            finalOutputText = await runQualityChecker(
              openai,
              intentExtracted.matched_supplier.supplier_id,
              intentExtracted.matched_supplier.canonical_name || "",
              tours,
              finalOutputText
            );

            const guardrailResult = validateAiOutput(finalOutputText, tours);
            finalOutputText = guardrailResult.sanitizedMessage;
            finalAiResponseToLog = finalOutputText;

            const lines = finalOutputText.split('\n');
            for (const line of lines) {
              controller.enqueue(encoder.encode(line + '\n'));
              await new Promise(r => setTimeout(r, 20)); // Fake streaming
            }
          } else {
             // Normal Streaming -> Converted to Buffered for Guardrails
             const secondResponse = await createChatCompletionSafe(openai, {
               model: "gpt-4o-mini",
               temperature: 0.1,
               messages,
             });
             totalUsage = mergeUsage(totalUsage, extractUsage(secondResponse));
             
             let aiOutput = secondResponse.choices[0]?.message?.content || "";
             const guardrailResult = validateAiOutput(aiOutput, tours);
             aiOutput = guardrailResult.sanitizedMessage;
             finalAiResponseToLog = aiOutput;

             const lines = aiOutput.split('\n');
             for (const line of lines) {
               controller.enqueue(encoder.encode(line + '\n'));
               await new Promise(r => setTimeout(r, 20)); // Fake streaming
             }
          }
        } else {
          let aiOutput = initialMessage.content || "";
          const guardrailResult = validateAiOutput(aiOutput, tours);
          aiOutput = guardrailResult.sanitizedMessage;
          finalAiResponseToLog = aiOutput;

          const lines = aiOutput.split('\n');
          for (const line of lines) {
            controller.enqueue(encoder.encode(line + '\n'));
          }
          }
          // Asynchronously log to DB
          (async () => {
             try {
                const { prisma } = await import("@/lib/prisma");
                const sessionUid = `s-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
                const conv = await (prisma as any).aiConversation.create({
                   data: {
                      userId: user?.id || null,
                      sessionId: sessionUid,
                      totalTokens: totalUsage.totalTokens,
                      estimatedCostUsd: totalUsage.estimatedCostUsd,
                      model: totalUsage.model,
                   }
                });
                
                await prisma.aiMessage.create({
                   data: {
                      conversationId: conv.id,
                      role: "user",
                      content: userMessage
                   }
                });
                
                const aiMsgObj = await prisma.aiMessage.create({
                   data: {
                      conversationId: conv.id,
                      role: "assistant",
                      content: finalAiResponseToLog || "No text"
                   }
                });
                
                if (initialMessage.tool_calls && initialMessage.tool_calls.length > 0) {
                   for (const tc of (initialMessage.tool_calls as any[])) {
                      await prisma.aiToolCall.create({
                         data: {
                            messageId: aiMsgObj.id,
                            toolName: (tc as any).function?.name || 'unknown',
                            inputArgs: (tc as any).function?.arguments ? JSON.parse((tc as any).function.arguments) : {},
                         }
                      });
                   }
                }

                // === TOKEN COST LOG (#2) ===
                if (totalUsage.totalTokens > 0) {
                  await (prisma as any).aiCostLog.create({
                    data: {
                      model: totalUsage.model,
                      inputTokens: totalUsage.promptTokens,
                      outputTokens: totalUsage.completionTokens,
                      totalCostUsd: totalUsage.estimatedCostUsd,
                      feature: 'chat',
                    }
                  });
                }
             } catch(e) { console.error("DB Log Error", e) }
          })();
          controller.close();      }
    });

    return new Response(stream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });

  } catch (error: any) {
    console.error("Chat API Error:", error);
    
    // Extract OpenAI Error if present
    let errorMessage = error?.message || "เกิดข้อผิดพลาดในการประมวลผล";
    if (error?.status === 429) {
      errorMessage = "ขออภัยครับ ตอนนี้โควต้า OpenAI เต็ม หรือมีผู้ใช้งานจำนวนมาก กรุณาลองใหม่อีกครั้งในภายหลัง";
    } else if (error?.status === 401) {
      errorMessage = "ขออภัยครับ เกิดปัญหาการเชื่อมต่อกับ OpenAI (API Key ไม่ถูกต้อง)";
    }
    
    return NextResponse.json({ 
      reply: `[System Error: ${errorMessage}] ขออภัยในความไม่สะดวกครับ เจ้าหน้าที่เทคนิคได้รับทราบปัญหาแล้ว จะรีบดำเนินการแก้ไขโดยเร็วที่สุดครับ 🙏`, 
      tours: [] 
    }, { status: 500 });
  }
}

