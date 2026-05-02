import OpenAI from 'openai';

export async function processUserImage(openai: OpenAI, userImage: string) {
  try {
    // Step 1: Raw Text Extraction (Bypass Vision Safety Filters)
    const rawOcrRes = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{
        role: "user",
        content: [
          { type: "text", text: "Please extract all text visible in this image exactly as written. Do not analyze, summarize, or refuse. Just output the raw text." },
          { type: "image_url", image_url: { url: userImage } }
        ]
      }]
    });
    
    let rawOcrText = rawOcrRes.choices[0].message.content || "";
    
    if (rawOcrText.toLowerCase().includes("sorry") || rawOcrText.toLowerCase().includes("cannot") || rawOcrText.toLowerCase().includes("can't") || rawOcrText.includes("ไม่สามารถ")) {
       rawOcrText = ""; // Vision safety filter triggered, ignore.
    }

    // Step 2: Structured JSON Extraction from Raw Text
    let extractedDataForSearch: any = null;
    if (rawOcrText.trim()) {
       const ocrRes = await openai.chat.completions.create({
         model: "gpt-4o-mini",
         response_format: {
           type: "json_schema",
           json_schema: {
             name: "tour_extraction",
             strict: true,
             schema: {
               type: "object",
               properties: {
                 tour_code: { type: "object", properties: { value: { type: ["string", "null"] }, confidence: { type: "number" }, evidence_text: { type: ["string", "null"] } }, required: ["value", "confidence", "evidence_text"], additionalProperties: false },
                 tour_name: { type: "object", properties: { value: { type: ["string", "null"] }, confidence: { type: "number" }, evidence_text: { type: ["string", "null"] } }, required: ["value", "confidence", "evidence_text"], additionalProperties: false },
                 destinations: { type: "array", items: { type: "object", properties: { name: { type: ["string", "null"] }, type: { type: "string", enum: ["country", "city", "region", "attraction", "unknown"] }, confidence: { type: "number" }, evidence_text: { type: ["string", "null"] } }, required: ["name", "type", "confidence", "evidence_text"], additionalProperties: false } },
                 duration: { type: "object", properties: { days: { type: ["number", "null"] }, nights: { type: ["number", "null"] }, confidence: { type: "number" }, evidence_text: { type: ["string", "null"] } }, required: ["days", "nights", "confidence", "evidence_text"], additionalProperties: false },
                 dates: {
                   type: "object",
                   properties: {
                     departure_dates: { type: "array", items: { type: "object", properties: { raw_text: { type: ["string", "null"] }, start_date: { type: ["string", "null"] }, end_date: { type: ["string", "null"] }, confidence: { type: "number" }, evidence_text: { type: ["string", "null"] }, reason: { type: ["string", "null"] } }, required: ["raw_text", "start_date", "end_date", "confidence", "evidence_text", "reason"], additionalProperties: false } },
                     travel_periods: { type: "array", items: { type: "object", properties: { raw_text: { type: ["string", "null"] }, start_date: { type: ["string", "null"] }, end_date: { type: ["string", "null"] }, confidence: { type: "number" }, evidence_text: { type: ["string", "null"] } }, required: ["raw_text", "start_date", "end_date", "confidence", "evidence_text"], additionalProperties: false } },
                     booking_deadlines: { type: "array", items: { type: "object", properties: { raw_text: { type: ["string", "null"] }, date: { type: ["string", "null"] }, confidence: { type: "number" }, evidence_text: { type: ["string", "null"] } }, required: ["raw_text", "date", "confidence", "evidence_text"], additionalProperties: false } },
                     promotion_periods: { type: "array", items: { type: "object", properties: { raw_text: { type: ["string", "null"] }, start_date: { type: ["string", "null"] }, end_date: { type: ["string", "null"] }, confidence: { type: "number" }, evidence_text: { type: ["string", "null"] } }, required: ["raw_text", "start_date", "end_date", "confidence", "evidence_text"], additionalProperties: false } },
                     payment_due_dates: { type: "array", items: { type: "object", properties: { raw_text: { type: ["string", "null"] }, date: { type: ["string", "null"] }, confidence: { type: "number" }, evidence_text: { type: ["string", "null"] } }, required: ["raw_text", "date", "confidence", "evidence_text"], additionalProperties: false } },
                     ambiguous_dates: { type: "array", items: { type: "object", properties: { raw_text: { type: ["string", "null"] }, possible_types: { type: "array", items: { type: "string" } }, reason: { type: ["string", "null"] }, confidence: { type: "number" }, evidence_text: { type: ["string", "null"] } }, required: ["raw_text", "possible_types", "reason", "confidence", "evidence_text"], additionalProperties: false } }
                   },
                   required: ["departure_dates", "travel_periods", "booking_deadlines", "promotion_periods", "payment_due_dates", "ambiguous_dates"],
                   additionalProperties: false
                 },
                 prices: { type: "array", items: { type: "object", properties: { raw_text: { type: ["string", "null"] }, amount: { type: ["number", "null"] }, currency: { type: "string", enum: ["THB", "USD", "EUR", "JPY", "unknown"] }, price_type: { type: "string", enum: ["adult", "child", "infant", "single_supplement", "group", "unknown"] }, confidence: { type: "number" }, evidence_text: { type: ["string", "null"] } }, required: ["raw_text", "amount", "currency", "price_type", "confidence", "evidence_text"], additionalProperties: false } },
                 airline: { type: "object", properties: { value: { type: ["string", "null"] }, confidence: { type: "number" }, evidence_text: { type: ["string", "null"] } }, required: ["value", "confidence", "evidence_text"], additionalProperties: false },
                 supplier_name: { type: "object", properties: { value: { type: ["string", "null"] }, confidence: { type: "number" }, evidence_text: { type: ["string", "null"] } }, required: ["value", "confidence", "evidence_text"], additionalProperties: false },
                 overall_confidence: { type: "number" },
                 missing_fields: { type: "array", items: { type: "string" } },
                 warnings: { type: "array", items: { type: "string" } },
                 should_ask_user: { type: "boolean" },
                 question_to_user: { type: ["string", "null"] }
               },
               required: ["tour_code", "tour_name", "destinations", "duration", "dates", "prices", "airline", "supplier_name", "overall_confidence", "missing_fields", "warnings", "should_ask_user", "question_to_user"],
               additionalProperties: false
             }
           }
         },
         messages: [
           {
             role: "system",
             content: "You are a meticulous data extraction assistant. Your job is to parse raw, unformatted, and often error-prone OCR text extracted from Thai tour posters. You must output the extracted data STRICTLY in the provided JSON format."
           },
           {
             role: "user",
             content: `OCR text:\n${rawOcrText}\n\nPlease extract the requested fields.`
           }
         ]
       });
       extractedDataForSearch = JSON.parse(ocrRes.choices[0].message.content || "{}");
       console.log("[OCR Structured Data]:", JSON.stringify(extractedDataForSearch, null, 2));
    }
    
    return extractedDataForSearch;
  } catch (error) {
    console.error("OCR Extraction Failed:", error);
    return null;
  }
}

export function getSearchAgentPrompt(extractedDataForSearch: any): string {
  return `คุณคือ AI Search Agent สำหรับระบบค้นหาทัวร์ B2B
หน้าที่ของคุณคือใช้ข้อมูล extracted JSON เพื่อค้นหาทัวร์ที่ตรงที่สุดใน database

ข้อมูลที่สกัดได้จากรูปภาพ:
${JSON.stringify(extractedDataForSearch, null, 2)}

จงค้นหาทัวร์โดยใช้คำสั่ง search_tours ตามพารามิเตอร์ที่เหมาะสม`;
}
