export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';


// GET all search logs to monitor what the AI is looking for
export async function GET(req: Request) {
  try {
    const searchLogs = await prisma.aiSearchLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100 // Limit for MVP
    });

    return NextResponse.json({ searchLogs });
  } catch (error) {
    console.error("Search Logs GET Error:", error);
    return NextResponse.json({ error: "Failed to fetch search logs" }, { status: 500 });
  }
}

