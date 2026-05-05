export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: NextRequest) {
  try {
    const { country, currentFlight, instruction } = await req.json();

    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      return NextResponse.json({ error: "OpenAI API Key not configured" }, { status: 500 });
    }

    const openai = new OpenAI({ apiKey: openaiApiKey });

    const prompt = `You are a flight ticketing expert adjusting an itinerary to ${country}.
The user wants to change their flight details.
Current Flight:
${JSON.stringify(currentFlight, null, 2)}

User Instruction: "${instruction}"

Please generate a new realistic flight schedule based on the user's instruction.
Return ONLY a valid JSON object representing the new flight.
Make sure the airline, airlineCode, and flight times are realistic.
Format:
{
  "airline": "string (เธเธทเนเธญเธชเธฒเธขเธเธฒเธฃเธเธดเธ เน€เธเนเธ Thai Airways, EVA Air)",
  "airlineCode": "string (IATA code 2 เธ•เธฑเธงเธญเธฑเธเธฉเธฃ เน€เธเนเธ TG, BR)",
  "outbound": "string (เน€เธ—เธตเนเธขเธงเธเธดเธเธเธฒเนเธ เน€เธเนเธ TG676 BKK-NRT 07:35 - 15:45)",
  "inbound": "string (เน€เธ—เธตเนเธขเธงเธเธดเธเธเธฒเธเธฅเธฑเธ เน€เธเนเธ TG677 NRT-BKK 17:30 - 22:30)"
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    const newFlight = JSON.parse(completion.choices[0].message.content || "{}");
    return NextResponse.json({ success: true, newFlight });
  } catch (error) {
    console.error("Regenerate Flight Error:", error);
    return NextResponse.json({ error: "Failed to regenerate flight" }, { status: 500 });
  }
}

