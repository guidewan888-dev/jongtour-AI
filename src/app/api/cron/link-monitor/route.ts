export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { LinkMonitorService } from '@/services/linkMonitorService';

// Vercel Cron Secret check
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log("Starting Scheduled Link Health Audit...");
    const run = await LinkMonitorService.runFullAudit();
    
    // Check if we need to send a LINE Alert for critical issues
    if (run.criticalIssues > 0) {
      console.warn(`[ALERT] Scheduled Audit found ${run.criticalIssues} critical issues!`);
      // Here you would integrate with the Line Messaging API to alert the Admin
    }

    return NextResponse.json(run);
  } catch (error: any) {
    console.error("Scheduled Audit Failed:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

