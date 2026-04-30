import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function test() {
  const email = 'testuser12345@example.com';
  
  // Create user first
  await supabaseAdmin.auth.admin.createUser({ email, email_confirm: true, password: 'password123' });

  const { data, error } = await supabaseAdmin.auth.admin.generateLink({
    type: 'magiclink',
    email,
  });
  console.log("data:", JSON.stringify(data, null, 2));

  if (data?.properties?.action_link) {
    const link = new URL(data.properties.action_link);
    console.log("action_link searchParams:", Object.fromEntries(link.searchParams));
    console.log("action_link hash:", link.hash);
  }
}

test();
