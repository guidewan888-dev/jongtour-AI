import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
  const tours = await prisma.tour.count();
  const departures = await prisma.departure.count();
  const dests = await prisma.tourDestination.count();
  
  console.log('Tours:', tours);
  console.log('Departures:', departures);
  console.log('Destinations:', dests);

  // Let's see one Letgo tour payload from tour_raw_sources
  const raw = await prisma.tourRawSource.findFirst({ where: { supplierId: 'SUP_LETGO' }});
  if (raw) {
    const payload = raw.rawPayload as any;
    console.log('Sample Letgo payload has Periods?', !!payload.Periods);
    console.log('Keys in payload:', Object.keys(payload));
  }
}
check();
