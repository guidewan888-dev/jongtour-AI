const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI('AIzaSyA8z-f7GgfMXOroYq2UlGCuc5KSMXaf_U8');
async function test() {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  const prompt = `
You are an intelligent travel agent parsing user travel queries.
Extract the travel intent from this user message: "แนะนำทัวร์ยุโรป ช่วงหน้าหนาวหน่อยครับ"

Return ONLY a valid JSON object with these exact keys:
- "keywords": array of strings. Include destination countries, cities, or continents in THAI language (e.g., ["ญี่ปุ่น", "ยุโรป", "หน้าหนาว", "ฮอกไกโด"]). Leave empty if none found. Do NOT include generic words like "ทัวร์" or "ไปเที่ยว".
- "maxPrice": number or null. Extract any maximum budget mentioned. Convert shorthand like "3 หมื่น" to 30000.
- "isFire": boolean. true if the user is looking for last-minute deals (e.g., "ไฟไหม้", "โปรไฟไหม้").

DO NOT wrap the response in markdown blocks like \`\`\`json. Return JUST the raw JSON string.
`;
  const res = await model.generateContent(prompt);
  console.log("INTENT:", res.response.text());
}
test();
