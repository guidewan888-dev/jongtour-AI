export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';

/**
 * POST /api/admin/rpa/submit
 * Execute the submit step after admin approval
 */
export async function POST(req: Request) {
  try {
    const { sessionId } = await req.json();

    if (!sessionId) {
      return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 });
    }

    // Use internal engine
    const { executeRpaSubmit } = await import('@/services/rpaEngine');
    const result = await executeRpaSubmit(sessionId);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error in RPA Submit:', error);
    return NextResponse.json(
      { error: 'Failed to execute submit', details: error.message },
      { status: 500 }
    );
  }
}
