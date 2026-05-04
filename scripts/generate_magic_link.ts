import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function generateLink() {
  const { data, error } = await supabase.auth.admin.generateLink({
    type: 'magiclink',
    email: 'guidewan888@gmail.com',
    options: {
      redirectTo: 'https://admin.jongtour.com/'
    }
  });

  if (error) {
    console.error('Error generating link:', error);
  } else {
    console.log('\n✅ DIRECT LOGIN LINK (BYPASS RATE LIMIT):');
    console.log(data.properties.action_link);
    console.log('\n');
  }
}

generateLink();
