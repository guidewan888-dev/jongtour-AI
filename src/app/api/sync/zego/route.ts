import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const ZEGO_API_URL = "https://www.zegoapi.com/v1.5/programtours";
const ZEGO_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2OWYwM2JlODQzMWFmMmU0ODY5NWY0YjAiLCJpYXQiOjE3Nzc1MTg1NDN9.qbZPxA3jldUTTLsGmbdMrvv3qXnTPDiNc_9_T48zPnw";

export async function GET() {
  try {
    // 1. Fetch data from Zego API
    const response = await fetch(ZEGO_API_URL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "auth-token": ZEGO_TOKEN,
      },
      // Avoid caching so we always get the latest real-time seats
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Zego API returned status: ${response.status}`);
    }

    const rawData = await response.json();
    
    // Safety check in case Zego API returns a success wrapper or array directly
    const toursData = Array.isArray(rawData) ? rawData : (rawData.data || []);
    
    if (toursData.length === 0) {
      return NextResponse.json({ message: "No tours found in Zego API response" });
    }

    let toursAdded = 0;
    let toursUpdated = 0;
    let departuresAdded = 0;
    let departuresUpdated = 0;

    // 2. Process each tour
    const tourUpserts = [];
    const departureUpserts = [];

    for (const zTour of toursData) {
      if (!zTour.ProductID || !zTour.ProductName) continue;

      const tourId = `zego_tour_${zTour.ProductID}`;
      
      // หา IATA code ของสายการบินจาก Period แรก
      let airlineCode = null;
      if (Array.isArray(zTour.Periods) && zTour.Periods.length > 0) {
        airlineCode = zTour.Periods[0].AirlineCode || null;
      }

      tourUpserts.push(
        prisma.tour.upsert({
          where: { id: tourId },
          update: {
            title: zTour.ProductName,
            destination: zTour.CountryName || zTour.Locations?.[0] || "Unknown",
            durationDays: parseInt(zTour.Days) || 0,
            price: zTour.Periods?.[0]?.Price || 0,
            imageUrl: zTour.URLImage || null,
            description: zTour.Highlight || null,
            airlineCode: airlineCode,
            providerId: zTour.ProductID.toString(),
            source: "API_ZEGO"
          },
          create: {
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
          }
        })
      );

      if (Array.isArray(zTour.Periods)) {
        for (const zPeriod of zTour.Periods) {
          if (!zPeriod.PeriodID || !zPeriod.PeriodStartDate || !zPeriod.PeriodEndDate) continue;

          const departureId = `zego_period_${zPeriod.PeriodID}`;
          
          departureUpserts.push(
            prisma.tourDeparture.upsert({
              where: { id: departureId },
              update: {
                startDate: new Date(zPeriod.PeriodStartDate),
                endDate: new Date(zPeriod.PeriodEndDate),
                price: zPeriod.Price || 0,
                totalSeats: zPeriod.GroupSize || 0,
                availableSeats: zPeriod.Seat || 0,
              },
              create: {
                id: departureId,
                tourId: tourId, // using the tourId string directly
                startDate: new Date(zPeriod.PeriodStartDate),
                endDate: new Date(zPeriod.PeriodEndDate),
                price: zPeriod.Price || 0,
                totalSeats: zPeriod.GroupSize || 0,
                availableSeats: zPeriod.Seat || 0,
              }
            })
          );
        }
      }
    }

    // Execute Tour Upserts in chunks of 50 to avoid connection pool exhaustion
    const chunkSize = 50;
    for (let i = 0; i < tourUpserts.length; i += chunkSize) {
      const chunk = tourUpserts.slice(i, i + chunkSize);
      await Promise.all(chunk);
      toursUpdated += chunk.length;
    }

    // Execute Departure Upserts in chunks of 50
    for (let i = 0; i < departureUpserts.length; i += chunkSize) {
      const chunk = departureUpserts.slice(i, i + chunkSize);
      await Promise.all(chunk);
      departuresUpdated += chunk.length;
    }

    // 4. Create Sync Log
    await prisma.apiSyncLog.create({
      data: {
        providerName: "API_ZEGO",
        status: "SUCCESS",
        recordsAdded: toursUpdated, 
        recordsUpdated: departuresUpdated,
      }
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
      await prisma.apiSyncLog.create({
        data: {
          providerName: "API_ZEGO",
          status: "FAILED",
          errorMessage: error.message || "Unknown error",
        }
      });
    } catch(e) {
      // Ignore if db is completely unreachable
    }

    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
