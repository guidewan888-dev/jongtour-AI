import { NextResponse } from 'next/server';
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';
import { createClient as createSupabaseServer } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const error = requestUrl.searchParams.get('error');
  const origin = requestUrl.origin;

  if (error) {
    return NextResponse.redirect(`${origin}/login?error=${error}`);
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/login`);
  }

  const clientId = process.env.LINE_CLIENT_ID!;
  const clientSecret = process.env.LINE_CLIENT_SECRET!;
  const redirectUri = `${origin}/api/auth/line/callback`;

  try {
    // 1. Exchange code for access_token
    const tokenResponse = await fetch('https://api.line.me/oauth2/v2.1/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      console.error('LINE Token Error:', tokenData);
      return NextResponse.redirect(`${origin}/login?error=line_token_error`);
    }

    // 2. Fetch user profile from LINE
    const profileResponse = await fetch('https://api.line.me/oauth2/v2.1/userinfo', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    const profileData = await profileResponse.json();
    
    if (profileData.error) {
       console.error('LINE Profile Error:', profileData);
       return NextResponse.redirect(`${origin}/login?error=line_profile_error`);
    }

    const { sub: lineId, name, picture, email: lineEmail } = profileData;
    
    // We must ensure the user has an email for Supabase.
    // If LINE doesn't return an email (because user didn't allow it), we create a fallback one.
    const email = lineEmail || `line_${lineId}@jongtour.com`;

    // 3. Initialize Admin Supabase Client (bypasses RLS and can manage users)
    const supabaseAdmin = createSupabaseAdmin(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 4. Create or Update user in Supabase auth.users
    const { error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: {
        full_name: name,
        avatar_url: picture,
        line_id: lineId,
        provider: 'line',
      },
    });

    // If user already exists, update their metadata to sync latest LINE profile
    if (createError && createError.message.includes('already exists')) {
       const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
       const user = existingUsers.users.find(u => u.email === email);
       if (user) {
         await supabaseAdmin.auth.admin.updateUserById(user.id, {
           user_metadata: {
             ...user.user_metadata,
             full_name: name,
             avatar_url: picture,
             line_id: lineId
           }
         });
       }
    } else if (createError && !createError.message.includes('already exists')) {
       console.error('Supabase Create User Error:', createError);
       return NextResponse.redirect(`${origin}/login?error=user_creation_failed`);
    }

    // 5. Generate a Magic Link OTP to establish a session for the user
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email,
    });

    if (linkError || !linkData.properties?.hashed_token) {
      console.error('Magic link generation error:', linkError);
      return NextResponse.redirect(`${origin}/login?error=session_generation_failed`);
    }

    // 6. Verify the OTP on the server to set the cookies via SSR client
    const cookieStore = await cookies();
    const supabaseServer = createSupabaseServer(cookieStore);

    const { error: verifyError } = await supabaseServer.auth.verifyOtp({
      email,
      token_hash: linkData.properties.hashed_token,
      type: 'magiclink',
    });

    if (verifyError) {
      console.error('OTP verification error:', verifyError);
      return NextResponse.redirect(`${origin}/login?error=session_verification_failed`);
    }

    // 7. Success! Redirect to home page
    return NextResponse.redirect(`${origin}/`);

  } catch (err) {
    console.error('LINE Login Callback Exception:', err);
    return NextResponse.redirect(`${origin}/login?error=internal_server_error`);
  }
}
