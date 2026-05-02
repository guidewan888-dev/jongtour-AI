import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qterfftaebnoawnzkfgu.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF0ZXJmZnRhZWJub2F3bnprZmd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzQ3MzAxNCwiZXhwIjoyMDkzMDQ5MDE0fQ.IDd7B8okNE1B0vf1OVQizDGeVQNdVwLK0gzogOyWIFE';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET() {
  try {
    const { data: credentials, error } = await supabase
      .from('SupplierApiCredential')
      .select('supplierId, isActive');

    if (error) throw error;
    
    // Ensure default is true if missing
    const settings = {
      SUP_LETGO: true,
      SUP_TOURFACTORY: true,
      SUP_CHECKIN: true,
    };

    credentials?.forEach(c => {
      settings[c.supplierId as keyof typeof settings] = c.isActive;
    });

    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { supplierId, isActive } = await request.json();

    if (!supplierId || typeof isActive !== 'boolean') {
      return NextResponse.json({ success: false, message: 'Invalid payload' }, { status: 400 });
    }

    // Upsert the setting
    const { data: existing } = await supabase
      .from('SupplierApiCredential')
      .select('id')
      .eq('supplierId', supplierId)
      .single();

    if (existing) {
      await supabase
        .from('SupplierApiCredential')
        .update({ isActive, updatedAt: new Date().toISOString() })
        .eq('id', existing.id);
    } else {
      await supabase
        .from('SupplierApiCredential')
        .insert({
          id: `c${Math.random().toString(36).substring(2, 11)}`,
          supplierId,
          baseUrl: 'https://placeholder.com',
          apiKey: 'placeholder',
          isActive,
        });
    }

    return NextResponse.json({ success: true, message: 'Setting updated' });
  } catch (error: any) {
    console.error('API /admin/sync/settings error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
