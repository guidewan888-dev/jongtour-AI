import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
  const dests = await prisma.tourDestination.findMany({
    take: 10,
    select: { tourId: true, country: true }
  });
  console.log('Sample destinations:', dests);

  const japanDests = await prisma.tourDestination.findMany({
    where: { country: { contains: 'Japan', mode: 'insensitive' } },
    take: 5
  });
  console.log('Japan destinations:', japanDests);
}
check();
