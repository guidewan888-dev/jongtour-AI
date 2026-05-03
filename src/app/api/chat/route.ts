import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import OpenAI from "openai";
import { type NextRequest } from "next/server";
import { calculateFitPrice } from "@/services/pricingEngine";
import { getSystemPrompt, BOOKING_ASSISTANT_SYSTEM_PROMPT } from "@/services/ai/prompts";
import { extractIntent } from "@/services/ai/intentExtractor";
import { searchTours, formatTourSummary } from "@/services/ai/tourSearchService";
import { runQualityChecker } from "@/services/ai/qualityChecker";
import { processUserImage, getSearchAgentPrompt } from "@/services/ai/ocrExtractor";
import { tools } from "@/services/ai/toolsConfig";

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
    let crmContext = "";
    
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

    if (!isOpenAIAvailable || !openai) {
      return NextResponse.json({ reply: "ขออภัย ระบบ AI ไม่พร้อมใช้งาน 😅", tours: [] }, { status: 500 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://qterfftaebnoawnzkfgu.supabase.co";
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_SRwNSJ89mInda5FcuB1W2w_9IEJlSOI";
    const supabase = createClient(supabaseUrl, supabaseKey);

    // STEP 1: Intent Extraction (Supplier Alias Matching)
    const { extracted: intentExtracted, shouldReturnEarly, earlyReturnMessage } = await extractIntent(openai, userMessage);
    
    if (shouldReturnEarly) {
      return NextResponse.json({ reply: earlyReturnMessage, tours: [] });
    }

    // STEP 1.5: Deep Semantic Search (RAG)
    let semanticMatchedTourIds: string[] = [];
    if (openai && userMessage.length > 8) {
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
        }
      } catch (err) {
        console.error("Semantic search failed:", err);
      }
    }

    // Prepare Messages History
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: "system", content: getSystemPrompt() + "\n\n" + BOOKING_ASSISTANT_SYSTEM_PROMPT + crmContext },
      ...(chatHistory.slice(-15).filter((m: any) => !(m.role === 'ai' && (m.content.includes("ไม่สามารถ") || m.content.includes("ขอโทษครับ")))).map((m: any) => {
        let content = m.content;
        if (m.role === 'ai' && m.tours && m.tours.length > 0) {
          const toursContext = m.tours.map((t:any) => {
            const deps = t.departures ? t.departures.filter((d: any) => new Date(d.startDate) >= new Date()).sort((a: any, b: any) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()).slice(0, 5).map((d: any) => `${new Date(d.startDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })} ถึง ${new Date(d.endDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })} (ว่าง ${d.availableSeats} ที่)`).join(', ') : 'ไม่มีข้อมูล';
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
        extractedDataForSearch = await processUserImage(openai, userImage);
        if (extractedDataForSearch) {
          const dest = extractedDataForSearch.destinations?.find((d: any) => d.confidence >= 0.75)?.name;
          const code = extractedDataForSearch.tour_code?.confidence >= 0.75 ? extractedDataForSearch.tour_code.value : null;
          const price = extractedDataForSearch.prices?.find((p: any) => p.confidence >= 0.75)?.amount;
          const deps = (extractedDataForSearch.dates?.departure_dates || []).filter((d: any) => d.confidence >= 0.75).map((d: any) => `${d.start_date || ''} ถึง ${d.end_date || ''}`).join(", ");
          const air = extractedDataForSearch.airline?.confidence >= 0.75 ? extractedDataForSearch.airline.value : null;

          if (extractedDataForSearch.should_ask_user || (!dest && !code) || !deps) {
             let fallbackQuestion = extractedDataForSearch.question_to_user;
             if (!fallbackQuestion) {
                if (!dest && !deps) fallbackQuestion = "ต้องการไปประเทศหรือเมืองไหน และเดินทางช่วงวันไหนครับ?";
                else if (!dest) fallbackQuestion = "ต้องการไปประเทศหรือเมืองไหนครับ?";
                else if (!deps) fallbackQuestion = "ต้องการเดินทางช่วงวันไหนครับ?";
                else fallbackQuestion = "มีข้อมูลไม่เพียงพอ รบกวนพิมพ์บอกเพิ่มเติมหน่อยครับ";
             }
             processedUserMessage = `[System Note: ข้อมูลจากรูปภาพไม่เพียงพอ (ห้ามเดาเด็ดขาด) ให้คุณตอบกลับลูกค้าด้วยคำถามนี้เท่านั้น: "${fallbackQuestion}"]`;
             forceTool = false;
          } else {
             let extractedText = `จุดหมายปลายทาง: ${dest || 'ไม่ระบุ'}\nรหัสทัวร์: ${code || 'ไม่ระบุ'}\nราคาประมาณ: ${price || 'ไม่ระบุ'}\nวันเดินทาง: ${deps || 'ไม่ระบุ'}\nสายการบิน: ${air || 'ไม่ระบุ'}`;
             const userIntent = userMessage ? `\nและมีข้อความเพิ่มเติม: "${userMessage}"` : "";
             processedUserMessage = `ผู้ใช้ค้นหาแพ็กเกจทัวร์ด้วยข้อมูลที่สกัดมาได้ดังนี้:\n${extractedText}${userIntent}\n\nช่วยเรียกใช้เครื่องมือค้นหา และอธิบายโปรแกรมที่เจอให้ฟังอย่างน่าสนใจ 1 โปรแกรมครับ`;
          }
        } else {
           processedUserMessage = `[System Note: OCR Vision Failed or Returned Empty. Reply to the user that the image could not be read clearly and ask them to provide more details about the tour they are looking for.]`;
           forceTool = false;
        }
      } catch (e) {
        console.error("OCR Error", e);
        processedUserMessage = `[System Note: OCR Vision Encountered an Error. Reply to the user that there was a technical error reading the image and ask them to type the tour details instead.]`;
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

    const initialResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini", 
      temperature: 0.1,
      messages,
      tools,
      tool_choice: forceTool ? { type: "function", function: { name: "search_tours" } } : "auto",
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
             const secondRes = await openai.chat.completions.create({ model: "gpt-4o-mini", messages, tools, tool_choice: "auto" });
             const secondMsg = secondRes.choices[0].message;
             if (secondMsg.tool_calls && secondMsg.tool_calls.length > 0) {
                messages.push(secondMsg);
                for (const tc of secondMsg.tool_calls) {
                  if (tc.type !== "function") continue;
                  if (tc.function.name === "get_tour_detail" || tc.function.name === "check_availability") {
                    const tArgs = JSON.parse(tc.function.arguments);
                    let tData = await (await import("@/lib/prisma")).prisma.tour.findFirst({
                      where: { tourCode: tArgs.tourCode },
                      include: { departures: { include: { prices: true } }, itineraries: true }
                    });
                    messages.push({ role: "tool", tool_call_id: tc.id, content: JSON.stringify(tData ? { code: tData.tourCode, title: tData.tourName, highlights: tData.itineraries?.[0]?.description, departures: tData.departures } : { error: "Tour not found" }) });
                  } else {
                    messages.push({ role: "tool", tool_call_id: tc.id, content: "{ \"status\": \"Tool executed but skipped deep logic for OCR flow\" }" });
                  }
                }
             }
          }
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
        else if (toolCall.function.name === "prepare_rpa_booking") {
          const args = JSON.parse(toolCall.function.arguments);
          try {
            const botUrl = process.env.BOT_SERVICE_URL || 'https://bot.jongtour.com';
            const rpaRes = await fetch(`${botUrl}/run/start`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ bookingId: args.bookingId, supplierId: args.supplierId })
            });
            const rpaData = await rpaRes.json();
            
            messages.push({
              role: "tool",
              tool_call_id: toolCall.id,
              content: JSON.stringify({ 
                success: true, 
                message: "ระบบได้สั่งการให้ AI Bot ไปดำเนินการจองที่หน้าเว็บของ Wholesale แล้ว กรุณารอรับภาพ Screenshot และกด Approve ในหน้าจอ Admin RPA Dashboard" 
              })
            });
          } catch (err) {
            console.error("RPA Bot Service Error:", err);
            messages.push({
              role: "tool",
              tool_call_id: toolCall.id,
              content: JSON.stringify({ success: false, error: "ไม่สามารถเชื่อมต่อกับ RPA Bot Service ได้ กรุณาตรวจสอบว่า bot.jongtour.com ทำงานอยู่หรือไม่" })
            });
          }
        }
        else {
          // Mock generic tools
          messages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: JSON.stringify({ success: true, message: "Tool executed successfully" })
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

        if (shouldStreamSecondPass) {
          if (intentExtracted?.supplier_filter_required && intentExtracted?.matched_supplier?.supplier_id) {
            // Quality Checker Pipeline (No Stream, buffer and validate)
            const fullResponse = await openai.chat.completions.create({
              model: "gpt-4o-mini",
              temperature: 0.1,
              messages,
              stream: false,
            });
            let finalOutputText = fullResponse.choices[0]?.message?.content || "";
            
            finalOutputText = await runQualityChecker(
              openai,
              intentExtracted.matched_supplier.supplier_id,
              intentExtracted.matched_supplier.canonical_name || "",
              tours,
              finalOutputText
            );

            const lines = finalOutputText.split('\n');
            for (const line of lines) {
              controller.enqueue(encoder.encode(line + '\n'));
              await new Promise(r => setTimeout(r, 20)); // Fake streaming
            }
          } else {
             // Normal Streaming
             const secondResponse = await openai.chat.completions.create({
               model: "gpt-4o-mini",
               temperature: 0.1,
               messages,
               stream: true,
             });
             for await (const chunk of secondResponse) {
               const text = chunk.choices[0]?.delta?.content || "";
               if (text) {
                 controller.enqueue(encoder.encode(text));
               }
             }
          }
        } else {
          const lines = (initialMessage.content || "").split('\n');
          for (const line of lines) {
            controller.enqueue(encoder.encode(line + '\n'));
          }
        }
        controller.close();
      }
    });

    return new Response(stream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });

  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json({ reply: "เกิดข้อผิดพลาดในการประมวลผล", tours: [] }, { status: 500 });
  }
}
