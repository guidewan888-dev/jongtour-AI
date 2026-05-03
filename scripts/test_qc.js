require('dotenv').config({ path: '.env.local' });
const { OpenAI } = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const getQualityCheckerPrompt = (
  requestedSupplierId, 
  requestedSupplierName, 
  tours, 
  finalOutputText
) => `คุณคือ AI Quality Checker สำหรับระบบค้นหาทัวร์

หน้าที่ของคุณคือตรวจคำตอบสุดท้ายก่อนส่งให้ลูกค้า

requested_supplier_id:
${requestedSupplierId}

requested_supplier_name:
${requestedSupplierName}

final_tour_results:
${JSON.stringify(tours.map((t) => ({ id: t.id, title: t.title, supplier_id: t.source, providerId: t.providerId })))}

AI_RESPONSE_TO_VALIDATE:
${finalOutputText}

กฎตรวจสอบ (โปรดอ่านอย่างละเอียด):
1. ตรวจสอบว่า final_tour_results มีข้อมูลทัวร์หรือไม่
   - ถ้า "มีข้อมูลทัวร์" และทุกทัวร์มี supplier_id ตรงกับ requested_supplier_id ให้คุณตอบ approved = true เสมอ
   - ถ้า "ไม่มีข้อมูลทัวร์เลย" (array ว่าง) ให้คุณตอบ approved = true เฉพาะกรณีที่ AI_RESPONSE_TO_VALIDATE บอกลูกค้าตรงๆ ว่า "ไม่พบโปรแกรม"
2. กรณีที่จะให้ approved = false ทันที มีแค่ 2 กรณีนี้เท่านั้น:
   - มีข้อมูลทัวร์ที่ supplier_id ไม่ตรงกับ requested_supplier_id ปะปนมา
   - ไม่มีข้อมูลทัวร์เลย แต่ AI ดันเสนอทัวร์ของ Supplier อื่นโดยไม่ได้ถามลูกค้าก่อน

ตอบกลับเป็น JSON เท่านั้น:
{
  "approved": boolean,
  "reason": "คำอธิบายสั้นๆ ว่าทำไมถึงให้ผ่านหรือไม่ผ่าน",
  "safe_response": "string or null"
}

ถ้าให้ approved = false ให้ใส่ safe_response เป็น:
"ยังไม่พบโปรแกรมของ ${requestedSupplierName} ตามเงื่อนไขนี้ครับ\n\nเงื่อนไขที่ค้นหา:\n- Supplier: ${requestedSupplierName}\n\nต้องการให้ผมหาโปรแกรมจาก Supplier เจ้าอื่นที่ใกล้เคียงให้ไหมครับ?"`;

async function test() {
  const tours = [
    { id: '1', title: 'ฮ่องกง', source: 'CHECKIN', providerId: null }
  ];
  
  const finalOutputText = `ยังไม่พบโปรแกรมของ Check in Group ตามเงื่อนไขนี้ครับ`;

  const qcPrompt = getQualityCheckerPrompt(
    'CHECKIN',
    "Check in Group",
    tours,
    finalOutputText
  );

  const qcRes = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    messages: [{ role: "system", content: qcPrompt }]
  });
  
  console.log(JSON.parse(qcRes.choices[0].message.content));
}

test().catch(console.error);
