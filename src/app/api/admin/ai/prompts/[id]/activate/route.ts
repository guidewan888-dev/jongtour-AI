export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const promptVersionId = params.id;

    // Find the version to activate
    const versionToActivate = await prisma.aiPromptVersion.findUnique({
      where: { id: promptVersionId }
    });

    if (!versionToActivate) {
      return NextResponse.json({ error: "Prompt version not found" }, { status: 404 });
    }

    // Deactivate all other versions in this template
    await prisma.aiPromptVersion.updateMany({
      where: { templateId: versionToActivate.templateId },
      data: {} // isDefault field not in schema yet
    });

    // Activate the requested version
    const activatedVersion = await prisma.aiPromptVersion.update({
      where: { id: promptVersionId },
      data: {} // isDefault field not in schema yet
    });

    // Update the current version pointer on the template
    await prisma.aiPromptTemplate.update({
      where: { id: versionToActivate.templateId },
      data: { currentVersion: activatedVersion.version }
    });

    return NextResponse.json({ success: true, activatedVersion });
  } catch (error) {
    console.error("Prompts Activate API Error:", error);
    return NextResponse.json({ error: "Failed to activate prompt version" }, { status: 500 });
  }
}

