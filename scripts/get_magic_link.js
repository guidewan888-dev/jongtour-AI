const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase.auth.admin.generateLink({
    type: 'magiclink',
    email: 'admin@jongtour.com',
  });
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('? MAGIC LINK:', data.properties.action_link);
  }
}
run();
