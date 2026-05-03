import { NextResponse } from 'next/server';
import { TourService } from '@/services/core';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');
    
    // const results = await TourService.searchTours(supabase, { query });
    
    return NextResponse.json({ success: true, data: [] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
