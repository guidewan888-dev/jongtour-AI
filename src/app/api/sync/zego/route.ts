import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const ZEGO_API_URL = "https://www.zegoapi.com/v1.5/programtours";
const ZEGO_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2OWYwM2JlODQzMWFmMmU0ODY5NWY0YjAiLCJpYXQiOjE3Nzc1MTg1NDN9.qbZPxA3jldUTTLsGmbdMrvv3qXnTPDiNc_9_T48zPnw";

// Admin key is required for bypass RLS and insert/upsert
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://qterfftaebnoawnzkfgu.supabase.co";
// Note: We need service role key to bypass RLS for server-side insertions. If not available, use the direct publishable key (assuming RLS is disabled or allows inserts for tests)
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_SRwNSJ89mInda5FcuB1W2w_9IEJlSOI";

const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST() {
  try {
    // 1. Fetch data from Zego API
    const response = await fetch(ZEGO_API_URL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "auth-token": ZEGO_TOKEN,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Zego API returned status: ${response.status}`);
    }

    const rawData = await response.json();
    const toursData = Array.isArray(rawData) ? rawData : (rawData.data || []);
    
    if (toursData.length === 0) {
      return NextResponse.json({ message: "No tours found in Zego API response" });
    }

    let toursAdded = 0;
    let toursUpdated = 0;
    let departuresAdded = 0;
    let departuresUpdated = 0;

    // 2. Process each tour
    const tourUpserts: any[] = [];
    const departureUpserts: any[] = [];

    for (const zTour of toursData) {
      if (!zTour.ProductID || !zTour.ProductName) continue;

      const tourId = `zego_tour_${zTour.ProductID}`;
      
      let airlineCode = null;
      if (Array.isArray(zTour.Periods) && zTour.Periods.length > 0) {
        airlineCode = zTour.Periods[0].AirlineCode || null;
      }

      tourUpserts.push({
        id: tourId,
        title: zTour.ProductName,
        destination: zTour.CountryName || zTour.Locations?.[0] || "Unknown",
        durationDays: parseInt(zTour.Days) || 0,
        price: zTour.Periods?.[0]?.Price || 0,
        imageUrl: zTour.URLImage || null,
        description: zTour.Highlight || null,
        airlineCode: airlineCode,
        providerId: zTour.ProductID.toString(),
        source: "API_ZEGO"
      });

      if (Array.isArray(zTour.Periods)) {
        for (const zPeriod of zTour.Periods) {
          if (!zPeriod.PeriodID || !zPeriod.PeriodStartDate || !zPeriod.PeriodEndDate) continue;

          const departureId = `zego_period_${zPeriod.PeriodID}`;
          
          departureUpserts.push({
            id: departureId,
            tourId: tourId,
            startDate: new Date(zPeriod.PeriodStartDate).toISOString(),
            endDate: new Date(zPeriod.PeriodEndDate).toISOString(),
            price: zPeriod.Price || 0,
            totalSeats: zPeriod.GroupSize || 0,
            availableSeats: zPeriod.Seat || 0,
          });
        }
      }
    }

    // Upsert Tours
    if (tourUpserts.length > 0) {
      const { data, error } = await supabase
        .from('Tour')
        .upsert(tourUpserts, { onConflict: 'id' });
        
      if (error) {
         console.error("Supabase Tour upsert error:", error);
         throw new Error(`Tour upsert failed: ${error.message}`);
      }
      toursUpdated += tourUpserts.length;
    }

    // Upsert Departures
    if (departureUpserts.length > 0) {
      const { data, error } = await supabase
        .from('TourDeparture')
        .upsert(departureUpserts, { onConflict: 'id' });
        
      if (error) {
         console.error("Supabase Departure upsert error:", error);
         throw new Error(`Departure upsert failed: ${error.message}`);
      }
      departuresUpdated += departureUpserts.length;
    }

    // Create Sync Log
    await supabase.from('ApiSyncLog').insert({
      providerName: "API_ZEGO",
      status: "SUCCESS",
      recordsAdded: toursUpdated, 
      recordsUpdated: departuresUpdated,
    });

    return NextResponse.json({
      success: true,
      message: "Sync completed successfully",
      stats: {
        toursProcessed: toursUpdated,
        departuresProcessed: departuresUpdated
      }
    });

  } catch (error: any) {
    console.error("Zego Sync Error:", error);
    
    // Log failure
    try {
      await supabase.from('ApiSyncLog').insert({
        providerName: "API_ZEGO",
        status: "FAILED",
        errorMessage: error.message || "Unknown error",
      });
    } catch(e) {
      // Ignore
    }

    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
