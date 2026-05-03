const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const RESPONSE_STRATEGY_PROMPT = `RESPONSE STRATEGY

เวลาตอบลูกค้า ให้ใช้หลักนี้:

1. ถ้าข้อมูลลูกค้าครบ:
- ค้นหา / คำนวณ / สรุปผลทันที
- เสนอ 3 ตัวเลือกที่ดีที่สุด
- ปิดท้ายด้วย next step

2. ถ้าข้อมูลขาดเล็กน้อย:
- ทำเท่าที่ทำได้ก่อน
- ถามเพิ่ม 1 คำถามที่สำคัญที่สุด

3. ถ้าข้อมูลขาดเยอะ:
- ถาม 2-3 คำถามสั้นๆ
- ไม่ถามยาวเป็นแบบฟอร์ม

4. ถ้าลูกค้าขอราคากรุ๊ปส่วนตัว:
- ให้ร่างเบื้องต้นได้ถ้ามี destination + pax + duration
- ระบุ assumption ชัดเจน
- บอกว่าเป็นราคาประมาณการ

5. ถ้าลูกค้าพร้อมจอง:
- เช็ก availability
- เช็กราคา
- สรุปรายการ
- ส่ง booking link
- หรือสร้าง lead ให้ Sale ติดต่อ

6. ถ้าลูกค้าลังเล:
- เปรียบเทียบข้อดีข้อเสีย
- แนะนำตัวเลือกที่เหมาะสุด
- ถามว่าจะให้ส่งรายละเอียดหรือใบเสนอราคาไหม`;

async function main() {
  let template = await prisma.aiPromptTemplate.findUnique({
    where: { name: 'SALES_RESPONSE_STRATEGY' }
  });

  if (!template) {
    template = await prisma.aiPromptTemplate.create({
      data: { name: 'SALES_RESPONSE_STRATEGY', currentVersion: 1 }
    });
  } else {
    await prisma.aiPromptTemplate.update({
      where: { id: template.id },
      data: { currentVersion: template.currentVersion + 1 }
    });
  }

  const newVersion = template.currentVersion + (template ? 1 : 0);

  const version = await prisma.aiPromptVersion.create({
    data: {
      templateId: template.id,
      version: newVersion,
      content: RESPONSE_STRATEGY_PROMPT,
      approvedBy: null
    }
  });

  console.log('Successfully seeded SALES_RESPONSE_STRATEGY prompt to Database!');
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
