import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://qterfftaebnoawnzkfgu.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

const openaiApiKey = process.env.OPENAI_API_KEY;
const openai = openaiApiKey ? new OpenAI({ apiKey: openaiApiKey }) : null;

const prisma = new PrismaClient();

async function main() {
  if (!openai) {
    console.error("OpenAI API key is missing");
    return;
  }

  console.log("Cleaning up old embeddings...");
  await prisma.$executeRaw`DELETE FROM tour_embeddings`;

  console.log("Fetching tours to generate embeddings...");
  const tours = await prisma.tour.findMany({
    where: {
      status: 'PUBLISHED'
    },
    include: {
      destinations: true,
      departures: {
        include: {
          prices: true
        }
      },
      supplier: true
    }
  });

  console.log(`Found ${tours.length} published tours.`);

  let successCount = 0;
  let failedCount = 0;

  for (const tour of tours) {
    try {
      let lowestPrice = 0;
      if (tour.departures && tour.departures.length > 0) {
        const prices = tour.departures.flatMap(d => d.prices.map(p => p.sellingPrice));
        if (prices.length > 0) {
          lowestPrice = Math.min(...prices.map(Number));
        }
      }

      const dests = tour.destinations.map(d => `${d.city ? d.city + ', ' : ''}${d.country}`).join(' | ');

      const textToEmbed = `
        Tour Title: ${tour.tourName}
        Supplier: ${tour.supplier?.displayName}
        Destinations: ${dests}
        Duration: ${tour.durationDays} Days / ${tour.durationNights} Nights
        Starting Price: ${lowestPrice > 0 ? lowestPrice + ' THB' : 'N/A'}
      `.trim().replace(/\n/g, " ");

      const response = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: textToEmbed,
        encoding_format: "float",
      });

      const embedding = response.data[0].embedding;

      const { error } = await supabase.from('tour_embeddings').insert({
        id: `embed_${tour.id}`,
        tourId: tour.id,
        embedding: embedding,
        content: textToEmbed,
        updatedAt: new Date().toISOString()
      });

      if (error) {
        throw new Error(error.message);
      }

      process.stdout.write('.');
      successCount++;
    } catch (err) {
      console.error(`\nFailed to process tour ${tour.id}:`, err);
      failedCount++;
    }
  }

  console.log(`\nDone! Success: ${successCount}, Failed: ${failedCount}`);
  await prisma.$disconnect();
}

main().catch(e => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
