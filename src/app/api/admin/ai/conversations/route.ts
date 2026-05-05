export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';


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
        AiMessage: {
          orderBy: { createdAt: 'desc' },
          take: 1
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

