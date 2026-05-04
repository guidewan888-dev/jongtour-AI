const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://qterfftaebnoawnzkfgu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF0ZXJmZnRhZWJub2F3bnprZmd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzQ3MzAxNCwiZXhwIjoyMDkzMDQ5MDE0fQ.IDd7B8okNE1B0vf1OVQizDGeVQNdVwLK0gzogOyWIFE'
);

async function resetPass() {
  const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
  const adminUser = authData?.users?.find(u => u.email === 'admin@jongtour.com');
  
  if (adminUser) {
    const { data, error } = await supabase.auth.admin.updateUserById(
      adminUser.id,
      { password: 'AdminPassword2026!' }
    );
    if (error) console.error('Error updating password:', error);
    else console.log('Password updated successfully!');
  } else {
    console.log('Admin user not found');
  }
}

resetPass();
