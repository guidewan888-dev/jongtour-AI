import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

async function test() {
  const email = 'testuser12345@example.com';
  
  const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
    type: 'magiclink',
    email,
  });
  
  const { data: sessionData, error: verifyError } = await supabase.auth.verifyOtp({
    token_hash: linkData!.properties.hashed_token,
    type: 'magiclink'
  });

  console.log("verifyError:", verifyError);
  console.log("sessionData:", !!sessionData?.session);
}

test();
