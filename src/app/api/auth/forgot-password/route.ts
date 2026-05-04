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

    // 1. Verify if user exists and is an admin
    // We check the database first to ensure we don't send admin reset links to normal customers
    const { data: dbUser } = await supabase
      .from('users')
      .select('id, email, role:roles(name)')
      .eq('email', email)
      .single();

    if (!dbUser) {
      // Return success anyway to prevent email enumeration
      return NextResponse.json({ success: true });
    }

    // Ensure they have an admin-level role
    const allowedRoles = ['SUPER_ADMIN', 'ADMIN', 'OPERATION', 'FINANCE', 'CONTENT_MANAGER', 'SALE_MANAGER'];
    // @ts-ignore
    if (!dbUser.role || !allowedRoles.includes(dbUser.role.name)) {
      return NextResponse.json({ success: true }); // Silent fail
    }

    // 2. Generate Recovery Link via Supabase Auth Admin API
    // We need to use the service role key to generate links without sending Supabase's default email
    const supabaseAdmin = require('@supabase/supabase-js').createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: email,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://admin.jongtour.com'}/auth/reset-password`
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
      // We still return success to the user so they don't know the internal state,
      // but we log it for the admin.
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
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
