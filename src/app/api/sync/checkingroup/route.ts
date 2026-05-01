import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { createClient } from "@supabase/supabase-js";

const CHECKIN_API_URL = "https://api.checkingroup.co.th/v1/programtours";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://qterfftaebnoawnzkfgu.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_SRwNSJ89mInda5FcuB1W2w_9IEJlSOI";

const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: Request) {
  // Check authorization for Vercel Cron
  const authHeader = request.headers.get('authorization');
  // Allow manual trigger if CRON_SECRET is not set in environment (e.g., local dev), otherwise enforce it.
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    // 1. Fetch data from Check In Group API
    const response = await fetch(CHECKIN_API_URL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Check In Group API returned status: ${response.status}`);
    }

    const toursData = await response.json();
    
    if (!Array.isArray(toursData) || toursData.length === 0) {
      return NextResponse.json({ message: "No tours found in Check In Group API response" });
    }

    let toursAdded = 0;
    let toursUpdated = 0;
    let departuresAdded = 0;
    let departuresUpdated = 0;

    // 2. Process each tour
    const tourUpserts: any[] = [];
    const departureUpserts: any[] = [];

    for (const cTour of toursData) {
      if (!cTour.id || !cTour.name) continue;

      const tourId = `checkingroup_tour_${cTour.id}`;
      
      const destination = Array.isArray(cTour.countries) && cTour.countries.length > 0 
        ? cTour.countries[0].name 
        : "Unknown";

      tourUpserts.push({
        id: tourId,
        title: cTour.name,
        destination: destination,
        durationDays: parseInt(cTour.day) || 0,
        price: cTour.price || 0,
        imageUrl: cTour.banner || null,
        description: cTour.highlight || null,
        airlineCode: cTour.vehicle || null,
        providerId: cTour.id.toString(),
        source: "CHECKIN",
        pdfUrl: cTour.pdf || null,
        itinerary: cTour.plans ? JSON.parse(JSON.stringify(cTour.plans)) : null,
        updatedAt: new Date().toISOString()
      });

      if (Array.isArray(cTour.periods)) {
        for (const cPeriod of cTour.periods) {
          if (!cPeriod.id || !cPeriod.start || !cPeriod.end) continue;

          const departureId = `checkingroup_period_${cPeriod.id}`;
          
          departureUpserts.push({
            id: departureId,
            tourId: tourId,
            startDate: new Date(cPeriod.start).toISOString(),
            endDate: new Date(cPeriod.end).toISOString(),
            price: cPeriod.price || 0,
            childPrice: cPeriod.priceChild || null,
            singleRoomPrice: cPeriod.priceSingleRoomAdd || null,
            depositPrice: cPeriod.deposit || null,
            totalSeats: cPeriod.seat || 0,
            availableSeats: cPeriod.available || 0,
          });
        }
      }
    }

    // 3. Upsert Tours
    if (tourUpserts.length > 0) {
      const { error: tourError } = await supabase
        .from('Tour')
        .upsert(tourUpserts, { onConflict: 'id' });
        
      if (tourError) throw tourError;
      toursUpdated += tourUpserts.length;
    }

    // 4. Upsert Departures
    if (departureUpserts.length > 0) {
      const { error: depError } = await supabase
        .from('TourDeparture')
        .upsert(departureUpserts, { onConflict: 'id' });
        
      if (depError) throw depError;
      departuresUpdated += departureUpserts.length;
    }

    return NextResponse.json({
      success: true,
      message: "Check In Group Sync completed successfully",
      data: {
        toursProcessed: tourUpserts.length,
        departuresProcessed: departureUpserts.length
      }
    });

  } catch (error: any) {
    console.error("Check In Group Sync Error:", error);
    return NextResponse.json({ success: false, message: "Sync failed", error: error.message }, { status: 500 });
  }
}
