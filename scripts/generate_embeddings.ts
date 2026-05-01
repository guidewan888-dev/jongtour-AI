import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';


const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://qterfftaebnoawnzkfgu.supabase.co";
// Must use the SERVICE_ROLE_KEY to update embeddings since it bypasses RLS
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_SRwNSJ89mInda5FcuB1W2w_9IEJlSOI";
const supabase = createClient(supabaseUrl, supabaseKey);

const openaiApiKey = process.env.OPENAI_API_KEY;
const openai = openaiApiKey ? new OpenAI({ apiKey: openaiApiKey }) : null;

async function main() {
  if (!openai) {
    console.error("OpenAI API key is missing");
    return;
  }

  console.log("Fetching tours without embeddings...");
  const { data: tours, error: fetchError } = await supabase
    .from('Tour')
    .select('id, title, destination, durationDays, price, description, itinerary')
    .is('embedding', null)
    .limit(100); // Process 100 at a time

  if (fetchError) {
    console.error("Fetch Error:", fetchError);
    return;
  }

  if (!tours || tours.length === 0) {
    console.log("No tours found that need embeddings.");
    return;
  }

  console.log(`Processing ${tours.length} tours...`);
  let successCount = 0;
  let failedCount = 0;

  for (const tour of tours) {
    try {
      let itineraryText = "";
      if (tour.itinerary && Array.isArray(tour.itinerary)) {
        itineraryText = tour.itinerary.map((day: any, i: number) => 
          `Day ${i + 1}: ${day.title || day.detail || ''}`
        ).join(" | ");
      }

      const textToEmbed = `
        Tour Title: ${tour.title}
        Destination: ${tour.destination}
        Duration: ${tour.durationDays} days
        Price: ${tour.price} THB
        Description: ${tour.description || "No description"}
        Itinerary: ${itineraryText}
      `.trim().replace(/\n/g, " ");

      const response = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: textToEmbed,
        encoding_format: "float",
      });

      const embedding = response.data[0].embedding;

      const { error: updateError } = await supabase
        .from('Tour')
        .update({ embedding })
        .eq('id', tour.id);

      if (updateError) {
        console.error(`Failed to update tour ${tour.id}:`, updateError.message);
        failedCount++;
      } else {
        process.stdout.write('.');
        successCount++;
      }
    } catch (err) {
      console.error(`Failed to process tour ${tour.id}:`, err);
      failedCount++;
    }
  }

  console.log(`\nDone! Success: ${successCount}, Failed: ${failedCount}`);
}

main();
