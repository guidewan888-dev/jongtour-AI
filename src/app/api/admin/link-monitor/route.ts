export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { LinkMonitorService } from '@/services/linkMonitorService';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const runId = searchParams.get('runId');

    if (runId) {
      const items = await prisma.linkAuditItem.findMany({
        where: { runId },
        orderBy: { severity: 'asc' }
      });
      return NextResponse.json(items);
    }

    const runs = await prisma.linkAuditRun.findMany({
      orderBy: { startedAt: 'desc' },
      take: 10
    });
    return NextResponse.json(runs);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    if (body.action === 'run_audit') {
      const run = await LinkMonitorService.runFullAudit();
      return NextResponse.json(run);
    }
    
    if (body.action === 'auto_fix' && body.runId) {
      const fixedCount = await LinkMonitorService.autoFixItems(body.runId);
      return NextResponse.json({ success: true, fixedCount });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

