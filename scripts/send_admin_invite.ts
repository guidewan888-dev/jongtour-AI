import { createClient } from '@supabase/supabase-js';
import { PrismaClient } from '@prisma/client';
import { EmailService } from '../src/lib/email';
import * as dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config({ path: '.env.local' });

const prisma = new PrismaClient();

async function run() {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const email = 'jongtourai@gmail.com';
    // Generate a secure temporary password
    const tempPassword = 'JongtourElite' + crypto.randomBytes(4).toString('hex') + '!';

    console.log(`Setting up Admin Invite for ${email}...`);

    // Get user id
    const { data: users, error: searchError } = await supabaseAdmin.auth.admin.listUsers();
    const user = users?.users.find(u => u.email === email);

    if (!user) {
      console.log('User not found in Supabase Auth!');
      return;
    }

    // 1. Update password in Supabase Auth
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
      password: tempPassword,
      email_confirm: true
    });

    if (updateError) {
      console.error('Failed to update password:', updateError);
      return;
    }
    console.log('Password successfully hashed and updated in Supabase Auth.');

    // 2. Update role and mustChangePassword in Prisma
    const role = await prisma.role.findUnique({ where: { name: 'SUPER_ADMIN' } });
    if (role) {
      await prisma.user.update({
        where: { email: 'jongtourAi@gmail.com' },
        data: { 
          mustChangePassword: true,
          roleId: role.id
        }
      });
      console.log('Role set to SUPER_ADMIN and must_change_password=true.');
    }

    // 3. Send the Invite Email
    console.log('Sending Admin Invite email via real SMTP...');
    const emailResult = await EmailService.sendAdminInvite(email, tempPassword, 'https://admin.jongtour.com');
    
    if (emailResult.success) {
      console.log(`✅ Invite email successfully delivered! Message ID: ${emailResult.messageId}`);
    } else {
      console.error('❌ Failed to send invite email:', emailResult.error);
    }

  } catch (error) {
    console.error('Script error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

run();
