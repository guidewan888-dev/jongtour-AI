import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const sessions = await prisma.lineChatSession.findMany({
      orderBy: { updatedAt: 'desc' },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    return NextResponse.json({ sessions }, { status: 200 });
  } catch (error) {
    console.error('Error fetching LINE CRM data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { sessionId, status } = await request.json();
    if (!sessionId || !status) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const updatedSession = await prisma.lineChatSession.update({
      where: { id: sessionId },
      data: { status }
    });

    return NextResponse.json({ success: true, session: updatedSession }, { status: 200 });
  } catch (error) {
    console.error('Error updating LINE CRM session:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
