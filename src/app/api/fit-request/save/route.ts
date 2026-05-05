export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { name, phone, email, pax, durationDays, country, itinerary } = data;

    if (!name || !phone || !country || !itinerary) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const fitRequest = await prisma.fitRequest.create({
      data: {
        serviceType: "FULL_SERVICE",
        name,
        phone,
        email,
        pax: parseInt(pax) || 1,
        startDate: new Date(), // Fallback
        endDate: new Date(Date.now() + (parseInt(durationDays) || 1) * 24 * 60 * 60 * 1000),
        durationDays: parseInt(durationDays) || 1,
        country,
        cities: itinerary.title || "Custom Route",
        itinerary,
        status: "PENDING"
      }
    });

    return NextResponse.json({ success: true, fitRequest });
  } catch (error) {
    console.error("Save FIT Error:", error);
    return NextResponse.json({ error: "Failed to save request" }, { status: 500 });
  }
}

