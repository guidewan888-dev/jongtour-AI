import { createClient } from '@supabase/supabase-js';
import { PrismaClient } from '@prisma/client';
import { EmailService } from '../src/lib/email';
import crypto from 'crypto';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config(); // fallback

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // MUST use service role for admin operations
);

const prisma = new PrismaClient();

function generateSecurePassword() {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < 16; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

async function setupAdmin() {
  const email = 'guidewan888@gmail.com';
  const fullName = 'Guidewan Admin';
  const tempPassword = generateSecurePassword();

  console.log(`🚀 Setting up Super Admin for: ${email}`);

  try {
    // 1. Get SUPER_ADMIN role ID
    let role = await prisma.role.findUnique({ where: { name: 'SUPER_ADMIN' } });
    if (!role) {
      console.log('Creating SUPER_ADMIN role...');
      role = await prisma.role.create({ data: { name: 'SUPER_ADMIN', description: 'Highest level administrator' } });
    }

    // 2. Create or Update user in Supabase Auth
    console.log('Creating user in Supabase Auth...');
    
    // First check if user exists
    const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) throw listError;
    
    let authUser = existingUsers.users.find(u => u.email === email);
    
    if (authUser) {
      console.log('User exists in Auth, updating password...');
      const { data, error } = await supabase.auth.admin.updateUserById(authUser.id, {
        password: tempPassword,
        email_confirm: true,
        user_metadata: { full_name: fullName }
      });
      if (error) throw error;
      authUser = data.user;
    } else {
      console.log('User does not exist, creating new...');
      const { data, error } = await supabase.auth.admin.createUser({
        email: email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: { full_name: fullName }
      });
      if (error) throw error;
      authUser = data.user;
    }

    if (!authUser) throw new Error('Failed to create/get auth user');

    // 3. Upsert User in Prisma
    console.log('Upserting user in Database...');
    const dbUser = await prisma.user.upsert({
      where: { email },
      update: {
        roleId: role.id,
        mustChangePassword: true,
        passwordHash: 'SUPABASE_AUTH', // We don't store real hashes since Supabase handles it
        status: 'ACTIVE'
      },
      create: {
        id: authUser.id,
        email,
        passwordHash: 'SUPABASE_AUTH',
        roleId: role.id,
        mustChangePassword: true,
        status: 'ACTIVE'
      }
    });

    // 4. Create Audit Log
    await prisma.auditLog.create({
      data: {
        userId: dbUser.id,
        action: 'CREATE_SUPER_ADMIN_INVITE',
        resource: 'users',
        resourceId: dbUser.id,
        newValues: { email, role: 'SUPER_ADMIN' }
      }
    });

    // 5. Send Email
    console.log('Sending invitation email...');
    const loginUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://admin.jongtour.com'}/auth/admin-login`;
    const emailResult = await EmailService.sendAdminInvite(email, tempPassword, loginUrl);

    if (emailResult.success) {
      console.log('✅ Invitation email sent successfully!');
    } else {
      console.log('⚠️ Failed to send email (check SMTP settings). Fallback credentials below:');
    }

    console.log('\n=============================================');
    console.log('🎉 ADMIN ACCOUNT CREATED SUCCESSFULLY');
    console.log('=============================================');
    console.log(`Email:    ${email}`);
    console.log(`Password: ${tempPassword}`);
    console.log('Role:     SUPER_ADMIN');
    console.log('Force Change Password on First Login: TRUE');
    console.log('=============================================');
    console.log('Please copy this temporary password immediately. It will only be shown once.');

  } catch (error) {
    console.error('❌ Error setting up admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupAdmin();
