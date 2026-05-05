export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { sendAdminInviteEmail } from '@/lib/email';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

function generateSecurePassword() {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < 16; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

export async function POST(req: Request) {
  try {
    const { email, name, role } = await req.json();
    
    if (!email || !role) {
      return NextResponse.json({ success: false, error: 'Email and role are required' }, { status: 400 });
    }

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // 1. Verify caller is SUPER_ADMIN
    const { data: { user: caller }, error: authError } = await supabase.auth.getUser();
    if (authError || !caller) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { data: callerDb } = await supabase.from('users').select('id, role:roles(name)').eq('email', caller.email).single();
    // @ts-ignore
    if (!callerDb || callerDb.role?.name !== 'SUPER_ADMIN') {
      return NextResponse.json({ success: false, error: 'Forbidden. Only SUPER_ADMIN can invite admins.' }, { status: 403 });
    }

    // 2. Generate secure temp password
    const tempPassword = generateSecurePassword();

    // 3. Create user in Supabase Auth using Service Role (Bypass normal limits)
    const supabaseAdmin = require('@supabase/supabase-js').createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: authData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: { full_name: name || '' }
    });

    if (createError) {
      return NextResponse.json({ success: false, error: createError.message }, { status: 400 });
    }

    // 4. Get Role ID
    const dbRole = await prisma.role.findUnique({ where: { name: role } });
    if (!dbRole) {
      return NextResponse.json({ success: false, error: 'Invalid role specified' }, { status: 400 });
    }

    // 5. Insert into Database with mustChangePassword = true
    const dbUser = await prisma.user.create({
      data: {
        id: authData.user.id,
        email,
        passwordHash: 'SUPABASE_AUTH',
        roleId: dbRole.id,
        status: 'ACTIVE',
        mustChangePassword: true
      }
    });

    // 6. Send Invitation Email
    const loginUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://admin.jongtour.com'}/login`;
    const emailResult = await sendAdminInviteEmail({ to: email, name: name || email, role, inviteUrl: loginUrl });

    // 7. Audit Log
    await prisma.auditLog.create({
      data: {
        userId: callerDb.id, // we don't have callerDb.id easily available here since we just fetched role. Let's find caller ID.
        action: 'INVITE_ADMIN',
        resource: 'users',
        resourceId: dbUser.id,
        newValues: { email, role }
      }
    });

    return NextResponse.json({ 
      success: true, 
      emailSent: emailResult.success,
      message: 'Admin invited successfully',
      // We return the tempPassword in API response as fallback in case email fails, 
      // but in UI we should only show it if email fails.
      tempPasswordFallback: emailResult.success ? null : tempPassword 
    });

  } catch (error: any) {
    console.error('Invite admin error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

