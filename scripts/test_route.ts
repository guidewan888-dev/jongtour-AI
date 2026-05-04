import { EmailService } from '../src/lib/email';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function run() {
  try {
    const email = 'guidewan888@gmail.com';

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    console.log('1. Checking user...');
    const { data: dbUser, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, email, role:roles(name)')
      .eq('email', email)
      .single();

    if (!dbUser || userError) {
      throw new Error(`User error: ${JSON.stringify(userError)}`);
    }
    console.log('User found:', dbUser.email, 'Role:', dbUser.role);

    console.log('2. Generating link...');
    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: email,
      options: {
        redirectTo: `https://admin.jongtour.com/auth/reset-password`
      }
    });

    if (error) {
      throw error;
    }
    console.log('Link generated:', data.properties?.action_link);

    console.log('3. Sending email...');
    const emailResult = await EmailService.sendPasswordReset(email, data.properties.action_link);
    console.log('Email sent:', emailResult);

  } catch (error: any) {
    console.error('ERROR:', error);
  }
}
run();
