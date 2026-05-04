import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function run() {
  const tours = await prisma.tour.findMany({
    where: { 
      supplier: { canonicalName: "let'sgo" }
    },
    include: {
      destinations: true,
      departures: true
    }
  });
  console.log(`Found ${tours.length} tours for let'sgo.`);
  const deps = tours.flatMap(t => t.departures).map(d => d.startDate);
  const japanTours = tours.filter(t => t.destinations.some(d => d.country === 'JAPAN'));
  console.log(`Found ${japanTours.length} Japan tours.`);
  console.log("Japan Tour Names:", japanTours.slice(0, 5).map(t => t.tourName));
}
run();
