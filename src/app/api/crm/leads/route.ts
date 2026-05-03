import { NextResponse } from 'next/server';
import { CRMService } from '@/services/core';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    
    // Used primarily by Webhooks from LINE OA or Web Forms
    // const lead = await CRMService.captureLead(supabase, 'WEB', body);
    
    return NextResponse.json({ success: true, leadId: 'MOCK-LEAD' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
