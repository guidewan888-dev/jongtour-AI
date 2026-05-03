const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://qterfftaebnoawnzkfgu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF0ZXJmZnRhZWJub2F3bnprZmd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzQ3MzAxNCwiZXhwIjoyMDkzMDQ5MDE0fQ.IDd7B8okNE1B0vf1OVQizDGeVQNdVwLK0gzogOyWIFE';

const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

async function resetPassword() {
  const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
  if (listError) return console.error(listError);

  const adminUser = users.find(u => u.email === 'admin@jongtour.com');
  if (adminUser) {
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(adminUser.id, {
      password: 'password123'
    });
    if (error) console.error("Error updating password:", error);
    else console.log("Password updated successfully to 'password123'");
  } else {
    console.log("admin@jongtour.com not found in Auth");
  }
}

resetPassword();
