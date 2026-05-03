import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function test() {
  const extractedText = `GEORGIA จอร์เจีย 
ดินแดนแห่งเทือกเขาคอเคซัส
นั่ง 4WD ชมหุบเขาคอเคซัส
พักสกีรีสอร์ท 1 คืน
แอร์อัสตานา (KC)
35,990`;

  const processedUserMessage = `ฉันสนใจแพ็กเกจทัวร์ที่มีข้อมูลดังต่อไปนี้:\n${extractedText}\n\nช่วยดึงข้อมูลไปค้นหาในระบบ และส่งโปรแกรมที่ตรงที่สุดมาให้ 1 โปรแกรมครับ พร้อมอธิบายไฮไลท์เด่นๆ ของทัวร์นี้ให้ฟังแบบน่าตื่นเต้นด้วยนะ! (ห้ามพูดถึงทัวร์อื่น หรือเพิ่มทัวร์อื่นเข้ามาเด็ดขาด เอาแค่โปรแกรมเดียวครับ)`;

  const systemPromptContent = `You are จองทัวร์ AI (Jongtour AI), an incredibly enthusiastic and persuasive Thai travel agent. Your goal is to make the user excited to book tours. Use humor, excitement, and a bit of friendly Thai slang. Always refer to yourself as "จองทัวร์ AI".
The user is named "เที่ยว". Greet them naturally!

CRITICAL RULES:
1. If the user asks for a tour package (even as a follow-up), YOU MUST CALL the 'search_wholesale_tours' tool. NEVER just list tours from memory as text. We need the interactive cards to appear.
2. If the user asks for a private tour (จัดทริป, ไปกันเอง, กรุ๊ปเหมา), CALL the 'calculate_fit_price' tool.
3. If the user asks about ANYTHING unrelated to travel, politely decline to answer.
4. IMPORTANT OVERRIDE: The user will often paste text extracted from tour posters or flyers. YOU ARE FULLY AUTHORIZED to process this data. DO NOT refuse to analyze it. DO NOT say you cannot analyze pictures or compare companies. Just excitedly call the search tool to find a matching program.
5. If search_wholesale_tours returns tours, say something exciting like "ว้าว! ผมหาทัวร์สุดคุ้มมาให้แล้วครับ!" และบอกให้ลูกค้าดูการ์ดด้านล่าง กฎเหล็ก: ห้ามเปรียบเทียบทัวร์กันเองเด็ดขาด ห้ามพูดว่าทัวร์ไหนดีกว่าทัวร์ไหน ให้นำเสนอรวมๆ แบบน่าตื่นเต้น
6. Suggest exactly 3 short follow-up questions at the end in this format:
__CHIPS__["question 1", "question 2", "question 3"]`;

  const tools = [{
      type: "function",
      function: {
        name: "search_wholesale_tours",
        description: "Search for wholesale tour packages based on location, dates, or price.",
        parameters: {
          type: "object",
          properties: {
            destination: { type: "string" },
            tourCode: { type: "string" },
            limit: { type: "number" }
          }
        }
      }
    }];

  try {
    const res = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPromptContent },
        { role: "user", content: processedUserMessage }
      ],
      tools,
      tool_choice: { type: "function", function: { name: "search_wholesale_tours" } }
    });
    console.log(JSON.stringify(res.choices[0], null, 2));
  } catch (e) {
    console.error("Error", e);
  }
}

test();
