export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: NextRequest) {
  try {
    const { country, dayObject, instruction } = await req.json();

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const prompt = `You are a travel agent modifying a private tour in ${country}.
The user wants to change this specific day.
Original Day Plan:
${JSON.stringify(dayObject, null, 2)}

User Instruction: "${instruction}"

Rewrite this day according to the user's instruction. You must write in THAI.
Return ONLY a valid JSON object representing the new day plan.
Format:
{
  "day": ${dayObject.day},
  "title": "New Day Title",
  "detail": "New Day details",
  "meals": { "breakfast": true, "lunch": false, "dinner": true },
  "hotel": "เธฃเธฐเธเธธเธเธทเนเธญเนเธฃเธเนเธฃเธกเธ—เธตเนเธกเธตเธญเธขเธนเนเธเธฃเธดเธเนเธฅเธฐเธชเธกเธเธฃเธดเธ เธ•เธฃเธเธเธฑเธเน€เธกเธทเธญเธเธ—เธตเนเนเธ (เน€เธเนเธ Hilton, Marriott) เธซเนเธฒเธกเธฃเธฐเธเธธเนเธเนเธเธทเนเธญเธเธฃเธฐเน€เธ—เธจ",
  "hotelHighlight": "เธเธณเธญเธเธดเธเธฒเธขเธเธธเธ”เน€เธ”เนเธเธเธญเธเนเธฃเธเนเธฃเธก 1 เธเธฃเธฐเนเธขเธเธชเธฑเนเธเน เน€เธเธทเนเธญเธเธนเธเนเธเธฅเธนเธเธเนเธฒ (เน€เธเนเธ เน€เธ”เธดเธ 1 เธเธฒเธ—เธตเธ–เธถเธเธชเธ–เธฒเธเธตเธฃเธ–เนเธ)",
  "hotelImageUrl": "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80",
  "imagePrompt": "A short English phrase describing the main attraction",
  "coordinates": { "lat": 13.7563, "lng": 100.5018 }
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    const newDay = JSON.parse(completion.choices[0].message.content || "{}");
    return NextResponse.json({ success: true, newDay });
  } catch (error) {
    console.error("Regenerate Day Error:", error);
    return NextResponse.json({ error: "Failed to regenerate day" }, { status: 500 });
  }
}

