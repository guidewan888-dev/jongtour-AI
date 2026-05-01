import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://qterfftaebnoawnzkfgu.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_SRwNSJ89mInda5FcuB1W2w_9IEJlSOI";
const supabase = createClient(supabaseUrl, supabaseKey);

const openaiApiKey = process.env.OPENAI_API_KEY;
const openai = openaiApiKey ? new OpenAI({ apiKey: openaiApiKey }) : null;

export async function processAiQuery(userMessage: string) {
  let matchedTourIds: string[] = [];
  let isSemanticSearch = false;
  let keywords: string[] = [];

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
        match_threshold: 0.25,
        match_count: 8
      });

      if (!matchError && matches && matches.length > 0) {
        matchedTourIds = matches.map((m: any) => m.id);
        isSemanticSearch = true;
        keywords = ["ทัวร์ที่ตรงกับความต้องการของคุณ"];
      }
    } catch (err) {
      console.error("Semantic search failed:", err);
    }
  }

  let query = supabase.from('Tour').select('*, departures:TourDeparture(*)');

  if (!isSemanticSearch) {
    const commonDestinations = [
      "ญี่ปุ่น", "japan", "เกาหลี", "korea", "ยุโรป", "europe", "ไต้หวัน", "taiwan", 
      "ฮ่องกง", "hong kong", "จีน", "china", "สิงคโปร์", "singapore", "เวียดนาม", "vietnam"
    ];
    
    for (const dest of commonDestinations) {
      if (userMessage.toLowerCase().includes(dest)) {
        keywords.push(dest);
      }
    }

    if (keywords.length > 0) {
      const orConditions = keywords.map(kw => `destination.ilike.*${kw}*,title.ilike.*${kw}*`);
      query = query.or(orConditions.join(','));
    }
  }

  if (isSemanticSearch && matchedTourIds.length > 0) {
    query = query.in('id', matchedTourIds);
  }

  // Fetch a larger pool to shuffle
  query = query.order('createdAt', { ascending: false }).limit(60);

  const { data: rawTours } = await query;
  let tours = rawTours || [];

  if (isSemanticSearch && matchedTourIds.length > 0) {
    tours.sort((a, b) => matchedTourIds.indexOf(a.id) - matchedTourIds.indexOf(b.id));
  } else {
    // Randomly shuffle to give visibility to older wholesale tours (like Let's Go)
    tours = tours.sort(() => 0.5 - Math.random());
  }

  if (isSemanticSearch && matchedTourIds.length > 0) {
    tours.sort((a, b) => matchedTourIds.indexOf(a.id) - matchedTourIds.indexOf(b.id));
  }

  // Local Filters (Simple Price)
  const priceMatch = userMessage.match(/งบ\s*(\d+)\s*(หมื่น|พัน)?/);
  if (priceMatch && tours.length > 0) {
    let num = parseInt(priceMatch[1]);
    if (priceMatch[2] === "หมื่น") num *= 10000;
    if (priceMatch[2] === "พัน") num *= 1000;
    tours = tours.filter(tour => tour.price <= num);
  }

  tours = tours.slice(0, 4);

  return tours;
}

export interface AiReplyResult {
  text: string;
  needsHandoff: boolean;
  customItinerary?: {
    title: string;
    estimatedPrice: string;
    days: { day: number; title: string; detail: string }[];
  };
}

