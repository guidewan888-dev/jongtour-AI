import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Classifies an uploaded image or PDF into specific categories 
 * so the system knows which flow to route to.
 */
export async function classifyFile(imageUrl: string): Promise<{ type: string; confidence: number }> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `คุณเป็นผู้คัดแยกประเภทไฟล์ (Dispatcher) ให้ระบุว่ารูปภาพ/PDF ที่ลูกค้าส่งมาคืออะไร:
1. SCENERY: รูปสถานที่ท่องเที่ยว (ทะเล, ภูเขา, วัด)
2. TOUR_POSTER: รูปโปรแกรมทัวร์ที่มีชื่อประเทศ ราคา และวันเดินทาง
3. ITINERARY_PDF: ไฟล์ PDF แจกแจงโปรแกรมทัวร์รายวัน
4. PRICE_TABLE: ตารางระบุวันออกเดินทางและราคา
5. PERSONAL_DOC: พาสปอร์ต, สลิปโอนเงิน, วีซ่า
6. UNKNOWN: นอกเหนือจากที่ระบุ

ให้ตอบกลับเป็น JSON Format เท่านั้น: {"type": "SCENERY", "confidence": 0.95}`
        },
        {
          role: "user",
          content: [
            { type: "text", text: "นี่คือไฟล์ประเภทไหน?" },
            { type: "image_url", image_url: { url: imageUrl } }
          ]
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 100,
    });

    const result = JSON.parse(response.choices[0].message.content || '{"type": "UNKNOWN", "confidence": 0}');
    return result;
  } catch (error) {
    console.error("Error classifying file:", error);
    return { type: "UNKNOWN", confidence: 0 };
  }
}

/**
 * Extracts tour details from a competitor's poster or image.
 * Uses strict guardrails to prevent hallucination.
 */
export async function extractTourDetailsFromImage(imageUrl: string) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `ทำ OCR ดึงข้อมูลจากรูปโปสเตอร์ทัวร์นี้ให้ละเอียดที่สุด โดยผลลัพธ์ต้องอยู่ในรูปแบบ JSON และต้องมี evidence_text แนบมาด้วยทุก Field.
- tour_code: รหัสทัวร์ (ถ้ามี)
- destination: ประเทศ หรือ เมือง
- duration: ระยะเวลา (เช่น '5 วัน 3 คืน')
- airline: ชื่อสายการบิน
- price: ราคาเริ่มต้น ตัวเลขเท่านั้น
- supplier: ค่ายทัวร์ต้นทาง เช่น ซีโก้, เลทส์โก
- date_ranges: ช่วงเดือนที่เดินทาง

Guardrail: หากช่องไหนอ่านไม่ออก ให้ใส่ null ห้ามเดาเอาเองเด็ดขาด
ตัวอย่าง Output:
{
  "tour_code": { "value": "ZGTNRT-2401", "evidence_text": "Code: ZGTNRT-2401", "confidence": 0.98 },
  "destination": { "value": "Japan", "evidence_text": "มหัศจรรย์โตเกียว ฟูจิ", "confidence": 0.95 }
}`
        },
        {
          role: "user",
          content: [
            { type: "text", text: "ดึงข้อมูลจากรูปทัวร์นี้" },
            { type: "image_url", image_url: { url: imageUrl } }
          ]
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 500,
    });

    return JSON.parse(response.choices[0].message.content || '{}');
  } catch (error) {
    console.error("Error extracting tour details:", error);
    return null;
  }
}

/**
 * Guesses the destination from a scenic photo.
 */
export async function extractDestinationFromImage(imageUrl: string) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `วิเคราะห์รูปภาพสถานที่ท่องเที่ยวนี้แล้วบอกว่าเป็นที่ไหน (ประเทศ, เมือง, หรือชื่อสถานที่)
ตอบกลับเป็น JSON: {"destination": "Fuji, Japan", "confidence": 0.98}`
        },
        {
          role: "user",
          content: [
            { type: "text", text: "รูปนี้คือที่ไหน?" },
            { type: "image_url", image_url: { url: imageUrl } }
          ]
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 100,
    });

    return JSON.parse(response.choices[0].message.content || '{"destination": null, "confidence": 0}');
  } catch (error) {
    console.error("Error extracting destination from image:", error);
    return null;
  }
}
