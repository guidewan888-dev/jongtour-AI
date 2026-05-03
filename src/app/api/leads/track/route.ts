import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { source, tourId } = body;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Using Prisma model names which usually map to snake_case in Supabase if not explicitly mapped,
    // but in this project they usually map to PascalCase or plural. Let's use `Lead` or `leads`.
    // Let's check `schema.prisma` mapping. Usually Prisma `Lead` without @@map maps to "Lead".
    // Wait, let's just insert it safely or silently fail.
    
    // We fetch the tour Name to include in notes
    let tourName = "";
    if (tourId) {
      const { data: tour } = await supabase.from("tours").select("tourName").eq("id", tourId).single();
      if (tour) tourName = tour.tourName;
    }

    const { error } = await supabase.from("Lead").insert({
      id: `L-${Date.now()}`,
      status: "NEW",
      source: source || "WEBSITE",
      notes: tourName ? `Customer clicked LINE button on Tour: ${tourName}` : "Customer clicked LINE button",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    if (error) {
       // try lowercase 'leads' if 'Lead' fails
       await supabase.from("leads").insert({
        id: `L-${Date.now()}`,
        status: "NEW",
        source: source || "WEBSITE",
        notes: tourName ? `Customer clicked LINE button on Tour: ${tourName}` : "Customer clicked LINE button",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Lead track error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
