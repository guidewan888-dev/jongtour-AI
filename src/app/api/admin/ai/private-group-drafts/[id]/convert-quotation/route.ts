import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const draftId = params.id;
    const body = await req.json();
    const adminId = body.adminId || "system"; 

    // Find the draft
    const draft = await prisma.aiPrivateGroupDraft.findUnique({
      where: { id: draftId }
    });

    if (!draft) {
      return NextResponse.json({ error: "Private Group Draft not found" }, { status: 404 });
    }

    // In a real system, this would insert a record into a `Quotations` or `Invoices` table.
    // For MVP, we just mark the status of the draft as "QUOTED"
    const updatedDraft = await prisma.aiPrivateGroupDraft.update({
      where: { id: draftId },
      data: { status: "QUOTED" }
    });

    // We might also want to generate a PDF link here.
    const mockQuotationUrl = `https://jongtour.com/quotations/${draftId}.pdf`;

    return NextResponse.json({ 
      success: true, 
      quotationUrl: mockQuotationUrl,
      draft: updatedDraft 
    });
  } catch (error) {
    console.error("Convert to Quotation API Error:", error);
    return NextResponse.json({ error: "Failed to convert draft to quotation" }, { status: 500 });
  }
}
