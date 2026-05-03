import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const totalConversations = await prisma.aiConversation.count();
    
    // Using bookingIntent as a proxy for "Hot Leads"
    const hotLeads = await prisma.aiConversation.count({
      where: { bookingIntent: true }
    });

    const searchToursCalled = await prisma.aiToolCall.count({
      where: { toolName: "search_tours" }
    });
    
    const privateGroupDrafts = await prisma.aiPrivateGroupDraft.count();
    
    // Aggregating costs
    const costLogs = await prisma.aiCostLog.aggregate({
      _sum: { totalCostUsd: true }
    });
    const aiCostToday = costLogs._sum.totalCostUsd || 0;

    const hallucinationWarnings = await prisma.aiMessage.count({
      where: { hallucinationFlag: true }
    });

    const humanTakeovers = await prisma.aiConversation.count({
      where: { status: "human_takeover" }
    });

    // Mocking conversion rate for now until we have actual booking completion link tracking
    const conversionRate = totalConversations > 0 ? ((hotLeads / totalConversations) * 100).toFixed(1) : 0;

    return NextResponse.json({
      totalConversations,
      hotLeads,
      searchToursCalled,
      privateGroupDrafts,
      aiCostToday,
      conversionRate,
      hallucinationWarnings,
      humanTakeovers
    });
  } catch (error) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 });
  }
}
