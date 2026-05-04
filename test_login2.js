const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://qterfftaebnoawnzkfgu.supabase.co',
  'sb_publishable_SRwNSJ89mInda5FcuB1W2w_9IEJlSOI' 
);

async function testLogin() {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'nonexistent@jongtour.com',
    password: 'password'
  });
  
  if (error) {
    console.error('Login Error:', error.message);
  }
}

testLogin();
