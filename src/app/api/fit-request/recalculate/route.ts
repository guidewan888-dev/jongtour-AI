export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { calculateFitPrice } from "@/services/pricingEngine";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { durationDays, pax, hotelStars, country, airlineCode, startDate } = body;

    const pricingData = await calculateFitPrice({
      durationDays: durationDays || 3,
      pax: pax || 2,
      hotelStars: hotelStars || 3,
      country: country || "Unknown",
      airlineCode: airlineCode || "",
      startDate: startDate || new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
      includeFlights: true,
      includeHotels: true,
      includeTransport: true,
      includeGuide: true,
      includeInsurance: true
    });

    const estimatedPrice = `${pricingData.sellingPricePerPax.toLocaleString()} THB/เธ—เนเธฒเธ`;

    return NextResponse.json({ success: true, estimatedPrice });
  } catch (error) {
    console.error("Recalculate Price Error:", error);
    return NextResponse.json({ error: "Failed to recalculate price" }, { status: 500 });
  }
}

