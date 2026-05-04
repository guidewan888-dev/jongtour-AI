import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

async function check() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );

  const { data: dests } = await supabase
    .from('tour_destinations')
    .select('tourId')
    .ilike('country', `%Japan%`)
    .limit(5);

  const tourIds = dests?.map((d: any) => d.tourId) || [];
  console.log("Tour IDs:", tourIds);

  if (tourIds.length > 0) {
    const { data: tourData, error } = await supabase
      .from('tours')
      .select(`
        id, tourName, tourCode, durationDays,
        images:tour_images(imageUrl),
        departures(startDate, remainingSeats, prices(sellingPrice)),
        supplier:suppliers(displayName)
      `)
      .in('id', tourIds);
      
    if (error) console.error("Error:", error);
    else {
      console.log("Success! Fetched tours:", tourData?.length);
      console.log("First tour supplier:", tourData?.[0]?.supplier);
    }
  }
}
check();
