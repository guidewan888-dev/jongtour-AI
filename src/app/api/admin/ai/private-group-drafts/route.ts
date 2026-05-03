import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET all private group drafts
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const statusFilter = searchParams.get("status");

  try {
    const whereClause: any = {};
    if (statusFilter) {
      whereClause.status = statusFilter;
    }

    const drafts = await prisma.aiPrivateGroupDraft.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: 50 // Limit for MVP
    });

    return NextResponse.json({ drafts });
  } catch (error) {
    console.error("Private Group Drafts GET Error:", error);
    return NextResponse.json({ error: "Failed to fetch private group drafts" }, { status: 500 });
  }
}

// PATCH update a specific draft (e.g. Sale adjusts the estimated price)
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, estimatedPrice, status, costBreakdown } = body;

    if (!id) {
      return NextResponse.json({ error: "Draft ID is required" }, { status: 400 });
    }

    const updatedDraft = await prisma.aiPrivateGroupDraft.update({
      where: { id },
      data: {
        ...(estimatedPrice && { estimatedPrice }),
        ...(status && { status }),
        ...(costBreakdown && { costBreakdown })
      }
    });

    return NextResponse.json({ success: true, draft: updatedDraft });
  } catch (error) {
    console.error("Private Group Drafts PATCH Error:", error);
    return NextResponse.json({ error: "Failed to update draft" }, { status: 500 });
  }
}
