const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://qterfftaebnoawnzkfgu.supabase.co',
  'sb_publishable_SRwNSJ89mInda5FcuB1W2w_9IEJlSOI' // Use anon key to test normal login
);

async function testLogin() {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'admin@jongtour.com',
    password: 'AdminPassword2026!'
  });
  
  if (error) {
    console.error('Login Error:', error.message);
  } else {
    console.log('Login Success! Session token length:', data.session.access_token.length);
  }
}

testLogin();
