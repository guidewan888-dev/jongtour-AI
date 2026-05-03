import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://qterfftaebnoawnzkfgu.supabase.co";
// Must use the SERVICE_ROLE_KEY to update embeddings since it bypasses RLS
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_SRwNSJ89mInda5FcuB1W2w_9IEJlSOI";
const supabase = createClient(supabaseUrl, supabaseKey);

const openaiApiKey = process.env.OPENAI_API_KEY;
const openai = openaiApiKey ? new OpenAI({ apiKey: openaiApiKey }) : null;

export async function POST(request: Request) {
  try {
    if (!openai) {
      return NextResponse.json({ error: "OpenAI API key is missing" }, { status: 500 });
    }

    // Optional: add a simple admin secret check here
    const { adminSecret, limit = 50 } = await request.json().catch(() => ({}));

    // Fetch tours that do NOT have an embedding yet
    const { data: tours, error: fetchError } = await supabase
      .from('tours')
      .select('id, tourName, durationDays, itineraries')
      .is('embedding', null)
      .limit(limit);

    if (fetchError) {
      console.error("Fetch Error:", fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    if (!tours || tours.length === 0) {
      return NextResponse.json({ message: "No tours found that need embeddings.", count: 0 });
    }

    let successCount = 0;
    let failedCount = 0;

    for (const tour of tours) {
      try {
        // Construct a rich text representation of the tour for embedding
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

        // Generate embedding
        const response = await openai.embeddings.create({
          model: "text-embedding-3-small",
          input: textToEmbed,
          encoding_format: "float",
        });

        const embedding = response.data[0].embedding;

        // Update the tour with the new embedding
        const { error: updateError } = await supabase
          .from('tours')
          .update({ embedding })
          .eq('id', tour.id);

        if (updateError) {
          console.error(`Failed to update tour ${tour.id}:`, updateError);
          failedCount++;
        } else {
          successCount++;
        }

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
