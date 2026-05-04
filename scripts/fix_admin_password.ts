import { createClient } from '@supabase/supabase-js';
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const prisma = new PrismaClient();

async function run() {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const email = 'guidewan888@gmail.com';
    const newPassword = 'AdminPassword123!';

    console.log(`Setting password for ${email}...`);

    // Get user id
    const { data: users, error: searchError } = await supabaseAdmin.auth.admin.listUsers();
    const user = users?.users.find(u => u.email === email);

    if (!user) {
      console.log('User not found!');
      return;
    }

    // Update password
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
      password: newPassword,
      email_confirm: true
    });

    if (error) {
      console.error('Failed to update password:', error);
      return;
    }

    console.log('Password updated successfully via Service Role (bypassing rate limits)!');

    // Update Prisma: set mustChangePassword to false and role to SUPER_ADMIN
    const role = await prisma.role.findUnique({ where: { name: 'SUPER_ADMIN' } });
    if (role) {
      await prisma.user.update({
        where: { email },
        data: { 
          mustChangePassword: false,
          roleId: role.id
        }
      });
      console.log('mustChangePassword set to false and role set to SUPER_ADMIN in Prisma.');
    } else {
      console.log('SUPER_ADMIN role not found in DB!');
    }

  } catch (error) {
    console.error('Script error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

run();
