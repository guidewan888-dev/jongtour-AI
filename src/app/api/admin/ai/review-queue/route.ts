export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';


// GET all pending review items
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const statusFilter = searchParams.get("status") || "pending";

  try {
    const queue = await prisma.aiReviewQueue.findMany({
      where: { status: statusFilter },
      orderBy: { createdAt: 'asc' }, // oldest first for queue
      take: 50 // Limit for MVP
    });

    return NextResponse.json({ queue });
  } catch (error) {
    console.error("Review Queue GET Error:", error);
    return NextResponse.json({ error: "Failed to fetch review queue" }, { status: 500 });
  }
}

// PATCH to resolve a queue item
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, status, resolvedById } = body;

    if (!id || !status) {
      return NextResponse.json({ error: "ID and status are required" }, { status: 400 });
    }

    const updatedQueueItem = await prisma.aiReviewQueue.update({
      where: { id },
      data: {
        status,
        resolvedById: resolvedById || "system"
      }
    });

    return NextResponse.json({ success: true, item: updatedQueueItem });
  } catch (error) {
    console.error("Review Queue PATCH Error:", error);
    return NextResponse.json({ error: "Failed to update review queue item" }, { status: 500 });
  }
}

