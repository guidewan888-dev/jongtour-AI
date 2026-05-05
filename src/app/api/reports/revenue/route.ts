export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { ReportService } from '@/services/core';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    
    // Calculate global revenue across B2C, B2B, CRM
    // const data = await ReportService.getRevenueMetrics(supabase, 'THIS_MONTH');
    
    return NextResponse.json({ success: true, data: {} });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

