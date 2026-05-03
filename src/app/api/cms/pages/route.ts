import { NextResponse } from 'next/server';
import { CMSService } from '@/services/core';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    
    // Call Core Service
    // const pages = await CMSService.getPages(supabase);
    
    return NextResponse.json({ success: true, data: [] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
