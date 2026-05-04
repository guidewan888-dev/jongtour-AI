import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { EmailService } from '@/lib/email';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // Get the current session user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user || !user.email) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Since the password was just changed by the client via Supabase Auth,
    // we just need to update our DB state and send the email.

    // 1. Update mustChangePassword in Prisma
    // Note: If you don't use prisma here, you can use supabase:
    await supabase
      .from('users')
      .update({ mustChangePassword: false })
      .eq('email', user.email);

    // 2. Send Notification Email
    await EmailService.sendPasswordChangedNotification(user.email);

    // 3. Create Audit Log
    const { data: dbUser } = await supabase.from('users').select('id').eq('email', user.email).single();
    
    if (dbUser) {
      await supabase.from('audit_logs').insert({
        userId: dbUser.id,
        action: 'CHANGE_PASSWORD_SUCCESS',
        resource: 'auth',
        resourceId: dbUser.id,
        newValues: { ip: req.headers.get('x-forwarded-for') || 'unknown' }
      });
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Change password completion error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
