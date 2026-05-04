const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Use ANON KEY just like middleware does!
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
);

async function checkAdminAnon() {
  const { data: user, error } = await supabase
    .from('users')
    .select('*, role:roles(*)')
    .eq('email', 'admin@jongtour.com')
    .single();
    
  console.log("DB User with ANON key:", user);
  console.log("Error with ANON key:", error);
}

checkAdminAnon();
