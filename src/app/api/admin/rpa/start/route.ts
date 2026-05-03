import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { bookingId, supplierId } = body;

    if (!bookingId || !supplierId) {
      return NextResponse.json({ error: 'Missing bookingId or supplierId' }, { status: 400 });
    }

    // Call the internal Bot Service
    const botUrl = process.env.BOT_SERVICE_URL || 'https://bot.jongtour.com';
    const res = await fetch(`${botUrl}/run/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ bookingId, supplierId }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Bot Service returned ${res.status}: ${errorText}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in RPA Start Gateway:', error);
    return NextResponse.json(
      { error: 'Failed to communicate with RPA Bot Service', details: String(error) },
      { status: 500 }
    );
  }
}
