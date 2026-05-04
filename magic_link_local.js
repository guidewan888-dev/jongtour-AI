const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://qterfftaebnoawnzkfgu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF0ZXJmZnRhZWJub2F3bnprZmd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzQ3MzAxNCwiZXhwIjoyMDkzMDQ5MDE0fQ.IDd7B8okNE1B0vf1OVQizDGeVQNdVwLK0gzogOyWIFE'
);

async function generateLink() {
  const { data, error } = await supabase.auth.admin.generateLink({
    type: 'magiclink',
    email: 'admin@jongtour.com',
    options: {
      redirectTo: 'http://localhost:3000/auth/callback'
    }
  });
  
  if (error) console.error(error);
  else console.log('Local Magic Link:', data.properties.action_link);
}

generateLink();
