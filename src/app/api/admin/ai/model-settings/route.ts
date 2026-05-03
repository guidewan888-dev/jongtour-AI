import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET all model settings
export async function GET() {
  try {
    const settings = await prisma.aiModelSetting.findMany();
    
    // Seed default settings if none exist
    if (settings.length === 0) {
      const defaultSettings = [
        { feature: "chat", model: "gpt-4o", temperature: 0.7, maxTokens: 2048, isActive: true },
        { feature: "search", model: "gpt-4o-mini", temperature: 0.1, maxTokens: 1024, isActive: true },
        { feature: "vision", model: "gpt-4o", temperature: 0.2, maxTokens: 1024, isActive: true },
      ];
      
      await prisma.aiModelSetting.createMany({
        data: defaultSettings
      });
      
      const newSettings = await prisma.aiModelSetting.findMany();
      return NextResponse.json({ settings: newSettings });
    }

    return NextResponse.json({ settings });
  } catch (error) {
    console.error("Model Settings GET Error:", error);
    return NextResponse.json({ error: "Failed to fetch model settings" }, { status: 500 });
  }
}

// PATCH update a specific model setting
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, model, temperature, maxTokens, isActive } = body;

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const updatedSetting = await prisma.aiModelSetting.update({
      where: { id },
      data: {
        ...(model && { model }),
        ...(temperature !== undefined && { temperature }),
        ...(maxTokens !== undefined && { maxTokens }),
        ...(isActive !== undefined && { isActive })
      }
    });

    return NextResponse.json({ success: true, setting: updatedSetting });
  } catch (error) {
    console.error("Model Settings PATCH Error:", error);
    return NextResponse.json({ error: "Failed to update model setting" }, { status: 500 });
  }
}
