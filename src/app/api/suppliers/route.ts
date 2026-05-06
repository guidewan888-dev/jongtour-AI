export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { SupplierService } from '@/services/core';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    
    // Fetch Wholesale master data
    // const suppliers = await SupplierService.getSuppliers(supabase);
    
    return NextResponse.json({ success: true, data: [] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

