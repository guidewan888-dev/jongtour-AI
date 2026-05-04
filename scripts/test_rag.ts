import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

async function testRag() {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );

  const userMessage = "ขอทัวร์ญี่ปุ่นของ Let'go เดือนพฤษภาคม 2 คน";
  console.log("Input:", userMessage);

  const embedResponse = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: userMessage.replace(/\n/g, " "),
    encoding_format: "float",
  });
  
  const query_embedding = embedResponse.data[0].embedding;
  const { data: matches, error: matchError } = await supabase.rpc('match_tours', {
    query_embedding,
    match_threshold: 0.25,
    match_count: 10
  });
  
  if (matchError) {
    console.error("RPC Error:", matchError);
  } else {
    console.log(`Found ${matches?.length || 0} matches.`);
    if (matches && matches.length > 0) {
      console.log(matches.slice(0, 3).map((m: any) => m.id));
    }
  }
}
testRag();
