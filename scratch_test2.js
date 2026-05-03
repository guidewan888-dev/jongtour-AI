const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const keywords = [
  "JAPAN",
  "ญี่ปุ่น",
  "ฮอกไกโด",
  "โตเกียว",
  "โอซาก้า",
  "ฟุกุโอกะ",
  "นาโกย่า"
];

async function main() {
  const keywordConditions = keywords.map(kw => ({
    OR: [
      { destinations: { some: { country: { contains: kw, mode: 'insensitive' } } } },
      { tourName: { contains: kw, mode: 'insensitive' } }
    ]
  }));

  const toursData = await prisma.tour.findMany({
    where: {
      status: 'PUBLISHED',
      OR: keywordConditions
    },
    include: {
      departures: {
        where: { startDate: { gte: new Date() } },
        orderBy: { startDate: 'asc' },
        include: { prices: true }
      },
      destinations: true,
      images: { take: 1 },
      supplier: true
    },
    orderBy: { createdAt: 'desc' },
    take: 1
  });

  console.log("Success! " + toursData.length);
}

main().catch(console.error).finally(() => prisma.$disconnect());
