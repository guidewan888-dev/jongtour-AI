export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Trigger background worker (e.g. Vercel Inngest or custom cron)
    // to sync with Wholesale API
    
    return NextResponse.json({ success: true, message: 'Sync job triggered' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

