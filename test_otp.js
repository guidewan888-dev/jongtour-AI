const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://qterfftaebnoawnzkfgu.supabase.co',
  'sb_publishable_SRwNSJ89mInda5FcuB1W2w_9IEJlSOI' 
);

async function testOtp() {
  const { data, error } = await supabase.auth.signInWithOtp({
    email: 'admin@jongtour.com',
  });
  
  if (error) {
    console.error('OTP Error:', error.message);
  } else {
    console.log('OTP Success:', data);
  }
}

testOtp();
