const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const toursData = await prisma.tour.findMany({
    where: { supplier: { canonicalName: "api_zego" }, status: 'PUBLISHED' },
    include: {
      destinations: true,
      images: { take: 1 },
      departures: {
        where: { startDate: { gte: new Date() } },
        orderBy: { startDate: 'asc' },
        include: { prices: true }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 1
  });

  console.log(JSON.stringify(toursData, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
