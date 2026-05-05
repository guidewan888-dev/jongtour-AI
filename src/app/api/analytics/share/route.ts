import { NextRequest, NextResponse } from 'next/server';

// POST /api/analytics/share — Track share events
export async function POST(req: NextRequest) {
  try {
    const { platform, url, ts } = await req.json();

    // Log to console (replace with DB/analytics in production)
    console.log(`[Share] ${platform} — ${url} at ${new Date(ts).toISOString()}`);

    // Could persist to DB:
    // await prisma.shareEvent.create({ data: { platform, url, createdAt: new Date(ts) } });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false }, { status: 400 });
  }
}
