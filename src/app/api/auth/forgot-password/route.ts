import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { EmailService } from '@/lib/email';
import { prisma } from '@/lib/prisma'; // Assuming prisma is available here or we can use Supabase JS

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    
    if (!email) {
      return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 });
    }

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // Use Service Role to bypass RLS for user verification
    const supabaseAdmin = require('@supabase/supabase-js').createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qterfftaebnoawnzkfgu.supabase.co',
      process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF0ZXJmZnRhZWJub2F3bnprZmd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzQ3MzAxNCwiZXhwIjoyMDkzMDQ5MDE0fQ.IDd7B8okNE1B0vf1OVQizDGeVQNdVwLK0gzogOyWIFE'
    );

    // 1. Verify if user exists and is an admin
    const { data: dbUser, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, email, role:roles(name)')
      .eq('email', email)
      .single();

    if (!dbUser || userError) {
      console.log('User not found or error:', userError);
      // Return success anyway to prevent email enumeration
      return NextResponse.json({ success: true });
    }

    // Ensure they have an admin-level role
    const allowedRoles = ['SUPER_ADMIN', 'ADMIN', 'OPERATION', 'FINANCE', 'CONTENT_MANAGER', 'SALE_MANAGER'];
    // @ts-ignore
    if (!dbUser.role || !allowedRoles.includes(dbUser.role.name)) {
      console.log('User role not allowed:', dbUser.role);
      return NextResponse.json({ success: true }); // Silent fail
    }

    // 2. Generate Recovery Link via Supabase Auth Admin API


    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: email,
      options: {
        redirectTo: `https://jongtour.com/reset-password`
      }
    });

    if (error) {
      throw error;
    }

    // 3. Send custom email using our SMTP EmailService
    const actionLink = data.properties.action_link;
    const emailResult = await EmailService.sendPasswordReset(email, actionLink);

    if (!emailResult.success) {
      console.error('Failed to send SMTP email, fallback to logging:', emailResult.error);
      return NextResponse.json({ success: false, error: 'SMTP Error: ' + emailResult.error }, { status: 500 });
    }

    // 4. Create Audit Log
    await supabase.from('audit_logs').insert({
      userId: dbUser.id,
      action: 'REQUEST_PASSWORD_RESET',
      resource: 'auth',
      resourceId: dbUser.id,
      newValues: { ip: req.headers.get('x-forwarded-for') || 'unknown' }
    });

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ success: false, error: error.message || error.toString() || 'Internal Server Error', stack: error.stack }, { status: 500 });
  }
}
