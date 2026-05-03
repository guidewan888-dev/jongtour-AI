import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET all guardrails
export async function GET() {
  try {
    const guardrails = await prisma.aiGuardrail.findMany();
    
    // Seed default guardrails if none exist
    if (guardrails.length === 0) {
      const defaultGuardrails = [
        { ruleName: "STRICT_PRICE_CHECK", description: "Prevent AI from answering prices without tool verification.", severity: "high", isActive: true },
        { ruleName: "AVAILABILITY_NO_GUESS", description: "Prevent AI from guessing seat availability.", severity: "high", isActive: true },
        { ruleName: "NO_FAKE_BOOKING_URLS", description: "Only send booking URLs that match get_booking_link output.", severity: "critical", isActive: true },
        { ruleName: "PRIVATE_GROUP_DISCLAIMER", description: "Force AI to state that private group pricing is an estimate.", severity: "medium", isActive: true }
      ];
      
      await prisma.aiGuardrail.createMany({
        data: defaultGuardrails
      });
      
      const newGuardrails = await prisma.aiGuardrail.findMany();
      return NextResponse.json({ guardrails: newGuardrails });
    }

    return NextResponse.json({ guardrails });
  } catch (error) {
    console.error("Guardrails GET Error:", error);
    return NextResponse.json({ error: "Failed to fetch guardrails" }, { status: 500 });
  }
}

// PATCH update a specific guardrail
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, isActive, severity, description } = body;

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const updatedGuardrail = await prisma.aiGuardrail.update({
      where: { id },
      data: {
        ...(isActive !== undefined && { isActive }),
        ...(severity && { severity }),
        ...(description && { description })
      }
    });

    return NextResponse.json({ success: true, guardrail: updatedGuardrail });
  } catch (error) {
    console.error("Guardrails PATCH Error:", error);
    return NextResponse.json({ error: "Failed to update guardrail" }, { status: 500 });
  }
}
