import { NextResponse } from 'next/server';
import { AuthService } from '@/services/core';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    
    // Call Core Service
    // In real app, we'd pass credentials. Here we just mock the response
    // const result = await AuthService.login(supabase, body.email, body.password);
    
    return NextResponse.json({ success: true, message: 'Logged in successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
