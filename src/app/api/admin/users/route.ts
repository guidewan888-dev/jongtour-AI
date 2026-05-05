export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { UserService } from '@/services/core';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    
    // Requires SUPER_ADMIN role
    // const users = await UserService.getAllUsers(supabase);
    
    return NextResponse.json({ success: true, data: [] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 403 });
  }
}

