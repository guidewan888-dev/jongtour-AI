import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const prisma = new PrismaClient();

async function main() {
  const email = 'jongtourAi@gmail.com';
  const tempPassword = 'TEMP_Password123!@#';

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  console.log(`1. Checking if user ${email} exists in Supabase Auth...`);
  
  // Actually, we can just try to create. If it fails, maybe it exists.
  const { data: authUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
    email: email,
    password: tempPassword,
    email_confirm: true
  });

  let authId;
  if (createError) {
    if (createError.message.includes('already exists')) {
      console.log('User already exists in Auth. Updating password and confirming...');
      const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
      const existing = existingUsers.users.find(u => u.email === email);
      if (existing) {
        authId = existing.id;
        await supabaseAdmin.auth.admin.updateUserById(authId, {
          password: tempPassword,
          email_confirm: true
        });
      }
    } else {
      throw createError;
    }
  } else {
    authId = authUser.user.id;
    console.log('Created user in Supabase Auth with ID:', authId);
  }

  console.log('2. Fetching SUPER_ADMIN role from Prisma...');
  const role = await prisma.role.findFirst({
    where: { name: 'SUPER_ADMIN' }
  });

  if (!role) {
    throw new Error('SUPER_ADMIN role not found in the database!');
  }

  console.log('3. Upserting user into Prisma...');
  const dbUser = await prisma.user.upsert({
    where: { email },
    update: {
      roleId: role.id,
      mustChangePassword: true,
      status: 'ACTIVE'
    },
    create: {
      id: authId, // Match Supabase ID
      email,
      passwordHash: 'SUPABASE_AUTH',
      roleId: role.id,
      mustChangePassword: true,
      status: 'ACTIVE'
    }
  });

  console.log('✅ Admin user created/updated successfully in Prisma:', dbUser.id);
  
  // Demote old admin if necessary to avoid confusion
  await prisma.user.updateMany({
    where: { email: 'guidewan888@gmail.com' },
    data: { roleId: (await prisma.role.findFirst({where: {name: 'CUSTOMER'}}))?.id || role.id } // Fallback if CUSTOMER doesn't exist
  });
  console.log('Demoted guidewan888@gmail.com to prevent conflicts.');

}

main().catch(console.error).finally(() => prisma.$disconnect());
