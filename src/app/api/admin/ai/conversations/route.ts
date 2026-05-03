import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET all conversations for the Chat Logs UI
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const statusFilter = searchParams.get("status");

  try {
    const whereClause: any = {};
    if (statusFilter) {
      whereClause.status = statusFilter;
    }

    const conversations = await prisma.aiConversation.findMany({
      where: whereClause,
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1 // Just to show the last message preview
        }
      },
      orderBy: { updatedAt: 'desc' },
      take: 50 // Limit for MVP
    });

    return NextResponse.json({ conversations });
  } catch (error) {
    console.error("Conversations GET API Error:", error);
    return NextResponse.json({ error: "Failed to fetch conversations" }, { status: 500 });
  }
}
