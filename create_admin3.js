const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://qterfftaebnoawnzkfgu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF0ZXJmZnRhZWJub2F3bnprZmd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzQ3MzAxNCwiZXhwIjoyMDkzMDQ5MDE0fQ.IDd7B8okNE1B0vf1OVQizDGeVQNdVwLK0gzogOyWIFE'
);

async function createAdmin() {
  const { data: role } = await supabase.from('roles').select('id').eq('name', 'ADMIN').single();
  
  const { error: dbError } = await supabase.from('users').insert({
    id: 'e3e86855-b0e3-4328-b907-01211428eed5',
    email: 'superadmin@jongtour.com',
    passwordHash: 'OAUTH_USER',
    roleId: role.id,
    status: 'ACTIVE',
    updatedAt: new Date().toISOString()
  });
  
  if (dbError) {
    console.error('DB Error:', dbError.message);
  } else {
    console.log('Created DB User');
  }
}

createAdmin();
