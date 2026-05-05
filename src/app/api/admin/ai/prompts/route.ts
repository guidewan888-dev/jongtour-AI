export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';


// GET all prompt templates and their active versions
export async function GET() {
  try {
    const templates = await prisma.aiPromptTemplate.findMany({
      include: {
        versions: {
          orderBy: { version: 'desc' }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    return NextResponse.json({ templates });
  } catch (error) {
    console.error("Prompts GET API Error:", error);
    return NextResponse.json({ error: "Failed to fetch prompts" }, { status: 500 });
  }
}

// POST create a new template OR a new version of an existing template
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, content, createdBy } = body;

    if (!name || !content) {
      return NextResponse.json({ error: "Name and content are required" }, { status: 400 });
    }

    // Check if template exists
    let template = await prisma.aiPromptTemplate.findUnique({
      where: { name }
    });

    let newVersionNumber = 1;

    if (!template) {
      // Create new template
      template = await prisma.aiPromptTemplate.create({
        data: { name, currentVersion: 1 }
      });
    } else {
      // Get highest version
      const latestVersion = await prisma.aiPromptVersion.findFirst({
        where: { templateId: template.id },
        orderBy: { version: 'desc' }
      });
      newVersionNumber = latestVersion ? latestVersion.version + 1 : 1;
      
      // Update current version pointer
      await prisma.aiPromptTemplate.update({
        where: { id: template.id },
        data: { currentVersion: newVersionNumber }
      });
    }

    // Create the new version
    const newPromptVersion = await prisma.aiPromptVersion.create({
      data: {
        templateId: template.id,
        version: newVersionNumber,
        content,
        // approvedBy: null
      }
    });

    return NextResponse.json({ success: true, template, version: newPromptVersion });
  } catch (error) {
    console.error("Prompts POST API Error:", error);
    return NextResponse.json({ error: "Failed to create prompt version" }, { status: 500 });
  }
}

