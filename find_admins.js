const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://qterfftaebnoawnzkfgu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF0ZXJmZnRhZWJub2F3bnprZmd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzQ3MzAxNCwiZXhwIjoyMDkzMDQ5MDE0fQ.IDd7B8okNE1B0vf1OVQizDGeVQNdVwLK0gzogOyWIFE'
);

async function findAdmins() {
  const { data: dbUsers, error } = await supabase
    .from('users')
    .select('email, role:roles(name)')
    .eq('roles.name', 'ADMIN');
    
  console.log(dbUsers);
}

findAdmins();
