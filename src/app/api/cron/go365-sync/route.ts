import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

/**
 * GET /api/cron/go365-sync — Vercel Cron trigger for Go365 scraper sync
 * Calls the Go365 sync endpoint internally
 */
export async function GET(request: Request) {
  // Verify cron secret for security
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    // Call the go365-sync endpoint internally
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://jongtour.com';
    const res = await fetch(`${baseUrl}/api/tours/go365-sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await res.json();

    if (res.ok) {
      return NextResponse.json({
        success: true,
        message: `Go365 cron sync completed: ${data.synced || 0} tours synced`,
        ...data,
      });
    } else {
      return NextResponse.json({
        success: false,
        message: data.error || 'Go365 sync failed',
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('[Cron Go365]', error.message);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
