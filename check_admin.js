const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://qterfftaebnoawnzkfgu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF0ZXJmZnRhZWJub2F3bnprZmd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzQ3MzAxNCwiZXhwIjoyMDkzMDQ5MDE0fQ.IDd7B8okNE1B0vf1OVQizDGeVQNdVwLK0gzogOyWIFE'
);

async function check() {
  // Check auth user
  const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
  if (authError) console.error('Auth Error:', authError);
  
  const adminUser = authData?.users?.find(u => u.email === 'admin@jongtour.com');
  console.log('Auth User:', adminUser ? 'Found' : 'Not Found');
  
  if (adminUser) {
    // Check public.users
    const { data: dbUser, error: dbError } = await supabase
      .from('users')
      .select('*, role:roles(*)')
      .eq('email', 'admin@jongtour.com')
      .single();
      
    if (dbError) console.error('DB Error:', dbError);
    console.log('DB User:', dbUser);
  }
}

check();