export async function generateAiReply(userMessage: string, tours: any[], chatHistory: any[] = []): Promise<AiReplyResult> {
  if (!openai) return { text: "ขออภัยค่ะ ขณะนี้ระบบ AI ไม่พร้อมใช้งาน กรุณาติดต่อแอดมินนะคะ", needsHandoff: false };

  const tourTitles = tours.length > 0 ? tours.map(t => {
    return `- ชื่อทัวร์: ${t.title} (ราคาเริ่มต้น ${t.price.toLocaleString()} บาท) 
      ไฮไลท์: ${t.description || t.destination}`;
  }).join("\n") : "";

  const systemPrompt = `คุณคือ 'จองทัวร์ AI' พนักงานขายทัวร์สุดน่ารัก สุภาพ และเป็นกันเองของบริษัท Jongtour
หน้าที่ของคุณคือแนะนำแพ็กเกจทัวร์ที่ใกล้เคียงกับที่ลูกค้าถามมา และตอบคำถามทั่วไปเกี่ยวกับบริษัท

**ข้อมูลบริษัท (Company Knowledge Base):**
- การชำระเงิน: จ่ายมัดจำ 50% ส่วนที่เหลือชำระก่อนเดินทาง 15-30 วัน รับชำระผ่านเงินโอนและบัตรเครดิต
- วีซ่า: บริษัทมีบริการให้คำปรึกษาและช่วยเตรียมเอกสาร (บางทัวร์รวมค่าวีซ่าแล้ว ให้ดูในโปรแกรม)
- ช่องทางติดต่อ: หากต้องการคุยกับแอดมินคนเป็นๆ สามารถติดต่อผ่าน LINE Official: @Jongtour หรือเบอร์โทร 02-XXX-XXXX

**ข้อมูลทัวร์ที่มีในระบบตอนนี้ (อ้างอิงจากฐานข้อมูล):**
${tourTitles ? tourTitles : "ตอนนี้ไม่มีแพ็กเกจทัวร์ที่ตรงกับที่คุณลูกค้าตามหาค่ะ แต่สามารถบอกให้เราหาทัวร์ประเทศอื่นได้นะคะ"}

**กฎการตอบ และ การปิดการขาย (AUTO-BOOKING):**
1. ถ้ามีทัวร์ที่ตรงกับความต้องการ ให้แนะนำพร้อมไฮไลท์เด่นๆ 1-2 ทัวร์ (อ้างอิงเฉพาะทัวร์ที่มีในระบบ)
2. ถ้าลูกค้าถามเรื่องการจ่ายเงิน วีซ่า หรือติดต่อแอดมิน ให้อ้างอิงจากข้อมูลบริษัท
3. ตอบสั้นๆ กระชับ เป็นธรรมชาติ มีอิโมจิน่ารักๆ
4. ไม่แต่งเรื่องเองเด็ดขาด ถ้าไม่รู้ให้แนะนำให้แอดไลน์ @Jongtour
5. [สำคัญมาก] หากวิเคราะห์เจตนา (Intent) แล้วพบว่า "ลูกค้าต้องการจองทัวร์" (เช่น "ตกลงจองอันนี้", "เอาแพ็กเกจนี้", "ไปวันไหนได้บ้าง") ให้คุณสอบถามรายละเอียดที่จำเป็น เช่น ชื่อ จำนวนคน และวันเดินทางที่ต้องการ 
6. [สำคัญมาก] เมื่อได้รายละเอียดครบถ้วนแล้ว ให้คุณแนบลิงก์จองทัวร์ให้ลูกค้า โดยใช้รูปแบบ URL นี้นะคะ: https://jongtour.com/tours/[รหัสทัวร์ (id)]
7. [สำคัญมาก] หากลูกค้าต้องการจัดกรุ๊ปส่วนตัว (Private Tour, กรุ๊ปเหมา, F.I.T.) ให้คุณออกแบบแผนการเดินทางแบบคร่าวๆ รายวัน พร้อมประเมินราคาส่งกลับไป โดยส่งในรูปแบบ customItinerary ใน JSON โดยจะต้องเขียนเป็นภาษาไทยทั้งหมด (You MUST write the entire itinerary in THAI language) **และสำคัญมาก: ทัวร์ส่วนตัว (Private Tour) มีต้นทุนการจัดการที่สูงกว่าปกติ ให้คุณคำนวณราคาต้นทุนประเมินของคุณ แล้วคูณด้วย 1.7 (บวกเพิ่ม 70%) เสมอ เพื่อให้สะท้อนราคาขายจริง**
8. [สำคัญที่สุด] คุณต้องตอบกลับเป็นรูปแบบ JSON เท่านั้น โดยมีโครงสร้างดังนี้:
{
  "text": "ข้อความตอบกลับของคุณ",
  "needsHandoff": boolean, // จะเป็น true เมื่อลูกค้ามีอารมณ์โกรธ ไม่พอใจ หรือเจาะจงขอคุยกับแอดมินคนจริง นอกนั้นเป็น false
  "customItinerary": { // (ใส่มาเฉพาะเมื่อลูกค้าขอจัดทัวร์ส่วนตัว/กรุ๊ปเหมาเท่านั้น ถ้าไม่ใช่ให้ใส่ null)
    "title": "ชื่อทริป (เช่น ทริปส่วนตัวญี่ปุ่น 5 วัน)",
    "estimatedPrice": "ราคาประเมิน (เช่น 45,000 บาท/ท่าน)",
    "days": [
      { 
        "day": 1, 
        "title": "เดินทางถึง / วันแรก", 
        "detail": "รายละเอียดสั้นๆ",
        "meals": { "breakfast": boolean, "lunch": boolean, "dinner": boolean },
        "hotel": "ชื่อโรงแรม หรือ -",
        "imagePrompt": "A short ENGLISH phrase describing the main tourist attraction of this day (e.g. 'A beautiful photography of Mount Fuji in spring')"
      }
    ]
  }
}
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        ...chatHistory.map(m => ({ role: m.role, content: m.content })),
        { role: "user", content: userMessage }
      ],
      temperature: 0.7,
      max_tokens: 600,
      response_format: { type: "json_object" }
    });

    const parsedContent = JSON.parse(response.choices[0].message.content || "{}");
    return {
      text: parsedContent.text || "ขออภัยค่ะ เกิดข้อผิดพลาดในการประมวลผล",
      needsHandoff: parsedContent.needsHandoff === true,
      customItinerary: parsedContent.customItinerary || undefined
    };
  } catch (error) {
    console.error("OpenAI Error:", error);
    return { text: "ขออภัยค่ะ ขณะนี้ระบบ AI ไม่พร้อมใช้งาน กรุณาติดต่อแอดมินทาง @Jongtour นะคะ", needsHandoff: false };
  }
}

export async function summarizeChatSession(chatHistory: any[]): Promise<string> {
  if (!openai || chatHistory.length === 0) return "ไม่มีข้อมูลแชท";

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { 
          role: "system", 
          content: "คุณคือระบบ AI หลังบ้านที่ช่วยสรุปการคุยระหว่างลูกค้าและ AI เซลส์\nให้อ่านประวัติการแชทแล้วสรุปใจความสำคัญสั้นๆ (ไม่เกิน 2 บรรทัด) เช่น 'ลูกค้าสนใจทัวร์ญี่ปุ่น แต่ยังลังเลเรื่องราคา', 'ลูกค้าต้องการจองทัวร์ยุโรป กำลังรอโอนเงิน' เป็นต้น" 
        },
        { 
          role: "user", 
          content: chatHistory.map(m => `${m.role === 'user' ? 'ลูกค้า' : 'AI'}: ${m.content}`).join('\n') 
        }
      ],
      temperature: 0.3,
      max_tokens: 150,
    });

    return response.choices[0].message.content || "ไม่สามารถสรุปได้";
  } catch (error) {
    console.error("Summarize Error:", error);
    return "ไม่สามารถสรุปได้เนื่องจากระบบขัดข้อง";
  }
}

