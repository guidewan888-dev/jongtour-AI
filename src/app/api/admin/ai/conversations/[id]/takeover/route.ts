import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const conversationId = params.id;
    const body = await req.json();
    const adminId = body.adminId || "system"; // Fallback to system if not provided

    // Update conversation status to human_takeover and assign to admin
    const conversation = await prisma.aiConversation.update({
      where: { id: conversationId },
      data: { 
        status: "human_takeover",
        assignedToId: adminId 
      }
    });

    return NextResponse.json({ success: true, conversation });
  } catch (error) {
    console.error("Takeover API Error:", error);
    return NextResponse.json({ error: "Failed to takeover conversation" }, { status: 500 });
  }
}
