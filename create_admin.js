const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://qterfftaebnoawnzkfgu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF0ZXJmZnRhZWJub2F3bnprZmd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzQ3MzAxNCwiZXhwIjoyMDkzMDQ5MDE0fQ.IDd7B8okNE1B0vf1OVQizDGeVQNdVwLK0gzogOyWIFE'
);

async function createAdmin() {
  // 1. Create in auth.users
  const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
    email: 'superadmin@jongtour.com',
    password: 'AdminPassword2026!',
    email_confirm: true
  });
  
  if (authError) {
    console.error('Auth Error:', authError.message);
    return;
  }
  
  console.log('Created Auth User:', authUser.user.id);
  
  // 2. Get ADMIN role id
  const { data: role } = await supabase.from('roles').select('id').eq('name', 'ADMIN').single();
  
  // 3. Create in public.users
  const { error: dbError } = await supabase.from('users').insert({
    id: authUser.user.id,
    email: 'superadmin@jongtour.com',
    roleId: role.id,
    status: 'ACTIVE'
  });
  
  if (dbError) {
    console.error('DB Error:', dbError.message);
  } else {
    console.log('Created DB User');
  }
}

createAdmin();
