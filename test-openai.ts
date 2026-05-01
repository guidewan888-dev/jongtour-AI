import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function test() {
  const userMessage = "อยากจัดทริปเที่ยวโตเกียว 3 วัน 2 คืน ไปกันเอง 4 คน";
  
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are an intelligent travel agent parsing user travel queries.
Extract the travel intent from the latest user message, taking into account the conversation history.
Return ONLY a JSON object with these exact keys:
{
  "keywords": ["..."],
  "maxPrice": null,
  "isFire": false,
  "wholesale": null,
  "days": null,
  "airline": null,
  "month": null,
  "isFitRequest": false
}

Rules for extraction:
- "keywords": array of strings. Include destination countries, cities, or continents in THAI language (e.g., ["ญี่ปุ่น", "ยุโรป", "หน้าหนาว", "ฮอกไกโด"]). Leave empty if none found. Do NOT include generic words like "ทัวร์" or "ไปเที่ยว".
- "maxPrice": number or null. Extract any maximum budget mentioned. Convert shorthand like "3 หมื่น" to 30000.
- "isFire": boolean. true if the user is looking for last-minute deals (e.g., "ไฟไหม้", "โปรไฟไหม้").
- "wholesale": string or null. Extract wholesale tour company names if mentioned (e.g. "Let's go", "Check in", "Go 365", "Tour Factory"). DO NOT put wholesale names in "keywords".
- "days": number or null. Extract the EXACT number of days requested (e.g. "3 วัน" -> 3).
- "airline": string or null. Extract the specific airline requested (e.g. "การบินไทย", "แอร์เอเชีย", "TG", "XJ").
- "month": string or null. Extract the month requested in English (e.g. "เมษา", "เมษายน", "สงกรานต์" -> "April").
- "isFitRequest": boolean. MUST be true if the user wants a private tour, custom itinerary, or F.I.T. (e.g., "จัดทัวร์ส่วนตัว", "ไปกันเอง", "ช่วยจัดทริปให้หน่อย", "จัดทริป").`
      },
      { role: "user", content: userMessage }
    ]
  });
  
  console.log("Intent output:", response.choices[0].message.content);
  
  const parsed = JSON.parse(response.choices[0].message.content || "{}");
  console.log("isFitRequest:", parsed.isFitRequest);
  
  if (parsed.isFitRequest) {
    console.log("Generating FIT...");
    const fitResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "You are an expert travel agent. The user wants a custom private tour (F.I.T). Generate a detailed day-by-day itinerary based on their request. Return ONLY JSON matching this format: { \"title\": \"Trip Name\", \"estimatedPrice\": \"Price (e.g. 45000 THB)\", \"days\": [{ \"day\": 1, \"title\": \"Day Title\", \"detail\": \"Day details\" }] }" },
        { role: "user", content: userMessage }
      ]
    });
    console.log("FIT output:", fitResponse.choices[0].message.content);
  }
}

test();
