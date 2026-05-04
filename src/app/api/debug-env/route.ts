import { NextResponse } from 'next/server';
import { EmailService } from '@/lib/email';

export async function GET() {
  const smtpWorks = await EmailService.verifyConnection();
  return NextResponse.json({
    supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    serviceRole: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    smtpHost: !!process.env.SMTP_HOST,
    smtpWorks
  });
}
