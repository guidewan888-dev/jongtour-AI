import { NextResponse } from "next/server";
import OpenAI from "openai";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const openaiApiKey = process.env.OPENAI_API_KEY;
  if (!openaiApiKey) {
    return NextResponse.json({ success: false, reply: "OpenAI API Key not found" }, { status: 500 });
  }

  const openai = new OpenAI({ apiKey: openaiApiKey });

  try {
    const { itinerary, message, chatHistory = [] } = await req.json();

    if (!itinerary || !message) {
      return NextResponse.json({ success: false, reply: "Missing required data" }, { status: 400 });
    }

    const systemPrompt = `You are "Jongtour Buddy" (จองทัวร์บัดดี้), an enthusiastic, helpful, and highly knowledgeable Thai travel assistant.
You are currently helping a customer who has JUST generated a private tour itinerary.

Here is the CURRENT ITINERARY JSON:
${JSON.stringify(itinerary, null, 2)}

CRITICAL RULES:
1. You MUST answer the user's questions based strictly on the provided itinerary context.
2. If they ask about a specific day or place, look at the itinerary data and give a helpful tip, food recommendation, or general travel advice for that location.
3. If they ask to change the plan (e.g. "อยากเปลี่ยนโรงแรม", "ขอไม่ไปวัดได้ไหม"), politely tell them to use the "ปรับแต่งใหม่" (Regenerate) button or the "🤖 แจ้ง AI เปลี่ยนสถานที่ของวันนี้" edit button on the specific day instead. You cannot edit the plan yourself.
4. Keep your answers concise, friendly, and use appropriate emojis. Always reply in Thai language.
5. If the question is completely unrelated to travel or the itinerary, gently steer the conversation back to their trip.`;

    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt },
      ...chatHistory.slice(-4), // keep last 4 messages for context
      { role: "user", content: message }
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      temperature: 0.7,
      max_tokens: 500,
    });

    const reply = response.choices[0].message.content || "ขออภัยครับ ตอนนี้ผมกำลังงงๆ รบกวนถามใหม่อีกครั้งนะครับ 😅";

    return NextResponse.json({ success: true, reply });

  } catch (error) {
    console.error("Travel Buddy Error:", error);
    return NextResponse.json({ success: false, reply: "ระบบขัดข้อง กรุณาลองใหม่อีกครั้งครับ 😅" }, { status: 500 });
  }
}
