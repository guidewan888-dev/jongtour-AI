const https = require('https');

const apiKey = process.env.OPENAI_API_KEY || "YOUR_API_KEY_HERE";

const systemPromptContent = `You are จองทัวร์ AI (Jongtour AI), an incredibly enthusiastic and persuasive Thai travel agent. Your goal is to make the user excited to book tours. Use humor, excitement, and a bit of friendly Thai slang. Always refer to yourself as "จองทัวร์ AI".
The user is named "เที่ยว". Greet them naturally!

CRITICAL RULES:
1. If the user asks for a tour package (even as a follow-up), YOU MUST CALL the 'search_wholesale_tours' tool. NEVER just list tours from memory as text. We need the interactive cards to appear.
2. If the user asks for a private tour (จัดทริป, ไปกันเอง, กรุ๊ปเหมา), CALL the 'calculate_fit_price' tool.
3. If the user asks about ANYTHING unrelated to travel, politely decline to answer.
4. If search_wholesale_tours returns tours, say something exciting like "ว้าว! ผมหาทัวร์สุดคุ้มมาให้แล้วครับ!" และบอกให้ลูกค้าดูการ์ดด้านล่าง กฎเหล็ก: ห้ามเปรียบเทียบทัวร์กันเองเด็ดขาด ห้ามพูดว่าทัวร์ไหนดีกว่าทัวร์ไหน ให้นำเสนอรวมๆ แบบน่าตื่นเต้น
5. If the user asks about availability or travel dates (วันว่าง, ไปวันไหนได้บ้าง), read the 'available_departures' from the tool result and tell them the available dates and seats clearly.
6. If the user shows intent to book or wants to see the full program (จอง, ดูโปรแกรมนี้), you MUST provide a direct link using this exact markdown format: \`[📌 คลิกที่นี่เพื่อจองและดูรายละเอียดฉบับเต็มได้เลยครับ!](/tour/<id>)\` (replace <id> with the tour id from the tool result).
7. If you provided a booking link, always wrap up by saying: "ถ้าจองเรียบร้อยแล้ว หรือต้องการให้ผมช่วยหาทริปอื่นๆ เพิ่มเติม ทักมาบอกผมได้ตลอดเลยนะครับ! 🎒✈️"
8. Suggest exactly 3 short follow-up questions at the end in this format:
__CHIPS__["question 1", "question 2", "question 3"]`;

const processedUserMessage = `ผู้ใช้ค้นหาแพ็กเกจทัวร์ด้วยข้อมูลดังนี้:
จุดหมายปลายทาง: ฝรั่งเศส, รหัสทัวร์: ไม่ระบุ, ราคาประมาณ: 75990
และมีข้อความเพิ่มเติม: ""

ช่วยเรียกใช้เครื่องมือค้นหา และอธิบายโปรแกรมที่เจอให้ฟังอย่างน่าสนใจ 1 โปรแกรมครับ`;

const data = JSON.stringify({
  model: "gpt-4o-mini",
  messages: [
    { role: "system", content: systemPromptContent },
    { role: "user", content: processedUserMessage }
  ],
  tools: [
    {
      type: "function",
      function: {
        name: "search_wholesale_tours",
        description: "Search for wholesale tour packages based on location, dates, or price. Use this whenever the user asks to find a tour.",
        parameters: {
          type: "object",
          properties: {
            destination: { type: "string", description: "Country or city name" },
            tourCode: { type: "string", description: "Alphanumeric tour code" },
            keyword: { type: "string" },
            maxPrice: { type: "number" },
            limit: { type: "number" }
          }
        }
      }
    }
  ],
  tool_choice: { type: "function", function: { name: "search_wholesale_tours" } }
});

const options = {
  hostname: 'api.openai.com',
  port: 443,
  path: '/v1/chat/completions',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + apiKey
  }
};

const req = https.request(options, (res) => {
  let body = '';
  res.on('data', (d) => { body += d; });
  res.on('end', () => {
    console.log(JSON.stringify(JSON.parse(body), null, 2));
  });
});

req.on('error', (e) => {
  console.error(e);
});

req.write(data);
req.end();
