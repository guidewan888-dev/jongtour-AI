import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import OpenAI from 'openai';
import { prisma } from '@/lib/prisma';

const openaiApiKey = process.env.OPENAI_API_KEY;
const openai = openaiApiKey ? new OpenAI({ apiKey: openaiApiKey }) : null;

export async function POST(request: Request) {
  try {
    if (!openai) {
      return NextResponse.json({ error: "OpenAI API key is missing" }, { status: 500 });
    }

    const { limit = 50 } = await request.json().catch(() => ({}));

    // Fetch tours that do NOT have a record in TourEmbedding
    const tours = await prisma.tour.findMany({
      where: {
        TourEmbedding: null
      },
      select: {
        id: true,
        tourName: true,
        durationDays: true,
        itineraries: true
      },
      take: limit
    });

    if (!tours || tours.length === 0) {
      return NextResponse.json({ message: "No tours found that need embeddings.", count: 0 });
    }

    let successCount = 0;
    let failedCount = 0;

    for (const tour of tours) {
      try {
        let itineraryText = "";
        if (tour.itineraries && Array.isArray(tour.itineraries)) {
          itineraryText = tour.itineraries.map((day: any, i: number) => 
            `Day ${i + 1}: ${day.title || day.description || ''}`
          ).join(" | ");
        }

        const textToEmbed = `
          Tour Title: ${tour.tourName}
          Duration: ${tour.durationDays} days
          Itinerary: ${itineraryText}
        `.trim().replace(/\n/g, " ");

        const response = await openai.embeddings.create({
          model: "text-embedding-3-small",
          input: textToEmbed,
          encoding_format: "float",
        });

        const embedding = response.data[0].embedding;

        // Insert using raw SQL because Prisma unsupported type 'vector'
        await prisma.$executeRaw`
          INSERT INTO tour_embeddings (id, "tourId", embedding, content, "updatedAt")
          VALUES (
            gen_random_uuid()::text, 
            ${tour.id}, 
            ${embedding}::vector, 
            ${textToEmbed}, 
            NOW()
          )
        `;

        successCount++;
      } catch (err) {
        console.error(`Failed to process tour ${tour.id}:`, err);
        failedCount++;
      }
    }

    return NextResponse.json({ 
      message: `Processed ${tours.length} tours.`, 
      success: successCount, 
      failed: failedCount 
    });

  } catch (error) {
    console.error("Generate Embeddings Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
