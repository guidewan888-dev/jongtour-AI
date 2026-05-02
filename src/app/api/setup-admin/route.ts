import { NextResponse } from 'next/server';
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const password = url.searchParams.get('password') || 'jongtouradmin888';
  const email = url.searchParams.get('email') || 'admin@jongtour.com';

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qterfftaebnoawnzkfgu.supabase.co';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  
  if (!supabaseServiceKey) {
     return NextResponse.json({ error: 'Missing Supabase Service Key' }, { status: 500 });
  }

  const supabaseAdmin = createSupabaseAdmin(supabaseUrl, supabaseServiceKey);

  try {
    // 1. Create Admin User in Supabase Auth
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
            full_name: 'Jongtour Admin',
        }
    });

    if (authError) {
        // If user already exists, let's update their password so we are sure what it is
        if (authError.message.includes('already registered') || authError.message.includes('already exists')) {
            const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
            const existingUser = existingUsers?.users?.find(u => u.email === email);
            
            if (existingUser) {
                await supabaseAdmin.auth.admin.updateUserById(existingUser.id, { password });
            }
        } else {
            return NextResponse.json({ error: authError.message });
        }
    }

    // 2. Upsert Admin User in Prisma/User Table
    const { error: dbError } = await supabaseAdmin
        .from('User')
        .upsert({
            email,
            role: 'ADMIN',
            password: 'OAUTH_USER', // Dummy password for DB, auth handled by Supabase
            name: 'Jongtour Admin'
        }, { onConflict: 'email' });

    if (dbError) {
        return NextResponse.json({ error: dbError.message });
    }

    return NextResponse.json({ 
        success: true, 
        message: 'สร้างบัญชีแอดมินสำเร็จแล้ว!', 
        credentials: {
            email,
            password
        },
        instruction: 'คุณสามารถนำอีเมลและรหัสผ่านนี้ไปล็อกอินที่หน้าเข้าสู่ระบบได้เลยครับ'
    });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
